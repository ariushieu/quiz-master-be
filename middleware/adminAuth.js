import { auth } from './auth.js';

// Admin middleware - requires auth middleware to run first
export const adminAuth = async (req, res, next) => {
    // auth middleware already ran and set req.user
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};
