import Log from '../models/log.model.js';

export const logActivity = (type, description) => {
    return async (req, res, next) => {
        const originalJson = res.json;

        res.json = async function(data) {
            try {
                // Log the activity
                await Log.create({
                    type,
                    description,
                    userId: req.user?.id || null,
                    metadata: {
                        path: req.originalUrl,
                        method: req.method,
                        timestamp: new Date(),
                        requestBody: req.body ? JSON.stringify(req.body) : null
                    }
                });

                // Call the original json function
                return originalJson.call(this, data);
            } catch (error) {
                console.error('Error logging activity:', error);
                // Still send the response even if logging fails
                return originalJson.call(this, data);
            }
        };

        next();
    };
};
