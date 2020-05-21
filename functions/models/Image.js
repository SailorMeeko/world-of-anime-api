const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    url_full: {
        type: String
    },
    url_175: {
        type: String
    },
    url_80: {
        type: String
    },
    filetype: {
        type: String
    },
    height: {
        type: String
    },
    width: {
        type: String
    },
    filesize: {
        type: String
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = Image = mongoose.model('image', ProfileSchema);