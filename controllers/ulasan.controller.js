import Ulasan from "../models/ulasan.models.js";
import User from "../models/user.models.js";
import { Op } from "sequelize";

// Get semua ulasan untuk kamar tertentu
export const getUlasanByKamar = async (req, res) => {
    try {
        const ulasan = await Ulasan.findAll({
            where: {
                id_kamar: req.params.id_kamar
            },
            include: [{
                model: User,
                attributes: ['username'] // Ganti nama dengan username
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(ulasan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get semua ulasan
export const getAllUlasan = async (req, res) => {
    try {
        const ulasan = await Ulasan.findAll({
            include: [{
                model: User,
                attributes: ['username'] // Ganti nama dengan username
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(ulasan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tambah ulasan baru
export const createUlasan = async (req, res) => {
    try {
        const ulasan = await Ulasan.create({
            ...req.body,
            id_user: req.user.id // Ambil id_user dari token
        });
        res.status(201).json({
            message: "Ulasan berhasil ditambahkan",
            data: ulasan
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update ulasan
export const updateUlasan = async (req, res) => {
    try {
        const ulasan = await Ulasan.update(req.body, {
            where: {
                id: req.params.id,
                id_user: req.user.id // Pastikan user yang update adalah pemilik ulasan
            }
        });
        if (ulasan[0] === 0) {
            return res.status(404).json({ message: "Ulasan tidak ditemukan atau Anda tidak memiliki akses" });
        }
        res.json({ message: "Ulasan berhasil diupdate" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Hapus ulasan
export const deleteUlasan = async (req, res) => {
    try {
        const ulasan = await Ulasan.destroy({
            where: {
                id: req.params.id,
                id_user: req.user.id // Pastikan user yang hapus adalah pemilik ulasan
            }
        });
        if (!ulasan) {
            return res.status(404).json({ message: "Ulasan tidak ditemukan atau Anda tidak memiliki akses" });
        }
        res.json({ message: "Ulasan berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
