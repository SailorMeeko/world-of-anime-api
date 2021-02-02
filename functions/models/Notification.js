const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Notification = mongoose.model('notification', NotificationSchema);