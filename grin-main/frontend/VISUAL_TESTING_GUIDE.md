# Visual Step-by-Step Testing Guide

## Phase 1: Setup

### Step 1.1 - Start Both Servers
```powershell
# PowerShell Terminal 1 - Frontend
cd c:\Users\sachd\OneDrive\Documentos\GitHub\grin\frontend
npm install
npm start
# Wait for: "webpack compiled successfully"
```

```powershell
# PowerShell Terminal 2 - Backend  
cd c:\Users\sachd\OneDrive\Documentos\GitHub\grin\backend
npm run dev
# Wait for: "Server running on port..."
```

### Step 1.2 - Open Browser
- Navigate to: `http://localhost:3000`
- Press **F12** to open DevTools
- Click on **Network** tab
- Right-click column headers, ensure you see: Name, Size, Time, Type

---

## Phase 2: First Visit (Baseline)

### Step 2.1 - Clear Network History
- In Network tab, press **Cmd+K** (Mac) or **Ctrl+L** (Windows)
- All requests disappear (clean slate)

### Step 2.2 - Navigate to Supplier List
- Click on **Supplier List** in your app menu
- Watch Network tab populate

**WHAT YOU SHOULD SEE:**
```
Request appears in Network tab:
├─ Name: api/suppliers  
├─ Type: xhr
├─ Size: ~5-10 KB
└─ Time: 100-500ms
```

**IN THE APP:**
- Page loads with supplier data ✅
- "Loading..." spinner disappears ✅
- Table shows suppliers ✅

---

## Phase 3: Navigate Away & Back (THE CRITICAL TEST!)

### Step 3.1 - Leave Supplier List
- Click on **Home** page (or any other page)
- Page changes ✅

### Step 3.2 - Clear Network History Again
- Press **Cmd+K** or **Ctrl+L** in Network tab
- All old requests disappear

### Step 3.3 - Go Back to Supplier List
- Click on **Supplier List** again
- Watch Network tab very carefully...

**EXPECTED RESULT - WITH REACT QUERY CACHING:**
```
Network tab: 
├─ (Should be EMPTY!)
└─ No new api/suppliers request ✅
```

**What happens instead:**
```
Supplier List loads instantly from CACHE
No API call made (Network tab empty)
Time to load: <50ms (from memory)
```

**WITHOUT Caching (Old Way):**
```
Network tab would show:
├─ api/suppliers request appears again
├─ "Loading..." spinner shows
└─ Wastes bandwidth & time ❌
```

---

## Phase 4: Third Visit (Double-Check Cache)

### Step 4.1 - Leave Again
- Click Home (or somewhere else)

### Step 4.2 - Clear Network Tab
- Press **Cmd+K** or **Ctrl+L**

### Step 4.3 - Return to Supplier List
- Click Supplier List
- Watch Network tab...

**EXPECTED:**
```
Network tab remains empty ✅
Data loads instantly from cache ✅
Zero API calls
```

---

## Phase 5: Verify with Filter/Search (Still Cached)

### Step 5.1 - Use Search Feature
- Type in the supplier search box
- Filter results

**WHAT SHOULD HAPPEN:**
```
Filtering happens instantly (cached data)
No API calls in Network tab ✅
Search uses local cached data ✅
Results update immediately
```

---

## Phase 6: Advanced - Force Refetch (Optional)

### Step 6.1 - Invalidate Cache (if you want fresh data)
- This is more advanced
- Normally not needed (auto-refresh after 5 min)
- For testing: You can close DevTools and wait 5+ minutes, then interact

---

## Summary Table: What You Should See

| Action | Network Calls | Cache? | Speed |
|--------|---|---|---|
| Load Supplier List (1st time) | ✅ 1 API call | Cached | 100-500ms |
| Navigate away & back (2nd time) | ❌ 0 calls | From cache | <50ms |
| Navigate away & back (3rd time) | ❌ 0 calls | From cache | <50ms |
| After 5+ min, then interact | ✅ 1 call | Background | <50ms + refresh |

---

## Troubleshooting While Testing

### Problem: Still seeing API calls on 2nd visit

**Symptom:**
```
1st visit: /api/suppliers appears ✓
2nd visit: /api/suppliers appears again ✗
```

**Solution:**
```bash
# Kill server (Ctrl+C)
npm install  # Ensure React Query is installed
npm start    # Restart
# Try again
```

### Problem: Network tab shows different URL

**Symptom:**
- Seeing `/api/v1/api/suppliers` instead of `/api/suppliers`

**Solution:**
- This is OK, just a routing thing
- Still counts as same request (caching still works)
- Watch for it being called 2+ times (that would be bad)

### Problem: Data never appears

**Symptom:**
- Page shows "Loading..." forever
- Network tab shows error

**Solution:**
```bash
# Check backend is running
# Check backend console for errors
# Make sure REACT_APP_BACKEND_URL is set in .env.local
```

---

## Performance Before/After Comparison

### BEFORE (Without React Query)
```
Timeline of 3 visits to Supplier List:

Time  Action                    Network
0s    Visit Supplier List       → API call 1 (250ms)
1s    Leave page                (no call)
2s    Visit Home page           (no call)
3s    Return to Supplier List   → API call 2 (250ms) ❌ Wasted!
4s    Leave page                (no call)
5s    Visit Other page          (no call)
6s    Return to Supplier List   → API call 3 (250ms) ❌ Wasted!

Total: 3 API calls = 750ms of server time wasted
```

### AFTER (With React Query)
```
Timeline of 3 visits to Supplier List:

Time  Action                    Network
0s    Visit Supplier List       → API call 1 (250ms) [CACHED]
1s    Leave page                (no call)
2s    Visit Home page           (no call)
3s    Return to Supplier List   (no call) ✅ From cache! <1ms
4s    Leave page                (no call)
5s    Visit Other page          (no call)
6s    Return to Supplier List   (no call) ✅ From cache! <1ms

Total: 1 API call = 250ms saved, 3x faster!

After 5 minutes:
7s    Return to Supplier List   → API call 2 (250ms) [Background refresh]
      (User never sees loading, silently updated)
```

---

## Success! 🎉

When you see this pattern:
```
1st visit:  API call → Data shown
2nd visit:  No call → Data from cache (instant!)
3rd visit:  No call → Data from cache (instant!)
```

**React Query is working perfectly!** ✅

Your app is now:
- ⚡ Faster (instant loads)
- 📉 Using less bandwidth
- 🔄 Updating data automatically
- 😊 Better user experience

