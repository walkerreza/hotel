import { DataTypes } from 'sequelize';
import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import User from "./user.models.js";
import Kamar from "./kamar.models.js";


const Reservasi = db.define(
    'reservasis',
    { 
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id',
            },
            allowNull: false,
        },
        kamar_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Kamar,
                key: 'id',
            },
            allowNull: false,
        },
        tanggal_checkin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        tanggal_checkout: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status_reservasi: {
            type: DataTypes.ENUM('dipesan', 'dibatalkan', 'selesai'),
            defaultValue: 'dipesan',
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

User.hasMany(Reservasi, { foreignKey: 'user_id' });
Kamar.hasMany(Reservasi, { foreignKey: 'kamar_id' });
Reservasi.belongsTo(User, { foreignKey: 'user_id' });
Reservasi.belongsTo(Kamar, { foreignKey: 'kamar_id' });


export default Reservasi;
