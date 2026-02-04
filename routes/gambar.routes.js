import express from 'express';
import {
    createGambar,
    getAllGambar,
    getGambarById,
    updateGambar,
    deleteGambar
} from '../controllers/gambar.controllers.js';
import { isAdmin } from "../middleware/CheckRole.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { upload } from '../middleware/multerConfig.js';
const router = express.Router();

router.post('/', authenticateToken, upload.fields([
    { name: 'gambar_preview', maxCount: 1 },
    { name: 'gambar_kamar', maxCount: 1 },
    { name: 'gambar_fasilitas', maxCount: 1 },
    { name: 'gambar_lokasi', maxCount: 1 }
]), createGambar);
router.get('/', authenticateToken, getAllGambar);
router.get('/:id', authenticateToken, getGambarById);
router.put('/:id', authenticateToken, upload.fields([
    { name: 'gambar_preview', maxCount: 1 },
    { name: 'gambar_kamar', maxCount: 1 },
    { name: 'gambar_fasilitas', maxCount: 1 },
    { name: 'gambar_lokasi', maxCount: 1 }
]), updateGambar);
router.delete('/:id', authenticateToken, deleteGambar);

export default router;
