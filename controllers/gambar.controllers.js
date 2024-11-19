import Gambar from '../models/gambar.models.js';

export const createGambar = async (req, res) => {
    try {
        const { gambar_preview, gambar_kamar, gambar_fasilitas, gambar_lokasi } = req.files;
        
        const gambar = await Gambar.create({
            gambar_preview: gambar_preview[0].path,
            gambar_kamar: gambar_kamar[0].path,
            gambar_fasilitas: gambar_fasilitas[0].path,
            gambar_lokasi: gambar_lokasi[0].path,
        });

        res.status(201).json(gambar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllGambar = async (req, res) => {
    try {
        const gambars = await Gambar.findAll();
        res.status(200).json(gambars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGambarById = async (req, res) => {
    try {
        const gambar = await Gambar.findByPk(req.params.id);
        if (gambar) {
            res.status(200).json(gambar);
        } else {
            res.status(404).json({ message: 'Gambar not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGambar = async (req, res) => {
    try {
        const [updated] = await Gambar.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedGambar = await Gambar.findByPk(req.params.id);
            res.status(200).json(updatedGambar);
        } else {
            res.status(404).json({ message: 'Gambar not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGambar = async (req, res) => {
    try {
        const deleted = await Gambar.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Gambar not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
