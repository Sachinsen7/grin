require('express-async-errors');

// 2. Standard imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // <-- IMPORTED
require('dotenv').config();

// 3. Import your custom utilities
const logger = require('./utills/logger');
const errorHandler = require('./Middleware/errorHandler');
const AppError = require('./utills/AppError');
const mainRouter = require('./routes/index.routes');

const app = express();

// --- Standard Middleware (in order) ---

// 4. Configure CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));

// 5. Body parsers and cookie parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // <-- ADDED

// 6. Static file servers
app.use('/files', express.static(path.join(__dirname, "files")));
app.use('/gsnfiles', express.static(path.join(__dirname, 'gsnfiles')));
app.use('/gsnPhotos', express.static(path.join(__dirname, 'gsnPhotos')));
app.use('/Entryfiles', express.static(path.join(__dirname, 'Entryfiles')));
app.use('/Entryphotos', express.static(path.join(__dirname, 'Entryphotos')));

// 7. Serve React build files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// --- Routes ---
// 8. Mount your main API router
app.use('/api', mainRouter); // All routes are now /api/v1/...

// 9. Serve React app for all non-API routes (client-side routing)
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// --- Error Handling (MUST be last) ---
// 10. Global Error Handler: Catches all errors passed by next()
app.use(errorHandler);

// 10. Global Error Handler: Catches all errors passed by next()
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.URL;

const mongooseOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// 11. Connect to DB first, then start server
mongoose.connect(MONGO_URL, mongooseOptions)
    .then(() => {
        logger.info('MongoDB Connected with connection pooling...');

        // 12. Assign app.listen to a 'server' variable
        const server = app.listen(PORT, (err) => {
            if (err) {
                logger.error('Server failed to start', err);
                return;
            }
            logger.info(`Server is running on port: ${PORT}`);
        });

        // Graceful shutdown logic
        const gracefulShutdown = (signal) => {
            logger.info(`${signal} signal received: closing HTTP server`);
            server.close(() => {
                logger.info('HTTP server closed');
                mongoose.connection.close(false, () => {
                    logger.info('MongoDB connection closed');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    })
    .catch(err => {
        logger.error('MongoDB Connection Error:', err);
        process.exit(1);
    });