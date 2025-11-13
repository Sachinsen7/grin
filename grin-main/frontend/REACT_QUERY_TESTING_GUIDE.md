# React Query Caching - Testing Guide

## Prerequisites
- Frontend server running (`npm start`)
- Backend server running (`npm run dev`)
- Browser DevTools open (F12)

---

## Test 1: Basic Caching Verification

### Step 1: Open DevTools Network Tab
1. Press **F12** to open DevTools
2. Click on **Network** tab
3. Filter by **XHR** (XMLHttpRequest) to see API calls only
4. Clear existing network history (Cmd+K or Ctrl+L)

### Step 2: Load Supplier List for First Time
1. Navigate to **Supplier List** page in your app
2. Watch the **Network** tab
3. You should see an API call to `/api/suppliers`
4. Check the **Response** tab to confirm data loads

**Expected Behavior:**
- ✅ API call made
- ✅ Response shows `{ success: true, data: [...] }`
- ✅ Data rendered on page

---

## Test 2: Verify Data is Cached

### Step 1: Navigate Away from Supplier List
1. Click on a different page (e.g., Admin Dashboard, Home)
2. Watch the **Network** tab — should be empty

### Step 2: Navigate Back to Supplier List
1. Click **Supplier List** again
2. Watch the **Network** tab
3. **Check if a new API call is made**

**Expected Behavior (with React Query caching):**
- ❌ **NO** new API call to `/api/suppliers` (data from cache)
- ✅ Page loads instantly from cached data
- ⏱️ Within 5 minutes of initial load

### Step 3: If API Call IS Made
- This means data is NOT cached
- Check that `npm install` was run and React Query is installed
- Verify `index.js` has `QueryClientProvider` wrapper

---

## Test 3: Wait for Stale Data Refresh

### Step 1: Load Supplier List Again
1. Clear Network tab history
2. Navigate to Supplier List
3. Note the time

### Step 2: Wait 5 Minutes (Stale Time)
- After 5 minutes, React Query marks data as "stale"
- When you interact with the page (scroll, filter, etc.), it triggers a **background refetch**
- **User sees no loading state** — data is updated silently

### Step 3: Observe Background Refetch
1. After 5 minutes, perform an action (filter, search, scroll)
2. Watch the **Network** tab
3. You should see a new API call to `/api/suppliers` in the background
4. Page updates with fresh data

**Expected Behavior:**
- ✅ After 5 minutes + interaction, API refetch occurs
- ✅ No loading spinner shown to user (background update)
- ✅ Fresh data replaces old data seamlessly

---

## Test 4: Garbage Collection (10-Minute Cache Cleanup)

### Step 1: Load Data
1. Load Supplier List
2. Note the time

### Step 2: Wait 10+ Minutes Without Interaction
1. Don't visit Supplier List for 10+ minutes
2. After 10 minutes, React Query garbage collects (removes) the cached data

### Step 3: Navigate Back After 10+ Minutes
1. Go to Supplier List again
2. Watch **Network** tab
3. A **fresh API call** should be made

**Expected Behavior:**
- ✅ New API call after 10 minutes of no use (cache expired)
- ✅ Fresh data loaded from server

---

## Test 5: Error Handling & Retry

### Step 1: Simulate Network Error
1. Open **Network** tab in DevTools
2. Click the **Throttling** dropdown (usually says "No throttling")
3. Select **Offline**

### Step 2: Load Supplier List
1. Try to navigate to Supplier List
2. Should see an error (no internet)

### Step 3: Enable Network Again
1. Click **Throttling** → Select **No throttling**
2. Try again
3. React Query automatically retries once

**Expected Behavior:**
- ✅ First attempt fails (offline)
- ✅ Automatic retry succeeds
- ✅ Data loads from successful retry
- ✅ No manual refresh needed

---

## Test 6: Multiple Page Visits (Concurrent Requests)

### Step 1: Rapidly Switch Pages
1. Open Supplier List
2. Immediately switch to another page
3. Immediately back to Supplier List

### Step 2: Watch Network Tab
1. Count API calls to `/api/suppliers`
2. Should see only **1 call**, not multiple

**Expected Behavior:**
- ✅ Only 1 API call despite multiple fast navigations
- ✅ React Query deduplicates concurrent requests
- ✅ All components share same cached data

---

## Test 7: Browser Console Debugging

### Step 1: Install React Query DevTools (Optional)
```bash
npm install @tanstack/react-query-devtools
```

### Step 2: Add to index.js
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Inside QueryClientProvider:
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Step 3: Open DevTools
1. A floating panel appears in bottom-right corner
2. Shows all queries, their status, and cache state
3. Click on queries to see their data

### Step 4: Monitor in Real-Time
- Watch query status: `idle` → `loading` → `success`
- See when data becomes `stale`
- Observe background refetch with ⟲ icon

---

## Quick Performance Comparison

### Without React Query (Old Way)
```
1. Navigate to Supplier List → API call
2. Navigate away → No call
3. Navigate back → API call again ❌ (wasted request)
4. Wait 2 seconds, navigate back → API call again ❌ (wasted request)
```

### With React Query (New Way)
```
1. Navigate to Supplier List → API call (cached)
2. Navigate away → No call
3. Navigate back → No call ✅ (instant from cache)
4. Wait 2 seconds, navigate back → No call ✅ (still cached)
5. Wait 5+ minutes, interact → Background refetch ✅ (silent update)
```

---

## Performance Metrics to Check

### Network Tab Analysis

**Check these metrics:**

1. **Request Count**
   - Count API calls to `/api/suppliers` over 5 minutes
   - Should be 1-2 calls max (initial + one background refresh)

2. **Response Time**
   - First load: Normal (actual API response time)
   - Subsequent loads: Near 0ms (cached data)

3. **Request Size**
   - Should decrease with caching (fewer requests = smaller total size)

4. **Page Load Time**
   - Measure time from page click to data visible
   - Should be faster on cached visits

### Example: Good Performance
```
Total Requests over 15 minutes: 2
- Request 1: Load Supplier List → 250ms API time
- Request 2: Background refresh after 5 minutes → 250ms

Result: 2 full API calls for 15 minutes of usage
```

### Example: Poor Performance (no caching)
```
Total Requests over 15 minutes: 8+
- Every page navigation triggers new API call
- Backend gets hammered
- User sees loading spinners frequently
```

---

## Troubleshooting

### Issue: API calls still happening every time
**Solution:**
- Run `npm install` to ensure React Query is installed
- Check `index.js` has `QueryClientProvider` wrapper
- Restart dev server (`npm start`)
- Clear browser cache (Ctrl+Shift+Del)

### Issue: "Cannot find module '@tanstack/react-query'"
**Solution:**
```bash
cd frontend
npm install
npm start
```

### Issue: DevTools showing "No queries"
**Solution:**
- Make sure `QueryClientProvider` is wrapping your entire `<App />`
- Restart dev server
- Check that components are using `useSuppliers()` or other custom hooks

### Issue: Data not updating after 5 minutes
**Solution:**
- Make sure to **interact** with the page (scroll, filter, click) after 5 minutes
- React Query only refetches when data is marked stale AND the page is being used
- Check that `refetchOnWindowFocus: false` in `QueryClient` config

---

## Success Checklist

✅ React Query package installed  
✅ QueryClientProvider wraps App in index.js  
✅ Custom hooks created in `src/hooks/useApiData.js`  
✅ SupplierList refactored to use `useSuppliers()`  
✅ Network tab shows reduced API calls  
✅ Navigating away/back doesn't trigger new API call  
✅ After 5+ minutes, background refresh occurs  
✅ Error handling works with automatic retry  

---

## Next Steps

Once verified:

1. **Refactor more components** to use React Query:
   - `ApprovalSample.js` → use `useCombinedData()`
   - `Accountmanager.js` → use `useCombinedData()`
   - Any component with fetch patterns

2. **Monitor in production** with DevTools

3. **Adjust cache times** if needed:
   - Need fresher data? Lower `staleTime`
   - Want more caching? Increase `gcTime`

