import express from "express";
import { 
    buatReservasi, 
    daftarReservasi, 
    daftarReservasiByUserId, 
    updateStatusReservasi, 
    hapusReservasi, 
    checkKamarStatus, 
    checkoutReservasi, 
    updateExpiredReservations,
    batalkanReservasi 
} from "../controllers/reservasi.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin, isUser } from "../middleware/CheckRole.js";
import { logActivity } from "../middleware/ActivityLogger.js";

const routerReservasi = express.Router();

routerReservasi.post("/", 
    authenticateToken,
    logActivity('CREATE', 'Membuat reservasi baru'),
    buatReservasi
);

routerReservasi.get("/", 
    authenticateToken, 
    logActivity('READ', 'Melihat daftar reservasi'),
    daftarReservasi
);

routerReservasi.get("/user/:userId", 
    authenticateToken, 
    logActivity('READ', 'Melihat daftar reservasi berdasarkan user ID'),
    daftarReservasiByUserId
);

routerReservasi.put("/:id/status", 
    authenticateToken, 
    isAdmin, 
    logActivity('UPDATE', 'Mengupdate status reservasi'),
    updateStatusReservasi
);

routerReservasi.put("/:id/checkout", 
    authenticateToken,
    logActivity('UPDATE', 'Checkout reservasi'),
    checkoutReservasi
);

routerReservasi.put("/:id/cancel", 
    authenticateToken,
    logActivity('UPDATE', 'Membatalkan reservasi'),
    batalkanReservasi
);

routerReservasi.delete("/:id", 
    authenticateToken, 
    isAdmin, 
    logActivity('DELETE', 'Menghapus reservasi'),
    hapusReservasi
);

// Endpoint baru untuk mengecek status kamar
routerReservasi.get("/kamar/:kamarId/status",
    authenticateToken,
    logActivity('READ', 'Mengecek status kamar'),
    checkKamarStatus
);

// Endpoint untuk update status reservasi yang expired
routerReservasi.post("/update-expired", 
    authenticateToken,
    logActivity('UPDATE', 'Update status reservasi expired'),
    updateExpiredReservations
);

export default routerReservasi;
