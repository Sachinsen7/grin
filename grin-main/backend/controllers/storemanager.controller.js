const jwt = require('jsonwebtoken')
const storeManager = require('../models/StorManager.chems')
const bcrypt = require('bcrypt')
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');

const storeManagerHandler = {
    getauthority: async (req, res) => {
        const { username, password } = req.body
        logger.info('Store Manager login attempt', { username });

        const user = await storeManager.findOne({ username })
        if (!user) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const isvalidUser = await bcrypt.compare(password, user.password)
        if (!isvalidUser) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: 'storemanager' }, 
            process.env.SECRET_KEY, 
            { expiresIn: '15m' }
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

        return sendSuccess(res, { accessToken });
    },
    addauthority: async (req, res) => {
        const { username, password ,name} = req.body
        logger.info('Attempting to create new store manager', { username });
 
        const data = await storeManager.findOne({ username: username })
        if (data) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }
        const hashPassword = await bcrypt.hash(password, 12)
        const newauthority = new storeManager({
            username,
            name,
            password: hashPassword
        })
        await newauthority.save()
        logger.info('Store Manager created successfully', { username });
        return sendSuccess(res, { message: 'Store Manager created successfully' }, 201);
    },
    getAllAuthority:async(req,res)=>{
        logger.info('Fetching all store managers');
        const users = await storeManager.find({}, 'name username createdAt');
        return sendSuccess(res, users);
    },
    deleteuser: async (req, res) => {
        const userId = req.params.id;
        logger.info('Attempting to delete store manager', { userId });

        const deleteUser = await storeManager.findByIdAndDelete(userId)
        if (!deleteUser) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        logger.info('Store Manager deleted successfully', { userId });
        return sendSuccess(res, { message: 'User deleted successfully' });
    }
}
module.exports = storeManagerHandler