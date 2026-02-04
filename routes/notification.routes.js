import express from 'express';
import { authenticateToken } from '../middleware/VerifyTokens.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Get all unread notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: {
                isRead: false
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ 
            message: 'Failed to fetch notifications',
            error: error.message 
        });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.update(
            { isRead: true },
            { 
                where: { id: req.params.id }
            }
        );
        
        if (notification[0] === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ 
            message: 'Failed to update notification',
            error: error.message 
        });
    }
});

// Create notification (internal use)
router.post('/', async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ 
            message: 'Failed to create notification',
            error: error.message 
        });
    }
});

export default router;
