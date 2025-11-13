/**
 * File Upload Validation Utility
 * Provides centralized validation for file uploads across the application
 */

// Configuration for allowed file types and sizes
export const FILE_VALIDATION_CONFIG = {
  // Document uploads (GSN, GRN, Bills)
  documents: {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'PDF, DOC, or DOCX files (max 10MB)'
  },
  // Photo/Image uploads (Attendee photos, GSN photos)
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'JPG or PNG images (max 5MB)'
  },
  // General file uploads
  general: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'PDF, DOC, DOCX, JPG, or PNG files (max 10MB)'
  }
};

/**
 * Validates a file against specified criteria
 * @param {File} file - The file to validate
 * @param {string} validationType - Type of validation ('documents', 'images', or 'general')
 * @returns {Object} Validation result { isValid: boolean, error: string|null }
 */
export const validateFile = (file, validationType = 'general') => {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }

  const config = FILE_VALIDATION_CONFIG[validationType] || FILE_VALIDATION_CONFIG.general;

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${config.description}`
    };
  }

  // Check file extension (additional safety check)
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  if (!config.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    };
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  // Additional security: Check for suspicious patterns in filename
  const suspiciousPatterns = /[<>:"|?*]/g;
  if (suspiciousPatterns.test(file.name)) {
    return {
      isValid: false,
      error: 'File name contains invalid characters'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates multiple files
 * @param {FileList} files - List of files to validate
 * @param {string} validationType - Type of validation
 * @returns {Object} Validation result with array of errors
 */
export const validateFiles = (files, validationType = 'general') => {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      errors: ['No files selected'],
      validFiles: []
    };
  }

  const errors = [];
  const validFiles = [];

  for (let i = 0; i < files.length; i++) {
    const validation = validateFile(files[i], validationType);
    if (validation.isValid) {
      validFiles.push(files[i]);
    } else {
      errors.push(`${files[i].name}: ${validation.error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    validFiles: validFiles
  };
};

/**
 * Get human-readable file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file info for display
 * @param {File} file - The file
 * @returns {Object} File info { name, size, type, sizeFormatted }
 */
export const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    sizeFormatted: getFileSize(file.size)
  };
};
