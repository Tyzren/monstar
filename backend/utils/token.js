const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (userId, isAdmin) => {
    return jwt.sign(
        { id: userId, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '15m' },
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
}

const hashRefreshToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
}