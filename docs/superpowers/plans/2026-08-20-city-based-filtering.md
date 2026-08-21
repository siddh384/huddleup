# City-Based Venue Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add city-based filtering so users see venues only in their selected city (Vadodara, Ahmedabad, Gandhinagar, Surat), with a global header city switcher and required city during profile setup.

**Architecture:** Profile-driven city context — user's city stored in `userProfiles.city`, all venue queries filtered by it. Header city switcher updates the profile via server action. Middleware redirects users without a city to the profile page.

**Tech Stack:** Next.js App Router, Drizzle ORM, PostgreSQL (Neon), Better Auth, shadcn/ui, Tailwind CSS

## Global Constraints

- Supported cities: `["Vadodara", "Ahmedabad", "Gandhinagar", "Surat"]` — no others
- `userProfiles.city` is nullable at DB level, enforced as required via application layer
- `venues.city` is NOT NULL — every venue must have a city
- Direct venue URL access (`/venues/[id]`) works regardless of user's city
- Owners see all their venues across cities on `/my-venues`
- No geo-detection, no "coming soon" page, no nearby cities toggle
- All times in IST (Asia/Kolkata)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `lib/cities.ts` | Create | CITIES constant, City type, city validation |
| `db/schema.ts` | Modify | Add `city` column to venues table |
| `scripts/backfill-city.ts` | Create | Migration script for existing venues |
| `lib/actions/cities.ts` | Create | getUserCity(), updateUserCity() server actions |
| `lib/actions/venues.ts` | Modify | Add city filter to getVenues, getPopularVenues, getRecommendedVenues |
| `middleware.ts` | Modify | Add city-set check for authenticated users |
| `components/profile-form.tsx` | Modify | Add required city dropdown |
| `components/city-switcher.tsx` | Create | Header city dropdown component |
| `components/shared/navbar.tsx` | Modify | Add CitySwitcher to header |
| `app/(root)/page.tsx` | Modify | Pass city to venue queries |
| `app/(root)/venues/page.tsx` | Modify | Pass city to getVenues |
| `components/venue-filters.tsx` | Modify | Relabel Location to Area |
| `components/create-venue-form.tsx` | Modify | Add city dropdown |
| `app/(root)/venues/[id]/edit/page.tsx` | Modify | Add city dropdown |
| `lib/actions/venues.ts` (createVenue) | Modify | Accept and store city |

---

### Task 1: Cities Constant and Schema

**Files:**
- Create: `lib/cities.ts`
- Modify: `db/schema.ts` (lines 74-93, venues table)

**Interfaces:**
- Produces: `CITIES` constant, `City` type, `isValidCity()` helper — consumed by all later tasks

- [ ] **Step 1: Create `lib/cities.ts`**

```ts
export const CITIES = ["Vadodara", "Ahmedabad", "Gandhinagar", "Surat"] as const;

export type City = (typeof CITIES)[number];

export function isValidCity(value: string): value is City {
  return (CITIES as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Add `city` column to venues schema**

In `db/schema.ts`, add `city` to the venues table after the `location` field (line 79):

```ts
location: varchar("location", { length: 255 }).notNull(),
city: varchar("city", { length: 50 }).notNull(),  // ← add this line
```

- [ ] **Step 3: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add lib/cities.ts db/schema.ts
git commit -m "feat: add cities constant and city column to venues schema"
```

---

### Task 2: Backfill Migration Script

**Files:**
- Create: `scripts/backfill-city.ts`

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, `db` from `db/index.ts`, `venues` from `db/schema.ts`

- [ ] **Step 1: Create the backfill script**

```ts
import { db } from "@/db";
import { venues } from "@/db/schema";
import { sql } from "drizzle-orm";

async function backfillCity() {
  console.log("Backfilling city column on existing venues...");

  const result = await db
    .update(venues)
    .set({ city: "Vadodara" })
    .where(sql`city IS NULL`)
    .returning({ id: venues.id, name: venues.name, city: venues.city });

  console.log(`Updated ${result.length} venues to city 'Vadodara':`);
  for (const v of result) {
    console.log(`  - ${v.name} (${v.id})`);
  }

  console.log("Done.");
  process.exit(0);
}

backfillCity().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the backfill**

```bash
npx tsx scripts/backfill-city.ts
```

Expected: All existing venues updated to `city = 'Vadodara'`. If no venues exist, script prints "Updated 0 venues".

- [ ] **Step 3: Verify**

```bash
# Check that no venues have NULL city
npx tsx -e "
const { db } = require('./db');
const { sql } = require('drizzle-orm');
const { venues } = require('./db/schema');
db.select({ count: sql\`count(*)\` }).from(venues).where(sql\`city IS NULL\`).then(r => console.log('NULL city venues:', r[0].count));
"
```

Expected: `NULL city venues: 0`

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-city.ts
git commit -m "feat: add venue city backfill migration script"
```

---

### Task 3: City Server Actions

**Files:**
- Create: `lib/actions/cities.ts`

**Interfaces:**
- Consumes: `City`, `isValidCity` from `lib/cities.ts`, `db` from `db/index.ts`, `userProfiles` from `db/schema.ts`, `getCurrentUser` from `lib/actions/users.ts`
- Produces: `getUserCity(): Promise<City | null>` and `updateUserCity(city: City): Promise<void>` — consumed by middleware, homepage, venues page, city switcher

- [ ] **Step 1: Create `lib/actions/cities.ts`**

```ts
"use server";

import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/actions/users";
import { type City, isValidCity } from "@/lib/cities";
import { revalidatePath } from "next/cache";

export async function getUserCity(): Promise<City | null> {
  const user = await getCurrentUser();
  if (!user?.profile?.city) return null;
  if (isValidCity(user.profile.city)) return user.profile.city;
  return null;
}

export async function updateUserCity(city: City): Promise<{ success: boolean; error?: string }> {
  if (!isValidCity(city)) {
    return { success: false, error: "Invalid city" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (user.profile) {
    await db
      .update(userProfiles)
      .set({ city, updatedAt: new Date() })
      .where(eq(userProfiles.userId, user.id));
  } else {
    // Profile shouldn't be null here (getCurrentUser auto-creates), but handle defensively
    await db.insert(userProfiles).values({
      userId: user.id,
      city,
    });
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath("/profile");

  return { success: true };
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit lib/actions/cities.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/cities.ts
git commit -m "feat: add getUserCity and updateUserCity server actions"
```

---

### Task 4: Fix Venue Queries with City Filter

**Files:**
- Modify: `lib/actions/venues.ts` (lines 172-344 getVenues, lines 738-758 getPopularVenues, lines 761-802 getRecommendedVenues, lines 22-83 createVenue)

**Interfaces:**
- Consumes: `City` from `lib/cities.ts`, `isValidCity` from `lib/cities.ts`
- Produces: Updated signatures:
  - `getVenues({ ..., city, ... })` — new required param
  - `getPopularVenues(city: City)` — new param
  - `getRecommendedVenues(city: City)` — new param
  - `createVenue({ ..., city, ... })` — new required param

- [ ] **Step 1: Update `getVenues()` signature and add city filter**

In `lib/actions/venues.ts`, update the function signature (around line 172):

```ts
export async function getVenues({
  page = 1,
  pageSize = 12,
  searchQuery,
  sportFilter,
  locationFilter,
  ratingFilter,
  status = "approved",
  city,  // ← add this
}: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sportFilter?: string;
  locationFilter?: string;
  ratingFilter?: string;
  status?: string;
  city?: City;  // ← add this
} = {})
```

In the query conditions section (around line 193), add city filter right after the status filter:

```ts
const conditions = [];

// Status filter (existing)
if (status) {
  conditions.push(eq(venues.status, status));
}

// City filter (new)
if (city && isValidCity(city)) {
  conditions.push(eq(venues.city, city));
}

// ... rest of existing conditions (search, location, rating)
```

Note: The `city` import needs to be added at the top of the file:
```ts
import { type City, isValidCity } from "@/lib/cities";
```

And `venues.city` needs to be available — it comes from the schema import which already exists.

- [ ] **Step 2: Replace `getPopularVenues()` with city-aware version**

Replace the entire function (lines 738-758):

```ts
export async function getPopularVenues(city?: City) {
  const conditions = [eq(venues.status, "approved")];

  if (city && isValidCity(city)) {
    conditions.push(eq(venues.city, city));
  }

  const allVenues = await db.query.venues.findMany({
    where: and(...conditions),
    with: { venueSports: { with: { sport: true } } },
    orderBy: [desc(venues.reviewCount), desc(venues.rating)],
    limit: 20,
  });

  return { success: true, venues: allVenues };
}
```

Make sure `and` is imported from `drizzle-orm` (check if it already is — it likely is since `getVenues` uses it).

- [ ] **Step 3: Replace `getRecommendedVenues()` with city-aware version**

Replace the entire function (lines 761-802). Delete all the broken lat/lng distance logic:

```ts
export async function getRecommendedVenues(city?: City) {
  const conditions = [eq(venues.status, "approved")];

  if (city && isValidCity(city)) {
    conditions.push(eq(venues.city, city));
  }

  const allVenues = await db.query.venues.findMany({
    where: and(...conditions),
    with: { venueSports: { with: { sport: true } } },
    orderBy: [desc(venues.rating), desc(venues.reviewCount)],
    limit: 10,
  });

  return { success: true, venues: allVenues };
}
```

- [ ] **Step 4: Update `createVenue()` to accept city**

In the `createVenue` function (around line 22), add `city` to the parameters:

Find the destructured parameters and add `city`:

```ts
export async function createVenue({
  name,
  description,
  address,
  location,
  city,  // ← add this
  images,
  amenities,
  sportIds,
}: {
  name: string;
  description?: string;
  address: string;
  location: string;
  city: City;  // ← add this
  images?: string[];
  amenities?: string[];
  sportIds: string[];
}) {
```

Add validation at the top of the function body (after the role check):

```ts
if (!isValidCity(city)) {
  return { success: false, error: "Invalid city. Must be one of: Vadodara, Ahmedabad, Gandhinagar, Surat" };
}
```

In the `db.insert(venues).values(...)` call, add `city`:

```ts
const [newVenue] = await db
  .insert(venues)
  .values({
    name,
    description,
    address,
    location,
    city,  // ← add this
    images: images || [],
    amenities: amenities || [],
    ownerId: user.id,
    status: "pending",
  })
  .returning();
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add lib/actions/venues.ts
git commit -m "feat: add city filter to getVenues, getPopularVenues, getRecommendedVenues, createVenue"
```

---

### Task 5: Middleware City Guard

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `db` from `db/index.ts`, `userProfiles` from `db/schema.ts`, `user` from auth schema
- Produces: Redirect to `/profile` if authenticated user has no city set

- [ ] **Step 1: Add city check to middleware**

The middleware currently (lines 16-43) checks auth for protected routes. We need to add a second check: if authenticated AND on a city-dependent route AND no city set → redirect to `/profile`.

Update `middleware.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const protectedRoutes = [
  "/bookings",
  "/my-bookings",
  "/my-venues",
  "/admin",
  "/admin-dashboard",
  "/owner-dashboard",
  "/create-venue",
  "/profile",
];

// Routes that require a city to be set (exclude /profile itself to avoid redirect loop)
const cityRequiredRoutes = ["/bookings", "/my-bookings", "/my-venues", "/create-venue"];

const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users from auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // City guard: redirect authenticated users without a city to /profile
  if (isAuthenticated) {
    const isCityRequired = cityRequiredRoutes.some((route) => pathname.startsWith(route));
    if (isCityRequired) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, session!.user.id),
        columns: { city: true },
      });
      if (!profile?.city) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

- [ ] **Step 2: Verify the app starts without errors**

```bash
npm run build 2>&1 | head -30
```

Expected: Build succeeds (or at least no middleware-related errors).

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add city guard to middleware — redirect to profile if no city set"
```

---

### Task 6: Profile Form City Dropdown

**Files:**
- Modify: `components/profile-form.tsx` (lines 193-227, city/state/zip section)

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`
- Produces: Required city dropdown in profile form

- [ ] **Step 1: Add CITIES import**

At the top of `components/profile-form.tsx`, add:

```ts
import { CITIES } from "@/lib/cities";
```

- [ ] **Step 2: Replace city text input with dropdown**

Replace the city Input field (around lines 193-227) with a Select dropdown. The current code has City, State, Zip in a 3-column grid. Replace the City input with:

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* City - now a required dropdown */}
  <div className="space-y-2">
    <Label htmlFor="city">City *</Label>
    <Select
      value={formData.city}
      onValueChange={(value) => setFormData({ ...formData, city: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select your city" />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* State - keep as is */}
  <div className="space-y-2">
    <Label htmlFor="state">State</Label>
    <Input
      id="state"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
      placeholder="State"
    />
  </div>

  {/* Zip Code - keep as is */}
  <div className="space-y-2">
    <Label htmlFor="zipCode">Zip Code</Label>
    <Input
      id="zipCode"
      value={formData.zipCode}
      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
      placeholder="Zip Code"
    />
  </div>
</div>
```

- [ ] **Step 3: Add validation to submit handler**

In the submit handler (around line 69), add city validation before the API calls:

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  // Add city validation
  if (!formData.city) {
    toast.error("Please select your city");
    setIsLoading(false);
    return;
  }

  // ... rest of existing handler
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add components/profile-form.tsx
git commit -m "feat: add required city dropdown to profile form"
```

---

### Task 7: Header City Switcher Component

**Files:**
- Create: `components/city-switcher.tsx`

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, `getUserCity` from `lib/actions/cities.ts`, `updateUserCity` from `lib/actions/cities.ts`
- Produces: CitySwitcher component — consumed by navbar

- [ ] **Step 1: Create `components/city-switcher.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, type City } from "@/lib/cities";
import { updateUserCity } from "@/lib/actions/cities";
import { toast } from "sonner";

interface CitySwitcherProps {
  currentCity: City | null;
}

export function CitySwitcher({ currentCity }: CitySwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleCityChange = (city: City) => {
    startTransition(async () => {
      const result = await updateUserCity(city);
      if (!result.success) {
        toast.error(result.error || "Failed to update city");
      }
    });
  };

  if (!currentCity) return null;

  return (
    <Select
      value={currentCity}
      onValueChange={handleCityChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px] h-9 gap-1.5 text-sm font-medium">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/city-switcher.tsx
git commit -m "feat: add CitySwitcher header component"
```

---

### Task 8: Integrate City Switcher into Navbar

**Files:**
- Modify: `components/shared/navbar.tsx`

**Interfaces:**
- Consumes: `CitySwitcher` from `components/city-switcher.tsx`, `getUserCity` from `lib/actions/cities.ts`
- Produces: City switcher visible in header for authenticated users

- [ ] **Step 1: Make navbar async and fetch city**

The navbar is currently a client component (`"use client"`). The CitySwitcher needs the current city, which comes from a server action. We have two options:

**Option A (recommended):** Keep navbar as client component, but fetch city via a wrapper server component.

Create a small server wrapper. Add to the top of `components/shared/navbar.tsx` or create a separate file:

Actually, the cleanest approach: the navbar is already a client component. We'll pass the city as a prop from a server component wrapper.

Create a server component wrapper at the bottom of `components/shared/navbar.tsx` (or in a separate file). The simpler approach: convert the navbar to accept a `city` prop and create a server component that fetches it.

- [ ] **Step 2: Update navbar to accept city prop**

Modify the `HomeNavbar` component to accept an optional `city` prop:

```tsx
"use client";

import { type City } from "@/lib/cities";
import { CitySwitcher } from "@/components/city-switcher";

// ... existing imports ...

interface HomeNavbarProps {
  city?: City | null;
}

export function HomeNavbar({ city }: HomeNavbarProps) {
  // ... existing code ...

  return (
    <header className="...">
      {/* ... existing nav content ... */}

      {/* Add CitySwitcher before the theme toggle / auth controls */}
      {/* In the desktop section (around line 79): */}
      <div className="hidden md:flex items-center gap-2">
        {city && <CitySwitcher currentCity={city} />}
        {/* existing theme toggle + AuthStatus */}
      </div>

      {/* ... rest of navbar ... */}
    </header>
  );
}
```

- [ ] **Step 3: Create server wrapper that fetches city**

Wherever `HomeNavbar` is rendered (likely in a layout file), wrap it in a server component that fetches the city. Check which file renders `<HomeNavbar />` — it's likely `app/(root)/layout.tsx`.

If it's in `app/(root)/layout.tsx`:

```tsx
import { getUserCity } from "@/lib/actions/cities";
import { HomeNavbar } from "@/components/shared/navbar";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const city = await getUserCity();

  return (
    <div>
      <HomeNavbar city={city} />
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify the navbar renders with city switcher**

```bash
npm run dev
```

Visit `http://localhost:3000` — the city switcher should appear in the header for authenticated users.

- [ ] **Step 5: Commit**

```bash
git add components/shared/navbar.tsx app/(root)/layout.tsx
git commit -m "feat: integrate CitySwitcher into navbar"
```

---

### Task 9: Update Homepage to Use City

**Files:**
- Modify: `app/(root)/page.tsx` (lines 13-16)

**Interfaces:**
- Consumes: `getUserCity` from `lib/actions/cities.ts`, `getPopularVenues(city)` and `getRecommendedVenues(city)` from `lib/actions/venues.ts`

- [ ] **Step 1: Fetch city and pass to venue queries**

Update `app/(root)/page.tsx`:

```tsx
import { getUserCity } from "@/lib/actions/cities";

export default async function HomePage() {
  const city = await getUserCity();

  const [popularResult, recommendedResult] = await Promise.all([
    getPopularVenues(city ?? undefined),
    getRecommendedVenues(city ?? undefined),
  ]);

  // ... rest of existing JSX (no changes needed to the template)
  // The VenueCarousel components stay the same — they just receive city-scoped data now
}
```

- [ ] **Step 2: Verify homepage loads**

```bash
npm run dev
```

Visit `http://localhost:3000` — homepage should show venues only from the user's city (or all cities if not logged in).

- [ ] **Step 3: Commit**

```bash
git add app/(root)/page.tsx
git commit -m "feat: scope homepage venues to user's city"
```

---

### Task 10: Update Venue Listing to Use City

**Files:**
- Modify: `app/(root)/venues/page.tsx` (lines 50-62)
- Modify: `components/venue-filters.tsx` (line 154-163, location filter label)

**Interfaces:**
- Consumes: `getUserCity` from `lib/actions/cities.ts`, updated `getVenues({ city })` from `lib/actions/venues.ts`

- [ ] **Step 1: Fetch city and pass to getVenues**

In `app/(root)/venues/page.tsx`, add city fetch and pass to getVenues:

```tsx
import { getUserCity } from "@/lib/actions/cities";

export default async function VenuesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  // ... existing param extraction ...

  const city = await getUserCity();

  const [user, venuesResult, sportsResult] = await Promise.all([
    getCurrentUser(),
    getVenues({
      page,
      pageSize: 12,
      searchQuery: search || undefined,
      sportFilter: sport || undefined,
      locationFilter: location || undefined,
      ratingFilter: rating || undefined,
      status: status || "approved",
      city: city ?? undefined,  // ← add this
    }),
    getAllSports(),
  ]);

  // ... rest of existing code
}
```

- [ ] **Step 2: Relabel "Location" to "Area" in VenueFilters**

In `components/venue-filters.tsx`, find the location filter label (around line 154):

Change:
```tsx
<Label htmlFor="location-filter">Location</Label>
```
To:
```tsx
<Label htmlFor="location-filter">Area</Label>
```

And update the placeholder (around line 158):
Change:
```tsx
placeholder="Filter by location..."
```
To:
```tsx
placeholder="Filter by area..."
```

- [ ] **Step 3: Add empty state message for no city**

If the user has no city set and visits `/venues`, they should see a prompt. In the venue listing page, add a check before rendering the grid:

```tsx
if (!city) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Select your city</h2>
        <p className="text-muted-foreground mb-4">
          Please set your city in your profile to browse venues.
        </p>
        <Button asChild>
          <a href="/profile">Go to Profile</a>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify venue listing works**

```bash
npm run dev
```

Visit `http://localhost:3000/venues` — should show only venues from the user's city.

- [ ] **Step 5: Commit**

```bash
git add app/(root)/venues/page.tsx components/venue-filters.tsx
git commit -m "feat: scope venue listing to user's city, relabel location to area"
```

---

### Task 11: Add City Dropdown to Venue Creation Form

**Files:**
- Modify: `components/create-venue-form.tsx` (lines 35-42 form state, lines 83-150 submit handler, lines 218-229 location field)

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, updated `createVenue({ ..., city })` from `lib/actions/venues.ts`

- [ ] **Step 1: Add CITIES import**

At the top of `components/create-venue-form.tsx`:

```ts
import { CITIES, type City } from "@/lib/cities";
```

- [ ] **Step 2: Add city to form state**

Update the form state (around line 35):

```ts
const [formData, setFormData] = useState({
  name: "",
  description: "",
  address: "",
  location: "",
  city: "" as City | "",  // ← add this
  amenities: "",
  selectedSports: [] as string[],
});
```

- [ ] **Step 3: Add city dropdown to the form JSX**

Add a city dropdown before the Location field (around line 218). Insert between "Full Address" and "Location (City/Area)":

```tsx
{/* City Selection */}
<div className="space-y-2">
  <Label htmlFor="city">
    City <span className="text-red-500">*</span>
  </Label>
  <Select
    value={formData.city}
    onValueChange={(value) => setFormData({ ...formData, city: value as City })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select city" />
    </SelectTrigger>
    <SelectContent>
      {CITIES.map((city) => (
        <SelectItem key={city} value={city}>
          {city}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 4: Update submit handler to include city**

In the submit handler (around line 83), add city validation and pass to createVenue:

```ts
// After existing validations, add:
if (!formData.city) {
  toast.error("Please select a city");
  return;
}

// In the createVenue call, add city:
const result = await createVenue({
  name: formData.name,
  description: formData.description || undefined,
  address: formData.address,
  location: formData.location,
  city: formData.city as City,  // ← add this
  images: uploadedImages,
  amenities: parsedAmenities,
  sportIds: formData.selectedSports,
});
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add components/create-venue-form.tsx
git commit -m "feat: add required city dropdown to venue creation form"
```

---

### Task 12: Add City Dropdown to Venue Edit Form

**Files:**
- Modify: `app/(root)/venues/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, venue data with `city` field

- [ ] **Step 1: Read the current edit page to understand its structure**

```bash
cat app/\(root\)/venues/\[id\]/edit/page.tsx
```

- [ ] **Step 2: Add city field to the edit form**

The edit form likely has a similar structure to the create form. Add:

1. Import `CITIES` from `@/lib/cities`
2. Add a city dropdown (Select component) pre-populated with the venue's current city
3. Include `city` in the form state and submit handler

```tsx
import { CITIES, type City } from "@/lib/cities";
```

Add the city dropdown in the form, similar to the create form:

```tsx
<div className="space-y-2">
  <Label htmlFor="city">City *</Label>
  <Select
    value={formData.city}
    onValueChange={(value) => setFormData({ ...formData, city: value as City })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select city" />
    </SelectTrigger>
    <SelectContent>
      {CITIES.map((city) => (
        <SelectItem key={city} value={city}>
          {city}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/(root)/venues/\[id\]/edit/page.tsx
git commit -m "feat: add city dropdown to venue edit form"
```

---

### Task 13: End-to-End Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors across the entire project.

- [ ] **Step 2: Run the dev server and test the full flow**

```bash
npm run dev
```

Manual test checklist:
1. Sign up / sign in → should redirect to `/profile` if no city set
2. Profile page → city dropdown visible, required, saves correctly
3. After setting city → can browse `/venues`, homepage shows city-scoped venues
4. Header → city switcher visible, switching city updates all pages
5. Create venue → city dropdown visible, required, saves to venue
6. Venue detail page (`/venues/[id]`) → accessible regardless of user's city
7. `/my-venues` → shows all owner venues across cities
8. Venue listing → "Area" filter works within city scope

- [ ] **Step 3: Verify no regressions in existing features**

```bash
# Check that existing venue queries still work
# Check that booking flow still works
# Check that admin dashboard still works
```

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address verification issues from city-based filtering"
```
