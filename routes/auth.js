const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { signAccessToken, verifyAccessToken, getExpiresInSeconds } = require('../utils/jwt');
const users = require('../data/users.json');

const router = express.Router();

// In-memory refresh token store: { refreshToken: userId }
const refreshTokens = new Map();

// POST /auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = uuidv4();

    refreshTokens.set(refreshToken, user.id);

    console.log(`[LOGIN] User "${user.username}" logged in`);

    res.json({
        accessToken,
        refreshToken,
        expiresIn: getExpiresInSeconds(),
        user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions
        }
    });
});

// POST /auth/refresh
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    const userId = refreshTokens.get(refreshToken);

    if (!userId) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    // Rotate refresh token
    refreshTokens.delete(refreshToken);
    const newRefreshToken = uuidv4();
    refreshTokens.set(newRefreshToken, user.id);

    const accessToken = signAccessToken(user);

    console.log(`[REFRESH] Token refreshed for user "${user.username}"`);

    res.json({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: getExpiresInSeconds(),
        user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions
        }
    });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = verifyAccessToken(token);
            // Remove all refresh tokens for this user
            for (const [rt, uid] of refreshTokens.entries()) {
                if (uid === decoded.sub) {
                    refreshTokens.delete(rt);
                }
            }
            console.log(`[LOGOUT] User "${decoded.username}" logged out`);
        } catch (err) {
            // Token might be expired, still allow logout
        }
    }

    res.status(204).send();
});

module.exports = router;
