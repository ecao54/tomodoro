const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
    try {
        // Check if Authorization header exists
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Add user info to request
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = authMiddleware;
