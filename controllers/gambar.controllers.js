import Gambar from '../models/gambar.models.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createGambar = async (req, res) => {
    try {
        const { gambar_preview, gambar_kamar, gambar_fasilitas, gambar_lokasi } = req.files;
        
        // Normalize paths to use forward slashes and remove 'uploads' prefix
        const normalizePath = (file) => {
            return file[0].path.replace(/\\/g, '/').replace(/^uploads\//, '');
        };
        
        const gambar = await Gambar.create({
            gambar_preview: normalizePath(gambar_preview),
            gambar_kamar: normalizePath(gambar_kamar),
            gambar_fasilitas: normalizePath(gambar_fasilitas),
            gambar_lokasi: normalizePath(gambar_lokasi)
        });

        res.status(201).json({
            id: gambar.id,
            gambar_preview: gambar.gambar_preview,
            gambar_kamar: gambar.gambar_kamar,
            gambar_fasilitas: gambar.gambar_fasilitas,
            gambar_lokasi: gambar.gambar_lokasi
        });
    } catch (error) {
        console.error('Error in createGambar:', error);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getAllGambar = async (req, res) => {
    try {
        const gambars = await Gambar.findAll({
            attributes: ['id', 'gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi']
        });
        res.status(200).json(gambars.map(gambar => ({
            id: gambar.id,
            gambar_preview: gambar.gambar_preview,
            gambar_kamar: gambar.gambar_kamar,
            gambar_fasilitas: gambar.gambar_fasilitas,
            gambar_lokasi: gambar.gambar_lokasi
        })));
    } catch (error) {
        console.error('Error in getAllGambar:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getGambarById = async (req, res) => {
    try {
        const gambar = await Gambar.findByPk(req.params.id);
        if (gambar) {
            res.status(200).json({
                id: gambar.id,
                gambar_preview: gambar.gambar_preview,
                gambar_kamar: gambar.gambar_kamar,
                gambar_fasilitas: gambar.gambar_fasilitas,
                gambar_lokasi: gambar.gambar_lokasi
            });
        } else {
            res.status(404).json({ message: 'Gambar not found' });
        }
    } catch (error) {
        console.error('Error in getGambarById:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateGambar = async (req, res) => {
    try {
        const gambar = await Gambar.findByPk(req.params.id);
        if (!gambar) {
            return res.status(404).json({ message: 'Gambar tidak ditemukan' });
        }

        const updateData = {};
        const oldFiles = {
            gambar_preview: gambar.gambar_preview,
            gambar_kamar: gambar.gambar_kamar,
            gambar_fasilitas: gambar.gambar_fasilitas,
            gambar_lokasi: gambar.gambar_lokasi
        };
        
        // Fungsi untuk normalize path
        const normalizePath = (filePath) => {
            return filePath.replace(/\\/g, '/').replace(/^uploads[\/\\]/, '');
        };

        if (req.files) {
            // Update path gambar dan hapus file lama jika ada
            if (req.files.gambar_preview) {
                updateData.gambar_preview = normalizePath(req.files.gambar_preview[0].path);
                if (oldFiles.gambar_preview) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', oldFiles.gambar_preview);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }
            if (req.files.gambar_kamar) {
                updateData.gambar_kamar = normalizePath(req.files.gambar_kamar[0].path);
                if (oldFiles.gambar_kamar) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', oldFiles.gambar_kamar);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }
            if (req.files.gambar_fasilitas) {
                updateData.gambar_fasilitas = normalizePath(req.files.gambar_fasilitas[0].path);
                if (oldFiles.gambar_fasilitas) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', oldFiles.gambar_fasilitas);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }
            if (req.files.gambar_lokasi) {
                updateData.gambar_lokasi = normalizePath(req.files.gambar_lokasi[0].path);
                if (oldFiles.gambar_lokasi) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', oldFiles.gambar_lokasi);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }
        }

        await gambar.update(updateData);

        // Return full URLs in response
        const response = {
            id: gambar.id,
            gambar_preview: gambar.gambar_preview,
            gambar_kamar: gambar.gambar_kamar,
            gambar_fasilitas: gambar.gambar_fasilitas,
            gambar_lokasi: gambar.gambar_lokasi,
            message: 'Gambar berhasil diupdate'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in updateGambar:', error);
        res.status(500).json({ 
            message: 'Gagal mengupdate gambar',
            error: error.message 
        });
    }
};

export const deleteGambar = async (req, res) => {
    try {
        const gambar = await Gambar.findByPk(req.params.id);
        if (!gambar) {
            return res.status(404).json({ message: 'Gambar tidak ditemukan' });
        }

        // Hapus file gambar dari folder uploads
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const gambarFields = ['gambar_preview', 'gambar_kamar', 'gambar_fasilitas', 'gambar_lokasi'];
        
        for (const field of gambarFields) {
            if (gambar[field]) {
                try {
                    // Path lengkap ke file
                    const filePath = path.join(uploadsDir, gambar[field]);
                    console.log('Trying to delete file:', filePath);
                    
                    // Cek apakah file ada
                    if (fs.existsSync(filePath)) {
                        // Hapus file
                        fs.unlinkSync(filePath);
                        console.log(`File ${field} berhasil dihapus:`, filePath);
                    } else {
                        console.log(`File ${field} tidak ditemukan:`, filePath);
                    }
                } catch (err) {
                    console.error(`Error saat menghapus file ${field}:`, err);
                }
            }
        }

        // Hapus data dari database
        await gambar.destroy();
        res.status(200).json({ message: 'Gambar berhasil dihapus' });
    } catch (error) {
        console.error('Error in deleteGambar:', error);
        res.status(500).json({ message: error.message });
    }
};
