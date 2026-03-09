const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '24h' });
};

module.exports = { generateToken };