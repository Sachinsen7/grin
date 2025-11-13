# ⚡ File Validation Quick Test Checklist

## 🎯 Quick Tests (5 minutes)

### Test 1: Valid PDF Upload ✅
```
📍 Go to: GSN Page → Document Upload
📁 Select: Any PDF file under 10MB
✅ Expected: File accepted, no error message
⏱️  Time: 30 seconds
```

### Test 2: Oversized File Rejection ❌
```
📍 Go to: GSN Page → Document Upload
📁 Select: ANY file over 10MB (or create test_large.bin)
❌ Expected: Error popup appears
❌ Expected: Input field clears
⏱️  Time: 30 seconds
```

### Test 3: Wrong File Type ❌
```
📍 Go to: Attendee Page → Photo Upload
📁 Select: Text file (.txt) or executable (.exe)
❌ Expected: Error popup "Invalid file type"
❌ Expected: Input field stays empty
⏱️  Time: 30 seconds
```

### Test 4: Image Size Limit ❌
```
📍 Go to: GSN Page → Photo Upload
📁 Select: Image file over 5MB
❌ Expected: Error popup "exceeds 5MB limit"
⏱️  Time: 30 seconds
```

### Test 5: Browser Console Check ✅
```
📍 Press: F12 → Console tab
📍 Go to: Attendee → Upload valid JPG
✅ Expected: Console shows "✓ File validated and selected: [filename]"
⏱️  Time: 30 seconds
```

---

## 📊 Quick Results Table

| Test | Action | Expected | ✅/❌ |
|------|--------|----------|-------|
| **1** | Upload valid PDF | Accept | ✅ |
| **2** | Upload 15MB file | Reject + Error | ❌ |
| **3** | Upload .txt file | Reject + Error | ❌ |
| **4** | Upload 6MB image | Reject + Error | ❌ |
| **5** | Check console | "✓ File validated" | ✅ |

---

## 🚨 If Something Fails

### **Error message doesn't appear?**
- [ ] Check browser console (F12)
- [ ] Is `handleFileChange` being called?
- [ ] Is `validateFile` imported?

### **File gets accepted when it shouldn't?**
- [ ] Check actual file size: Right-click → Properties
- [ ] Check file MIME type (not just extension)
- [ ] Verify `FILE_VALIDATION_CONFIG` limits

### **Input field doesn't clear?**
- [ ] Check if `e.target.value = ''` is in `handleFileChange`
- [ ] Try different file
- [ ] Refresh page (Ctrl+R)

---

## 📁 Files Created/Modified

✅ `frontend/src/utils/fileValidation.js` - Validation utility (already exists)
✅ `frontend/src/Pages/Gsn/Gsn.js` - Document & photo validation (already updated)
✅ `frontend/src/Pages/Attendee/Attendee.js` - File & photo validation (already updated)
✅ `frontend/src/Pages/Attendee/GrinEntry.js` - Bill file validation (already updated)

---

## ✨ What's Protected Now?

| Security Feature | Status |
|------------------|--------|
| File size limit | ✅ 10MB documents, 5MB images |
| File type check | ✅ Only PDF/DOC/JPG/PNG allowed |
| Malicious filename | ✅ Blocks special characters |
| Invalid MIME type | ✅ Checks file header, not just extension |
| Auto-clear on error | ✅ Input resets if validation fails |

---

**Ready to test?** Pick Test 1 and start! 🚀
