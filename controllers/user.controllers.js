import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import dotenv from "dotenv";
import Users from "../models/user.models.js";

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
            role: role, // Role bisa 'admin' atau 'user'
            created_at: new Date(),
            updated_at: new Date()
        });
        
        res.json(user);
    } catch (error) {
        res.status( ).json({ message: error.message });
    }
};

// Fungsi login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const login = await Users.findOne({
            where: { username: username }
        });
        
        if (!login) return res.status(404).send("User not found");

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, login.password);
        if (!isMatch) return res.status(401).send("Invalid credentials");

        // Generate token dengan role
        const token = jwt.sign(
            { id: login.id, role: login.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );
        
        res.json({ token, role: login.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
