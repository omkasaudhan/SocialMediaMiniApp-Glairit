import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'))

         const db_URL = process.env.MONGODB_URL.endsWith('/') 
            ? process.env.MONGODB_URL.slice(0, -1) 
            : process.env.MONGODB_URL;

        await mongoose.connect(`${db_URL}/glairit-Socially`)
    } catch (error) {
        console.log(`Mongoose connection error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB