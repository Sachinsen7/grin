const express = require('express');
const router = express.Router();
const v1Router = express.Router(); // Create a new router for v1
const rateLimit = require('express-rate-limit');

// --- CONTROLLERS ---
const attendeeHandler = require('../controllers/attendee.controller');
const storeManagerHandler = require('../controllers/storemanager.controller');
const purchaseManagerManagerHandler = require('../controllers/purchasemanager.controller');
const generalManagerHandler = require('../controllers/generalmanager.controller');
const adminHandler = require('../controllers/admin.controller');
const handler = require('../controllers/main.controller');
const accountantHandeler = require('../controllers/accountant.controller');
const gsnHandler = require('../controllers/gsn.controller');
const authController = require('../controllers/auth.controller');

// --- MIDDLEWARE ---
const auth = require('../Middleware/authMiddleware');
// Import all validation schemas
const { validate, loginSchema, signupSchema, entrySchema } = require('../Middleware/validation.middleware');

// --- SUB-ROUTES ---
const auditorRoutes = require('./auditor.routes');
const supplierRoutes = require('./supplier.routes');
const uploadRoute = require('./upload.route');

// --- RATE LIMITERS ---
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 100, // 100 login attempts per hour
    message: { message: 'Too many login attempts from this IP, please try again after 1 hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 1000, // 1000 requests per hour
    message: { message: 'Too many requests from this IP, please try again after 1 hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- V1 ROUTE DEFINITIONS ---

v1Router.get('/', (req, res) => {
    res.send("Welcome to API v1");
});

// --- Auth Routes ---
v1Router.post('/refresh-token', loginLimiter, authController.handleRefreshToken);

// --- Data Routes ---
v1Router.use('/upload-data', apiLimiter, require('./upload.route'));
v1Router.use("/getdata", apiLimiter, auth.authMiddleware, require('./get.route'));
v1Router.use('/entries', apiLimiter, require('./entriesRoutes'));
v1Router.use('/gsn/upload-data', apiLimiter, require('./gsnuploadroute'));
v1Router.use("/gsn/getdata", apiLimiter, auth.authMiddleware, require('./gsngetroute'));
v1Router.use('/api', apiLimiter, supplierRoutes); // Note: This will be /api/v1/api/suppliers. Ideally, remove /api from supplier.routes.js

// --- Admin Routes ---
v1Router.post('/sign-up/admin', apiLimiter, validate(signupSchema), adminHandler.addauthority);
v1Router.post('/log-in/admin', loginLimiter, adminHandler.getauthority); // Validation removed
v1Router.get('/getall/admin', apiLimiter, auth.authMiddleware, adminHandler.getAllAuthority);
v1Router.delete('/getall/admin/delete/:id', apiLimiter, auth.authMiddleware, adminHandler.deleteuser);

// --- GSN Routes ---
v1Router.post('/sign-up/gsn', apiLimiter, validate(signupSchema), gsnHandler.addauthority);
v1Router.post('/log-in/gsn', loginLimiter, gsnHandler.getauthority); // Validation removed
v1Router.get('/getall/gsn', apiLimiter, gsnHandler.getAllAuthority);
v1Router.delete('/getall/gsn/delete/:id', apiLimiter, gsnHandler.deleteuser);

// --- Attendee Routes ---
v1Router.post("/log-in/attendee", loginLimiter, attendeeHandler.getauthority); // Validation removed
v1Router.post('/sign-up/attendee', apiLimiter, validate(signupSchema), auth.authMiddleware, attendeeHandler.addauthority);
v1Router.get('/getall/attendee', apiLimiter, auth.authMiddleware, attendeeHandler.getAllAuthority);
v1Router.delete('/getall/attendee/delete/:id', apiLimiter, auth.authMiddleware, attendeeHandler.deleteuser);

// --- Store Manager Routes ---
v1Router.post('/sign-up/storemanager', apiLimiter, validate(signupSchema), auth.authMiddleware, storeManagerHandler.addauthority);
v1Router.post('/log-in/storemanager', loginLimiter, storeManagerHandler.getauthority); // Validation removed
v1Router.get('/getall/storemanager', apiLimiter, auth.authMiddleware, storeManagerHandler.getAllAuthority);
v1Router.delete('/getall/storemanager/delete/:id', apiLimiter, auth.authMiddleware, storeManagerHandler.deleteuser);

// --- General Manager Routes ---
v1Router.post('/sign-up/generalmanager', apiLimiter, validate(signupSchema), auth.authMiddleware, generalManagerHandler.addauthority);
v1Router.post('/log-in/generalmanager', loginLimiter, generalManagerHandler.getauthority); // Validation removed
v1Router.get('/getall/generalmanager', apiLimiter, auth.authMiddleware, generalManagerHandler.getAllAuthority);
v1Router.delete('/getall/generalmanager/delete/:id', apiLimiter, auth.authMiddleware, generalManagerHandler.deleteuser);

// --- Purchase Manager Routes ---
v1Router.post('/sign-up/purchasemanager', apiLimiter, validate(signupSchema), auth.authMiddleware, purchaseManagerManagerHandler.addauthority);
v1Router.post('/log-in/purchasemanager', loginLimiter, purchaseManagerManagerHandler.getauthority); // Validation removed
v1Router.get('/getall/purchasemanager', apiLimiter, auth.authMiddleware, purchaseManagerManagerHandler.getAllAuthority);
v1Router.delete('/getall/purchasemanager/delete/:id', apiLimiter, auth.authMiddleware, purchaseManagerManagerHandler.deleteuser);

// --- Account Manager Routes ---
v1Router.post('/sign-up/accountmanager', apiLimiter, validate(signupSchema), auth.authMiddleware, accountantHandeler.addauthority);
v1Router.post('/log-in/accountmanager', loginLimiter, accountantHandeler.getauthority); // Validation removed
v1Router.get('/getall/accountmanager', apiLimiter, auth.authMiddleware, accountantHandeler.getAllAuthority);
v1Router.delete('/getall/accountmanager/delete/:id', apiLimiter, auth.authMiddleware, accountantHandeler.deleteuser);

// --- Other Routes ---
v1Router.post('/verify', apiLimiter, auth.authMiddleware, handler.updateVerificationStatus);
v1Router.use('/', apiLimiter, auditorRoutes); // Mount auditor routes at /v1/*

// --- Mount the v1 router ---
// All routes will be prefixed with /v1
router.use('/v1', v1Router);

module.exports = router;