import fs from 'fs'
import Message from '../models/Message.js'
import imagekit from '../Config/imagekit.js'

const connections = {}

export const sseController = (req, res) => {
    const userId = req.params?.userId || req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
    console.log('New client connected: ', userId)

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()
    res.write(':\n\n')

    // Store the response object in the connections object
    connections[userId] = res

    // Handle client disconnect
    req.on('close', () => {
        console.log('Client disconnected: ', userId)
        delete connections[userId]
    })
}

// send Message
export const sendMessage = async (req, res) => {
    try {
        const userId = req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
        const { to_user_id, text } = req.body
        const image = req.file 

        let media_url = ''
        let message_type = image ? 'image' : 'text'

        if (message_type === 'image' && image) {
            const fileStream = fs.createReadStream(image.path)
            const response = await imagekit.upload({
                file: fileStream,
                fileName: image.originalname,
            })
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path)
            }
            media_url = imagekit.url({
                path: response.filePath || response.filepath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            })
        }
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            media_url,
            message_type,
        })
        res.json({ success: true, message: message, data: message })

        // Send the message to the recipient if they are connected
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id')
        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
        }
    } catch (error) {
        console.error('Error sending message:', error)  
        res.json({ success: false, message: error.message })
    }
}

// Get Chat Messages
export const getChatMessages = async (req, res) => {
    try {
        const userId = req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
        const to_user_id = req.body?.to_user_id || req.query?.to_user_id
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: 1 })

        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId, seen: false },
            { $set: { seen: true } }
        )
        res.json({ success: true, data: messages, messages })
    } catch (error) {
        console.error('Error fetching chat messages:', error)
        res.json({ success: false, message: error.message })
    }
}

export const getUserRecentMessages = async (req, res) => {
    try {
        const userId = req.userId || (typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId)
        const messages = await Message.find({
            $or: [
                { from_user_id: userId },
                { to_user_id: userId },
            ]
        })
        .populate('from_user_id', 'full_name username profile_picture')
        .populate('to_user_id', 'full_name username profile_picture')
        .sort({ createdAt: -1 })

        res.json({ success: true, data: messages, messages })
    } catch (error) {
        console.error('Error fetching recent messages:', error)
        res.json({ success: false, message: error.message })
    }
}
