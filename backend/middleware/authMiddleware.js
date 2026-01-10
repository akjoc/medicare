const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Blacklist = require('../models/blacklist');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Split by any amount of whitespace to be robust
            const parts = req.headers.authorization.split(/\s+/);
            token = parts[1];

            if (!token || parts[0].toLowerCase() !== 'bearer') {
                console.error('Core Auth Error: Malformed Authorization Header', req.headers.authorization);
                return res.status(401).json({ error: 'Not authorized, token missing or malformed' });
            }

            // Check if token is blacklisted
            const blacklistedToken = await Blacklist.findOne({ where: { token } });
            if (blacklistedToken) {
                return res.status(401).json({ error: 'Not authorized, token revoked' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Core Auth Error:', error.message);
            console.error('Token:', token);
            // console.error('Decoded:', jwt.decode(token)); // Optional: to see if structure is valid
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { protect };
