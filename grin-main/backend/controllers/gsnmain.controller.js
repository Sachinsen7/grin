const gsnEntries = require('../models/gsnInventry.Schema')
const jwt = require('jsonwebtoken')
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');
require("dotenv").config()

const gsnHandler = {

    uploaddata: async function (req, res) {
        logger.info("=== GSN Upload Data Called ===");
        const {
            grinNo, grinDate, gsn, gsnDate, poNo, poDate,
            partyName, innoviceno, innoviceDate, lrNo, lrDate,
            transName, vehicleNo, materialInfo, tableData,
            gstNo, cgst, sgst, companyName, address, mobileNo,
            totalAmount
        } = req.body;

        // Validate required fields
        if (!grinNo || !grinDate || !gsn || !gsnDate || !poNo || !poDate ||
            !partyName || !innoviceno || !innoviceDate || !lrNo || !lrDate ||
            !transName || !vehicleNo) {
            logger.warn('GSN upload missing required fields');
            throw new AppError('Missing required fields', 400, 'BAD_REQUEST');
        }

        let billFilePath = null;
        if (req.files && req.files.file && req.files.file.length > 0) {
            billFilePath = `gsnfiles/${req.files.file[0].filename}`;
            logger.info('GSN bill file path created', { billFilePath });
        }

        let photoPath = null;
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            photoPath = `gsnPhotos/${req.files.photo[0].filename}`;
            logger.info('GSN photo path created', { photoPath });
        }

        let parsedTableData;
        try {
            parsedTableData = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
        } catch (parseError) {
            logger.warn('Invalid tableData format for GSN upload', { tableData, error: parseError.message });
            throw new AppError('Invalid tableData format', 400, 'BAD_REQUEST');
        }

        logger.info('Checking for duplicate GSN entry', { grinNo });
        const existData = await gsnEntries.findOne({ grinNo });
        if (existData) {
            throw new AppError('Duplicate entry found', 400, 'DUPLICATE_ENTRY');
        }

        const newInventory = new gsnEntries({
            grinNo, grinDate, gsn, gsnDate, poNo, poDate,
            partyName, innoviceno, innoviceDate, lrNo, lrDate,
            transName, vehicleNo, file: billFilePath, photoPath: photoPath,
            materialInfo, tableData: parsedTableData,
            gstNo, cgst, sgst, companyName, address, mobileNo,
            totalAmount
        });

        await newInventory.save();
        logger.info('GSN Entry saved successfully', { entryId: newInventory._id });
        return sendSuccess(res, { message: 'Inventory added successfully', inventory: newInventory }, 201);
    },

    getting: async function (req, res) {
        logger.info("Fetching GSN entries...");
        const data = await gsnEntries.find();

        if (!data || data.length === 0) {
            logger.warn("No GSN entries found");
            return sendSuccess(res, []);
        }

        return sendSuccess(res, data);
    },

    updateVerificationStatus: async function (req, res) {
        const { _Id, managerType, status, isHidden } = req.body;
        logger.info('Updating GSN verification status', { _Id, managerType, status, isHidden });

        const managerFieldMap = {
            'General Manager': 'GeneralManagerSigned',
            'Store Manager': 'StoreManagerSigned',
            'Purchase Manager': 'PurchaseManagerSigned',
            'Account Manager': 'AccountManagerSigned',
            'isHidden': 'isHidden'
        };

        const updateField = managerFieldMap[managerType];
        if (!updateField) {
            throw new AppError('Invalid manager type', 400, 'BAD_REQUEST');
        }

        const result = await gsnEntries.findByIdAndUpdate(_Id,
            {
                [updateField]: status === 'checked',
                isHidden: isHidden
            },
            { new: true });

        if (!result) {
            throw new AppError('Item not found', 404, 'NOT_FOUND');
        }

        logger.info('GSN verification status updated', { _Id });
        return sendSuccess(res, { message: 'Verification status updated successfully', data: result });
    },

    deleteByParty: async function (req, res) {
        const { partyName } = req.params;
        logger.info('Deleting GSN entries by party name', { partyName });
        if (!partyName) {
            throw new AppError('Party name is required', 400, 'BAD_REQUEST');
        }
        const result = await gsnEntries.deleteMany({ partyName });
        logger.info('Deleted GSN entries', { partyName, count: result.deletedCount });
        return sendSuccess(res, { message: 'Deleted successfully', result });
    },

    updateByParty: async function (req, res) {
        const { partyName } = req.params;
        const updateData = req.body;
        logger.info('Updating GSN entries by party name', { partyName });

        if (!partyName) {
            throw new AppError('Party name is required', 400, 'BAD_REQUEST');
        }
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new AppError('No update data provided', 400, 'BAD_REQUEST');
        }

        const sanitizedUpdateData = {};
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && updateData[key] !== null) {
                if (key === 'tableData') {
                    if (Array.isArray(updateData[key])) {
                        sanitizedUpdateData[key] = updateData[key];
                    } else if (typeof updateData[key] === 'string') {
                        try {
                            sanitizedUpdateData[key] = JSON.parse(updateData[key]);
                        } catch (parseErr) {
                            sanitizedUpdateData[key] = [];
                        }
                    } else {
                        sanitizedUpdateData[key] = [];
                    }
                } else {
                    sanitizedUpdateData[key] = updateData[key];
                }
            }
        });

        if (Object.keys(sanitizedUpdateData).length === 0) {
            throw new AppError('No valid data provided for update', 400, 'BAD_REQUEST');
        }

        const existingDocs = await gsnEntries.find({ partyName });
        if (existingDocs.length === 0) {
            throw new AppError(`No GSN documents found for party: ${partyName}`, 404, 'NOT_FOUND');
        }

        const result = await gsnEntries.updateMany({ partyName }, { $set: sanitizedUpdateData });

        if (result.modifiedCount === 0) {
            return sendSuccess(res, {
                message: 'GSN documents found but no changes were made',
                updatedCount: result.modifiedCount,
                totalCount: result.matchedCount,
                result: result
            });
        }

        logger.info('Updated GSN entries by party name', { partyName, count: result.modifiedCount });
        return sendSuccess(res, {
            message: 'GSN documents updated successfully',
            updatedCount: result.modifiedCount,
            totalCount: result.matchedCount,
            result: result
        });
    }
}

module.exports = gsnHandler;
