ALTER TABLE "time_slots" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "time_slots" CASCADE;--> statement-breakpoint
ALTER TABLE "venues" ALTER COLUMN "city" SET DEFAULT 'Vadodara';