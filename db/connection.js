const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MongoDB connection error: MONGO_URI is not set in .env');
        process.exit(1);
    }

    if (mongoUri.includes('<') || mongoUri.includes('>')) {
        console.error('MongoDB connection error: MONGO_URI appears to contain placeholder credentials. Please update .env with a valid connection string.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message || err);
        process.exit(1);
    }
};

module.exports = connectDB;