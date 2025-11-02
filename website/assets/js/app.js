const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const projectsRoutes = require('../api/routes/projects');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/projects', projectsRoutes);

// Page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/index.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/projects.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/admin.html'));
});

app.get('/hub', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/hub.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'DevNexes Solutions API is running!',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;