import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.config.js";
import Pembayaran from "./pembayaran.models.js";

const BuktiPembayaran = db.define(
    'bukti_pembayarans',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        pembayaran_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Pembayaran,
                key: 'id',
            },
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        keterangan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        verified_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        verified_by: {
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
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

// Relasi dengan model Pembayaran
Pembayaran.hasMany(BuktiPembayaran, { foreignKey: 'pembayaran_id' });
BuktiPembayaran.belongsTo(Pembayaran, { foreignKey: 'pembayaran_id' });

export default BuktiPembayaran; 