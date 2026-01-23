const retailer = (req, res, next) => {
    if (req.user && req.user.role === 'retailer') {
        next();
    } else {
        res.status(401).json({ error: 'Not authorized as a retailer' });
    }
};

module.exports = { retailer };
