const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const statsRoutes = require('./routes/statsRoutes');
const serviceAccount = require('./config/firebase-service-account.json');
require('dotenv').config();

// Initialize Firebase Admin with service account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});
