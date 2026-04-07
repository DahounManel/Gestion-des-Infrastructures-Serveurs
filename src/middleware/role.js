const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
        }
        
        next();
    };
};

module.exports = requireRole;
