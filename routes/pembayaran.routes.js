import express from "express";
import { buatPembayaran, daftarPembayaran, updateStatusPembayaran, logPembayaranDanReservasi,hapusPembayaran } from "../controllers/pembayaran.controllers.js";
import { isAdmin } from "../middleware/CheckRole.js";

const routerPembayaran = express.Router();
routerPembayaran.post("/", buatPembayaran);
routerPembayaran.get("/", daftarPembayaran);
routerPembayaran.put("/:id/status", updateStatusPembayaran);
routerPembayaran.get("/log/:id", logPembayaranDanReservasi); // Rute untuk log berdasarkan ID
routerPembayaran.get("/log/username/:username", logPembayaranDanReservasi);
routerPembayaran.delete("/:id?",hapusPembayaran); //jika id kosong maka hapus semua data pembayaran


export default routerPembayaran;