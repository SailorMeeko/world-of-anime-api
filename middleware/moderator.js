const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const User = require('../models/User');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token and user type

    try {
        const decoded = jwt.verify(token, jwtSecret);
        
        User.findById(decoded.user.id).select().then(function(user) {
            if (user.type !== 'moderator' && user.type !== 'admin') {
                return res.status(401).json({ msg: 'Not authorized' });
            }

            req.user = decoded.user;
            next();
        });

    } catch (error) {
        console.log(error.message)
        res.status(401).json({ msg: 'Token is not valid' });
    }
}