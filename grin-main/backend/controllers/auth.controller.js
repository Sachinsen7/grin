const jwt = require('jsonwebtoken');
const admin = require('../models/admin.model');
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');
// TODO: Import other user models if refresh token should work for them
// const attendee = require('../models/attendee.login.schema');
// const storeManager = require('../models/StorManager.chems');

const handleRefreshToken = async (req, res) => {
    logger.info('Handling refresh token request');
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        throw new AppError('Unauthorized: No refresh token cookie', 401, 'AUTH_002');
    }

    const refreshToken = cookies.jwt;

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
        throw new AppError('Forbidden: Invalid refresh token', 403, 'AUTH_003');
    }

    // TODO: This logic only finds 'admin' users.
    // You need to expand this to find users from other collections
    // (e.g., by storing 'role' in the refresh token).
    // For now, it only works for the 'admin' model.
    const user = await admin.findById(decoded.userId);
    if (!user) {
        throw new AppError('Forbidden: User not found', 403, 'AUTH_004');
    }

    // Issue a new Access Token
    const accessToken = jwt.sign(
        { userId: decoded.userId, role: 'admin' }, // TODO: Role should be dynamic
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );

    logger.info('Refresh token validated, new access token issued', { userId: decoded.userId });
    return sendSuccess(res, { accessToken });
};

module.exports = { handleRefreshToken };
