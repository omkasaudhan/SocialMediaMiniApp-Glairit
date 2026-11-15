import imagekit from '../Config/imagekit.js'
import fs from 'fs'
import Story from '../models/Story.js'
import User from '../models/User.js'
import { inngest } from '../inngest/index.js'

export const addStory = async (req, res) => {
    try {
        const userId = req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
        const { content, background_color, media_type } = req.body
        const media = req.file
        
        let media_url = ''

        if ((media_type === 'image' || media_type === 'video') && media) {
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })
            media_url = response.url
            if (fs.existsSync(media.path)) {
                fs.unlinkSync(media.path)
            }
        }

        // create story
        const story = await Story.create({
            user: userId,
            content,
            media_urls: media_url,
            media_type,
            background_color
        })

        // schedule story deletion after 24 hours
        try {
            await inngest.send({
                name: 'app/story-delete',
                data: { storyId: story._id }
            })
        } catch (inngestErr) {
            console.error("Inngest story-delete send error:", inngestErr.message)
        }

        res.json({ success: true, message: "Story created successfully", story })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}  

// Get stories
export const getStories = async (req, res) => {
    try {
        const userId = req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
        const user = await User.findById(userId)
        const userIds = [userId, ...(user?.connections || []), ...(user?.following || [])]
        
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 })
        res.json({ success: true, stories })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
