import express from "express";
import { tambahKamar, daftarKamar, editKamar, deleteKamar } from "../controllers/kamar.controllers.js";
import { authenticateToken } from "../middleware/VerifyTokens.js";
import { isAdmin } from "../middleware/CheckRole.js";
import { upload } from '../middleware/multerConfig.js';

const routerKamar = express.Router();


routerKamar.post("/", authenticateToken, isAdmin, tambahKamar);
routerKamar.put("/:id", authenticateToken, isAdmin, editKamar);
routerKamar.delete("/:id", authenticateToken, isAdmin, deleteKamar);


routerKamar.get("/", authenticateToken, daftarKamar);

export default routerKamar;

