import mongoose from 'mongoose'

let isConnected = false;
export let lastDbError = null;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        if (!process.env.MONGODB_URL) {
            const msg = 'MONGODB_URL environment variable is missing in server environment variables';
            console.error(msg);
            lastDbError = msg;
            return;
        }

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

        const db = await mongoose.connect(connectionString, {
            dbName: 'glairit-Socially',
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = db.connections[0].readyState === 1;
        lastDbError = null;
        console.log('Database connected successfully');
    } catch (error) {
        lastDbError = error.message;
        console.error(`Mongoose connection error: ${error.message}`);
    }
}

export default connectDB
