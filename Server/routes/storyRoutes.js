import express from 'express'
import { addStory, getStories } from '../controllers/storyController.js';
import { protect } from '../Middlewares/auth.js';
import { upload } from '../Config/multer.js';

const storyRouter = express.Router();

storyRouter.post('/create', upload.single('media'), protect, addStory)
storyRouter.get('/get', protect, getStories)

export default storyRouter