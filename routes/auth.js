const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); 
const bcrypt = require('bcryptjs');

const router = express.Router();

// Signup Route (With Validation)
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    try {
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
});

// Google OAuth Login Route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful via Google', token });
    }
);

// Logout Route (Fix session clearing)
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        req.session = null; // Clear session properly
        res.json({ message: "Logged out successfully" });
    });
});

module.exports = router;
