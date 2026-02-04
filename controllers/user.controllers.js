    import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Sequelize, Op } from "sequelize";
import Users from "../models/user.models.js";
import Log from "../models/log.model.js";
import multer from "multer";
import path from "path";

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
}).single('photo');

// Fungsi register
export const tambahuser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await Users.create({ 
            username: username,
            email: email,
            password: hashedPassword,
            role: role,
            created_at: new Date(),
            updated_at: new Date()
        });
        
        // Tambah log untuk registrasi user baru
        await Log.create({
            type: 'CREATE',
            description: `User baru dibuat: ${username}`,
            metadata: { userId: user.id, email: email, role: role }
        });
        
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Check for specific Sequelize errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                message: "Username or email already exists" 
            });
        }
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

// Fungsi login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({
            where: { username: username }
        });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token dengan role
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                username: user.username,
                photo_url: user.photo_url ? `http://localhost:5000${user.photo_url}` : null
            },
            process.env.ACCESS_TOKEN_SECRET || 'your-secret-key',
            { expiresIn: "24h" }
        );
        
        // Tambah log untuk login
        await Log.create({
            type: 'LOGIN',
            description: `User ${username} melakukan login`,
            userId: user.id,
            metadata: { timestamp: new Date() }
        });
        
        // Kirim data user tanpa password
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            photo_url: user.photo_url ? `http://localhost:5000${user.photo_url}` : null
        };
        
        res.json({ 
            token, 
            role: user.role,
            user: userData 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: { exclude: ['password'] } // Don't send passwords
        });
        
        // Tambah log untuk akses daftar user
        await Log.create({
            type: 'READ',
            description: 'Mengakses daftar semua user',
            userId: req.user.id,
            metadata: { count: users.length }
        });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users for dropdown
export const getAllUsersForDropdown = async (req, res) => {
    try {
        const users = await Users.findAll({
            where: {
                role: 'user' // Hanya ambil user biasa
            },
            attributes: ['id', 'username', 'email'], // Hanya ambil data yang diperlukan
            order: [['username', 'ASC']] // Urutkan berdasarkan username
        });
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data users" });
    }
};

// Mendapatkan profil user yang sedang login
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Ambil ID dari token yang sudah diverifikasi

        const user = await Users.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role', 'photo_url', 'created_at', 'updated_at'] // Include photo_url
        });

        if (!user) {
            return res.status(404).json({ message: "Profil tidak ditemukan" });
        }

        // Transform photo_url menjadi URL lengkap jika ada
        const userData = user.toJSON();
        if (userData.photo_url) {
            userData.photo_url = `http://localhost:5000${userData.photo_url}`;
        }

        res.json(userData);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Gagal mengambil profil. Silakan coba lagi." });
    }
};

// Mengupdate profil user
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Ambil ID dari token
        const { username, email } = req.body;

        // Validasi input
        if (!username || !email) {
            return res.status(400).json({ message: "Username dan email harus diisi" });
        }

        // Cek apakah email sudah digunakan (kecuali oleh user yang sama)
        const existingUser = await Users.findOne({
            where: {
                email: email,
                id: { [Sequelize.Op.ne]: userId } // Exclude current user
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        // Update profil
        const [updated] = await Users.update(
            {
                username,
                email,
                updated_at: new Date()
            },
            {
                where: { id: userId }
            }
        );

        if (!updated) {
            return res.status(404).json({ message: "Profil tidak ditemukan" });
        }

        // Ambil data user yang sudah diupdate
        const updatedUser = await Users.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role', 'created_at', 'updated_at']
        });

        // Tambah log untuk update profil
        await Log.create({
            type: 'UPDATE',
            description: `User ${username} mengupdate profil`,
            userId: userId,
            metadata: { updatedFields: ['username', 'email'] }
        });

        res.json({
            message: "Profil berhasil diperbarui",
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Gagal mengupdate profil. Silakan coba lagi." });
    }
};

// Mengubah password user
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // Ambil ID dari token
        const { oldPassword, newPassword } = req.body;

        // Validasi input
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Password lama dan baru harus diisi" });
        }

        // Ambil data user
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Verifikasi password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password lama salah" });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await Users.update(
            {
                password: hashedPassword,
                updated_at: new Date()
            },
            {
                where: { id: userId }
            }
        );

        // Tambah log untuk perubahan password
        await Log.create({
            type: 'UPDATE',
            description: `User ${user.username} mengubah password`,
            userId: userId,
            metadata: { updatedFields: ['password'] }
        });

        res.json({ message: "Password berhasil diubah" });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: "Gagal mengubah password. Silakan coba lagi." });
    }
};

// Upload foto profil
export const uploadProfilePhoto = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: "Error saat upload file" });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "File tidak ditemukan" });
            }

            const userId = req.user.id;
            const photoUrl = `/uploads/profiles/${req.file.filename}`;

            await Users.update(
                { photo_url: photoUrl },
                { where: { id: userId } }
            );

            // Tambah log untuk upload foto
            await Log.create({
                type: 'UPDATE',
                description: `User mengupload foto profil baru`,
                userId: userId,
                metadata: { photoUrl }
            });

            res.json({
                message: "Foto profil berhasil diupload",
                photo_url: photoUrl
            });
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: "Gagal mengupload foto profil" });
    }
};
