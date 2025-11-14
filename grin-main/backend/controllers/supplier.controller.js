const gsnEntries = require('../models/gsnInventry.Schema');
const Supplier = require('../models/supplier.schema');
const { sendSuccess } = require('../utills/response');
const logger = require('../utills/logger');
const AppError = require('../utills/AppError');

// GET /api/suppliers
exports.getSuppliers = async (req, res) => {
  logger.info('Fetching all suppliers');
  const [gsnSuppliers, dedicatedSuppliers] = await Promise.all([
    gsnEntries.find({}, {
      partyName: 1,
      address: 1,
      gstNo: 1,
      mobileNo: 1,
      companyName: 1,
      cgst: 1,
      sgst: 1,
      igst: 1,
      totalAmount: 1,
      materialTotal: 1,
      gstTax: 1,
      _id: 0
    }),
    Supplier.find({ isActive: true }, {
      partyName: 1,
      address: 1,
      gstNo: 1,
      mobileNo: 1,
      companyName: 1,
      email: 1,
      _id: 0
    })
  ]);

  const supplierMap = new Map();
  // (Your existing merge logic is good)
  gsnSuppliers.forEach(supplier => {
    if (supplier.partyName) {
      supplierMap.set(supplier.partyName, {
        partyName: supplier.partyName,
        address: supplier.address || '',
        gstNo: supplier.gstNo || '',
        mobileNo: supplier.mobileNo || '',
        companyName: supplier.companyName || '',
        email: '',
        cgst: supplier.cgst || 0,
        sgst: supplier.sgst || 0,
        igst: supplier.igst || 0,
        totalAmount: supplier.totalAmount || 0,
        materialTotal: supplier.materialTotal || 0,
        gstTax: supplier.gstTax || 0,
        source: 'GSN'
      });
    }
  });
  dedicatedSuppliers.forEach(supplier => {
    if (supplier.partyName && !supplierMap.has(supplier.partyName)) {
      supplierMap.set(supplier.partyName, {
        partyName: supplier.partyName,
        address: supplier.address || '',
        gstNo: supplier.gstNo || '',
        mobileNo: supplier.mobileNo || '',
        companyName: supplier.companyName || '',
        email: supplier.email || '',
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalAmount: 0,
        materialTotal: 0,
        gstTax: 0,
        source: 'Dedicated'
      });
    }
  });

  const allSuppliers = Array.from(supplierMap.values()).sort((a, b) => {
    const nameA = (a.partyName || '').trim().toLowerCase();
    const nameB = (b.partyName || '').trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return sendSuccess(res, allSuppliers);
};

// POST /api/suppliers
exports.addSupplier = async (req, res) => {
  const { partyName, address, gstNo, mobileNo, companyName, email } = req.body;
  logger.info('Adding new supplier', { partyName });
  
  if (!partyName || partyName.trim() === '') {
    throw new AppError('Supplier name is required', 400, 'BAD_REQUEST');
  }
  
  const existingSupplier = await Supplier.findOne({ partyName: partyName.trim() });
  if (existingSupplier) {
    throw new AppError('Supplier with this name already exists', 400, 'USER_EXISTS');
  }
  
  const newSupplier = new Supplier({
    partyName: partyName.trim(),
    address: address || '',
    gstNo: gstNo || '',
    mobileNo: mobileNo || '',
    companyName: companyName || '',
    email: email || '',
    isActive: true
  });
  
  try {
    await newSupplier.save();
  } catch (err) {
    if (err.code === 11000) {
      logger.warn('Duplicate supplier name conflict on save', { partyName });
      throw new AppError('Supplier with this name already exists', 400, 'USER_EXISTS');
    }
    throw err; // Re-throw other save errors
  }

  const supplierData = {
    partyName: newSupplier.partyName,
    address: newSupplier.address,
    gstNo: newSupplier.gstNo,
    mobileNo: newSupplier.mobileNo,
    companyName: newSupplier.companyName,
    email: newSupplier.email
  };
  logger.info('Supplier added successfully', { partyName });
  return sendSuccess(res, supplierData, 201);
};

// GET /api/supplier-details?partyName=...
exports.getSupplierDetails = async (req, res) => {
  const { partyName } = req.query;
  logger.info('Fetching supplier details', { partyName });

  if (!partyName) {
    throw new AppError('partyName is required', 400, 'BAD_REQUEST');
  }
  
  const entries = await gsnEntries.find({ partyName }, { gsn: 1, grinNo: 1, _id: 0 });
  return sendSuccess(res, entries);
};

// PUT /api/supplier/:partyName
exports.updateSupplier = async (req, res) => {
  const { partyName } = req.params;
  const { partyName: newPartyName, address, gstNo, mobileNo, companyName, email } = req.body;
  logger.info('Updating supplier', { partyName });
  
  const updateData = {};
  if (newPartyName) updateData.partyName = newPartyName.trim();
  if (address !== undefined) updateData.address = address;
  if (gstNo !== undefined) updateData.gstNo = gstNo;
  if (mobileNo !== undefined) updateData.mobileNo = mobileNo;
  if (companyName !== undefined) updateData.companyName = companyName;
  if (email !== undefined) updateData.email = email;
  
  const result = await Supplier.updateOne(
    { partyName, isActive: true },
    { $set: updateData }
  );
  
  if (result.modifiedCount === 0) {
    // Check if the supplier exists but wasn't modified
    const exists = await Supplier.findOne({ partyName, isActive: true });
    if (exists) {
        logger.warn('Supplier update requested but no changes made', { partyName });
        return sendSuccess(res, { message: 'Supplier found but no changes were made', modifiedCount: 0 });
    }
    throw new AppError('No supplier found to update', 404, 'NOT_FOUND');
  }
  
  logger.info('Supplier updated successfully', { partyName });
  return sendSuccess(res, { modifiedCount: result.modifiedCount });
};

// DELETE /api/supplier/:partyName
exports.deleteSupplier = async (req, res) => {
  const { partyName } = req.params;
  logger.info('Deleting supplier (soft delete)', { partyName });

  const result = await Supplier.updateOne(
    { partyName, isActive: true },
    { $set: { isActive: false } } // Soft delete
  );
  
  if (result.modifiedCount === 0) {
    throw new AppError('No supplier found to delete', 404, 'NOT_FOUND');
  }
  
  logger.info('Supplier deleted successfully', { partyName });
  return sendSuccess(res, { message: 'Supplier deleted successfully' });
};
