const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        // Debug logs
        console.log('Environment Check:', {
            nodeEnv: process.env.NODE_ENV,
            mongoURI: process.env.MONGODB_URI ? 'Exists' : 'Missing'
        });

        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set up error handling for the connection
        conn.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Handle successful reconnection
        conn.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = connectDB;
