const express = require('express');
const router = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(403).json({ error: "Invalid token" });
    }
};

// Get all users (Protected Route)
router.get('/', authenticate, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Get user by ID (Protected Route)
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const user = await User.findById(id);
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
});

// Create a new user (Public Route)
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (Protected Route)
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    updatedUser ? res.json({ message: "User updated successfully", user: updatedUser }) : res.status(404).json({ error: "User not found" });
});

// Delete user (Protected Route)
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    deletedUser ? res.json({ message: "User deleted successfully" }) : res.status(404).json({ error: "User not found" });
});

module.exports = router;
