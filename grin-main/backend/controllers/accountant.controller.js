const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const accountManager = require('../models/accountant.chema')
const { sendSuccess, sendError } = require('../utills/response'); // Added

const accountantHandeler = {
    getauthority: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await accountManager.findOne({ username })
            if (!user) {
                return sendError(res, 'Invalid username or password', 401, 'AUTH_001');
            }

            const isvalidUser = await bcrypt.compare(password, user.password)
            if (!isvalidUser) {
                return sendError(res, 'Invalid username or password', 401, 'AUTH_001');
            }
            // Note: This controller still uses the old JWT logic.
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "5min" })
            return sendSuccess(res, { token });
        } catch (error) {
            console.error("Error in accountant getauthority:", error)
            return sendError(res, 'Internal server error', 500, 'SERVER_ERROR');
        }
    },
    addauthority: async (req, res) => {
        try {
            const { username, password, name } = req.body
            const user = await accountManager.findOne({ username })
            if (user) {
                return sendError(res, 'User already exists', 400, 'USER_EXISTS');
            }
            const hashPassword = await bcrypt.hash(password, 12)
            const newauthority = new accountManager({
                name,
                username,
                password: hashPassword
            })
            await newauthority.save()
            return sendSuccess(res, { message: 'Accountant created successfully' }, 201);
        } catch (error) {
            console.error("Error in accountant addauthority:", error)
            return sendError(res, 'Internal server error', 500, 'SERVER_ERROR');
        }
    },
    getAllAuthority: async (req, res) => {
        try {
            const users = await accountManager.find({}, 'name username createdAt');
            return sendSuccess(res, users);
        } catch (err) {
            console.error("Error in accountant getAllAuthority:", err)
            return sendError(res, 'Internal server error', 500, 'SERVER_ERROR');
        }
    },
    deleteuser: async (req, res) => {
        try {
            const userId = req.params.id;
            const deleteUser = await accountManager.findByIdAndDelete(userId)
            if (!deleteUser) {
                return sendError(res, 'User not found', 404, 'NOT_FOUND');
            }
            return sendSuccess(res, { message: 'User deleted successfully' });
        } catch (error) {
            console.error("Error in accountant deleteuser:", error)
            return sendError(res, 'Internal server error', 500, 'SERVER_ERROR');
        }
    }
}
module.exports = accountantHandeler
