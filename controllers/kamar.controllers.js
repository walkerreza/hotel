import Kamars from "../models/kamar.models.js";
import Gambar from "../models/gambar.models.js";    
import Reservasis from "../models/reservasi.models.js"; // tambahkan import Reservasis
import { Op } from 'sequelize'; // tambahkan import Op dari sequelize

export const tambahKamar = async (req, res) => {
    try {
        const { nomor_kamar, tipe_kamar, harga_per_malam, status_kamar, gambar_id } = req.body;
        
        // Validate required fields
        if (!nomor_kamar || !tipe_kamar || !harga_per_malam || !status_kamar) {
            return res.status(400).json({ 
                message: "Semua field harus diisi",
                details: {
                    nomor_kamar: !nomor_kamar ? "Nomor kamar harus diisi" : null,
                    tipe_kamar: !tipe_kamar ? "Tipe kamar harus diisi" : null,
                    harga_per_malam: !harga_per_malam ? "Harga per malam harus diisi" : null,
                    status_kamar: !status_kamar ? "Status kamar harus diisi" : null
                }
            });
        }

        // Validate harga_per_malam
        const MAX_HARGA = 100000000; // 100 juta
        if (harga_per_malam <= 0) {
            return res.status(400).json({ message: "Harga per malam harus lebih dari 0" });
        }
        if (harga_per_malam > MAX_HARGA) {
            return res.status(400).json({ message: `Harga per malam tidak boleh lebih dari ${new Intl.NumberFormat('id-ID').format(MAX_HARGA)}` });
        }

        // Check if room number already exists
        const existingKamar = await Kamars.findOne({ where: { nomor_kamar } });
        if (existingKamar) {
            return res.status(400).json({ message: "Nomor kamar sudah digunakan" });
        }

        // If gambar_id is provided, verify it exists
        if (gambar_id) {
            const gambar = await Gambar.findByPk(gambar_id);
            if (!gambar) {
                return res.status(400).json({ message: "ID Gambar tidak ditemukan" });
            }
        }

        const kamar = await Kamars.create({
            nomor_kamar,
            tipe_kamar,
            harga_per_malam,
            status_kamar,
            gambar_id,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Return success response with created data
        return res.status(201).json({
            message: "Kamar berhasil ditambahkan",
            data: kamar
        });
    } catch (error) {
        console.error('Error in tambahKamar:', error);
        return res.status(500).json({ 
            message: "Terjadi kesalahan saat menambahkan kamar",
            error: error.message 
        });
    }
};


export const daftarKamar = async (req, res) => {
    try {
        console.log('Fetching kamar list...');
        const kamars = await Kamars.findAll({
            include: [{
                model: Gambar,
                as: 'gambar',
                attributes: ['id', 'gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi']
            }],
            order: [['created_at', 'DESC']]
        });
        
        // Transform response untuk menambahkan URL lengkap
        const transformedKamars = kamars.map(kamar => {
            const kamarJson = kamar.toJSON();
            if (kamarJson.gambar) {
                kamarJson.gambar = {
                    ...kamarJson.gambar,
                    gambar_preview: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_preview}`,
                    gambar_kamar: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_kamar}`,
                    gambar_fasilitas: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_fasilitas}`,
                    gambar_lokasi: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_lokasi}`
                };
            }
            return kamarJson;
        });
        
        console.log(`Found ${kamars.length} rooms`);
        res.json(transformedKamars);
    } catch (error) {
        console.error('Error in daftarKamar:', error);
        res.status(500).json({ 
            message: "Gagal mengambil daftar kamar",
            error: error.message 
        });
    }
};


export const editKamar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomor_kamar, tipe_kamar, harga_per_malam, status_kamar, gambar_id } = req.body;
        const kamar = await Kamars.findByPk(id);
        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }
        await kamar.update({
            nomor_kamar,
            tipe_kamar,
            harga_per_malam,
            status_kamar,
            gambar_id,
            updated_at: new Date()  
        });
        res.json(kamar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteKamar = async (req, res) => {
    try {
        const { id } = req.params;
        const kamar = await Kamars.findByPk(id);
        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }
        await kamar.destroy();
        res.json({ message: "Kamar berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const daftarKamarById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching kamar detail for ID:', id);

        const kamar = await Kamars.findOne({
            where: { id },
            include: [{
                model: Gambar,
                as: 'gambar',
                attributes: ['id', 'gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi']
            }]
        });

        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }

        // Transform data untuk response
        const response = {
            ...kamar.toJSON(),
            foto_kamar: kamar.gambar ? `http://localhost:5000/uploads/${kamar.gambar.gambar_kamar}` : null,
            foto_preview: kamar.gambar ? `http://localhost:5000/uploads/${kamar.gambar.gambar_preview}` : null,
            foto_fasilitas: kamar.gambar ? `http://localhost:5000/uploads/${kamar.gambar.gambar_fasilitas}` : null,
            foto_lokasi: kamar.gambar ? `http://localhost:5000/uploads/${kamar.gambar.gambar_lokasi}` : null
        };

        console.log('Sending kamar detail:', response);
        res.json(response);
    } catch (error) {
        console.error('Error in daftarKamarById:', error);
        res.status(500).json({ 
            message: "Gagal mengambil detail kamar",
            error: error.message 
        });
    }
};

// Get available rooms by date
export const getAvailableRooms = async (req, res) => {
    try {
        const { date } = req.params;
        const checkDate = new Date(date);

        // Validate date
        if (isNaN(checkDate.getTime())) {
            return res.status(400).json({ 
                message: "Format tanggal tidak valid"
            });
        }

        // Get all rooms
        const rooms = await Kamars.findAll({
            include: [{
                model: Gambar,
                attributes: ['gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi'],
                required: false
            }]
        });

        // Get booked rooms for the date
        const bookedRooms = await Reservasis.findAll({
            where: {
                status_reservasi: 'dipesan',
                [Op.and]: [
                    {
                        tanggal_checkin: {
                            [Op.lte]: date
                        }
                    },
                    {
                        tanggal_checkout: {
                            [Op.gte]: date
                        }
                    }
                ]
            },
            attributes: ['kamar_id']
        });

        // Get array of booked room IDs
        const bookedRoomIds = bookedRooms.map(reservation => reservation.kamar_id);

        // Filter available rooms (exclude booked rooms)
        const availableRooms = rooms.filter(room => !bookedRoomIds.includes(room.id));

        // Format response data
        const formattedRooms = availableRooms.map(room => {
            const baseUrl = 'http://localhost:5000';
            const normalizeImagePath = (path) => {
                if (!path) return '/room-placeholder.jpg';
                if (path.startsWith('http')) return path;
                return `${baseUrl}/${path.replace(/\\/g, '/')}`;
            };

            return {
                ...room.toJSON(),
                gambar: room.Gambar ? {
                    gambar_preview: normalizeImagePath(room.Gambar.gambar_preview),
                    gambar_kamar: normalizeImagePath(room.Gambar.gambar_kamar),
                    gambar_fasilitas: normalizeImagePath(room.Gambar.gambar_fasilitas),
                    gambar_lokasi: normalizeImagePath(room.Gambar.gambar_lokasi)
                } : null
            };
        });

        return res.status(200).json({
            message: "Daftar kamar tersedia berhasil diambil",
            data: formattedRooms
        });
    } catch (error) {
        console.error('Error in getAvailableRooms:', error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data kamar tersedia",
            error: error.message
        });
    }
};

// Get room details by reservation ID
export const getKamarByReservasi = async (req, res) => {
    try {
        const { reservasi_id } = req.params;
        
        // Cari reservasi dulu
        const reservasi = await Reservasis.findByPk(reservasi_id);
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        // Ambil detail kamar berdasarkan kamar_id dari reservasi
        const kamar = await Kamars.findByPk(reservasi.kamar_id, {
            include: [{
                model: Gambar,
                as: 'gambar',
                attributes: ['id', 'gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi']
            }]
        });

        if (!kamar) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }

        // Transform response untuk menambahkan URL lengkap
        const kamarJson = kamar.toJSON();
        if (kamarJson.gambar) {
            kamarJson.gambar = {
                ...kamarJson.gambar,
                gambar_preview: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_preview}`,
                gambar_kamar: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_kamar}`,
                gambar_fasilitas: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_fasilitas}`,
                gambar_lokasi: `http://localhost:5000/uploads/${kamarJson.gambar.gambar_lokasi}`
            };
        }

        res.status(200).json(kamarJson);
    } catch (error) {
        console.error('Error in getKamarByReservasi:', error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data kamar", error: error.message });
    }
};
