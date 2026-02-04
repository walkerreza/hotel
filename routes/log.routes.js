import express from 'express';
import { Op } from 'sequelize';
import Log from '../models/log.model.js';
import { authenticateToken } from '../middleware/VerifyTokens.js';

const router = express.Router();

// Get all logs with authentication
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching logs...');
        const logs = await Log.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${logs.length} logs`);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            message: 'Failed to fetch logs',
            error: error.message 
        });
    }
});

// Delete specific log with authentication
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Log.destroy({
            where: {
                id: req.params.id
            }
        });
        
        if (result === 0) {
            return res.status(404).json({ message: 'Log not found' });
        }
        
        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ 
            message: 'Failed to delete log',
            error: error.message 
        });
    }
});

// Clear all logs with authentication
router.delete('/clear/all', authenticateToken, async (req, res) => {
    try {
        await Log.destroy({
            where: {},
            truncate: true
        });
        res.status(200).json({ message: 'All logs cleared successfully' });
    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).json({ 
            message: 'Failed to clear logs',
            error: error.message 
        });
    }
});

export default router;
