import express from 'express'
import { getFeedPosts, likePost, addPost } from '../controllers/postController.js';
import { protect } from '../Middlewares/auth.js';
import { upload } from '../Config/multer.js';

const postRouter = express.Router();

postRouter.post('/add', upload.array('images', 4), protect, addPost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)

export default postRouter