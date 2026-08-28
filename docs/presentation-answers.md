# HuddleUp / QuickCourt -- Presentation Answers

## How to use this document

Below are answers to the questions you'll face. They're written in speaking style, not essay style. Read them aloud to yourself a few times, pick the parts that feel natural to you, and discard the rest. You don't need to say everything here. The goal is to sound like yourself, not like you're reading a script.

I've organized each question so the first paragraph is the core answer. The paragraphs after that are supporting details you can use if the professor digs deeper.

---

## 1. What is your project about?

HuddleUp is a full-stack web platform for finding and booking sports courts. The brand name in the metadata is QuickCourt.

There are three user roles. Players browse venues by city and sport, check real-time availability of specific courts, book by the hour, and pay online. Facility owners list their venues, create court configurations with pricing and operating hours, and track bookings and revenue. Admins moderate the marketplace: they approve or reject new venues, manage user roles, and handle reports.

The whole thing is scoped to a city. You pick your city when you sign up, and everything you see is filtered to that city. We built it for four Gujarat cities: Vadodara, Ahmedabad, Gandhinagar, and Surat.

---

## 2. What problem are you trying to solve?

The way people book sports courts today is broken. You call the venue and ask if a slot is free. They check a register. You hope they remembered to write your name in it. You show up and the court is double-booked or the person who took your call is not at the desk. Payment is cash or UPI to whoever answers the phone.

For venue owners, it's the same problem from the other side. They manage bookings on WhatsApp, registers, or a spreadsheet. They have no record of who booked what, no way to track which courts are most profitable, and no tool to see occupancy trends.

For the platform, there's a trust problem. If anyone can list a venue, the quality drops. If anyone can leave a review, it's fake. If two people book the same time slot, someone shows up and can't play.

The existing platforms that do this well -- Playo, Playfinder, CourtReserve -- either don't operate in Indian tier-2 cities, or they focus on only one side of the marketplace. Playo covers the big metros. None of the major platforms cover Vadodara, Surat, or Gandhinagar. The ones that do cover Gujarat, like Bookysta in Ahmedabad and Bookforsport in Rajkot, are small and single-city.

So the problem is: there is no platform for Gujarat tier-2 cities that gives players a reliable booking experience, owners a management dashboard, and an admin a moderation layer to keep everything trustworthy.

---

## 3. What motivated you to select this project?

Honestly, because we hit this problem ourselves. I play badminton and sometimes football in Vadodara. Booking a court at a local academy meant sending a WhatsApp message, waiting for a reply, and hoping the slot was still free by the time I got there. Twice I showed up and the court was taken by someone who had "called earlier." That's the kind of frustration that makes you think: there has to be a better way.

My collaborator Siddh and I wanted to build something real -- not a to-do app or a blog. A marketplace with payments, with roles, with moderation, with a real database that prevents race conditions. Something that could actually be deployed. We also wanted to use the full modern stack: Next.js, TypeScript, PostgreSQL, proper auth, proper payments. Most student projects stop at a CRUD app. We wanted to go further.

The cities are specific to us because we're from Gujarat. Vadodara, Ahmedabad, Surat, Gandhinagar -- these are places we know. If we were going to build a venue booking platform, it made sense to build it for a place where we could actually knock on venue doors and say "here's a demo."

---

## 4. How can this project contribute to a real-life application?

This is not a demo. It's a deployable product. Here's what it does in practice:

**For a player:** You open the site, search for badminton courts in Vadodara. You see five venues with images, amenities, and ratings. You pick one, see a calendar, pick a date, see a grid of available time slots. You pick 7-8 PM, pay online, get a confirmation. You show up and your court is waiting. No phone calls, no cash, no confusion.

**For a venue owner:** You list your venue, add photos, set up court configurations with pricing and operating hours. You get a dashboard showing your total bookings, revenue, and occupancy. You see who booked what and when. You don't miss calls because nobody needs to call.

**For an admin:** You approve venues before they go live, so the platform doesn't have low-quality listings. You manage user roles. You handle reports when someone has a bad experience.

**For the system:** Double-booking is prevented at the database level. Reviews are only allowed after a confirmed booking. The moderation workflow means a venue is reviewed before it appears on the platform.

This is a full marketplace. It's not a feature, it's a product. If you wanted to launch it in Vadodara tomorrow, you could start onboarding venues and players. The only thing blocking a real launch is payment processor setup for India (UPI/Razorpay) and real venue onboarding, which is a business process, not a technical gap.

---

## 5. What is the novelty or newness of your work?

I'll be honest: a court booking platform is not a new idea. Playo has been doing it for years. Playfinder does it in the UK. CourtReserve does it for US clubs. Individually, none of the features we built are groundbreaking.

What's new is the combination and the constraints we chose.

**First, the city scope.** Most platforms go national or global. We deliberately scoped everything to a city. Every query filters by city. The middleware redirects you to set your city if you haven't. The venue form requires a city. This is a design choice that matches how sports actually work: you don't travel across the country to play a weekly badminton game. You play in your city. By keeping it city-scoped, the search results are relevant, and the moderation load is manageable.

**Second, the three-sided marketplace with moderation.** Most platforms are two-sided: players and owners. We added a third: the admin. Venues go through a pending -> approved workflow. This keeps the listing quality high. We haven't seen this in the Indian competitors. Bookysta and Bookforsport don't have a visible moderation layer.

**Third, database-enforced double-booking prevention.** This is the strongest technical piece. We have a unique partial index on the bookings table: (court_id, booking_date, start_time) where status = 'confirmed'. This means even if two users click "book" at the exact same millisecond, the database guarantees only one goes through. The second one gets a constraint violation, and we catch it server-side. Most platforms rely on client-side checks or application-level locking, which can fail under concurrent load. We don't have to worry about that.

**Fourth, verified reviews.** You can only review a venue if you have a confirmed, completed booking. This prevents fake reviews. We checked the competitors and found that none of them have this. Playo has reviews, but users on the Play Store report fake reviews being a problem. Our approach is simple: no booking, no review.

**Fifth, a production-grade stack for a student project.** Most academic projects use a single technology or a simple CRUD pattern. We built 11 database tables with full relations, three user roles with server-side authorization, payment integration, file uploads, city-scoped middleware, and a custom design system. The gap between a student project and a production app is usually big. We tried to close that gap as much as possible.

---

## 6. What specific technical contribution have you made?

I'll walk through the key technical decisions and what they required.

**Database schema.** 11 tables with full Drizzle ORM relations. The bookings table has a composite unique constraint on (court_id, booking_date, start_time, status) that prevents double-booking at the database level. This is the most important constraint in the system. The venue_sports table uses a composite primary key for the many-to-many relationship. The reviews table links to a specific booking, which is how we enforce verified reviews.

**The availability algorithm.** The time-slots API generates available slots for a given court on a given date. It takes the court's operating hours, generates 30-minute or 60-minute blocks, then subtracts the ones that are already booked with a confirmed status. It also accounts for the requested duration: if you want to book for 2 hours, it only shows slots where the next 2 hours are fully open. This is a server-side computation that runs on every request, so it's always up to date.

**The booking race condition.** The most interesting technical challenge. When two users try to book the same slot at the same time, the unique constraint on bookings catches it. We wrap the booking creation in a try-catch that checks for the specific Postgres error code for unique violation (23505). If it fires, we return a clear error message: "This slot has already been booked." The user can refresh and pick another slot. This is simpler and more reliable than a distributed lock or a queue.

**The city guard middleware.** Every authenticated request goes through middleware that checks if the user has set a city in their profile. If not, they get redirected to /profile. This means every part of the app can assume a city is set. The venue queries all use `eq(venues.city, userCity)` as a base filter. This is consistent across the homepage, the venue listing, the search results, and the dashboard.

**Role-based access control.** Server-side checks on every protected route. The middleware handles auth. The admin routes check for the admin role server-side. The owner routes check for the facility_owner or admin role. A user can't access /owner-dashboard by guessing the URL. The role is stored in the user table, not in a JWT claim, so changing a role takes effect immediately.

**Payment flow.** The booking flow is: select court and time slot -> create a payment checkout via Polar.sh -> redirect to Polar's hosted checkout page -> on success, Polar redirects to our success callback -> we update the booking status to confirmed and payment status to completed. If the payment fails, the booking is cancelled. This is a standard checkout flow, but integrating it with the availability constraint and the booking status tracking required careful state management.

**File uploads.** UploadThing integration for venue images. Five images max, 4MB each. The uploads are presigned and validated server-side. Images are stored as a JSON array of URLs in the venues table.

**The BoardUI design system.** We didn't just use Tailwind stock components. We built a custom design system called BoardUI on top of Radix UI primitives. It has its own design tokens, typography, and component library. The result is a consistent look across the whole app -- the admin dashboard, the venue cards, the booking flow, the auth pages. This is not a technical innovation, but it's an investment in quality that most student projects skip.

---

## 7. Technology choices -- why these and what were the alternatives?

### Next.js App Router

We chose Next.js because it gives us server-side rendering for SEO (venue pages need to be indexable), React Server Components for efficient data fetching, and server actions for mutations without writing API routes. The App Router is the current standard.

Alternatives: A plain React SPA with Vite would have worse SEO (we'd need a separate SSR layer). Remix would also work but has a smaller ecosystem. A Python/Django monolith was considered but we're both comfortable with TypeScript, and keeping the full stack in one language reduces context switching.

### TypeScript

Catch bugs at compile time, better refactoring confidence, and the ORM (Drizzle) is fully typed. Both of us know TypeScript, so it was the natural choice.

### PostgreSQL (Neon) + Drizzle ORM

We chose PostgreSQL because the relational model matters here. Bookings, venues, users, reviews -- they all have constraints and relationships. We needed unique constraints, foreign keys, and transactions.

Alternatives: SQLite can't handle concurrent writes well for a booking system. MongoDB has the flexibility but we'd lose the declarative constraint that prevents double-booking. Neon gives us serverless Postgres, so we don't need to manage a VPS.

Drizzle vs Prisma: Drizzle is lighter, closer to SQL, and faster at runtime. Prisma has nicer auto-complete and migrations but adds a heavier layer. Migration speed during development was a factor -- Drizzle migrations are SQL files, fast to run.

### Better-Auth

We chose Better-Auth because it's a newer open-source library designed for this Next.js stack. It supports email/password, Google, and GitHub out of the box. It stores sessions in our database, so we control the data.

Alternatives: Auth.js (formerly NextAuth) is more mature but has more boilerplate for custom setups. Clerk is a hosted service and easier to set up, but we wanted to keep auth data in our own database. Better-Auth struck the right balance.

### Polar.sh for payments

We used Polar's sandbox mode for the payment flow. It has a clean checkout API and a developer-friendly SDK.

The honest limitation: for a real India launch, we'd switch to Razorpay or Stripe with INR support, because Polar doesn't support UPI which is the dominant payment method in India. Polar was the right choice for development and demonstration. The payment flow architecture is the same regardless of the provider.

### UploadThing for file uploads

Purpose-built for Next.js. Presigned uploads, file type validation, size limits. It integrates directly with the Next.js API route pattern. Alternatives: direct S3 uploads would require more boilerplate. Cloudinary is more feature-rich but adds another service.

### TanStack React Query

Client-side caching for the dashboard stats, venue listings, and availability checks. The booking UI feels instant because the data is cached and refetched in the background. Server Actions handle mutations, but queries go through React Query for the cache layer.

### Other tools

- Tailwind CSS for styling, with a custom BoardUI layer of design tokens.
- date-fns for date manipulation -- lightweight, tree-shakeable, no moment.js bloat.
- Motion (framer-motion) for page transitions and the not-found page animation.
- Embla Carousel for the venue image gallery.
- The t3-env library for environment variable validation with Zod.

---

## 8. Related work and how we differ

### Playo (playo.co)

The dominant player in India. 4M+ users, 50+ sports, covers major metros. They have a venue partner app for owners and a booking system for players. They are the closest competitor.

**How we differ:** Playo does not cover Gujarat cities. Their footer lists Bangalore, Chennai, Hyderabad, Pune, Mumbai, Delhi, Kochi, and international locations. No Vadodara, Ahmedabad, Surat, or Gandhinagar. They also have a known problem with "super hosts" bulk-booking slots and reselling at inflated prices (acknowledged in their July 2026 update). We avoid this by design: our system is booking-direct with no middleman reselling. We also have verified reviews gated on confirmed bookings; Playo reviews can be posted by anyone.

### Bookysta (bookysta.com)

Ahmedabad-based court booking platform. Supports cricket, pickleball, badminton, football, volleyball, tennis, basketball, swimming.

**How we differ:** Ahmedabad only. We cover four cities. No visible moderation workflow. We have a three-role admin system. Our verified reviews are also unique here.

### Bookforsport (bookforsport.com)

Rajkot-based. Free for venue owners (no commission, no subscription). Box cricket, pickleball, badminton, football turf.

**How we differ:** Rajkot only. We cover a broader region. The commission-free model is interesting but raises questions about sustainability. We haven't made a decision on our monetization model yet.

### Playfinder (playfinder.com) / CourtReserve (courtreserve.com)

Playfinder is UK's leading sports booking platform. CourtReserve is US-based club management software for tennis, pickleball, and padel clubs.

**How we differ:** Both are excellent products but not relevant to the Indian market. Playfinder is UK-only. CourtReserve is B2B SaaS for club management, not a consumer marketplace. Neither addresses the Indian context of phone-call booking, cash payments, and WhatsApp-based management.

### Key gaps we identified

1. **No platform covers Gujarat tier-2 cities.** Playo, the biggest player, is absent. The local players cover one city each.
2. **No platform has verified reviews.** You can post a review on Playo or Bookysta without ever booking. Our system requires a confirmed booking.
3. **No platform has a three-role moderation workflow.** Most are two-sided. We have an admin approval layer.
4. **No platform documented database-level double-booking prevention.** Most say "real-time availability" but don't explain how they prevent the race condition.

---

## 9. Strengths, weaknesses, limitations, and future improvements

### Strengths

- **Complete vertical slice.** Auth, listings, availability, booking, payment, review, moderation, reporting. It's not a feature demo, it's a full marketplace.
- **Database-level race safety.** The unique constraint on bookings is a real engineering decision that prevents a real problem.
- **Verified reviews.** Simple and effective. No booking, no review.
- **City-scoped design.** Honest to the domain. Sports are local.
- **Production stack.** Environment validation, type safety, proper auth, migrations, design system. Most student projects skip these.

### Weaknesses and limitations

- **Timezone is hardcoded to IST.** If the platform expands to other regions, each venue or city needs its own timezone. That's a schema change and a lot of testing.
- **Payment is Polar sandbox, not real money.** For a real launch, we need Razorpay with UPI support. The architecture is the same, but the integration work is not trivial.
- **No real-time updates.** If you're looking at availability and someone else books the slot, you won't know until you refresh. The database constraint prevents the double-book, but the user experience could be better with WebSockets or SSE.
- **No automated tests.** We have no tests. This is the biggest weakness for a production application. We relied on manual testing during development.
- **Notifications table exists but is not wired.** The notifications table is in the schema, but we haven't built the UI or the notification dispatch pipeline. Email or SMS notifications would be needed for a real deployment.
- **No waitlist or recurring bookings.** If a slot is taken, you can't join a waitlist. If you want to book every Tuesday at 7 PM, you have to do it manually each time.
- **No player reputation system.** Owners can't see who is booking. A player rating system would help with trust.
- **Seed data is not real venues.** The 19 venues in the seed script are realistic but not actual operational venues. Real onboarding requires a business development process.

### Future improvements

- **Razorpay integration with UPI.** This is the first thing needed for an India launch.
- **Real-time availability via WebSockets or SSE.** So the UI updates when a slot is booked.
- **Waitlist and recurring booking.** Common user requests.
- **Player ratings and reputation.** So owners can see who they're booking to.
- **Notification pipeline.** Email and SMS reminders for bookings, payment confirmations, and cancellations.
- **Admin analytics dashboard.** Charts for revenue, bookings, user growth, and venue performance.
- **PWA or mobile app.** Push notifications, offline access to booking confirmations.
- **Multi-language support.** Hindi and Gujarati would make the platform accessible to more users.
- **Automated tests.** Unit tests for the availability algorithm, integration tests for the booking flow, and end-to-end tests for the critical paths.

---

## Quick reference: one-liners for rapid-fire questions

**What is HuddleUp?**
A full-stack web platform for booking sports courts, with three roles: players, venue owners, and admins.

**What's the stack?**
Next.js 16 App Router, TypeScript, PostgreSQL on Neon, Drizzle ORM, Tailwind CSS, Better-Auth, Polar.sh, UploadThing, TanStack Query.

**What's the novel thing?**
The combination of a city-scoped marketplace, database-enforced double-booking prevention, verified reviews gated on confirmed bookings, and a three-role moderation workflow.

**Who are the competitors?**
Playo is the biggest in India but doesn't cover Gujarat tier-2 cities. Bookysta covers Ahmedabad only. Bookforsport covers Rajkot only. No competitor has verified reviews or a moderation workflow.

**What's the biggest limitation?**
No automated tests, no real-time updates, payments are in sandbox mode, and notifications are not wired.

**Is it production-ready?**
Architecturally yes, but it needs a real payment provider, automated tests, and a business development effort to onboard venues.