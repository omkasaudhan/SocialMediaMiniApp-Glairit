import express from 'express'
import { getChatMessages,sseController, sendMessage } from '../controllers/messageController.js';
import { upload } from '../Config/multer.js';
import { protect } from '../Middlewares/auth.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController)
messageRouter.post('/send', protect, upload.single('image'), sendMessage)
messageRouter.get('/get', protect, getChatMessages)

export default messageRouter