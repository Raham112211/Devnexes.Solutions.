const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// Get all projects
router.get('/', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ projects: rows });
    });
});

// Add new project
router.post('/', (req, res) => {
    const { title, description, status, image, files } = req.body;
    
    db.run(
        'INSERT INTO projects (title, description, status, image, files) VALUES (?, ?, ?, ?, ?)',
        [title, description, status, image, JSON.stringify(files || [])],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                id: this.lastID,
                message: 'Project added successfully' 
            });
        }
    );
});

// Update project
router.put('/:id', (req, res) => {
    const { title, description, status, image, files } = req.body;
    const { id } = req.params;
    
    db.run(
        'UPDATE projects SET title = ?, description = ?, status = ?, image = ?, files = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, status, image, JSON.stringify(files || []), id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                message: 'Project updated successfully' 
            });
        }
    );
});

// Delete project
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ 
            success: true, 
            message: 'Project deleted successfully' 
        });
    });
});

module.exports = router;