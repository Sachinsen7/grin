const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const PurchaseManager=require('../models/purchasemanager.model')
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');

const purchaseManagerManagerHandler = {
    getauthority: async (req, res) => {
        const{username,password}= req.body
        logger.info('Purchase Manager login attempt', { username });

        const user = await PurchaseManager.findOne({username})
        if (!user) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }
        const isvalidUser = await bcrypt.compare(password, user.password)
        if (!isvalidUser) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: 'purchasemanager' }, 
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

        return sendSuccess(res, { accessToken });
    },
    addauthority: async (req, res) => {
        const { username, password, name } = req.body
        logger.info('Attempting to create new purchase manager', { username });

        const user = await PurchaseManager.findOne({username })
        if (user) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }
        const hashPassword = await bcrypt.hash(password, 12)
        const newauthority = new PurchaseManager({
            name, // Added name
            username,
            password:hashPassword
        })
        await newauthority.save()
        logger.info('Purchase Manager created successfully', { username });
        return sendSuccess(res, { message: 'Purchase Manager created successfully' }, 201);
    },
    getAllAuthority:async(req,res)=>{
        logger.info('Fetching all purchase managers');
        const users = await PurchaseManager.find({}, 'name username createdAt');
        return sendSuccess(res, users);
    },
    deleteuser: async (req, res) => {
        const userId = req.params.id;
        logger.info('Attempting to delete purchase manager', { userId });

        const deleteUser = await PurchaseManager.findByIdAndDelete(userId)
        if (!deleteUser) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        logger.info('Purchase Manager deleted successfully', { userId });
        return sendSuccess(res, { message: 'User deleted successfully' });
    }
}
module.exports = purchaseManagerManagerHandler
