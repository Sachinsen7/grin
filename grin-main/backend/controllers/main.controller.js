const Entries = require('../models/inventory.schema');
const jwt = require('jsonwebtoken');
const gsnEntries = require('../models/gsnInventry.Schema');
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');
require("dotenv").config();

const handler = {

    uploaddata: async function (req, res) {
        logger.info("=== Starting uploaddata handler ===");
        const {
            grinNo, grinDate, gsn, gsnDate, poNo, poDate,
            partyName, innoviceno, innoviceDate, receivedFrom,
            lrNo, lrDate, transName, vehicleNo,
            materialInfo, tableData,
            gstNo, cgst, sgst, companyName, address, mobileNo,
            totalAmount, weightDifferenceNotes, weightDifferenceValue,
            discount
        } = req.body;

        const parsedTotalAmount = parseFloat(totalAmount) || 0;

        if (!grinNo || !partyName) {
            throw new AppError('Missing required fields', 400, 'BAD_REQUEST');
        }

        let billFilePath = null;
        if (req.files && req.files.file && req.files.file.length > 0) {
            billFilePath = `files/${req.files.file[0].filename}`;
        }

        let photoPath = null;
        if (req.files && req.files.photo && req.files.photo.length > 0) {
            photoPath = `Entryphotos/${req.files.photo[0].filename}`;
        }

        let parsedTableData;
        try {
            parsedTableData = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
        } catch (parseError) {
            logger.warn('Invalid tableData format', { tableData, error: parseError.message });
            throw new AppError('Invalid tableData format', 400, 'BAD_REQUEST');
        }

        logger.info("Creating new inventory entry");
        const newInventory = new Entries({
            grinNo, grinDate, gsn, gsnDate, poNo, poDate,
            partyName, innoviceno, innoviceDate, receivedFrom,
            lrNo, lrDate, transName, vehicleNo,
            file: billFilePath,
            photoPath: photoPath,
            materialInfo,
            tableData: parsedTableData,
            gstNo, cgst, sgst, companyName, address, mobileNo,
            totalAmount: parsedTotalAmount,
            weightDifferenceNotes: weightDifferenceNotes || '',
            weightDifferenceValue: parseFloat(weightDifferenceValue) || 0,
            discount: parseFloat(discount) || 0
        });

        await newInventory.save();
        logger.info('Inventory added successfully', { entryId: newInventory._id });
        return sendSuccess(res, { message: 'Inventory added successfully', inventory: newInventory }, 201);
    },

    getting: async function (req, res) {
        logger.info('Fetching all GRIN entries');
        const data = await Entries.find();
        if (!data) {
            // This case might be valid (no entries), so we send an empty array.
            logger.warn('No GRIN entries found');
            return sendSuccess(res, []);
        }
        return sendSuccess(res, data);
    },

    updateVerificationStatus: async function (req, res) {
        const { partyName, managerType, status, fieldName } = req.body;
        logger.info('Updating verification status for party', { partyName, managerType, status, fieldName });

        if (!partyName) {
            throw new AppError('Party name is required', 400, 'BAD_REQUEST');
        }

        const managerFieldMap = {
            'General Manager': 'GeneralManagerSigned',
            'Store Manager': 'StoreManagerSigned',
            'Purchase Manager': 'PurchaseManagerSigned',
            'Account Manager': 'AccountManagerSigned',
            'Auditor': 'AuditorSigned'
        };

        const updateField = fieldName || managerFieldMap[managerType];
        if (!updateField) {
            throw new AppError('Invalid manager type', 400, 'BAD_REQUEST');
        }

        const updatePayload = {
            [updateField]: status === 'checked'
        };

        const [gsnResult, grnResult] = await Promise.all([
            gsnEntries.updateMany(
                { partyName: partyName },
                { $set: updatePayload }
            ),
            Entries.updateMany(
                { partyName: partyName },
                { $set: updatePayload }
            )
        ]);

        const totalMatched = gsnResult.matchedCount + grnResult.matchedCount;
        if (totalMatched === 0) {
            throw new AppError('No documents found for this party', 404, 'NOT_FOUND');
        }

        logger.info('Verification status updated successfully', { partyName, gsnUpdated: gsnResult.modifiedCount, grnUpdated: grnResult.modifiedCount });
        return sendSuccess(res, {
            message: 'Verification status updated successfully',
            gsnUpdated: gsnResult.modifiedCount,
            grnUpdated: grnResult.modifiedCount,
            totalUpdated: gsnResult.modifiedCount + grnResult.modifiedCount,
            partyName: partyName
        });
    }
}

module.exports = handler;
