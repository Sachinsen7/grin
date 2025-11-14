# API Route Fix Summary

## Problem
The frontend was calling API endpoints without the `/api/v1` prefix, causing 404 errors during login and other operations.

## Backend Route Structure
- All routes are mounted at `/api/v1/...`
- Example: `/api/v1/log-in/admin`, `/api/v1/log-in/storemanager`, etc.

## Solution Implemented

### 1. Created Centralized API Utility (`src/utils/api.js`)
- Axios instance with base URL: `${BACKEND_URL}/api/v1`
- Automatic token injection in request headers
- Automatic token refresh on 401 errors
- Handles authentication flow consistently

### 2. Updated Login Component
- Now uses the centralized `api` utility
- Correctly calls `/log-in/{role}` which resolves to `/api/v1/log-in/{role}`
- Improved token extraction from response

### 3. Token Manager
- Updated refresh token endpoint to use `/v1/refresh-token`
- Maintains existing token management logic

## Role Mapping
The following roles are supported:
- `admin` → `/api/v1/log-in/admin`
- `GSN` → `/api/v1/log-in/gsn`
- `attendee` → `/api/v1/log-in/attendee`
- `storemanager` → `/api/v1/log-in/storemanager`
- `generalmanager` → `/api/v1/log-in/generalmanager`
- `purchasemanager` → `/api/v1/log-in/purchasemanager`
- `accountmanager` → `/api/v1/log-in/accountmanager`
- `auditor` → `/api/v1/log-in/auditor`

## Next Steps (Optional)
To fully migrate the application, update other API calls to use the centralized `api` utility:
- Replace `axios.get(\`\${url}/...\`)` with `api.get('/...')`
- Replace `axios.post(\`\${url}/...\`)` with `api.post('/...')`
- Remove manual token header injection (handled automatically)

## Files Modified
1. `src/utils/api.js` - NEW: Centralized API client
2. `src/Components/Login/LoginCard.js` - Updated to use new API client
3. `src/utils/tokenManager.js` - Updated refresh token endpoint
4. `src/App.js` - Added Toaster component for notifications
5. `src/index.js` - Removed unused Toaster import
6. `src/Pages/SupplierList.js` - Fixed duplicate variable declarations
