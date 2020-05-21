const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    profile_pic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'image'
    },
    username: {
        type: String
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
    show_age: {
        type: Boolean
    },
    about_me: {
        type: String
    },
    favorite_anime: {
        type: String
    },
    favorite_movies: {
        type: String
    },
    createDate: {
        type: Date
    },
    updateDate: {
        type: Date
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);