require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = 7000;

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in .env file');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/items', itemsRouter);

app.get('/health', (req, res) => {
    console.log('[Health] GET /health');
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`PoCServer running on http://localhost:${PORT}`);
    console.log('Available users: admin/admin123, operator/operator123, viewer/viewer123');
});
