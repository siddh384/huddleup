# HuddleUp - Fix Priority List

## How to Use
Fix issues in order: #1, #2, #3...
- **Functional fixes first** — nothing should be broken
- **Code quality** — deduplicate, clean up
- **UI changes** — after everything works
- **Dead code removal** — absolute last

---

## Functional Fixes (Top Priority)

### 1. Fix `/admin-dashboard` — Make It Work ✅
- `app/(admin)/admin-dashboard/page.tsx` has all components but nothing updates/works
- **Root cause**: Dashboard fetches from `/api/admin/*` routes that didn't exist
- **Fix**: Created 3 API routes that wire up existing server actions:
  - `app/api/admin/users/route.ts` — calls `getAllUsers()`
  - `app/api/admin/venues/route.ts` — calls `getVenues()`
  - `app/api/admin/reports/route.ts` — calls `getAllReports()` and `getReportsStats()`
- Dashboard is now fully functional
- We will use `/admin-dashboard` as the admin route (ignore `/admin`)

### 2. `/profile` Route Not Working ✅
- `/profile` is in middleware `protectedRoutes` but no `app/(root)/profile/page.tsx` exists
- **Fix**: Created full profile page with:
  - `app/(root)/profile/page.tsx` — server component showing user info, stats, membership
  - `components/profile-form.tsx` — client component for editing profile details
- Displays: account info, stats (bookings/venues/reviews/notifications), membership status, edit form

### 3. Edit Venue Button → 404 ✅
- Clicking "Edit Venue" redirects to a non-existent page
- **Fix**: Created edit venue flow:
  - Added `updateVenue()` server action in `lib/actions/venues.ts`
  - Created `app/(root)/venues/[id]/edit/page.tsx` — server component with auth check
  - Created `components/edit-venue-form.tsx` — client form with pre-filled data
- Form includes: name, description, address, location, amenities, sports, images
- Owner/admin only access enforced

### 4. Fix Homepage Sections (Recently Visited, Recommended, Popular) ✅
- **Recently Visited**: Shows venues the user has previously clicked on using localStorage tracking
- **Recommended Sports**: Shows venues near Vadodara, Gujarat, India (sorted by distance)
- **Popular Sports**: Shows all approved venues
- **Fix**: Created real data flow:
  - Added `getPopularVenues()`, `getRecommendedVenues()`, `getVenuesByIds()` server actions
  - Created `RecentlyVisited` client component with localStorage persistence
  - Created `VenueCarousel` component for reuse
  - Added `VenueVisitTracker` to venue detail page to track visits
- Homepage now shows real data instead of hardcoded carousels

### 5. Wire Up Cancel Booking ✅
- `app/(root)/bookings/page.tsx:215`: Cancel button is `disabled` with TODO comment
- `cancelBooking` action exists in `lib/actions/bookings.ts` but isn't connected
- **Fix**: Created `CancelBookingButton` client component with confirmation dialog
- Button now shows confirmation dialog before cancelling
- Uses existing `cancelBooking` server action
- Page refreshes after successful cancellation

### 6. Enable Booking Button on Every Venue ✅
- Ensure every venue has a working booking button
- Should work in Polar sandbox mode (dummy payment, not real)
- Check venue detail page for any conditions that disable booking
- **Fix**: Booking button was already enabled on all venues with courts
- Added helpful message when venue has no courts: "This venue doesn't have any courts set up yet"
- Payment already configured for Polar sandbox mode

### 7. Add More Venues (15-20)
- Seed the database with 15-20 venues across different sports and locations
- Include varied data: different prices, ratings, amenities

### 8. Add Comments/Reviews to Every Venue
- Seed a few reviews for each venue
- Ensure review display works on venue detail page

### 9. Owner Dashboard Uses Mock Data ✅
- `app/(admin)/owner-dashboard/page.tsx:92-101` has hardcoded `mockStats`
- Should fetch real stats from the database
- **Fix**: Replaced `mockStats` with `initialStats` (zeroed out)
- Stats are now calculated from real data fetched from `/api/venues` and `/api/bookings/owner`
- Both venues and bookings data update stats independently when loaded

---

## Code Quality (After Functional Fixes)

### 10. Extract Duplicate DataTable Component
- `DataTable` is copy-pasted between admin and owner dashboards
- Extract into `components/shared/data-table.tsx`

### 11. Extract Duplicate Sports Carousel
- Homepage has 3 identical carousel sections
- Extract into a reusable `SportsCarousel` component

### 12. Clean Up Debug Code
- `components/shared/navbar.tsx:16-27`: Remove `console.log` debug statements

### 13. Consolidate Data Fetching
- `lib/axios/users.ts` duplicates `lib/actions/users.ts`
- Only `getCurrentUser` from axios is used — consolidate or remove

### 14. Fix `deleteUserAccount` Stub
- `lib/actions/users.ts:406-422`: Function doesn't actually delete anything
- Implement properly or remove

---

## UI Changes (After Everything Works)

_Install "impeccable's frontend skill" after functional fixes, then use it for:_

### 15. Landing Page UI Overhaul
### 16. Login/Signup Page — Change Left Photo
### 17. Venues Page UI
### 18. Venue Card/Detail Page UI
### 19. Contact Page UI
### 20. Add cursor:pointer to All Clickable Buttons

---

## Dead Code Removal (Absolute Last)

Remove only after ALL fixes above are complete:

- `lib/actions/users.ts:178` - `getUserById()` unused
- `lib/actions/users.ts:406` - `deleteUserAccount()` unused stub
- `lib/actions/reports.ts:168` - `getReportById()` unused
- `lib/actions/membership.ts:168` - `getMembershipHistory()` unused
- `lib/actions/membership.ts:189` - `updateMembershipPaymentStatus()` unused
- `lib/actions/venues.ts:445` - `getOwnerDashboardStats()` unused
- `lib/payment.tsx:10` - `buyMembership()` unused
- `lib/uploadthing.ts:9` - `UploadDropzone` unused
- `hooks/use-current-user.ts:14` - `useUserProfile()` unused
- `hooks/use-current-user.ts:38` - `useUserStats()` unused
- `lib/axios/users.ts` - entire file mostly unused (move `getCurrentUser` if needed)
- Unused imports across action files (`desc`, `asc`, `ilike`, `revalidatePath`, etc.)
