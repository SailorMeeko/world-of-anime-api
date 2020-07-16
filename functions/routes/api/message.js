const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Message = require('../../models/Message');
const Friendship = require('../../models/Friendship');

// @router  POST api/message
// @desc    Create a message
// @access  Private
router.post('/', [ auth, [
    check('text', 'Text is required').not().isEmpty()
  ] ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      // Ensure friendship
      const friends = await areFriends(req.user.id, req.body.to);

      if (!friends) {
          return res.status(500).send('Users are not friends.');
      }
  
      try {
          const newMessage = new Message({
              from: req.user.id,
              to: req.body.to,
              subject: req.body.subject,
              text: req.body.text
          });
  
          const message = await newMessage.save();
  
          res.json(message);
      } catch (error) {
          console.error(error.message);
          res.status(500).send('Server Error');
      }
  });


// @router  GET api/message
// @desc    Get all private messages for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find({ to: req.user.id })
            .populate({ path: 'from', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' }
            })
            .sort({ date: -1 });

        res.json(messages);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/message/:id
// @desc    Get a single private message
// @access  Private
router.get('/single/:message_id', auth, async (req, res) => {
    try {
        const message = await Message.findOne({ _id: req.params.message_id })
            .populate({ path: 'from', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' }
            })
            .populate({ path: 'comments.user',
                populate: { path: 'avatar', select: 'url_avatar, url_full' }
            })
            .sort({ date: -1 });

          // Only the to or from of this message should be allowed to comment
          if (message == null || (req.user.id != message.to && req.user.id != message.from.id) ) {
            return res.status(500).send('This is not your message.');
          }
          
        res.json(message);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  POST api/message/comment/:id
// @desc    Comment on a message
// @access  Private
router.post('/comment/:message_id', [ auth, [
    check('text', 'Text is required').not().isEmpty()  
  ] ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
  
      try {
          const message = await Message.findById(req.params.message_id);

          // Only the to or from of this message should be allowed to comment
          if (req.user.id != message.to && req.user.id != message.from.id) {
            return res.status(500).send('This is not your message.');
          }
  
          const newComment = {
              text: req.body.text,
              user: req.user.id
          };
  
          message.comments.unshift(newComment);

          const updatedMessage = await message.save().then(post => post.populate({ path: 'from', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
            })
            .populate({ path: 'comments.user',
                populate: { path: 'avatar', select: 'url_avatar, url_full' }
            }).execPopulate());
  
          res.json(updatedMessage);
      } catch (error) {
          console.error(error.message);
          res.status(500).send('Server Error');
      }
  });


async function areFriends(user1, user2) {
    // First try user1 -> user2
    const request = await Friendship.find({ user1: user1, user2: user2 });

    if (request.length) {
        const status = request[0].status;

        if (status === 1) {
            return true;
        }

    } else {

        // Now try user2 -> user1
        const request = await Friendship.find({ user1: user2, user2: user1 });

        if (request.length) {
            const status = request[0].status;

            if (status === 1) {
                return true;
            }
        }
    }

    return false;
}

module.exports = router;