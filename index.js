import express from "express";
import cors from "cors";
import userRoute from "./routes/user.routes.js";
import kamarRoute from "./routes/kamar.routes.js";
import reservasiRoute from "./routes/reservasi.routes.js";
import pembayaranRoute from "./routes/pembayaran.routes.js";
import loginRoute from "./routes/login.routes.js";
import gambarRoute from "./routes/gambar.routes.js"; 
import logRoute from "./routes/log.routes.js";
import notificationRoute from "./routes/notification.routes.js";
import ulasanRoute from "./routes/ulasan.routes.js";
import db from "./config/db.config.js";
import User from "./models/user.models.js";
import Reservasi from "./models/reservasi.models.js";
import Pembayaran from "./models/pembayaran.models.js";

const app = express();

// CORS middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profiles', express.static('uploads/profiles'));

// Routes
app.use('/api/user', userRoute);
app.use('/api/kamar', kamarRoute);
app.use('/api/reservasi', reservasiRoute);
app.use('/api/pembayaran', pembayaranRoute);
app.use('/login', loginRoute);
app.use('/api/gambar', gambarRoute); 
app.use('/api/log', logRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/ulasan', ulasanRoute);

// Inisialisasi relasi model
async function initializeModels() {
    try {
        // Sync models dengan database
        await User.sync();
        await Reservasi.sync();
        await Pembayaran.sync();
        
        console.log('Models synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
}

// Test database connection
async function connectDatabase() {
    try {
        await db.authenticate();
        console.log('Database connected...');
        await initializeModels();
    } catch (error) {
        console.error('Connection error:', error);
    }
}

connectDatabase();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
