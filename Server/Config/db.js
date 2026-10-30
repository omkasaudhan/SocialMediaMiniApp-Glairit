import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/glairit-Socially`)
    } catch (error) {
        console.log(`Mongoose connection error: ${error.message}`)
    }
}

export default connectDB