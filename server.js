require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const jwt = require('jsonwebtoken');

// Import authentication 
require('./auth/google');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session Configuration for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict"
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Improved MongoDB Connection Handling
mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log("MongoDB Connected to Project 2"))
   .catch(err => {
       console.error("MongoDB Connection Error:", err);
       process.exit(1);
   });

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.warn("No token provided");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Routes
app.use('/users', require('./routes/users'));
app.use('/contacts', require('./routes/contacts'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    }
);

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {});
    req.logout(() => {});
    res.json({ message: "Logged out successfully" });
});

// Home Route
app.get('/', (req, res) => {
    res.send('Hello world');
});

// 404 Error Handling
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
