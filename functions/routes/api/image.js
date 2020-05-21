const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @router  POST api/image
// @desc    Create a new image
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const newImage = new Image({
            user: user,
            url_full: req.body.url_full
        });

        const image = await newImage.save();

        res.json(image);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;