const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.environment' });
const connectDB = require('./config/db');

const app = express();
app.options('*', cors()) // include before other routes

// Connect Database
connectDB();

// CORS options
let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

// Init Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/message', require('./routes/api/message'));
app.use('/api/image', require('./routes/api/image'));
app.use('/api/friendship', require('./routes/api/friendship'));
app.use('/api/notification', require('./routes/api/notification'));

const PORT = process.env.LOCAL_PORT || functions.config().woa.port;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

exports.app = functions.https.onRequest(app);