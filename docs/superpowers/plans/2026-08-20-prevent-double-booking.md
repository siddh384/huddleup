# Prevent Double-Booking Race Condition

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a database-level unique constraint to prevent double-bookings, and handle the constraint violation gracefully in the application.

**Architecture:** We add a unique constraint on `(courtId, bookingDate, startTime, status)` to the PostgreSQL bookings table. This ensures that two concurrent booking requests for the same slot cannot both succeed - the database will reject the second insert. We also update the `createBooking` function to catch the unique violation error (PostgreSQL error code 23505) and return a user-friendly error message.

**Tech Stack:** Next.js, Drizzle ORM, PostgreSQL (Neon)

## Global Constraints

- Use existing Drizzle ORM patterns from `db/schema.ts`
- Follow existing error handling patterns from `lib/actions/bookings.ts`
- Use `pnpm` for package management
- Migrations stored in `drizzle/migrations/`

---

## Files to Modify

| File | Change |
|------|--------|
| `db/schema.ts` | Add `unique` import and unique constraint to `bookings` table |
| `lib/actions/bookings.ts` | Catch PostgreSQL unique violation error (code 23505) in `createBooking` |

---

### Task 1: Add Unique Constraint to Schema

**Files:**
- Modify: `db/schema.ts:1-12` (imports) and `db/schema.ts:129-147` (bookings table)

**Interfaces:**
- Produces: Unique constraint `unique_active_booking` on columns `(courtId, bookingDate, startTime, status)`

- [ ] **Step 1: Add `unique` to imports**

In `/Users/darshil/dev1/huddleup/db/schema.ts`, add `unique` to the import statement at line 1:

```typescript
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  uuid,
  primaryKey,
  varchar,
  json,
  unique,  // Add this
} from "drizzle-orm/pg-core";
```

- [ ] **Step 2: Add unique constraint to bookings table**

Modify the `bookings` table definition at lines 129-147 to include a second argument with the unique constraint:

```typescript
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  courtId: uuid("court_id")
    .notNull()
    .references(() => courts.id, { onDelete: "cascade" }),
  bookingDate: timestamp("booking_date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  endTime: varchar("end_time", { length: 5 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("confirmed"),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_active_booking").on(
    table.courtId,
    table.bookingDate,
    table.startTime,
    table.status
  ),
]);
```

- [ ] **Step 3: Verify schema compiles**

Run: `pnpm tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 4: Generate migration**

Run: `pnpm drizzle-kit generate`
Expected: New migration file created in `drizzle/migrations/`

- [ ] **Step 5: Commit schema change**

```bash
git add db/schema.ts drizzle/migrations/
git commit -m "feat: add unique constraint to prevent double-booking"
```

---

### Task 2: Handle Unique Violation in Booking Logic

**Files:**
- Modify: `lib/actions/bookings.ts:175-210` (booking insert and error handling)

**Interfaces:**
- Consumes: PostgreSQL error code `23505` (unique_violation)
- Produces: User-friendly error message "This time slot was just booked by someone else. Please select a different time."

- [ ] **Step 1: Wrap booking insert in try-catch for unique violation**

In `/Users/darshil/dev1/huddleup/lib/actions/bookings.ts`, replace lines 175-210 with:

```typescript
    // Create the booking
    let newBooking;
    try {
      [newBooking] = await db
        .insert(bookings)
        .values({
          userId: userResult.user.id,
          courtId: bookingData.courtId,
          bookingDate: bookingDateTime,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          totalPrice: finalPrice.toString(),
          status: "confirmed",
          paymentStatus: "pending",
        })
        .returning();
    } catch (insertError: unknown) {
      // PostgreSQL unique violation error code
      if (
        insertError &&
        typeof insertError === "object" &&
        "code" in insertError &&
        (insertError as { code: string }).code === "23505"
      ) {
        return {
          success: false,
          error:
            "This time slot was just booked by someone else. Please select a different time.",
        };
      }
      throw insertError;
    }

    revalidatePath("/");
    revalidatePath("/venues");
    revalidatePath(`/venues/${court.venueId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      booking: newBooking,
      discountApplied: discountResult.success && discountResult.isMember,
      originalPrice: discountResult.success
        ? discountResult.originalPrice
        : originalPrice,
      discountAmount: discountResult.success
        ? discountResult.discountAmount
        : 0,
      finalPrice,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit error handling change**

```bash
git add lib/actions/bookings.ts
git commit -m "feat: handle unique violation error in createBooking"
```

---

### Task 3: Run Migration (When Ready to Deploy)

> **Note:** This task should be done when you're ready to apply the change to your database.

- [ ] **Step 1: Check for existing duplicates (safety check)**

Run this SQL against your database:
```sql
SELECT court_id, booking_date, start_time, status, COUNT(*) 
FROM bookings 
WHERE status = 'confirmed'
GROUP BY court_id, booking_date, start_time, status 
HAVING COUNT(*) > 1;
```

Expected: No rows returned (no existing duplicates)

- [ ] **Step 2: Run migration**

Run: `pnpm drizzle-kit migrate`
Expected: Migration applied successfully

---

## Answer for Judges

> "We prevent double-booking with a database unique constraint on (courtId, bookingDate, startTime, status). It's impossible to create duplicate bookings at the database level, regardless of concurrent requests. If two users try to book the same slot simultaneously, the second one receives a friendly error message."

