const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    uid: {
        type: String
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'image'
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    lastOnline: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema);