# Supplier List - Important Notes

## Current Status

The Supplier List page is currently **READ-ONLY** for suppliers sourced from GSN entries.

## Why Edit/Delete Don't Work

1. **Data Source**: The suppliers displayed come from two sources:
   - **GSN Entries** (from `gsnInventry.Schema`) - These are automatically populated from GSN forms
   - **Dedicated Suppliers** (from `supplier.schema`) - These are manually added suppliers

2. **The Problem**: Most suppliers shown are from GSN entries, which are NOT in the Supplier collection. The update/delete endpoints only work on the Supplier collection.

3. **Backend Restart Required**: The route changes made today require a backend server restart to take effect.

## Solutions

### Option 1: Make GSN Suppliers Read-Only (Recommended)
Update the frontend to:
- Show a "source" badge (GSN or Dedicated)
- Disable Edit/Delete buttons for GSN-sourced suppliers
- Only allow editing of Dedicated suppliers

### Option 2: Sync GSN Data to Supplier Collection
Create a sync mechanism that:
- Automatically creates Supplier records when GSN entries are created
- Keeps them in sync
- Allows editing through the Supplier endpoints

### Option 3: Remove Edit/Delete Features
If suppliers should only be managed through GSN forms:
- Remove Edit/Delete buttons entirely
- Make the page view-only

## Immediate Action Required

**RESTART THE BACKEND SERVER** for the route changes to take effect:
```bash
cd grin-main/backend
# Stop the current server (Ctrl+C)
# Then restart it
npm start
# or
node index.js
```

## Files Modified Today

### Backend
- `routes/index.routes.js` - Fixed supplier route mounting (from `/api` to `/`)

### Frontend  
- `Pages/SupplierList.js` - Fixed API endpoints (removed `/api` prefix)

## Current Endpoints (after restart)

- GET `/api/v1/suppliers` - Get all suppliers
- POST `/api/v1/suppliers` - Add new supplier
- GET `/api/v1/supplier-details?partyName=X` - Get supplier details
- PUT `/api/v1/supplier/:partyName` - Update supplier (Dedicated only)
- DELETE `/api/v1/supplier/:partyName` - Delete supplier (Dedicated only)

## Recommendation

For now, **disable Edit/Delete buttons** in the UI until a proper solution is implemented. The supplier list can still be used for viewing supplier information and details.
