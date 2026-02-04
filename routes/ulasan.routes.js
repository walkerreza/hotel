import express from "express";
import { 
    getUlasanByKamar,
    getAllUlasan,
    createUlasan,
    updateUlasan,
    deleteUlasan
} from "../controllers/ulasan.controller.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";

const router = express.Router();

// Route untuk ulasan
router.get('/kamar/:id_kamar', getUlasanByKamar);
router.get('/', getAllUlasan);
router.post('/', authenticateToken, createUlasan);
router.put('/:id', authenticateToken, updateUlasan);
router.delete('/:id', authenticateToken, deleteUlasan);

export default router;
