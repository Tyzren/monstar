const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenService {
    static ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;
    static REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

    static generateAccessToken(userId, isAdmin) {
        return jwt.sign(
            { id: userId, isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '15m' },
        );
    };

    static generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }

    static hashRefreshToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

module.exports = TokenService;