import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { serve } from 'inngest/express'
import connectDB from './Config/db.js'
import {inngest, functions} from './inngest/index.js'
import { clerkMiddleware } from '@clerk/express'                                            
import userRouter from './routes/userRoutes.js'
import postRouter from './routes/postRoutes.js'
import storyRouter from './routes/storyRoutes.js'
import messageRouter from './routes/messageRoutes.js'

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

app.get('/', (req, res)=> res.send('Server is running'))
app.use('/api/inngest', serve({client: inngest, functions}))
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

await connectDB();
app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`))

export default app