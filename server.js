const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 7000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`PoCServer running on http://localhost:${PORT}`);
    console.log('Available users: admin/admin123, operator/operator123, viewer/viewer123');
});
