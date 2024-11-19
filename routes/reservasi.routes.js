import express from "express";
import { buatReservasi, daftarReservasi, updateStatusReservasi, hapusReservasi} from "../controllers/reservasi.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin, isUser } from "../middleware/CheckRole.js";

const routerReservasi = express.Router();


// routerReservasi.post("/", authenticateToken, isUser, buatReservasi);
routerReservasi.post("/", authenticateToken,isUser, buatReservasi);
routerReservasi.get("/", authenticateToken, daftarReservasi);
routerReservasi.put("/:id/status", authenticateToken, isAdmin, updateStatusReservasi);

routerReservasi.delete("/:id?", authenticateToken, isAdmin, hapusReservasi); //jika id kosong maka hapus semua reservasi


export default routerReservasi;
