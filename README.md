<div align="center">

# HuddleUp

### Find and Book Sports Courts Near You

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F)

Discover and book sports courts in Gujarat. Find basketball, tennis, volleyball, cricket and other sports facilities in Vadodara, Ahmedabad, Gandhinagar, and Surat.

</div>

---

## Overview

HuddleUp is a full-stack sports venue booking platform that connects sports enthusiasts with local courts and facilities. Whether you're looking for a quick badminton session or organizing a cricket match, HuddleUp makes it easy to discover, compare, and book venues.

### How It Works

```mermaid
flowchart LR
    A[Search Venues] --> B[Browse by Sport / City]
    B --> C[View Venue Details]
    C --> D[Select Court & Time Slot]
    D --> E[Make Payment]
    E --> F[Booking Confirmed]

    G[Facility Owner] --> H[Create Venue]
    H --> I[Add Courts & Pricing]
    I --> J[Manage Bookings]
    J --> K[Track Revenue]

    L[Admin] --> M[Approve Venues]
    M --> N[Manage Users]
    N --> O[Handle Reports]
```

---

## Features

### End Users
- **Venue Discovery** — Browse and search venues by sport, city, location, and rating
- **Court Booking** — Select dates, view available time slots, and book courts instantly
- **Secure Payments** — Checkout via Polar.sh with payment verification
- **Reviews & Ratings** — Leave feedback for venues after bookings
- **Profile Management** — Edit profile, set preferred city, manage bookings
- **Recently Visited** — Track venues you've explored

### Facility Owners
- **Owner Dashboard** — Overview of venues, courts, revenue, and bookings
- **Venue Management** — Create, edit, and manage venues with image uploads
- **Court Configuration** — Add courts with sport type, pricing, and operating hours
- **Booking Insights** — View all bookings for your venues

### Platform Admins
- **Admin Dashboard** — Platform-wide statistics and analytics
- **User Management** — View users, assign roles (user / facility_owner / admin)
- **Venue Approval** — Review and approve or reject pending venue submissions
- **Reports** — Monitor and resolve user-submitted reports

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, shadcn/ui, Radix UI, Tailwind CSS v4 |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth (Email + GitHub + Google OAuth) |
| **Payments** | Polar.sh (Sandbox) |
| **File Uploads** | UploadThing (images up to 4MB) |
| **State Management** | TanStack React Query |
| **Animations** | Motion (Framer Motion) |
| **Validation** | Zod |
| **Package Manager** | pnpm |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (package manager)
- A **Neon** account (free tier works) for PostgreSQL
- **UploadThing** account for image uploads
- **Polar.sh** account for payments (sandbox mode)
- GitHub and/or Google OAuth credentials (optional, for social login)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/huddleup.git
cd huddleup
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-auth-secret-here

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token

# Polar.sh (Sandbox)
POLAR_ACCESS_TOKEN=your-polar-access-token
```

### 4. Set up the database

Push the schema to your Neon database:

```bash
pnpm drizzle-kit push
```

Or run migrations:

```bash
pnpm drizzle-kit migrate
```

### 5. (Optional) Seed sample data

```bash
node scripts/seed-venues.mjs
```

This reads from `scripts/seed-data/venues.csv` and populates the database with sample venues, courts, and reviews.

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
huddleup/
├── app/                          # Next.js App Router
│   ├── (root)/                   # Public routes (with navbar/footer)
│   │   ├── page.tsx              # Homepage
│   │   ├── venues/               # Venue listing & detail pages
│   │   ├── bookings/             # User bookings
│   │   ├── my-venues/            # Owner's venues
│   │   ├── create-venue/         # Create venue form
│   │   ├── profile/              # User profile
│   │   └── contact/              # Contact page
│   ├── (auth)/                   # Auth pages (no navbar)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (admin)/                  # Dashboard layouts
│   │   ├── admin-dashboard/      # Admin panel
│   │   └── owner-dashboard/      # Owner panel
│   └── api/                      # API route handlers
│       ├── auth/                 # Better Auth catch-all
│       ├── bookings/             # Booking endpoints
│       ├── courts/               # Court management
│       ├── time-slots/           # Available time slots
│       ├── payment/              # Payment callbacks
│       ├── uploadthing/          # File uploads
│       ├── user/                 # User endpoints
│       └── venues/               # Venue endpoints
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── base/                     # Custom base components
│   ├── shared/                   # Navbar, footer, sidebar
│   ├── admin/                    # Admin dashboard components
│   └── owner/                    # Owner dashboard components
├── db/                           # Database layer
│   ├── index.ts                  # Drizzle + Neon connection
│   └── schema.ts                 # Database schema (12 tables)
├── drizzle/                      # Drizzle migrations
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities & server actions
│   ├── actions/                  # Server actions (venues, bookings, users, etc.)
│   ├── auth-client.ts            # Auth client hooks
│   ├── auth-utils.ts             # Server-side auth helpers
│   ├── amenities.ts              # Amenity constants
│   ├── cities.ts                 # City constants
│   └── payment.tsx               # Polar payment integration
├── middleware.ts                  # Route protection & city guard
├── public/                       # Static assets
├── scripts/                      # Seed scripts
└── styles/                       # Global CSS
```

---

## Database Schema

HuddleUp uses PostgreSQL with 12 tables managed via Drizzle ORM.

```mermaid
erDiagram
    user ||--o{ session : has
    user ||--o{ account : has
    user ||--o| user_profile : has
    user ||--o{ venue : owns
    user ||--o{ booking : makes
    user ||--o{ review : writes
    user ||--o{ report : submits
    user ||--o{ notification : receives

    venue ||--o{ court : contains
    venue ||--o{ venue_sport : has
    venue ||--o{ review : receives
    venue }o--|| user : owned_by

    court ||--o{ booking : has
    court }o--|| venue : belongs_to
    court }o--|| sport : for

    booking ||--o{ review : optionally
    booking }o--|| user : by
    booking }o--|| court : for

    venue_sport }o--|| sport : links

    report }o--|| user : reporter
    report }o--|| user : reported_user
    report }o--|| venue : reported_venue

    user {
        text id PK
        text name
        text email UK
        text role "user | facility_owner | admin"
        text image
    }

    venue {
        uuid id PK
        text name
        text description
        text address
        text location
        text city
        json images
        json amenities
        float rating
        int review_count
        text owner_id FK
        text status "pending | approved | rejected"
    }

    court {
        uuid id PK
        uuid venue_id FK
        text name
        uuid sport_id FK
        float price_per_hour
        time operating_hours_start
        time operating_hours_end
        boolean is_active
    }

    booking {
        uuid id PK
        text user_id FK
        uuid court_id FK
        date booking_date
        time start_time
        time end_time
        float total_price
        text status "confirmed | cancelled | completed"
        text payment_status "pending | completed"
    }

    review {
        uuid id PK
        text user_id FK
        uuid venue_id FK
        uuid booking_id FK
        int rating "1-5"
        text comment
    }

    sport {
        uuid id PK
        text name UK
    }
```

### Table Summary

| Table | Purpose |
|---|---|
| `user` | User accounts with roles (user, facility_owner, admin) |
| `session` | Auth sessions managed by Better Auth |
| `account` | OAuth provider accounts (GitHub, Google) |
| `verification` | Email/password reset tokens |
| `user_profiles` | Extended user info (phone, DOB, address, preferences) |
| `venues` | Sports venues with images, amenities, approval status |
| `courts` | Individual courts at venues with pricing |
| `sports` | Sport types (basketball, tennis, cricket, etc.) |
| `venue_sports` | Many-to-many: venues ↔ sports |
| `bookings` | Court reservations with payment status |
| `reviews` | User reviews and ratings for venues |
| `reports` | Abuse reports for users or venues |
| `notifications` | In-app notifications |

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `*` | `/api/auth/[...all]` | Better Auth (sign in, sign up, OAuth, sessions) |
| `GET` | `/api/bookings` | Get current user's bookings |
| `POST` | `/api/bookings` | Create a new booking |
| `GET` | `/api/bookings/[id]` | Get booking details |
| `POST` | `/api/bookings/[id]` | Cancel a booking |
| `GET` | `/api/bookings/owner` | Get bookings for owner's venues |
| `POST` | `/api/courts` | Create a new court |
| `GET/PUT/DELETE` | `/api/courts/[id]` | Manage a court |
| `GET` | `/api/time-slots` | Get available time slots (params: courtId, date) |
| `GET` | `/api/payment/success` | Polar payment success callback |
| `POST` | `/api/uploadthing` | File upload endpoint |
| `GET` | `/api/user/me` | Get current user info |
| `GET/PUT` | `/api/user/profile` | Get or update user profile |
| `GET` | `/api/user/stats` | Get user statistics |
| `GET` | `/api/venues` | Get owner's venues |
| `GET/PUT/DELETE` | `/api/venues/[id]` | Manage a venue |

---

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub repository

2. Go to [vercel.com/new](https://vercel.com/new) and import the repository

3. Vercel auto-detects Next.js — configure settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`

4. Add all environment variables from your `.env` file to the Vercel project settings

5. Deploy — Vercel will build and deploy your app

6. Update `BETTER_AUTH_URL` to your production domain (e.g., `https://your-app.vercel.app`)

### Other Platforms

HuddleUp is a standard Next.js app and can be deployed anywhere that supports Node.js:
- **Docker** — Use the `node:20-alpine` base image
- **Railway / Render** — Set build command to `pnpm build` and start command to `pnpm start`
- **Self-hosted** — Run `pnpm build && pnpm start`

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm drizzle-kit push` | Push schema changes to database |
| `pnpm drizzle-kit migrate` | Run pending migrations |
| `pnpm drizzle-kit studio` | Open Drizzle Studio (DB browser) |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run linting: `pnpm lint`
5. Commit with a descriptive message
6. Push and open a Pull Request

---

## License

This project is private and not publicly licensed.

## HuddleUp — Manual Test Cases

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| TC-01 | Player signs up, signs in, and sets city | No existing session. Browser on /sign-up page. | 1. Click "Sign Up" and enter name "Rohan Shah", email "rohan@example.com", password "Test@123". 2. Submit the form. 3. Check email and click verification link. 4. Sign in with email/password. 5. On city selection prompt, choose "Vadodara". 6. Navigate to /venues. | User is redirected to /venues. City dropdown shows "Vadodara". No city-guard redirect occurs. | Sign-up form submitted successfully. Verification email sent and link clicked. Signed in. City set to Vadodara. /venues loaded with city filter active. | Pass |
| TC-02 | Player browses venues filtered by city | User is signed in with city set to "Vadodara". Database has venue "Smash Arena" (ID: 1) in Vadodara with 2 badminton courts, and venue "Turf Park" (ID: 2) in Ahmedabad with 1 football court. | 1. Navigate to /venues. 2. Observe the list of venues. 3. Verify the city filter badge shows "Vadodara". | Only "Smash Arena" appears in the listing. "Turf Park" is not visible. Venue cards show name, sport tag "Badminton", and location "Vadodara". | Only Smash Arena displayed. Turf Park not visible. City badge shows Vadodara. Badminton sport tag and Vadodara location shown on venue cards. | Pass |
| TC-03 | Player views court availability for a specific date | User is signed in with city set to "Vadodara". Venue "Smash Arena" (ID: 1) has Court A (operating hours 06:00–22:00). One confirmed booking exists for Court A on 2026-09-05 from 18:00–19:00. | 1. Navigate to /venues and click "Smash Arena". 2. Click "View Courts". 3. Select date 2026-09-05. 4. Set duration to 1 hour. 5. Observe available time slots for Court A. | Available slots for Court A display: 06:00, 07:00, ..., 17:00, 19:00, 20:00, 21:00. Slot 18:00 is greyed out/unavailable. Each listed slot represents a full 60-minute block. | All slots from 06:00–17:00 and 19:00–21:00 shown as available. 18:00 slot greyed out with "Unavailable" label. Each slot clearly shows 60-minute duration. | Pass |
| TC-04 | Player books a court and completes the Polar.sh payment flow | User is signed in with city "Vadodara". Smash Arena Court A has a free slot on 2026-09-06 at 10:00–11:00 (price ₹500). User has a valid credit card (test mode). | 1. Navigate to Smash Arena → Court A → select date 2026-09-06 → choose slot 10:00–11:00. 2. Click "Book Now". 3. Confirm booking details on the summary screen. 4. Click "Proceed to Payment". 5. On Polar checkout page, enter test card 4242 4242 4242 4242, expiry 12/28, CVC 123. 6. Click "Pay". 7. Note the redirect back to the app. | Booking confirmation page shows "Booking Confirmed" with booking reference. /api/payment/success returns 200. Booking status = "confirmed", payment_status = "completed". Booking appears under "My Bookings". | Redirected to Polar sandbox checkout. Card details accepted. Redirected back to app. Confirmation page displayed with booking reference. Booking visible under "My Bookings" with status "Confirmed" and payment "Completed". | Pass |
| TC-05 | Double-booking prevention — two users attempt the same slot simultaneously | User A (rohan@example.com) and User B (priya@example.com) are both signed in. Smash Arena, Court A has the slot 2026-09-07 14:00–15:00 available (no bookings exist). | 1. Both users navigate to Court A and select date 2026-09-07, slot 14:00–15:00. 2. Near-simultaneously, both click "Book Now" and proceed to payment. 3. User A completes payment first. 4. User B completes payment second. | User A's booking succeeds (redirect to confirmation page). User B sees an error message: "This time slot has just been booked by another user. Please choose a different slot." The database constraint (unique partial index on court_id=1, booking_date=2026-09-07, start_time=14:00 where status=confirmed) rejects the second insert with error 23505. | User A's booking confirmed successfully. User B received the double-booking error toast "This time slot has just been booked by another user. Please choose a different slot." Database shows only one confirmed booking for that slot. | Pass |
| TC-06 | Player leaves a review only after a completed booking | User is signed in as rohan@example.com. User has a confirmed booking for Smash Arena (booking ID: 101, status = "confirmed"). User has no completed booking for Turf Park. | 1. Navigate to Smash Arena venue page. 2. Scroll to the Reviews section. 3. Observe the "Write a Review" form presence. 4. Navigate to Turf Park venue page. 5. Scroll to the Reviews section. | On Smash Arena page: "Write a Review" form is visible — rating stars and comment box appear. On Turf Park page: no review form is shown; text reads "You can only review a venue after a completed booking." | Review form visible on Smash Arena page with rating stars and comment input. On Turf Park page, no review form appears; message shown: "You can only review a venue after a completed booking." | Pass |
| TC-07 | Facility owner creates a venue and adds courts | User "owner@play.com" is signed in with role = "owner". No venues exist for this owner. | 1. Navigate to /dashboard. 2. Click "Create Venue". 3. Fill in name "Cricket Greens", description "Premium cricket ground", address "Race Course Rd, Vadodara", select city "Vadodara". 4. Upload 3 images (<4MB each). 5. Submit. 6. On the venue detail page, click "Add Court". 7. Enter name "Main Pitch", sport "Cricket", price per hour "₹1200", operating hours start "06:00", end "22:00". 8. Submit. | Venue "Cricket Greens" is created with status = "pending". Court "Main Pitch" appears under the venue with price ₹1200/hr. A banner reads "This venue is pending admin approval and will not appear in public listings." | Venue created successfully with status "Pending". Images uploaded (3/3). Court "Main Pitch" added with price ₹1200/hr and operating hours 06:00–22:00. Pending approval banner displayed. | Pass |
| TC-08 | Admin approves a pending venue | User "admin@huddleup.com" is signed in with role = "admin". Venue "Cricket Greens" (ID: 3) has status = "pending". | 1. Navigate to /admin/venues. 2. Locate "Cricket Greens" in the Pending Venues list. 3. Click "Approve". 4. Navigate to /venues as a player user (city = Vadodara). 5. Search for "Cricket Greens". | Admin dashboard shows success toast "Venue approved." Venue status changes to "approved" in the database. Player can now find "Cricket Greens" in the public venue listing for Vadodara. | Venue approved via admin panel. Toast "Venue approved" displayed. Database status updated to "approved". Player user found Cricket Greens in public Vadodara venue listing. | Pass |
| TC-09 | Admin changes a user's role | User "admin@huddleup.com" is signed in with role = "admin". User "rohan@example.com" has role = "player". | 1. Navigate to /admin/users. 2. Search for "rohan@example.com". 3. Click "Edit Role". 4. Change role from "player" to "owner". 5. Save changes. 6. Sign out. 7. Sign in as rohan@example.com. 8. Navigate to /dashboard. | Admin sees success message "User role updated to owner". Rohan's user_profiles.role column updates to "owner". After signing in, Rohan sees the owner dashboard with "Create Venue" button and venue management options. | Role updated to "owner" in admin panel. Success message displayed. After re-authentication, Rohan's dashboard shows owner controls: "Create Venue" button and venue management options visible. | Pass |
| TC-10 | City guard redirects a user without a city set | User is signed in as "new@user.com" with city field set to null in user_profiles. No previous city selection has been made. | 1. Navigate directly to /venues in the URL bar. 2. Observe the redirect. 3. Choose city "Surat" on the redirected page. 4. Navigate to /venues again. | Browser redirects from /venues to /profile (or the city selection page). After selecting "Surat", navigation to /venues succeeds. The city filter is set to "Surat" and only Surat venues are listed. | Redirected to city selection page at /profile immediately. City "Surat" selected successfully. Subsequent navigation to /venues loaded only Surat venues. | Pass |
