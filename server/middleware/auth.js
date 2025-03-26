const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "Invalid token - user not found" });
        }

        // Convert userType to lowercase for consistency
        req.user = {
            ...user.toObject(),
            userType: user.userType.toLowerCase()
        };
        
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authenticateJWT;