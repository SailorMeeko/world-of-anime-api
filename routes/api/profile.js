const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

// @router  GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['username']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @router  POST api/profile
// @desc    Crate or update a user profile
// @access  Private
router.post('/', 
    [ 
        auth, 
    ], async (req, res) => {

        const {
            name,
            gender,
            birthday,
            about_me
        } = req.body;

        // Build profile object

        const profileFields = {};
        profileFields.user = req.user.id;
        if (name) {
            profileFields.name = name;
        }

        if (gender) {
            profileFields.gender = gender;
        }

        if (birthday) {
            profileFields.birthday = birthday;
        }

        if (about_me) {
            profileFields.about_me = about_me;
        }
        
        // if (skills) {
        //     profileFields.skills = skills.split(',').map(skill => skill.trim());
        // }

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // Update
                profileFields.updateDate = Date.now();
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields}, { new: true });

                return res.json(profile);
            }

            // Create
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

});

module.exports = router;