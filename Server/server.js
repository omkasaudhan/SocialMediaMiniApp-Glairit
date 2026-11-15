import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { serve } from 'inngest/express'
import connectDB from './Config/db.js'
import { inngest, functions } from './inngest/index.js'
import User from './models/User.js'
import { clerkMiddleware } from '@clerk/express'                                            
import userRouter from './routes/userRoutes.js'
import postRouter from './routes/postRoutes.js'
import storyRouter from './routes/storyRoutes.js'
import messageRouter from './routes/messageRoutes.js'

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Connect to DB middleware (ensures DB is connected on request without crashing serverless cold starts)
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (err) {
        console.error('DB connection error in middleware:', err.message);
    }
    next();
});

// Guard clerkMiddleware so missing keys return a descriptive message instead of 500 crash
if (process.env.CLERK_PUBLISHABLE_KEY || process.env.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware());
} else {
    console.warn('Warning: CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing in environment variables');
}

app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/inngest', serve({ client: inngest, functions }));

// Direct test endpoint to verify Clerk user sync into MongoDB Atlas immediately via Postman
app.post('/api/test-sync-user', async (req, res) => {
    try {
        const eventData = req.body.data || req.body;
        const { id, first_name, last_name, email_addresses, image_url } = eventData;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Missing user id in payload' });
        }
        const primaryEmail = email_addresses && email_addresses.length > 0
            ? email_addresses[0].email_address
            : `user_${id}@glairit.com`;

        let username = primaryEmail.split('@')[0];
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id !== id) {
                username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
                attempts++;
            } else {
                isUnique = true;
            }
        }
        const userData = {
            _id: id,
            email: primaryEmail,
            full_name: `${first_name || ""} ${last_name || ""}`.trim(),
            profile_picture: image_url || '',
            username
        };
        const user = await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
        return res.json({ success: true, message: 'User saved to MongoDB Atlas successfully!', user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Helper endpoint to dispatch any event to Inngest via Inngest SDK
app.post('/api/send-event', async (req, res) => {
    try {
        const { name, data } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Event name is required (e.g. clerk/user.created)' });
        }
        const response = await inngest.send({ name, data: data || {} });
        return res.json({
            success: true,
            message: `Event '${name}' sent to Inngest successfully`,
            response
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

// In local environment, start listening on PORT. On Vercel (serverless), export default app.
if (!process.env.VERCEL) {
    await connectDB();
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
}

export default app;
