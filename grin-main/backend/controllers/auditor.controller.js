const Auditor = require('../models/auditor.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');
require('dotenv').config();

// Signup Auditor
exports.signupAuditor = async (req, res) => {
  const { name, username, password } = req.body;
  logger.info('Attempting to sign up auditor', { username });

  const existingAuditor = await Auditor.findOne({ username });
  if (existingAuditor) {
    throw new AppError('Username already exists', 400, 'USER_EXISTS');
  }
  const newAuditor = new Auditor({ name, username, password });
  await newAuditor.save();
  logger.info('Auditor registered successfully', { username });
  return sendSuccess(res, { message: 'Auditor registered successfully' }, 201);
};

// Login Auditor
exports.loginAuditor = async (req, res) => {
    const { username, password } = req.body;
    logger.info('Auditor login attempt', { username });
    
    if (!username || !password) {
       throw new AppError('Username and password are required', 400, 'BAD_REQUEST');
    }

    const auditor = await Auditor.findOne({ username });
    if (!auditor) {
        throw new AppError('Invalid credentials', 401, 'AUTH_001');
    }

    const isMatch = await bcrypt.compare(password, auditor.password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401, 'AUTH_001');
    }

    const accessToken = jwt.sign(
        { userId: auditor._id, role: 'auditor' }, 
        process.env.SECRET_KEY, 
        { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
        { userId: auditor._id }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' }
    );
    res.cookie('jwt', refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, { accessToken });
};

// Get All Auditors
exports.getAllAuditors = async (req, res) => {
  logger.info('Fetching all auditors');
  const auditors = await Auditor.find({}, 'name username createdAt');
  return sendSuccess(res, auditors);
};

// Delete Auditor
exports.deleteAuditor = async (req, res) => {
  const auditorId = req.params.id;
  logger.info('Attempting to delete auditor', { auditorId });

  const deletedAuditor = await Auditor.findByIdAndDelete(auditorId);
  if (!deletedAuditor) {
    throw new AppError('Auditor not found', 404, 'NOT_FOUND');
  }
  logger.info('Auditor deleted successfully', { auditorId });
  return sendSuccess(res, { message: 'Auditor deleted successfully' });
};
