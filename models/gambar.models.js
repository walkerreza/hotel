import { DataTypes } from 'sequelize';
import db from "../config/db.config.js";

const Gambar = db.define(
    'gambars',
    { 
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        gambar_preview: {
            type: DataTypes.STRING,
            allowNull: false, // Menambahkan allowNull: false
        },
        gambar_kamar: {
            type: DataTypes.STRING,
            allowNull: false, // Menambahkan allowNull: false
        },
        gambar_fasilitas: {
            type: DataTypes.STRING,
            allowNull: false, // Menambahkan allowNull: false
        },
        gambar_lokasi: {
            type: DataTypes.STRING,
            allowNull: false, // Menambahkan allowNull: false
        },
 
    },
);

export default Gambar;
