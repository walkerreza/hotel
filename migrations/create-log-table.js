import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const createLogTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                userId INT,
                metadata JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('Log table created successfully');
    } catch (error) {
        console.error('Error creating log table:', error);
    }
};

createLogTable();
