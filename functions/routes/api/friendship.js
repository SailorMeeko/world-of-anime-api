const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Friendship = require('../../models/Friendship');

/* Friendship rules
user1: person who initiated the friend request
user2: person whom friendship was requested
status: status of friendship request:
    0 = Requested
    1 = Accepted (The request was accepted, these people are friends)
    2 = Rejected (The request was rejected, these people are not friends)
*/


// @router  GET api/friendship/request
// @desc    Create a friend request
// @access  Private
router.get('/request/:friend_id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // TODO - See if this friendship exists already



        const newFriendship = new Friendship({
            user1: req.user.id,
            user2: req.params.friend_id,
            status: 0
        });

        const friendship = await newFriendship.save();

        res.json(friendship);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/friendship/requests
// @desc    Get your current friendship requests (status 0)
// @access  Private
router.get('/requests', auth, async (req, res) => {
    try {
        const requests = await Friendship.find({ user2: req.user.id, status: 0 },
            { "user1": 1, "createDate": 1 })
            .populate({ path: 'user1', 
                populate: { path: 'avatar', select: 'url_avatar, url_full' },
                select: 'username'
        })

        res.json(requests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/friendship/num_requests
// @desc    Get simple count of a users friendship requests (status 0)
// @access  Public
router.get('/num_requests/:user_id', async (req, res) => {
    try {
        const requests = await Friendship.find({ user2: req.params.user_id, status: 0 });
        res.json(requests.length);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/friendship/status
// @desc    Get friendship status between 2 users
// @access Public
router.get('/status/:user1/:user2', async (req, res) => {
    try {
        let complete = false;

        // First try user1 -> user2
        const request = await Friendship.find({ user1: req.params.user1, user2: req.params.user2 });

        if (request.length) {
            const status = request[0].status;

            if (status === 0) {
                res.json('requested');
                complete = true;
            }

            if (status === 1) {
                res.json('friends');        
                complete = true;
            }

            if (status === 2) {
                res.json('rejected');        
                complete = true;
            }            

        } else {

            // Now try user2 -> user1
            const request = await Friendship.find({ user1: req.params.user2, user2: req.params.user1 });

            if (request.length) {
                const status = request[0].status;

                if (status === 0) {
                    res.json('requestee');
                    complete = true;
                }
    
                if (status === 1) {
                    res.json('friends');        
                    complete = true;
                }

                if (status === 2) {
                    res.json('rejectee');        
                    complete = true;
                }                

            }
        };

        if (request.length === 0) {
            res.json('no friendship');
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})


// @router  GET api/friendship/friends
// @desc    Get your current friends
// @access  Private
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await Friendship.find({ status: 1,  $or: [
                                                { user1: req.user.id},
                                                { user2: req.user.id} ]
                                            });

        res.json(friends);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;