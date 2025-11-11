const Entries = require('../models/inventory.schema');
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');

// Get all entries
exports.getAllEntries = async (req, res) => {
    logger.info('Fetching all entries');
    const entries = await Entries.find();
    if (!entries || entries.length === 0) {
        logger.warn('No entries found');
        return sendSuccess(res, []);
    }
    return sendSuccess(res, entries);
};

// Create new entry
exports.createEntry = async (req, res) => {
    logger.info('Creating new entry');
    const newEntry = new Entries(req.body);
    const savedEntry = await newEntry.save();
    logger.info('New entry created successfully', { entryId: savedEntry._id });
    return sendSuccess(res, savedEntry, 201);
};

// Update entry visibility
exports.updateVisibility = async (req, res) => {
    const { _Id, id, isHidden } = req.body;
    const entryId = _Id || id;
    logger.info('Updating entry visibility', { entryId, isHidden });

    if (!entryId) {
        throw new AppError('Entry ID is required', 400, 'BAD_REQUEST');
    }

    const updatedEntry = await Entries.findByIdAndUpdate(
        entryId,
        { isHidden },
        { new: true }
    );
    if (!updatedEntry) {
        throw new AppError('Entry not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updatedEntry);
};

// Update manager signature
exports.updateManagerSignature = async (req, res) => {
    const { _Id, id, managerType, signed } = req.body;
    const entryId = _Id || id;
    logger.info('Updating manager signature', { entryId, managerType, signed });

    if (!entryId) {
        throw new AppError('Entry ID is required', 400, 'BAD_REQUEST');
    }
    if (!managerType) {
        throw new AppError('Manager type is required', 400, 'BAD_REQUEST');
    }

    const updateFieldKey = `${managerType.replace(/\s+/g, '')}Signed`;
    const validFields = ['GeneralManagerSigned', 'StoreManagerSigned', 'PurchaseManagerSigned', 'AccountManagerSigned'];
    
    if (!validFields.includes(updateFieldKey)) {
         throw new AppError('Invalid manager type', 400, 'BAD_REQUEST');
    }
    
    const updatedEntry = await Entries.findByIdAndUpdate(
        entryId,
        { [updateFieldKey]: signed },
        { new: true }
    );

    if (!updatedEntry) {
        throw new AppError('Entry not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updatedEntry);
};

// Get single entry by ID
exports.getEntryById = async (req, res) => {
    logger.info('Fetching entry by ID', { entryId: req.params.id });
    const entry = await Entries.findById(req.params.id);
    if (!entry) {
        throw new AppError('Entry not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, entry);
};

// Function to update the bill file path
exports.updateBill = async (req, res) => {
    const { partyId, id } = req.body;
    const entryId = partyId || id;
    logger.info('Updating bill file', { entryId });

    if (!entryId) {
        throw new AppError('Entry ID (partyId or id) is required', 400, 'BAD_REQUEST');
    }
    if (!req.files || !req.files.file || req.files.file.length === 0) {
        throw new AppError('Bill file is required for update', 400, 'BAD_REQUEST');
    }

    const billFile = req.files.file[0];
    const billFilePath = `entriesFiles/${billFile.filename}`;

    const entryToUpdate = await Entries.findById(entryId);
    if (!entryToUpdate) {
        throw new AppError('Entry not found with the provided ID', 404, 'NOT_FOUND');
    }

    entryToUpdate.file = billFilePath;
    const savedEntry = await entryToUpdate.save();

    logger.info('Bill updated successfully', { entryId });
    return sendSuccess(res, {
        message: 'Bill updated successfully',
        entry: savedEntry
    });
};

// Delete by partyName
exports.deleteByParty = async (req, res) => {
    const { partyName } = req.params;
    logger.info('Deleting entries by party name', { partyName });
    if (!partyName) {
        throw new AppError('Party name is required', 400, 'BAD_REQUEST');
    }
    const result = await Entries.deleteMany({ partyName });
    logger.info('Deleted entries', { partyName, count: result.deletedCount });
    return sendSuccess(res, { message: 'Deleted successfully', result });
};

// Update by partyName
exports.updateByParty = async (req, res) => {
    const { partyName } = req.params;
    const updateData = req.body;
    logger.info('Updating entries by party name', { partyName });

    if (!partyName) {
        throw new AppError('Party name is required', 400, 'BAD_REQUEST');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new AppError('No update data provided', 400, 'BAD_REQUEST');
    }

    // (Your sanitization logic remains the same)
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

    const existingDocs = await Entries.find({ partyName });
    if (existingDocs.length === 0) {
        throw new AppError(`No GRIN documents found for party: ${partyName}`, 404, 'NOT_FOUND');
    }

    const result = await Entries.updateMany({ partyName }, { $set: sanitizedUpdateData });

    if (result.modifiedCount === 0) {
        return sendSuccess(res, {
            message: 'GRIN documents found but no changes were made',
            updatedCount: result.modifiedCount,
            totalCount: result.matchedCount,
            result: result
        });
    }

    logger.info('Updated entries by party name', { partyName, count: result.modifiedCount });
    return sendSuccess(res, {
        message: 'GRIN documents updated successfully',
        updatedCount: result.modifiedCount,
        totalCount: result.matchedCount,
        result: result
    });
};