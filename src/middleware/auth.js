const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized. Token missing or invalid." });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, role, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized. Token missing or invalid." });
    }
};

module.exports = auth;
