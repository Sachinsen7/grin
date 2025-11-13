# 🔒 File Upload Validation Testing Guide

## What's Protected?
Your application now validates files **BEFORE** uploading. This prevents:
- ✅ Oversized files (>10MB for docs, >5MB for images)
- ✅ Invalid file types (non-PDF, non-image files)
- ✅ Suspicious filenames with special characters
- ✅ Malicious file uploads

---

## 📁 Validation Rules by Upload Type

### **Document Uploads** (GSN, GRN, Bills)
```
Allowed Types: PDF, DOC, DOCX
Max Size:     10 MB
Where Used:   - GSN page (document upload)
              - Attendee page (bill upload)
              - GRN Entry (bill upload)
```

### **Image Uploads** (Photos)
```
Allowed Types: JPG, JPEG, PNG
Max Size:     5 MB
Where Used:   - GSN page (photos)
              - Attendee page (attendee photo)
```

### **General Uploads** (Fallback)
```
Allowed Types: PDF, DOC, DOCX, JPG, JPEG, PNG
Max Size:     10 MB
```

---

## 🧪 Test Case 1: Valid File Upload ✅

### **Scenario:** Upload a valid PDF document

**Steps:**
1. Navigate to **GSN** → **GSN Documents** section
2. Click **Choose File** button
3. Select a valid PDF file (< 10MB, e.g., `invoice.pdf`)
4. **Expected Result:**
   - ✅ File selected without error message
   - ✅ File appears in input field
   - ✅ Console shows: `✓ File validated and selected: invoice.pdf`

**How to test:**
```bash
# Create a test PDF using a simple PDF creator or use an existing one
# File: invoice.pdf, Size: 2MB, Type: PDF
# Expected: File accepted ✅
```

---

## 🧪 Test Case 2: Oversized File ❌

### **Scenario:** Try to upload a file larger than 10MB

**Steps:**
1. Navigate to **GSN** → Document upload
2. Click **Choose File**
3. Select a file **larger than 10MB** (e.g., `large_video.mp4`)
4. **Expected Result:**
   - ❌ Error popup appears:
     ```
     ❌ File validation failed:
     File size (15.50MB) exceeds maximum allowed size of 10.0MB
     ```
   - ❌ File is NOT selected (input stays empty)
   - ❌ Input field is cleared: `e.target.value = ''`

**How to test:**
```bash
# Create a dummy large file
fsutil file createnew large_file.bin 11000000  # ~11MB on Windows
# Or in PowerShell:
# $file = New-Object System.IO.FileStream("large_file.bin", [System.IO.FileMode]::Create)
# $file.Seek(11000000, [System.IO.SeekOrigin]::Begin) | Out-Null
# $file.WriteByte(0)
# $file.Close()
```

---

## 🧪 Test Case 3: Invalid File Type ❌

### **Scenario:** Try to upload an executable or text file

**Steps:**
1. Navigate to **Attendee** → Attendee Photo upload
2. Click **Choose File**
3. Select an invalid file type:
   - `.exe` (executable)
   - `.bat` (batch file)
   - `.txt` (text file)
   - `.mp4` (video file)
4. **Expected Result:**
   - ❌ Error popup:
     ```
     ❌ File validation failed:
     Invalid file type. Allowed types: JPG or PNG images (max 5MB)
     ```
   - ❌ File is NOT selected

**How to test:**
```bash
# Create test files
echo "invalid" > test.txt           # Text file
echo "invalid" > malware.exe        # Executable (don't actually create dangerous files!)
type nul > test.mp4                 # Video file
```

---

## 🧪 Test Case 4: Suspicious Filename ❌

### **Scenario:** File with special characters in name

**Steps:**
1. Rename a valid PDF to: `invoice<script>.pdf` or `file"malicious".pdf`
2. Try to upload it
3. **Expected Result:**
   - ❌ Error popup:
     ```
     ❌ File validation failed:
     File name contains invalid characters
     ```

**How to test:**
```bash
# Windows: You cannot directly create files with these characters
# Instead, test by checking the validation code catches:
# < > : " | ? * characters
# The validation checks: /[<>:"|?*]/g
```

---

## 🧪 Test Case 5: Image Size Validation ❌

### **Scenario:** Try to upload an image larger than 5MB

**Steps:**
1. Navigate to **GSN** → Photo upload
2. Select an image **> 5MB** (e.g., high-res photo)
3. **Expected Result:**
   - ❌ Error:
     ```
     ❌ File validation failed:
     File size (6.25MB) exceeds maximum allowed size of 5.0MB
     ```

**How to test:**
```bash
# Create a large dummy image (6MB)
# On Windows PowerShell:
$file = [System.IO.File]::Create("large_image.jpg")
$file.SetLength(6291456)  # 6MB in bytes
$file.Close()

# Then try uploading it
```

---

## 🧪 Test Case 6: Multiple File Attempts ✅

### **Scenario:** User tries multiple files, one invalid

**Steps:**
1. Navigate to **Attendee** page
2. Try to upload file 1 (INVALID - `.txt`) → Gets rejected ❌
3. Input field clears automatically
4. Try to upload file 2 (VALID - `.jpg`) → Gets accepted ✅
5. Input field shows valid file

**Expected:**
- ✅ User can retry after validation failure
- ✅ No file data persists from failed attempt
- ✅ Valid file uploads work after rejection

---

## 🧪 Test Case 7: Console Verification ✅

### **Scenario:** Verify validation logs in browser console

**Steps:**
1. Open Browser DevTools: **F12** → **Console** tab
2. Upload a **valid** file
3. **Expected Console Output:**
   ```
   ✓ File validated and selected: invoice.pdf
   ```
4. Upload an **invalid** file
5. **Expected Console Output:**
   ```
   Console should NOT show the ✓ message
   Only the error popup appears
   ```

**How to verify:**
- ✅ Search Console for "File validated and selected:" = Success
- ❌ No console message = File was rejected (expected)

---

## 📊 Test Summary Table

| Test Case | File Type | Size | Expected | Status |
|-----------|-----------|------|----------|--------|
| **1** Valid PDF | PDF | 2MB | ✅ Accept | Should Pass |
| **2** Oversized | PDF | 15MB | ❌ Reject | Should Pass |
| **3** Wrong Type | EXE | 1MB | ❌ Reject | Should Pass |
| **4** Bad Filename | PDF | 2MB | ❌ Reject | Should Pass |
| **5** Large Image | JPG | 6MB | ❌ Reject | Should Pass |
| **6** Retry After Fail | JPG | 3MB | ✅ Accept | Should Pass |
| **7** Console Logs | ANY | ANY | Logged | Should Pass |

---

## ✅ Success Criteria

All tests pass if:

1. ✅ Valid files are accepted silently
2. ✅ Invalid files show error popup
3. ✅ Invalid files clear the input field
4. ✅ File size validation works for both documents (10MB) and images (5MB)
5. ✅ File type validation blocks non-allowed types
6. ✅ Suspicious filenames are rejected
7. ✅ Console shows `✓ File validated` only for valid files
8. ✅ User can retry immediately after rejection

---

## 🔍 Validation Configuration Reference

**Location:** `frontend/src/utils/fileValidation.js`

**Key Functions:**
```javascript
// Check single file
validateFile(file, 'documents')  // Returns { isValid, error }

// Check multiple files
validateFiles(files, 'documents')  // Returns { isValid, errors, validFiles }

// Get file size formatted
getFileSize(bytes)  // "2.5 MB"

// Get file info
getFileInfo(file)  // { name, size, type, sizeFormatted }
```

**Validation Types:**
- `'documents'` - PDF, DOC, DOCX (10MB max)
- `'images'` - JPG, JPEG, PNG (5MB max)
- `'general'` - All allowed types (10MB max)

---

## 🚀 Real-World Scenarios to Test

### Scenario A: User Accidentally Selects Large Video
```
User Action:     Click "Choose File" for GSN Document
User Selects:    project_video.mp4 (50MB)
Expected:        ❌ Error: "File size exceeds 10MB limit"
User Response:   User selects correct PDF instead
Result:          ✅ PDF uploads successfully
```

### Scenario B: User Attempts File Upload Exploit
```
User Action:     Rename malware.exe to malware.pdf
User Selects:    Renamed file
Expected:        ⚠️ System checks MIME type (not just extension)
Result:          ✅ Rejected because MIME type is not PDF
```

### Scenario C: User Uploads High-Resolution Photo
```
User Action:     Upload attendee photo (8MP, 6.5MB)
Expected:        ❌ Error: "Photo exceeds 5MB limit"
User Solution:   Compress photo before uploading
Result:          ✅ Compressed photo (3MB) uploads successfully
```

---

## 📝 Troubleshooting

### **"File validation failed" but file looks valid**
- Check file **MIME type** (not just extension)
- Try renaming file with different extension
- Verify file is actually that type (e.g., text file named `.jpg`)

### **Large file never shows error**
- Browser may be waiting to read file
- Check file size calculation: `file.size / (1024 * 1024)`
- Verify MAX_SIZE in `fileValidation.js` configuration

### **Input field doesn't clear after rejection**
- The `e.target.value = ''` line should clear it
- Check if `handleFileChange` is properly imported
- Verify no other code is overriding the input value

### **Want to increase/decrease size limits?**
Edit `frontend/src/utils/fileValidation.js`:
```javascript
documents: {
  // Change this:
  maxSize: 10 * 1024 * 1024, // ← Change 10 to desired MB
  // ...
}
```

---

## 🎯 Next Steps

After testing validation:

1. ✅ Test all 7 test cases above
2. ✅ Verify error messages appear correctly
3. ✅ Check console for validation logs
4. ✅ Test file retry functionality
5. ✅ Consider user experience: Are error messages clear?
6. Optional: Customize error messages in `handleFileChange` functions
7. Optional: Add visual file preview before upload

---

## 📞 Questions?

- **How to customize allowed file types?** → Edit `FILE_VALIDATION_CONFIG` in `fileValidation.js`
- **How to change error messages?** → Modify the `alert()` calls in `handleFileChange`
- **How to log validation details?** → Check `console.log()` statements in handlers
- **How to show file preview?** → Use `File.slice()` and FileReader API
