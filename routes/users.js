const express = require('express');
const router = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const user = await User.findById(id);
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
});

router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    updatedUser ? res.json({ message: "User updated successfully", user: updatedUser }) : res.status(404).json({ error: "User not found" });
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    deletedUser ? res.json({ message: "User deleted successfully" }) : res.status(404).json({ error: "User not found" });
});

module.exports = router;
