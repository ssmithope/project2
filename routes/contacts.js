const express = require('express');
const router = express.Router();
const Contact = require('../models/contacts'); 
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const contact = await Contact.findById(id);
        contact ? res.json(contact) : res.status(404).json({ error: "Contact not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ message: "Contact created successfully", contact: newContact });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });
        updatedContact ? res.json({ message: "Contact updated successfully", contact: updatedContact }) 
            : res.status(404).json({ error: "Contact not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        deletedContact ? res.json({ message: "Contact deleted successfully" }) 
            : res.status(404).json({ error: "Contact not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
