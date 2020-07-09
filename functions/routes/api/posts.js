const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');

// @router  POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [ auth, [
  check('text', 'Text is required').not().isEmpty()
] ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            profile: req.body.profileId
        });

        const post = await newPost.save().then(post => post.populate({ path: 'user', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            }).execPopulate());

        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/posts/profile/:profile_id
// @desc    Get all posts for a profile
// @access  Public
router.get('/profile/:profile_id', async (req, res) => {
    try {
        const posts = await Post.find({ profile: req.params.profile_id })
            .populate({ path: 'user', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            })
            .populate({ path: 'comments.user',
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            })
            .sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id',  async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({ path: 'user', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            })
            .populate({ path: 'comments.user',
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            });

        if (!post) {
            res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        if (error.name == 'CastError') {
            res.status(404).json({ msg: 'Post not found' });
        }

        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


// // @router  DELETE api/posts/:id
// // @desc    Delete post by id
// // @access  Private
// router.delete('/:id', auth, async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id).sort();

//         if (!post) {
//             res.status(404).json({ msg: 'Post not found' });
//         }
        
//         // Check user

//         if (post.user.toString() !== req.user.id) {
//             return res.status(401).json({ msg: 'User not authorized' });
//         }

//         await post.remove();

//         res.json({ msg: 'Post removed' });
//     } catch (error) {
//         if (error.name == 'CastError') {
//             res.status(404).json({ msg: 'Post not found' });
//         }

//         console.log(error.message);
//         res.status(500).send('Server Error');
//     }
// });



// @router  POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:post_id', [ auth, [
    check('text', 'Text is required').not().isEmpty()  
  ] ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
  
      try {
          const post = await Post.findById(req.params.post_id);
  
          const newComment = {
              text: req.body.text,
              user: req.user.id
          };
  
          post.comments.unshift(newComment);

          const updatedPost = await post.save().then(post => post.populate({ path: 'user', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            })
            .populate({ path: 'comments.user',
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
            }).execPopulate());
  
          res.json(updatedPost);
      } catch (error) {
          console.error(error.message);
          res.status(500).send('Server Error');
      }
  });


// // @router  DELETE api/posts/comment/:id/:comment_id
// // @desc    Delete comment
// // @access  Private
// router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
//      try {
//          const post = await Post.findById(req.params.id);

//          // Pull out comment
//          const comment = post.comments.find(comment => comment.id === req.params.comment_id);

//          // Make sure comment exists
//          if (!comment) {
//              return res.status(404).json({ msg: 'Comment not found' });
//          }

//          // Check user
//          if (comment.user.toString() !== req.user.id) {
//             return res.status(401).json({ msg: 'User not authorized' });
//          }

//          // Get remove index
//          const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

//          if (removeIndex >= 0) {
//             post.comments.splice(removeIndex, 1);
//          }
         
//          await post.save();

//          res.json(post.comments);         
//      } catch (error) {
//          console.error(error.message);
//          res.status(500).send('Server Error');
//      }
// });

module.exports = router;