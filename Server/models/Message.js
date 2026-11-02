import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from_user_id: {type: String, ref: 'User', required: true},
    to_user_id: {type: String, ref: 'User', required: true},
    text: {type:String },
    media_url: [{type:String }],
    message_type: {type: String, enum: ['text', 'image']},
    seen: {type: Boolean, default: false}
}, { timestamps: true , minimize: false });

const Message = mongoose.model('Message', messageSchema);

export default Message;