import mongoose from 'mongoose'

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export let lastDbError = null;

const connectDB = async () => {
    // 1. If connection already open and ready, reuse it immediately
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!process.env.MONGODB_URL) {
        const msg = 'MONGODB_URL environment variable is missing in server environment variables';
        console.error(msg);
        lastDbError = msg;
        throw new Error(msg);
    }

    // 2. If a connection is already being established by another concurrent request, reuse the promise
    if (!cached.promise) {
        const rawUrl = process.env.MONGODB_URL.trim();
        let connectionString = rawUrl;

        // Ensure database name glairit-Socially is properly specified before any query parameters
        if (!connectionString.toLowerCase().includes('glairit-socially')) {
            if (connectionString.includes('?')) {
                const [base, query] = connectionString.split('?');
                const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                connectionString = `${cleanBase}/glairit-Socially?${query}`;
            } else {
                const cleanBase = connectionString.endsWith('/') ? connectionString.slice(0, -1) : connectionString;
                connectionString = `${cleanBase}/glairit-Socially`;
            }
        }

        const opts = {
            dbName: 'glairit-Socially',
            serverSelectionTimeoutMS: 15000, // 15s timeout to handle serverless cold starts gracefully
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(connectionString, opts).then((m) => {
            console.log('Database connected successfully');
            lastDbError = null;
            return m;
        }).catch((err) => {
            console.error('Mongoose connection error:', err.message);
            lastDbError = err.message;
            cached.promise = null; // Reset promise so subsequent requests can retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB
