import { DataTypes } from 'sequelize';
import { Sequelize } from "sequelize";
import db from "../config/db.config.js";
import User from "./user.models.js";
import Kamar from "./kamar.models.js";

const Ulasan = db.define(
    'ulasans',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_kamar: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        ulasan: {
            type: DataTypes.TEXT,
            allowNull: false,
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

// Relasi
User.hasMany(Ulasan, { foreignKey: 'id_user' });
Ulasan.belongsTo(User, { foreignKey: 'id_user' });

Kamar.hasMany(Ulasan, { foreignKey: 'id_kamar' });
Ulasan.belongsTo(Kamar, { foreignKey: 'id_kamar' });

export default Ulasan;
