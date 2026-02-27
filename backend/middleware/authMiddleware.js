import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        console.warn(`[admin] Auth failed for user ${req.user?._id}, role: ${req.user?.role}`);
        res.status(403).json({ message: 'Not authorized as an Admin' });
    }
};

export const teacherOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Teacher')) {
        next();
    } else {
        console.warn(`[teacherOrAdmin] Auth failed for user ${req.user?._id}, role: ${req.user?.role}`);
        res.status(403).json({ message: 'Not authorized. Requires Teacher or Admin role.' });
    }
};
