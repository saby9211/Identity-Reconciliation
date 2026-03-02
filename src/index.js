require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const identifyRoute = require('./routes/identify');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Bitespeed Identity Reconciliation Service' });
});

// Routes
app.use('/identify', identifyRoute);

// Auto-create Contact table on startup
async function initializeDatabase() {
    try {
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS Contact (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phoneNumber VARCHAR(10) NULL,
        email VARCHAR(255) NULL,
        linkedId INT NULL,
        linkPrecedence ENUM('primary','secondary') NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phoneNumber),
        INDEX idx_linkedId (linkedId)
      )
    `);
        console.log('✅ Contact table ready');
    } catch (err) {
        console.error('❌ Failed to initialize database:', err.message);
        process.exit(1);
    }
}

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
