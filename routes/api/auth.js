const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtTokenExpires = process.env.JWT_TOKEN_EXPIRES;
const firebase = require('../../config/firebase');

const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @router  POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // See if user exists

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' }] });
        }

        await firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' }] });
        });

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
                
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error');
    }
});

module.exports = router;