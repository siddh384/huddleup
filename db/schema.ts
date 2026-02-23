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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user', 'facility_owner', 'admin'
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const sports = pgTable("sports", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  location: varchar("location", { length: 255 }).notNull(), // Short location for display
  images: json("images").$type<string[]>().default([]), // Array of image URLs from UploadThing
  amenities: json("amenities").$type<string[]>().default([]), // Array of amenity strings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"), // Average rating from reviews (0.00 to 5.00)
  reviewCount: integer("review_count").default(0), // Total number of reviews
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected'
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const venueSports = pgTable(
  "venue_sports",
  {
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.venueId, t.sportId] })],
);

export const courts = pgTable("courts", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sportId: uuid("sport_id")
    .notNull()
    .references(() => sports.id),
  pricePerHour: decimal("price_per_hour", {
    precision: 10,
    scale: 2,
  }).notNull(),
  operatingHoursStart: varchar("operating_hours_start", {
    length: 5,
  }).notNull(), // "09:00"
  operatingHoursEnd: varchar("operating_hours_end", { length: 5 }).notNull(), // "22:00"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  courtId: uuid("court_id")
    .notNull()
    .references(() => courts.id, { onDelete: "cascade" }),
  bookingDate: timestamp("booking_date").notNull(), // Date of the booking
  startTime: varchar("start_time", { length: 5 }).notNull(), // "14:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "15:00"
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("confirmed"), // 'confirmed', 'cancelled', 'completed'
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timeSlots = pgTable("time_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  courtId: uuid("court_id")
    .notNull()
    .references(() => courts.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  endTime: varchar("end_time", { length: 5 }).notNull(),
  status: varchar("status", { length: 20 }).default("available"), // 'available', 'booked', 'blocked'
  bookingId: uuid("booking_id").references(() => bookings.id),
  blockReason: text("block_reason"), // For maintenance blocks
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").references(() => bookings.id), // Optional link to booking
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id),
  reportedUserId: text("reported_user_id").references(() => user.id),
  reportedVenueId: uuid("reported_venue_id").references(() => venues.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'resolved', 'dismissed'
  resolvedBy: text("resolved_by").references(() => user.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'booking_confirmed', 'booking_cancelled', 'venue_approved', etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data"), // Additional data for the notification
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  preferences: json("preferences")
    .$type<{
      favoritesSports?: string[];
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
    }>()
    .default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  planType: varchar("plan_type", { length: 20 }).notNull(), // 'monthly', '6_months', 'annual'
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'expired', 'cancelled'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(false),
  discountPercentage: integer("discount_percentage").default(30), // Default 30% discount
  paymentAmount: decimal("payment_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // 'pending', 'paid', 'failed'
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [user.id],
    references: [userProfiles.userId],
  }),
  membership: one(members, {
    fields: [user.id],
    references: [members.userId],
  }),
  venues: many(venues),
  bookings: many(bookings),
  reviews: many(reviews),
  reports: many(reports),
  notifications: many(notifications),
  sessions: many(session),
  accounts: many(account),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  user: one(user, {
    fields: [members.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  owner: one(user, {
    fields: [venues.ownerId],
    references: [user.id],
  }),
  approvedBy: one(user, {
    fields: [venues.approvedBy],
    references: [user.id],
  }),
  courts: many(courts),
  venueSports: many(venueSports),
  reviews: many(reviews),
}));

export const sportsRelations = relations(sports, ({ many }) => ({
  courts: many(courts),
  venueSports: many(venueSports),
}));

export const venueSportsRelations = relations(venueSports, ({ one }) => ({
  venue: one(venues, {
    fields: [venueSports.venueId],
    references: [venues.id],
  }),
  sport: one(sports, {
    fields: [venueSports.sportId],
    references: [sports.id],
  }),
}));

export const courtsRelations = relations(courts, ({ one, many }) => ({
  venue: one(venues, {
    fields: [courts.venueId],
    references: [venues.id],
  }),
  sport: one(sports, {
    fields: [courts.sportId],
    references: [sports.id],
  }),
  bookings: many(bookings),
  timeSlots: many(timeSlots),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(user, {
    fields: [bookings.userId],
    references: [user.id],
  }),
  court: one(courts, {
    fields: [bookings.courtId],
    references: [courts.id],
  }),
  timeSlots: many(timeSlots),
  reviews: many(reviews),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one }) => ({
  court: one(courts, {
    fields: [timeSlots.courtId],
    references: [courts.id],
  }),
  booking: one(bookings, {
    fields: [timeSlots.bookingId],
    references: [bookings.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  venue: one(venues, {
    fields: [reviews.venueId],
    references: [venues.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(user, {
    fields: [reports.reporterId],
    references: [user.id],
  }),
  reportedUser: one(user, {
    fields: [reports.reportedUserId],
    references: [user.id],
  }),
  reportedVenue: one(venues, {
    fields: [reports.reportedVenueId],
    references: [venues.id],
  }),
  resolvedBy: one(user, {
    fields: [reports.resolvedBy],
    references: [user.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Sport = typeof sports.$inferSelect;
export type NewSport = typeof sports.$inferInsert;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type NewTimeSlot = typeof timeSlots.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
