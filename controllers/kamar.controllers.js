import Kamars from "../models/kamar.models.js";
import Gambar from "../models/gambar.models.js";    


export const tambahKamar = async (req, res) => {
    try {
        const { nomor_kamar, tipe_kamar, harga_per_malam, status_kamar, gambar_id } = req.body;
        const kamar = await Kamars.create({
            nomor_kamar,
            tipe_kamar,
            harga_per_malam,
            status_kamar,
            gambar_id,
            created_at: new Date(),
            updated_at: new Date()
        });
        res.json(kamar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const daftarKamar = async (req, res) => {
    try {
        const kamars = await Kamars.findAll({
            include: [{
                model: Gambar,
                as: 'gambar' // Menambahkan relasi dengan model Gambar
            }]
        });
        res.json(kamars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const editKamar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomor_kamar, tipe_kamar, harga_per_malam, status_kamar, gambar } = req.body;
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
