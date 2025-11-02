const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// Get all feedback
router.get('/', (req, res) => {
    const query = 'SELECT * FROM feedback ORDER BY created_at DESC';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, feedback: rows });
    });
});

// Add new feedback
router.post('/', (req, res) => {
    const { name, email, service, rating, text } = req.body;
    
    if (!name || !email || !service || !rating || !text) {
        return res.status(400).json({ success: false, error: 'All fields required' });
    }
    
    const query = `INSERT INTO feedback (name, email, service, rating, text, created_at) 
                   VALUES (?, ?, ?, ?, ?, datetime('now'))`;
    
    db.run(query, [name, email, service, rating, text], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Update feedback (admin only)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, service, rating, text } = req.body;
    
    const query = `UPDATE feedback SET name = ?, email = ?, service = ?, rating = ?, text = ? 
                   WHERE id = ?`;
    
    db.run(query, [name, email, service, rating, text, id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// Delete feedback (admin only)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM feedback WHERE id = ?';
    
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, changes: this.changes });
    });
});

module.exports = router;