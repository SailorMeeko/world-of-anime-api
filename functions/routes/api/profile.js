const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Image = require('../../models/Image');

// @router  GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @router  POST api/profile/search
// @desc    Return users based on search criteria
// @access  Public
router.post('/search', async (req, res) => {
    try {
        const {
            username,
            name,
            gender,
            about_me,
            favorite_anime,
            favorite_movies
        } = req.body;

        const profiles = await Profile.find({ $and: [
            username ? {username: new RegExp(username, "i")} : {},
            name ? {name: new RegExp(name, "i")} : {},
            about_me ? {about_me: new RegExp(about_me, "i")} : {},
            favorite_anime ? {favorite_anime: new RegExp(favorite_anime, "i")} : {},
            favorite_movies ? {favorite_movies: new RegExp(favorite_movies, "i")} : {}
        ]},
        { "username": 1 }).populate('profile_pic', ['url_full', 'url_175']);

        if (!profiles) {
            return res.status(400).json({ msg: 'No users matched that criteria' });
        }
                                    
        res.json(profiles)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/profile/:username
// @desc    Get user by username
// @access  Private
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ 'username': new RegExp('^'+req.params.username+'$', "i") }, { "_id": 1, "createDate": 1 });

        if (!user || user.length === 0) {
            return res.status(400).json({ errors: [ { msg: 'There is no profile for this user' }] });
        }

        const profile = await Profile.findOne({ user: user._id }).populate('profile_pic', ['url_full', 'url_175']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        profile.createDate = user.createDate;

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



// @router  POST api/profile
// @desc    Update a user profile
// @access  Private
router.post('/', 
    [ 
        auth, 
    ], async (req, res) => {

        const {
            profile_pic,
            name,
            gender,
            birthday,
            show_age,
            about_me,
            favorite_anime,
            favorite_movies
        } = req.body;

        // Build profile object

        const profileFields = {};

        if (profile_pic) {
            const image = await Image.findById(profile_pic);
            profileFields.profile_pic = image;
        }
 
        profileFields.name = name;

        if (gender) {
            profileFields.gender = gender;
        }

        if (birthday) {
            profileFields.birthday = birthday;
        }

        profileFields.show_age = show_age || false;
        profileFields.about_me = about_me;
        profileFields.favorite_anime = favorite_anime;
        profileFields.favorite_movies = favorite_movies;
        
        // if (skills) {
        //     profileFields.skills = skills.split(',').map(skill => skill.trim());
        // }

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // Update profile
                profileFields.updateDate = Date.now();
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields}, { new: true });

                // Update user with avatar_url
                // For now, we are just using their profile image as their avatar

                await User.findByIdAndUpdate(req.user.id, { $set: { avatar: profileFields.profile_pic }});

                return res.json(profile);
            }

            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

});

module.exports = router;