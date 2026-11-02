import imagekit from '../Config/imagekit.js'
import fs from 'fs'
import Story from '../models/Story.js'
import User from '../models/User.js'
import { inngest } from '../inngest/index.js'


export const addStory = async (req, res) => {
    try {
        const {userId} = req.auth
        const {content, background_color, media_type } = req.body
        const media = req.file
        
        let media_url = ''

        if(media_type === 'image' || media_type === 'video'){
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: cover.originalname,
                        })
                        media_url = response.url
            }
            // create story
            const story = await Story.create({
                user: userId,
                content,
                media_urls: media_url,
                media_type,
            })

            //schedule story deletion after 24 hours
            await inngest.send({
                name: 'app/story-delete',
                data: { storyId: story._id }
            })
            res.json({success: true, message: "Story created successfully"})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}  

//Get stories
export const getStories = async (req, res) => {
    try {
        const {userId} = req.auth
        const user = await User.findById(userId)
        const userIds = [userId, ...user.connections, ...user.following]
        
        const stories = await Story.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1})
        res.json({success: true, stories})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// like posts
// export const likePost = async (req, res) => {
//     try {
//         const {userId} = req.auth
//         const {postId} = req.body

//         const post = await Post.findById(postId)
//         if(post.likes_count.include(userId)){
//             post.likes_count = post.likes_count.filter(user => user !== userId)
//             await post.save()
//             res.json({success: true, message: "Post unliked successfully"})        
//         }
//         else{
//             post.likes_count.push(userId)
//             await post.save()
//             res.json({success: true, message: "Post liked successfully"})
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }