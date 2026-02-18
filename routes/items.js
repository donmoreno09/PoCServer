const express = require('express');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

// In-memory items store (seeded from JSON)
let items = require('../data/items.json').map(i => ({ ...i }));
let nextId = items.length + 1;

// All routes require authentication
router.use(authenticate);

// GET /api/items — list all items
router.get('/', requirePermission('items.read'), (req, res) => {
    console.log(`[Items] → GET /api/items | user: ${req.user.username}`);

    res.json(items);

    console.log(`[Items] ← 200 | count: ${items.length}`);
});

// POST /api/items — create item
router.post('/', requirePermission('items.write'), (req, res) => {
    console.log(`[Items] → POST /api/items | user: ${req.user.username}`);
    console.log(`[Items]   body:`, JSON.stringify(req.body));

    const { name, status } = req.body;
    if (!name) {
        console.log(`[Items] ← 400 | missing name`);
        return res.status(400).json({ error: 'Name is required' });
    }

    const item = { id: nextId++, name, status: status || 'active' };
    items.push(item);

    console.log(`[Items] ← 201 | created:`, JSON.stringify(item));
    res.status(201).json(item);
});

// PUT /api/items/:id — update item
router.put('/:id', requirePermission('items.write'), (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[Items] → PUT /api/items/${id} | user: ${req.user.username}`);
    console.log(`[Items]   body:`, JSON.stringify(req.body));

    const item = items.find(i => i.id === id);

    if (!item) {
        console.log(`[Items] ← 404 | id ${id} not found`);
        return res.status(404).json({ error: 'Item not found' });
    }

    if (req.body.name)   item.name   = req.body.name;
    if (req.body.status) item.status = req.body.status;

    console.log(`[Items] ← 200 | updated:`, JSON.stringify(item));
    res.json(item);
});

// DELETE /api/items/:id — delete item
router.delete('/:id', requirePermission('items.delete'), (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[Items] → DELETE /api/items/${id} | user: ${req.user.username}`);

    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
        console.log(`[Items] ← 404 | id ${id} not found`);
        return res.status(404).json({ error: 'Item not found' });
    }

    items.splice(index, 1);

    console.log(`[Items] ← 204 | removed id: ${id} | remaining: ${items.length}`);
    res.status(204).send();
});

module.exports = router;
