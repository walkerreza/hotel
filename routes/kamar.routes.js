import express from "express";
import { 
    tambahKamar, 
    daftarKamar, 
    editKamar, 
    deleteKamar, 
    daftarKamarById,
    getAvailableRooms,
    getKamarByReservasi
} from "../controllers/kamar.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin } from "../middleware/CheckRole.js";
import { logActivity } from "../middleware/ActivityLogger.js";

const routerKamar = express.Router();

routerKamar.post("/", 
    authenticateToken, 
    isAdmin, 
    logActivity('CREATE', 'Menambah kamar baru'),
    tambahKamar
);

routerKamar.get("/", 
    logActivity('READ', 'Melihat daftar kamar'),
    daftarKamar
);

// Route untuk mendapatkan kamar tersedia berdasarkan tanggal
routerKamar.get("/available/:date",
    logActivity('READ', 'Melihat kamar tersedia'),
    getAvailableRooms
);

routerKamar.get("/reservasi/:reservasi_id",
    authenticateToken,
    logActivity('READ', 'Melihat kamar berdasarkan reservasi'),
    getKamarByReservasi
);

routerKamar.put("/:id", 
    authenticateToken, 
    isAdmin,
    logActivity('UPDATE', 'Mengubah data kamar'),
    editKamar
);

routerKamar.delete("/:id",
    authenticateToken,
    isAdmin,
    logActivity('DELETE', 'Menghapus kamar'),
    deleteKamar
);

routerKamar.get("/:id",
    logActivity('READ', 'Melihat detail kamar'),
    daftarKamarById
);

export default routerKamar;
