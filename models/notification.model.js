import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const Notification = db.define('notification', {
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM('RESERVASI', 'PEMBAYARAN'),
        allowNull: false
    },
    isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    metadata: {
        type: Sequelize.JSON,
        allowNull: true
    }
}, {
    timestamps: true
});

export default Notification;
