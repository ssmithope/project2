const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: function() { return !this.googleId; } }, 
    lastName: { type: String, required: function() { return !this.googleId; } }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, 
    googleId: { type: String, required: false }, 
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);
