const express = require('express');
const router = express.Router();
const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || functions.config().woa.jwtsecret;
const jwtExpires = process.env.JWT_TOKEN_EXPIRES || parseInt(functions.config().woa.jwtexpires);
const firebase = require('../../config/firebase');
const auth = require('../../middleware/auth');
const requireAuth = require('../../middleware/auth');
const requireAdmin = require('../../middleware/admin');

const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');


// @router  DELETE api/users/forgot_password
// @desc    Trigger forgot password e-mail
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || email.length === 0) {
            return res.status(400).json({ errors: [ { msg: 'Email required' }] });
        }        

        // Trigger password reset e-mail
        firebase.auth().sendPasswordResetEmail(email).then(function() {
            // Email sent.
          }).catch(function(error) {
            // An error happened.
          });

        res.json({ msg: 'Email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @router  POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6})
], async (req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // See if email exists

        let userByEmail = await User.findOne({ email });

        if (userByEmail) {
            return res.status(400).json({ errors: [ { msg: 'Email address already registered' }] });
        }

        // See if username is already registered

        let userByUsername = await User.find({ 'username': new RegExp('^'+username+'$', "i") });

        if (userByUsername.length > 0) {
            return res.status(400).json({ errors: [ { msg: 'That username is already taken' }] });
        }

        // Create new user

        await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            return res.status(500).json({ msg: 'Problem creating account. Please try again.' });
        })

        const firebaseUser = firebase.auth().currentUser;

        const user = new User({
            username,
            email,
            type: 'regular',
            uid: firebaseUser.uid
        });

        await user.save();

        // Create empty profile

        const profileFields = {};
        profileFields.user = user.id;
        profileFields.username = username;

        const profile = new Profile(profileFields);

        await profile.save();        

        // Return jsonwebtoken

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, jwtSecret, {
            expiresIn: jwtExpires,
        }, (err, token) => {
            if (err) {
                throw err;
            } else {
                res.json({ token });
            }
        });
        
        console.log('Created user ', username);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }

});


// @router  DELETE api/users/:username
// @desc    Delete full account by username
// @access  Private
router.delete('/:username', requireAdmin, async (req, res) => {
    try {
        const user = await User.findOne({ 'username': new RegExp('^'+req.params.username+'$', "i") }, { "_id": 1 });

        if (!user || user.length === 0) {
            return res.status(400).json({ errors: [ { msg: 'User does not exist' }] });
        }

        const userId = user._id;

        // Remove profile
        await Profile.findOneAndRemove({ user: userId });
    
        // Remove user
        await User.findOneAndRemove({ _id: userId });

        console.log('Admin deleted user ', req.params.username);

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @router  DELETE api/users
// @desc    Delete full account of logged in user
// @access  Private
router.delete('/', requireAuth, async (req, res) => {
    try {
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        // Remove user from firebase
        const firebaseUser = firebase.auth().currentUser;

        firebaseUser.delete().then(function() {
            // User deleted
        }).catch(function(error) {
            // An error happened
        });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/users/recent
// @desc    Get most recent new members
// @access  Public
router.get('/recent', async (req, res) => {
    try {
        const users = await User.find()
                                .populate('avatar', ['url_full', 'url_175'])
                                .sort({createDate: 'descending'})
                                .limit(4);

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/users/online
// @desc    Get who is currently online
// @access  Public
router.get('/online', async (req, res) => {
    try {
        // Last online is defined as active in the past X minutes
        const minutes = 15;

        const users = await User.find({ 'lastOnline': { $gt: new Date(Date.now() - minutes * 60 * 1000) } })
                                .populate('avatar', ['url_full', 'url_175'])
                                .sort({lastOnline: 'descending'});


        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @router  GET api/users/last_online
// @desc    Get current users profile
// @access  Private
router.get('/last_online', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { lastOnline: Date.now() });

        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;