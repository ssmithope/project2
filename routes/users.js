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

// Get all users 
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get user by ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const user = await User.findById(id);
        user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new user 
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already in use." });
        }

        // Create new user
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update user 
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Validate request body
        if (!req.body.firstName || !req.body.email) {
            return res.status(400).json({ error: "First name and email are required for update." });
        }

        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        updatedUser ? res.json({ message: "User updated successfully", user: updatedUser }) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete user 
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const deletedUser = await User.findByIdAndDelete(id);
        deletedUser ? res.json({ message: "User deleted successfully" }) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
