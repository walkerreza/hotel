import Reservasis from "../models/reservasi.models.js";
import Kamars from "../models/kamar.models.js";
import Users from "../models/user.models.js"; 

import { Op } from 'sequelize'; // op dari squilize

export const buatReservasi = async (req, res) => {
    try {
        const { user_id, kamar_ids, tanggal_checkin, tanggal_checkout } = req.body;

        // Validasi apakah user_id yang digunakan adalah user yang sedang login
        const user = await Users.findByPk(user_id);
        if (user && user.role === 'admin') {
            return res.status(403).json({ message: "Admin tidak dapat melakukan reservasi" });
        }

        // Loop melalui setiap kamar_id untuk membuat reservasi
        const reservasiResults = [];
        for (const kamar_id of kamar_ids) {
           
            const existingReservasi = await Reservasis.findOne({
                where: {
                    kamar_id,
                    tanggal_checkin: {
                        [Op.lte]: tanggal_checkout
                    },
                    tanggal_checkout: {
                        [Op.gte]: tanggal_checkin
                    },
                    status_reservasi: 'dipesan' 
                }
            });

            if (existingReservasi) {
                return res.status(400).json({ message: `Kamar ${kamar_id} sudah dipesan oleh user lain` });
            }

           
            const reservasi = await Reservasis.create({
                user_id,
                kamar_id,
                tanggal_checkin,
                tanggal_checkout,
                status_reservasi: 'dipesan',
                created_at: new Date(),
                updated_at: new Date()
            });

            reservasiResults.push(reservasi);
           
            await Kamars.update(
                { status_kamar: 'dipesan' },
                { where: { id: kamar_id } }
            );
        }

        res.json(reservasiResults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const daftarReservasi = async (req, res) => {
    try {
        const reservasis = await Reservasis.findAll();
        res.json(reservasis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const hapusReservasi = async (req, res) => {
    try {
        const { id } = req.params;
        const reservasi = await Reservasis.findByPk(id);
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }
        await reservasi.destroy();

        await Kamars.update(
            { status_kamar: 'tersedia' },
            { where: { id: reservasi.kamar_id } }
        );

        res.json({ message: "Reservasi berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateStatusReservasi = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

    
        if (!['dipesan', 'dibatalkan', 'selesai'].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        const reservasi = await Reservasis.findByPk(id);
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

     
        await reservasi.update({ status_reservasi: status, updated_at: new Date() });

        
        if (status === 'dibatalkan') {
            await Kamars.update(
                { status_kamar: 'tersedia' },
                { where: { id: reservasi.kamar_id } }
            );
        }

        res.json({ message: `Reservasi berhasil diupdate menjadi ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
