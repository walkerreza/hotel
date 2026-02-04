import express from "express";
import { buatPembayaran, daftarPembayaran, updateStatusPembayaran, logPembayaranDanReservasi, hapusPembayaran, daftarPembayaranByUser } from "../controllers/pembayaran.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin } from "../middleware/CheckRole.js";
import { logActivity } from "../middleware/ActivityLogger.js";

const routerPembayaran = express.Router();

routerPembayaran.post("/", 
    authenticateToken,
    logActivity('CREATE', 'Membuat pembayaran baru'),
    buatPembayaran
);

routerPembayaran.get("/", 
    authenticateToken,
    logActivity('READ', 'Melihat daftar pembayaran'),
    daftarPembayaran
);

routerPembayaran.put("/:id/status", 
    authenticateToken,
    isAdmin, 
    logActivity('UPDATE', 'Mengupdate status pembayaran'),
    updateStatusPembayaran
);

routerPembayaran.get("/log/:id", 
    authenticateToken,
    logActivity('READ', 'Melihat log pembayaran'),
    logPembayaranDanReservasi
);

routerPembayaran.delete("/:id?", 
    authenticateToken,
    isAdmin,
    logActivity('DELETE', 'Menghapus pembayaran'),
    hapusPembayaran
);

routerPembayaran.get("/user/:userId", 
    authenticateToken,
    logActivity('READ', 'Melihat riwayat pembayaran user'),
    daftarPembayaranByUser
);

export default routerPembayaran;