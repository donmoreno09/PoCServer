const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '30m';

function signAccessToken(user) {
    const payload = {
        sub: user.id,
        username: user.username,
        name: user.displayName,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        iss: 'poc-auth'
    };

    return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXPIRY });
}

function verifyAccessToken(token) {
    return jwt.verify(token, SECRET);
}

function getExpiresInSeconds() {
    return 30 * 60;
}

module.exports = { signAccessToken, verifyAccessToken, getExpiresInSeconds };
