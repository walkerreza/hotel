import { DataTypes } from 'sequelize';
import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import Gambar from "./gambar.models.js"; // Import model Gambar

const Kamar = db.define(
    'kamars',
    { 
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nomor_kamar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipe_kamar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        harga_per_malam: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        status_kamar: {
            type: DataTypes.ENUM('tersedia', 'dipesan'),
            defaultValue: 'tersedia',
        },
        gambar_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Gambar.hasMany(Kamar, { foreignKey: 'gambar_id' });
Kamar.belongsTo(Gambar, { foreignKey: 'gambar_id' });

export default Kamar;
