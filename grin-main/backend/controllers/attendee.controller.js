const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const attendee = require('../models/attendee.login.schema')
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');

const attendeeHandler = {
    getauthority: async (req, res) => {
       const {username,password}= req.body;
       logger.info('Attendee login attempt', { username });

        const user = await attendee.findOne({username})
        if (!user) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const isvalidUser = await bcrypt.compare(password, user.password)
        if (!isvalidUser) {
            throw new AppError('Invalid username or password', 401, 'AUTH_001');
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: 'attendee' }, 
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
        const { username, password,name } = req.body
        logger.info('Attempting to create new attendee', { username });

        const user = await attendee.findOne({ username:username })
        if (user) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }
        const hashPassword = await bcrypt.hash(password,12)
        const newauthority = new attendee({
            name,
            username,
            password:hashPassword
        })
        await newauthority.save()
        logger.info('Attendee created successfully', { username });
        return sendSuccess(res, { message: 'Attendee created successfully' }, 201);
    },
    getAllAuthority:async(req,res)=>{
        logger.info('Fetching all attendees');
        const users = await attendee.find({}, 'name username createdAt');
        return sendSuccess(res, users);
    },
    deleteuser: async (req, res) => {
        const userId = req.params.id;
        logger.info('Attempting to delete attendee', { userId });

        const deleteUser = await attendee.findByIdAndDelete(userId)
        if (!deleteUser) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        logger.info('Attendee deleted successfully', { userId });
        return sendSuccess(res, { message: 'User deleted successfully' });
    }
}
module.exports = attendeeHandler
