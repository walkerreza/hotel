import express from "express";
import db from "./config/db.config.js";
import userRoute from "./routes/user.routes.js";
import kamarRoute from "./routes/kamar.routes.js";
import reservasiRoute from "./routes/reservasi.routes.js";
import pembayaranRoute from "./routes/pembayaran.routes.js";
import loginRoute from "./routes/login.routes.js";
import gambarRoute from "./routes/gambar.routes.js"; // Menambahkan route gambar

import cors from "cors";

const app = express();

async function connectDatabase() {
    try {
        await db.authenticate();
        console.log("Database Ok");
    } catch (error) {
        console.log("Belum konek:", error);
    }
}

connectDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', userRoute);
app.use('/api/kamar', kamarRoute);
app.use('/api/reservasi', reservasiRoute);
app.use('/api/pembayaran', pembayaranRoute);
app.use('/login', loginRoute);
app.use('/api/gambar', gambarRoute); // Menambahkan route untuk gambar
app.use('/uploads', express.static('uploads'));

app.listen(5000, () => {
    console.log("Server berjalan di port 5000");
});
