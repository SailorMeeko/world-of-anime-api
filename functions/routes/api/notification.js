const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const requireAuth = require('../../middleware/auth');


const Notification = require('../../models/Notification');
const User = require('../../models/User');

// @router  POST api/notification
// @desc    Create a notification
// @access  Private
router.post('/', auth, async (req, res) => {
      try {
          const newNotification = new Notification({
              user: req.body.user,
              text: req.body.text,
              type: req.body.type
          });
  
          const notification = await newNotification.save();
  
          res.json(notification);
      } catch (error) {
          console.error(error.message);
          res.status(500).send('Server Error');
      }
  });

// @router  GET api/notification/get
// @desc    Get all notification for a user
// @access  Public
router.get('/get', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const notifications = await Notification.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments({ user: req.user.id });            

        res.json({
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page
          });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

// @router  DELETE api/notification/notification/:notification_id
// @desc    Delete single notification
// @access  Private
router.delete('/notification/:notification_id', requireAuth, async (req, res) => {
    try {
        // Remove notification
        const result = await Notification.findOneAndRemove({ _id: req.params.notification_id, user: req.user.id });

        if (result) {
            res.json({ msg: 'Notification deleted' });
        } else {
            res.json({ msg: 'Notification not deleted' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @router  DELETE api/notification/notifications
// @desc    Delete all notifications for a user
// @access  Private
router.delete('/notifications', requireAuth, async (req, res) => {
    try {
        // Remove notifications
        await Notification.deleteMany({ user: req.user.id });

        res.json({ msg: 'Notifications deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;