import { Sequelize } from "sequelize";
import db from "../config/db.config.js";


const { DataTypes } = Sequelize;

const User = db.define(
    'users',
    { 
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        photo_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
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

export default User;
