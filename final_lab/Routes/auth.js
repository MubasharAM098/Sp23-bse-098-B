const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        return res.render('register', { errors, name, email, password, password2 });
    }
    
    try {
        const user = await User.findOne({ email });
        if (user) {
            errors.push({ msg: 'Email is already registered' });
            return res.render('register', { errors, name, email, password, password2 });
        }
        
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
    }
});

// Login Route
router.get('/login', (req, res) => res.render('login'));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

module.exports = router;
