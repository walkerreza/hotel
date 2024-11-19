import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.config.js";
import Reservasi from "./reservasi.models.js";


const Pembayaran = db.define(
    'pembayarans',
    { 
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reservasi_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Reservasi,
                key: 'id',
            },
            allowNull: false,
        },
        jumlah: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        metode_pembayaran: {
            type: DataTypes.ENUM('transfer', 'kartu kredit', 'cash'),
            allowNull: false,
        },
        status_pembayaran: {
            type: DataTypes.ENUM('pending', 'sukses', 'gagal'),
            defaultValue: 'pending',
        },
        tanggal_pembayaran: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
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



Reservasi.hasOne(Pembayaran, { foreignKey: 'reservasi_id' });
Pembayaran.belongsTo(Reservasi, { foreignKey: 'reservasi_id' });



export default Pembayaran;
