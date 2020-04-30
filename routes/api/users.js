const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtTokenExpires = process.env.JWT_TOKEN_EXPIRES;
const firebase = require('../../config/firebase');

const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

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
        })

        const firebaseUser = firebase.auth().currentUser;

        user = new User({
            username,
            email,
            type: 'regular',
            uid: firebaseUser.uid
        });

        await user.save();

        // Return jsonwebtoken

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, jwtSecret, {
            expiresIn: jwtTokenExpires
        }, (err, token) => {
            if (err) {
                throw err;
            } else {
                res.json({ token });
            }
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }

});

module.exports = router;