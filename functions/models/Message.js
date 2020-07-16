const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    to: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },    
    subject: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Number,
        default: 0
    },
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Message = mongoose.model('message', MessageSchema);