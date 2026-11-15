import mongoose from 'mongoose'

let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        if (!process.env.MONGODB_URL) {
            console.error('MONGODB_URL environment variable is missing in .env');
            return;
        }

        const rawUrl = process.env.MONGODB_URL.trim();
        const db_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

        const connectionString = db_URL.includes('glairit-Socially') 
            ? db_URL 
            : `${db_URL}/glairit-Socially`;

        const db = await mongoose.connect(connectionString);
        isConnected = db.connections[0].readyState === 1;
        console.log('Database connected');
    } catch (error) {
        console.error(`Mongoose connection error: ${error.message}`);
        // Do NOT call process.exit(1) on serverless platforms (Vercel)
        // because it crashes the container with 500 FUNCTION_INVOCATION_FAILED
    }
}

export default connectDB
