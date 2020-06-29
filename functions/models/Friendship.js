const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: Number,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('friendship', FriendshipSchema);