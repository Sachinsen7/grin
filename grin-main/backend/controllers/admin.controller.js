const bcrypt = require("bcrypt")
const admin = require('../models/admin.model')
const jwt = require('jsonwebtoken')
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger'); // Added
const AppError = require('../utills/AppError'); // Added

const adminHandler = {
    getauthority: async (req, res) => {
        logger.info('Admin login attempt...');
        const { username, password } = req.body

        const user = await admin.findOne({ username })
        if (!user) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const isvalidUser = await bcrypt.compare(password, user.password)
        if (!isvalidUser) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: 'admin' },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return sendSuccess(res, { accessToken: accessToken }, 200);
    },
    addauthority: async (req, res) => {
        const { username, password, name } = req.body
        logger.info('Attempting to create new admin', { username });

        const user = await admin.findOne({ username: username })
        if (user) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }

        const hashPassword = await bcrypt.hash(password, 12)
        const newauthority = new admin({
            name,
            username,
            password: hashPassword
        })
        await newauthority.save()
        logger.info('Admin created successfully', { username });
        return sendSuccess(res, { message: 'Admin created successfully' }, 201);
    },
    getAllAuthority: async (req, res) => {
        logger.info('Fetching all admins');
        const users = await admin.find({}, 'name username createdAt');
        return sendSuccess(res, users);
    },
    deleteuser: async (req, res) => {
        const userId = req.params.id;
        logger.info('Attempting to delete admin', { userId });

        const deleteUser = await admin.findByIdAndDelete(userId)
        if (!deleteUser) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        logger.info('Admin deleted successfully', { userId });
        return sendSuccess(res, { message: 'User deleted successfully' });
    }
}
module.exports = adminHandler
