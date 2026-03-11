# Quick Reference Guide - Lead Reanalysis Feature

## Files Changed

### Models & Types

1. **models/Lead.ts**
   - Added `reanalysisCount: number` to ILead interface
   - Added reanalysisCount schema field with default 0

2. **types/lead.ts**
   - Added `reanalysisCount: number` to Lead interface

### Components

3. **components/LeadTable.tsx**
   - Made client component with "use client"
   - Added reanalyse button with loading state
   - Added reanalysisCount column
   - Added `onLeadUpdate` callback prop
   - Handles error states and duplicate prevention

4. **components/LeadDetail.tsx**
   - Made client component with "use client"
   - Added edit mode with form
   - Added 9 new editable fields + success criteria
   - Added reanalysis info box with count
   - Added "Reanalyse Now" button
   - Auto-triggers reanalysis after save
   - Shows error/success messages

### Pages

5. **app/leads/page.tsx**
   - Added `handleLeadUpdate` handler
   - Passes `onLeadUpdate` to LeadTable

6. **app/leads/qualified/page.tsx**
   - Added `handleLeadUpdate` handler
   - Passes `onLeadUpdate` to LeadTable

7. **app/leads/disqualified/page.tsx**
   - Added `handleLeadUpdate` handler
   - Passes `onLeadUpdate` to LeadTable

8. **app/leads/[id]/page.tsx**
   - Converted to client component
   - Added useState for lead data
   - Passes `onLeadUpdate` to LeadDetail

### API

9. **app/api/leads/[id]/reanalyse/route.ts** (NEW)
   - New POST endpoint for reanalysis
   - Increments reanalysisCount
   - Calls external API
   - Prevents duplicates with in-memory cache
   - Comprehensive logging

---

## How It Works

### User Flow 1: Reanalyse from List

```
1. User sees lead in table with "Reanalyse" button
2. Clicks button
3. POST /api/leads/{id}/reanalyse
4. UI shows "Analyzing..." state
5. reanalysisCount increments
6. Table updates with new count
7. Success message shown
```

### User Flow 2: Edit and Reanalyse from Detail

```
1. User views lead details
2. Clicks "Edit" button
3. Form appears with editable fields
4. User modifies data
5. Clicks "Save Changes"
6. PATCH /api/leads/{id} saves changes
7. POST /api/leads/{id}/reanalyse auto-triggers
8. reanalysisCount increments
9. Success message shows new count
10. Form closes, detail refreshes
```

### User Flow 3: Manual Reanalyse from Detail

```
1. User sees reanalysis info box
2. Clicks "Reanalyse Now" button
3. POST /api/leads/{id}/reanalyse
4. Button shows "Reanalysing..."
5. reanalysisCount increments
6. Success message with new count
```

---

## Key Features

### Duplicate Prevention

- In-memory Map tracks ongoing reanalyses
- Returns 409 if reanalysis already in progress
- 5-second timeout clears the lock

### Error Handling

```javascript
// At API level:
if (reanalysisInProgress.get(id)) {
  return 409 error
}

// At UI level:
try { ... } catch { setError(message) }
```

### External API Integration

- Configurable via environment variables
- Graceful degradation if external API fails
- Optional: updates scores from external API response

### Logging

```javascript
// [Reanalysis] Starting reanalysis for lead {id}
// [Reanalysis] Lead info: {...}
// [Reanalysis] Reanalysis completed for lead {id}.
//              New reanalysisCount: {count}
```

---

## Environment Setup

### Add to .env or .env.local:

```env
# Optional - external reanalysis API
LEAD_REANALYSIS_API_URL=https://api.example.com/reanalyse
LEAD_REANALYSIS_API_KEY=your-key-here
```

### No additional npm packages required

All functionality uses existing dependencies:

- Next.js
- React
- MongoDB/Mongoose
- TypeScript

---

## Database Schema Change

### Before:

```javascript
{
  leadScore: Number,
  leadInfo: Object,
  // ... other fields
}
```

### After:

```javascript
{
  leadScore: Number,
  leadInfo: Object,
  reanalysisCount: Number, // NEW (default: 0)
  // ... other fields
}
```

Existing leads will have reanalysisCount undefined until first reanalysis.

---

## Testing the Feature

### 1. Check reanalysisCount displays

```
Navigate to /leads - Check table has "Reanalysis Count" column
Navigate to /leads/{id} - Check blue info box shows count
```

### 2. Test reanalyse button

```
Click "Reanalyse" in table
Watch button change to "Analyzing..."
Check count increments
Verify success message
```

### 3. Test edit and save

```
Click "Edit" in detail page
Change a field (e.g., "Type of Lead")
Click "Save Changes"
Watch button show "Saving..."
Verify success message with new reanalysisCount
Check database for updated data
```

### 4. Test error cases

```
Rapid-click reanalyse (should prevent duplicates)
Click reanalyse while save is in progress (should queue)
Edit with empty required fields (validate gracefully)
```

---

## Debugging Tips

### Check Console Logs

```javascript
// Look for these patterns:
// [Reanalysis] Starting reanalysis...
// [Reanalysis] Reanalysis completed...
// [LeadTable] Reanalysis successful...
// [LeadDetail] Triggering reanalysis...
```

### Check Network Tab

- POST /api/leads/{id}/reanalyse
- PATCH /api/leads/{id}
- Check response includes reanalysisCount

### Check MongoDB

```javascript
// Query lead:
db.leads.findOne({ _id: ObjectId("...") });
// Should have reanalysisCount field
```

---

## Performance Considerations

### In-Memory Cache

- Only tracks ongoing reanalyses (max a few KB)
- Auto-clears after 5 seconds
- No database overhead

### API Calls

- One reanalysis per click (prevented by button state)
- One database update per reanalysis
- One external API call per reanalysis

### UI Updates

- Local state updates immediately
- Callback prop updates parent state
- No excessive re-renders

---

## Troubleshooting

### Reanalysis Count Not Updating

```
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify reanalysisCount field exists in database
4. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
```

### Button States Not Changing

```
1. Ensure React is in development mode
2. Check state updates are working
3. Verify component is client component ("use client")
4. Check console for React errors
```

### External API Not Called

```
1. Check LEAD_REANALYSIS_API_URL env var is set
2. Check endpoint is accessible
3. Check API authentication (LEAD_REANALYSIS_API_KEY)
4. Check network tab for outbound requests
```

---

## Code Examples

### Using the Reanalyse Endpoint

```typescript
// Trigger reanalysis
const response = await fetch(`/api/leads/${leadId}/reanalyse`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});

const result = await response.json();
console.log(result.reanalysisCount); // New count
```

### Handling Updates in Parent Component

```typescript
const handleLeadUpdate = (updatedLead: Lead) => {
  setLeads((prev) =>
    prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)),
  );
};
```

### Checking Reanalysis Count in UI

```tsx
<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800">
  {lead.reanalysisCount || 0}
</span>
```

---

## Security Considerations

### Input Validation

- All lead fields are validated before save
- External API calls use environment variables (secrets)
- MongoDB queries use ObjectId validation

### Rate Limiting

- Duplicate prevention stops rapid reanalysis calls
- 5-second timeout between calls for same lead
- UI buttons disabled during processing

### Data Privacy

- Only authenticated requests to /api/leads endpoints
- Field values not logged to external services
- External API URL/key stored in env vars only

---

## Next Steps for Deployment

1. **Merge branch** with feature code
2. **Add environment variables** to production:
   - `LEAD_REANALYSIS_API_URL`
   - `LEAD_REANALYSIS_API_KEY`
3. **Database migration** (if existing data):
   - reanalysisCount will be 0 for all existing leads
4. **Test in staging** before production
5. **Monitor logs** for reanalysis activity

---

## Support & Questions

For questions about implementation:

- Check FEATURE_IMPLEMENTATION_SUMMARY.md for detailed docs
- Review code comments in components and API routes
- Search console logs for [Reanalysis] tags
- Check git commits for implementation history
