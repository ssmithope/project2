require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json'); 

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log("MongoDB Connected to Project 2"))
   .catch(err => console.error("MongoDB Connection Error:", err));


app.use('/users', require('./routes/users'));
app.use('/contacts', require('./routes/contacts'));
app.use('/api-docs', require('./routes/swagger'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get('/', (req, res) => {
    res.send('Hello world');
});


app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
