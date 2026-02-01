const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const vinRoutes = require('./routes/vin');
const carAPIRoutes = require('./routes/carAPI');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/vin', vinRoutes);
app.use('/api', carAPIRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database
db.init().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Access at: http://localhost:${PORT}`);
        if (process.env.RENDER || process.env.RAILWAY || process.env.FLY) {
            console.log(`🌐 Public URL will be provided by hosting platform`);
        }
    });
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
