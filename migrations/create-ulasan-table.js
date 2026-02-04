import { Sequelize } from 'sequelize';
import db from '../config/db.config.js';

const createUlasanTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS ulasans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_user INT NOT NULL,
                id_kamar INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                ulasan TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (id_kamar) REFERENCES kamars(id) ON DELETE CASCADE
            );
        `);
        console.log('Ulasan table created successfully');
    } catch (error) {
        console.error('Error creating ulasan table:', error);
    }
};

createUlasanTable();
