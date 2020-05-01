const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String
    },
    gender: {
        type: String
    },
    birthday: {
        type: Date
    },
    about_me: {
        type: String
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);