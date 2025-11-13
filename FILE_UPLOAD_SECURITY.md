# File Upload Security & Validation

## Overview
This document outlines the file upload validation security measures implemented in the GRIN application to prevent security vulnerabilities and server overload.

## Problem Statement
**Issue 7.2: No File Upload Validation (CRITICAL)**
- No file size checks
- No file type validation  
- Risk of uploading malicious files
- Security risk and potential server overload

## Solution Implemented

### 1. Centralized Validation Utility
**File:** `frontend/src/utils/fileValidation.js`

A reusable validation module that provides:
- Type checking (MIME type and file extension)
- File size validation
- Filename security checks
- Human-readable error messages

### 2. Validation Configuration

```javascript
FILE_VALIDATION_CONFIG = {
  documents: {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  general: {
    // Combined support for both documents and images
    maxSize: 10 * 1024 * 1024, // 10MB
  }
}
```

### 3. Validation Functions

#### `validateFile(file, validationType)`
Validates a single file and returns validation result.

**Parameters:**
- `file` (File): The file to validate
- `validationType` (string): Type of validation - 'documents', 'images', or 'general'

**Returns:**
```javascript
{
  isValid: boolean,
  error: string | null
}
```

**Usage Example:**
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  const validation = validateFile(file, 'documents');
  
  if (!validation.isValid) {
    alert(`❌ File validation failed:\n${validation.error}`);
    e.target.value = ''; // Clear the input
    return;
  }
  
  setFile(file);
};
```

#### `validateFiles(files, validationType)`
Validates multiple files and returns aggregated results.

**Returns:**
```javascript
{
  isValid: boolean,
  errors: string[],
  validFiles: File[]
}
```

#### `getFileInfo(file)`
Returns human-readable file information.

**Returns:**
```javascript
{
  name: string,
  size: number,
  type: string,
  sizeFormatted: string // e.g., "2.5 MB"
}
```

### 4. Updated Components

#### GSN Form (`frontend/src/Pages/Gsn/Gsn.js`)
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  const validation = validateFile(file, 'documents');
  
  if (!validation.isValid) {
    alert(`❌ File validation failed:\n${validation.error}`);
    e.target.value = '';
    return;
  }
  
  setFile(file);
};

const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  const validation = validateFile(file, 'images');
  
  if (!validation.isValid) {
    alert(`❌ Photo validation failed:\n${validation.error}`);
    e.target.value = '';
    return;
  }
  
  setPhoto(file);
};
```

#### Attendee Form (`frontend/src/Pages/Attendee/Attendee.js`)
Same validation pattern applied to file and photo uploads.

#### GRIN Entry (`frontend/src/Pages/Attendee/GrinEntry.js`)
Bill file validation applied with document type checking.

## Security Checks Performed

### 1. **File Type Validation**
- ✅ MIME type checking
- ✅ File extension verification
- ✅ Prevents executable uploads (.exe, .bat, etc.)
- ✅ Prevents script uploads (.js, .html, etc.)

### 2. **File Size Validation**
- ✅ Documents: Max 10MB
- ✅ Images: Max 5MB
- ✅ Prevents server overload
- ✅ User-friendly error messages with actual file size

### 3. **Filename Security**
- ✅ Detects suspicious characters in filename: `< > : " | ? *`
- ✅ Prevents path traversal attacks
- ✅ Rejects invalid filenames

### 4. **Clear User Feedback**
- ✅ Specific error messages for each validation failure
- ✅ Console logging for debugging
- ✅ Input field cleared on validation failure
- ✅ Visual indicators (✓ and ✌️) in console

## Validation Error Messages

### File Type Error
```
❌ File validation failed:
Invalid file type. Allowed types: PDF, DOC, or DOCX files (max 10MB)
```

### File Size Error
```
❌ File validation failed:
File size (15.50MB) exceeds maximum allowed size of 10MB
```

### File Extension Error
```
❌ File validation failed:
Invalid file extension. Allowed extensions: .pdf, .doc, .docx
```

### Suspicious Filename Error
```
❌ File validation failed:
File name contains invalid characters
```

## Testing the Implementation

### Test Case 1: Valid Document Upload
1. Click file input on GSN form
2. Select a PDF file (< 10MB)
3. Expected: File accepted, no error message
4. Console: ✓ File validated and selected: filename.pdf

### Test Case 2: Invalid File Type
1. Try to upload a .exe or .txt file
2. Expected: Alert message with error
3. Input field is cleared

### Test Case 3: Oversized File
1. Try to upload a file > 10MB (documents) or > 5MB (images)
2. Expected: Alert with file size error message
3. Shows actual file size vs. max allowed

### Test Case 4: Invalid Image Format
1. Try to upload a .gif or .bmp image
2. Expected: Error message: "Invalid file type. Allowed types: JPG or PNG images"

### Test Case 5: Suspicious Filename
1. Try to upload a file with name: `test<>file.pdf`
2. Expected: Error message: "File name contains invalid characters"

### Test Case 6: Valid Image Upload
1. Upload a JPG/PNG image (< 5MB)
2. Expected: File accepted
3. Console: ✓ Photo validated and selected: filename.jpg

## Browser Developer Tools Verification

### To verify validation is working:

1. **Open DevTools:** F12 or Right-click → Inspect
2. **Go to Console Tab:** Look for validation messages:
   ```
   ✓ File validated and selected: document.pdf
   ✓ Photo validated and selected: photo.jpg
   ```

3. **Network Tab:** Verify no upload requests for rejected files
   - Valid files should trigger network requests
   - Invalid files should NOT trigger any network requests

4. **Test all scenarios:**
   - Accept/Reject scenarios in console
   - File size in alert messages
   - Form field clears on rejection

## Future Enhancements

### Recommended Improvements:
1. **Backend Validation:** Add matching validation on server-side
2. **Virus Scanning:** Integrate with ClamAV or similar for malware detection
3. **File Hashing:** Store file hashes to detect duplicate uploads
4. **Quarantine System:** Temporarily store suspicious files for review
5. **Audit Logging:** Log all file upload attempts (success and failures)
6. **Progressive Upload:** Show upload progress for large files
7. **Drag & Drop:** Add drag-and-drop file upload interface
8. **Image Compression:** Auto-compress images before upload

## Configuration Guide

### To modify file type restrictions:

Edit `frontend/src/utils/fileValidation.js`:

```javascript
export const FILE_VALIDATION_CONFIG = {
  documents: {
    allowedTypes: ['application/pdf', ...], // Add new MIME types
    allowedExtensions: ['.pdf', ...], // Add new extensions
    maxSize: 10 * 1024 * 1024, // Adjust size limit
  },
  // ... other types
};
```

### To modify max file size globally:

```javascript
// For documents: Change maxSize value
documents: {
  maxSize: 20 * 1024 * 1024, // Changed to 20MB
}

// For images: Change maxSize value
images: {
  maxSize: 10 * 1024 * 1024, // Changed to 10MB
}
```

### To add a new validation type:

```javascript
export const FILE_VALIDATION_CONFIG = {
  // ... existing types
  videos: {
    allowedTypes: ['video/mp4', 'video/mpeg'],
    allowedExtensions: ['.mp4', '.mpeg'],
    maxSize: 100 * 1024 * 1024, // 100MB for videos
    description: 'MP4 or MPEG videos (max 100MB)'
  }
};

// Then use in component:
const validation = validateFile(file, 'videos');
```

## Security Best Practices

### ✅ DO:
- Always validate files client-side for UX
- Validate again on server-side (critical)
- Log all upload attempts
- Use security headers (CORS, Content-Type)
- Implement rate limiting on uploads
- Store files outside web root
- Use random filenames (not user-provided)
- Scan uploads with antivirus/malware detection

### ❌ DON'T:
- Rely solely on client-side validation
- Accept file extensions without checking MIME type
- Trust user-provided filenames
- Store files in web root with execute permissions
- Allow unlimited file uploads
- Accept any file type
- Skip validation for "trusted" users

## File Upload Workflow

```
User selects file
    ↓
handleFileChange() triggered
    ↓
validateFile() checks:
  1. File exists?
  2. MIME type allowed?
  3. Extension allowed?
  4. File size OK?
  5. Filename safe?
    ↓
    ├─ ANY validation fails?
    │  ├─ Show alert with error
    │  └─ Clear input field
    │
    └─ ALL validations pass?
       ├─ Set file in state
       ├─ Log success message
       └─ Allow form submission
```

## Summary

| Issue | Solution | Status |
|-------|----------|--------|
| No file type validation | MIME type + extension checking | ✅ Implemented |
| No file size check | 10MB docs, 5MB images limit | ✅ Implemented |
| Malicious file upload risk | Type/size/filename validation | ✅ Implemented |
| Server overload risk | File size limits enforced | ✅ Implemented |
| Poor error messages | User-friendly validation errors | ✅ Implemented |
| No validation utility | Centralized validation module | ✅ Implemented |

## Files Modified

1. **Created:** `frontend/src/utils/fileValidation.js`
2. **Updated:** `frontend/src/Pages/Gsn/Gsn.js`
3. **Updated:** `frontend/src/Pages/Attendee/Attendee.js`
4. **Updated:** `frontend/src/Pages/Attendee/GrinEntry.js`

---

**Last Updated:** November 13, 2025
**Version:** 1.0
**Security Level:** CRITICAL
