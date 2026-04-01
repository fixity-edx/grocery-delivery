const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if this is an admin token (string ID instead of ObjectId)
            if (decoded.id === 'admin') {
                req.user = {
                    _id: 'admin',
                    id: 'admin',
                    email: process.env.ADMIN_EMAIL,
                    role: 'admin',
                    name: 'Administrator',
                    isActive: true
                };
                return next();
            }

            // Get user from token (regular user with ObjectId)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ success: false, message: 'Account is deactivated' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Role-based authorization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Admin authentication (env-based)
exports.adminAuth = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Create a temporary admin user object
            req.user = {
                id: 'admin',
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
                name: 'Administrator'
            };
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Generate JWT Token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
