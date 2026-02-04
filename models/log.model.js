import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const Log = db.define('log', {
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
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

export default Log;
