const Joi = require('joi');

// --- Reusable Schemas ---

// Basic string, alphanumeric, 3-30 chars.
const usernameSchema = Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required();

// Basic password, 8+ chars.
// For production, add: .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
const passwordSchema = Joi.string()
    .min(8)
    .required();

// --- Custom Validators ---

// Custom validator for a string that must be valid JSON
const jsonString = Joi.string().custom((value, helpers) => {
    try {
        JSON.parse(value);
    } catch (e) {
        // If parsing fails, return a custom Joi error
        return helpers.error('any.invalid', { message: 'tableData must be a valid JSON string' });
    }
    // If parsing succeeds, return the original string value
    return value;
});


// --- Validation Schemas ---

// Schema for all /log-in routes
const loginSchema = Joi.object({
    username: usernameSchema,
    password: passwordSchema
});

// Schema for all /sign-up routes
const signupSchema = Joi.object({
    username: usernameSchema,
    password: passwordSchema,
    name: Joi.string().max(100).allow(null, '') // Allow optional name
});

// Schema for GRIN/GSN data upload
// This is a more complex example. We validate key fields.
const entrySchema = Joi.object({
    grinNo: Joi.string().required(),
    partyName: Joi.string().required(),
    grinDate: Joi.date().required(),
    gsn: Joi.string().required(),
    gsnDate: Joi.date().required(),
    poNo: Joi.string().required(),
    poDate: Joi.date().required(),
    innoviceno: Joi.string().required(),
    innoviceDate: Joi.date().required(),
    lrNo: Joi.string().required(),
    lrDate: Joi.date().required(),
    transName: Joi.string().required(),
    vehicleNo: Joi.string().required(),

    // Non-required fields
    receivedFrom: Joi.string().allow(null, ''),
    materialInfo: Joi.string().allow(null, ''),
    gstNo: Joi.string().allow(null, ''),
    cgst: Joi.number().allow(null, ''),
    sgst: Joi.number().allow(null, ''),
    igst: Joi.number().allow(null, ''),
    gstTax: Joi.number().allow(null, ''),
    companyName: Joi.string().allow(null, ''),
    address: Joi.string().allow(null, ''),
    mobileNo: Joi.string().allow(null, ''),
    totalAmount: Joi.number().allow(null, ''),
    materialTotal: Joi.number().allow(null, ''),
    isNewEntry: Joi.boolean().allow(null, ''),

    // Weight Difference Fields
    weightDifferenceNotes: Joi.string().allow(null, ''),
    weightDifferenceValue: Joi.number().allow(null, ''),

    // Discount Field
    discount: Joi.number().allow(null, ''),

    // For tableData, which comes as a JSON string
    tableData: jsonString.required() // <-- This is the fix
});


// --- Middleware Function ---

// A dynamic middleware factory that takes a schema
const validate = (schema) => {
    return (req, res, next) => {
        // We validate req.body
        const { error } = schema.validate(req.body);

        if (error) {
            // If validation fails, send a 400 Bad Request
            return res.status(400).json({
                message: 'Input validation error',
                error: error.details[0].message
            });
        }

        // Validation passed
        next();
    };
};

module.exports = {
    validate,
    loginSchema,
    signupSchema,
    entrySchema
};