# City-Based Venue Filtering — Design Spec

**Date:** 2026-08-20
**Status:** Approved for implementation

## Overview

Add city-based filtering to HuddleUp so users see venues only in their selected city. Four cities are supported: Vadodara, Ahmedabad, Gandhinagar, Surat. Users select their city during profile setup and can switch cities via a global header switcher.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Supported cities | Vadodara, Ahmedabad, Gandhinagar, Surat | Fixed list, no expansion for now |
| City context management | Profile-driven (DB) | Single source of truth, fits server-first architecture |
| City switcher placement | Header (global) | Persistent across all pages |
| Onboarding | Required city field on profile page | No dedicated page, uses existing profile |
| Direct venue URL access | Allowed regardless of city | Owners can share links to anyone |
| Existing venue migration | Backfill to Vadodara | Clean data, no null checks |
| Nearby cities / geo-detection | Not built | Out of scope |
| "Coming soon" page | Not built | Only 4 cities, no others exist |

## Data Model

### New constant — `lib/cities.ts`

```ts
export const CITIES = ["Vadodara", "Ahmedabad", "Gandhinagar", "Surat"] as const;
export type City = (typeof CITIES)[number];
```

### Schema changes

**`venues` table — add column:**
- `city: varchar(50) NOT NULL` — set at creation from `CITIES`

**`userProfiles` table — modify column:**
- `city: varchar(50)` (nullable) — currently nullable, stays nullable
- Enforced as required via application layer (middleware redirect), not DB constraint
- New users have `city = NULL` until they set it on the profile page

### Migration

Backfill script:
- All existing venues → `city = 'Vadodara'`
- All existing user profiles → `city = 'Vadodara'`

Application-layer validation: `city` must be one of `CITIES` values (enforced via dropdown selects, not DB constraint).

## City Context Flow

```
Better Auth Session (has user.id)
        │
        ▼
  getUserCity(userId)
  Server action: reads userProfiles.city
  Returns: City (one of 4 values)
        │
   ┌────┼────┐
   ▼    ▼    ▼
Home  /venues  Search
(filtered by city)
```

### Rules

- Every page that shows venues calls `getUserCity()` first
- All venue queries append `WHERE venue.city = $userCity`
- Header city switcher calls `updateUserCity(city)` server action → updates `userProfiles.city` → revalidates page
- Direct URL access (`/venues/[id]`) works regardless of city — no filter
- Owners see all their venues across cities on `/my-venues` (no city filter)
- Logged-out users: no city switcher shown, must sign up to browse

## Components

### 1. Header City Switcher

**File:** New component `components/city-switcher.tsx`

**Visual:**
```
┌──────────────────────────────────────────────────┐
│  HuddleUp   [Home] [Venues]   [📍 Vadodara ▾]   [Profile] │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Shows current `userProfiles.city`
- Dropdown with 4 city options from `CITIES`
- On select → `updateUserCity(city)` server action → DB update → `revalidatePath('/')`
- Wrapped in `useTransition()` for smooth UI
- Not shown to logged-out users

### 2. Profile Page — Required City

**File:** Existing `app/(root)/profile/page.tsx`

**Changes:**
- City dropdown (from `CITIES`) added to profile form
- Marked as `*required`
- Validation: form cannot submit without city

### 3. Middleware / Layout Guard

**File:** `middleware.ts` or a layout component

**Logic:**
- For authenticated users on protected routes, check if `userProfiles.city` is null
- If null → redirect to `/profile` with a message: "Please select your city to continue"
- Routes exempted: `/profile`, `/api/*`, `/admin/*`, `/sign-in`, `/sign-up`
- This is a soft enforcement — DB column is nullable, but the app won't let users browse without setting a city

## Page Changes

### Homepage (`app/(root)/page.tsx`)

**`getRecommendedVenues(city)`:**
- Delete broken lat/lng proximity logic
- New query: `WHERE status = 'approved' AND city = $city ORDER BY rating DESC, reviewCount DESC LIMIT 10`

**`getPopularVenues(city)`:**
- Add city filter: `WHERE status = 'approved' AND city = $city`
- Change sort: `ORDER BY reviewCount DESC, rating DESC LIMIT 20`

**Recently Visited:** No change (reads from localStorage, shows any visited venue).

**Hero search:** No change (navigates to `/venues?location=...`, listing page handles city scope).

**Logged-out users:** Show popular venues from all cities (no city filter). Prompt to sign up for personalized results.

### Venue Listing (`app/(root)/venues/page.tsx`)

**`getVenues()` changes:**
- New required parameter: `city: City`
- Query adds: `AND city = $city`
- `locationFilter` (ILIKE search) stays, relabeled as "Area" — searches within city for neighborhood-level matches (e.g., "Alkapuri")

**Empty state:** "No venues available in [City] yet. Check back soon!"

### Venue Detail (`app/(root)/venues/[id]/page.tsx`)

**No city filtering.** Anyone can access any venue via direct URL. No changes needed.

### Venue Creation (`components/create-venue-form.tsx`)

**Changes:**
- Add required "City" dropdown (from `CITIES`) to the form
- Placed near the existing "Location" field
- "Location" becomes the area/neighborhood detail (e.g., "Alkapuri")
- City is stored in `venues.city`

### Venue Edit (`app/(root)/venues/[id]/edit/page.tsx`)

**Changes:**
- Same city dropdown as creation form
- Pre-populated with venue's current city
- Owner can change city if needed

### Owner's Venues (`app/(root)/my-venues/page.tsx`)

**No city filter.** Shows all venues across all cities for the logged-in owner.

### Owner Dashboard (`app/(admin)/owner-dashboard/page.tsx`)

**No city filter.** Shows all venues and bookings across cities.

### Admin Dashboard (`app/(admin)/admin-dashboard/page.tsx`)

**No city filter.** Admin sees everything.

## Server Actions

### New: `lib/actions/cities.ts`

```ts
export async function getUserCity(): Promise<City>
// Reads userProfiles.city for current user
// Throws if not authenticated or city not set

export async function updateUserCity(city: City): Promise<void>
// Updates userProfiles.city for current user
// Calls revalidatePath('/') to refresh all pages
```

### Modified: `lib/actions/venues.ts`

```ts
getVenues(filters: { city: City; search?; sport?; rating?; page?; limit? })
// Adds city filter to WHERE clause

getRecommendedVenues(city: City)
// Replaces broken lat/lng logic with city + rating sort

getPopularVenues(city: City)
// Adds city filter, changes sort to reviewCount DESC
```

## What We're NOT Building

- ❌ Latitude/longitude on venues
- ❌ Geo-detection (browser or IP-based)
- ❌ "Coming soon" page for unsupported cities
- ❌ Nearby cities toggle
- ❌ City auto-detection from address parsing
- ❌ Dedicated onboarding page (uses existing profile)
- ❌ City-scoped owner dashboard (owners see all their venues)

## Files Changed

| File | Change |
|---|---|
| `lib/cities.ts` | **New** — CITIES constant and City type |
| `db/schema.ts` | Add `city` to venues, make `userProfiles.city` required |
| `lib/actions/cities.ts` | **New** — getUserCity, updateUserCity |
| `lib/actions/venues.ts` | Fix getRecommendedVenues, add city filter to getVenues/getPopularVenues |
| `middleware.ts` | Add city-set check for authenticated routes |
| `components/city-switcher.tsx` | **New** — Header city dropdown |
| `components/navbar.tsx` (or equivalent) | Add CitySwitcher to header |
| `app/(root)/page.tsx` | Pass city to venue queries |
| `app/(root)/venues/page.tsx` | Pass city to getVenues |
| `components/venue-filters.tsx` | Relabel "Location" to "Area" |
| `components/create-venue-form.tsx` | Add city dropdown |
| `app/(root)/venues/[id]/edit/page.tsx` | Add city dropdown |
| `app/(root)/profile/page.tsx` | Add required city field |
| `scripts/backfill-city.ts` | **New** — Migration script |
