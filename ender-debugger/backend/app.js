const express = require('express');
const cors = require('cors');
// Removed runtime routes

const app = express();

app.use(cors());
app.use(express.json());

// API routes will be added here for AI model integration

// ... rest of the app configuration ...

module.exports = app; 