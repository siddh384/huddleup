// Seeds venues from scripts/seed-data/venues.csv into the Neon database.
//
// Usage: node scripts/seed-venues.mjs [--fresh]
//
//   --fresh  wipes ALL existing venues (and their courts, bookings, reviews)
//            before inserting. Without it, the script aborts if any venue
//            exists, so manual edits (photos, prices) are never destroyed.
//
// Notes:
// - Venues are inserted as 'approved', owned by OWNER_EMAIL below.
// - The CSV has no prices; every court gets PLACEHOLDER_PRICE/hr until edited
//   by hand in the owner UI.
// - Images are seeded empty; they are added manually via venue edit.
// - A plausible set of reviews (2-4 per venue) is generated from real user
//   accounts, then venue rating/review_count are recomputed.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const OWNER_EMAIL = "darshil.0406@gmail.com";
const PLACEHOLDER_PRICE = "500.00";
const DEFAULT_HOURS = { start: "06:00", end: "22:00" };
const CITIES = ["Vadodara", "Ahmedabad", "Gandhinagar", "Surat"];
const FRESH = process.argv.includes("--fresh");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(scriptDir, "seed-data", "venues.csv");

// ---------- CSV parsing (quoted fields, embedded commas/newlines) ----------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---------- normalization helpers ----------

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function splitList(value) {
  // sports/amenities arrive comma- or semicolon- or newline-separated
  return (value || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dedupeCaseInsensitive(items) {
  const seen = new Set();
  return items.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCity(value) {
  const match = CITIES.find((c) => c.toLowerCase() === (value || "").trim().toLowerCase());
  if (!match) throw new Error(`Unknown city: "${value}"`);
  return match;
}

function parseHours(value) {
  // accepts "6 AM - 12 AM", "06:00-23:00", "6:00 AM to 10:00 PM"; falls back to default
  const raw = (value || "").trim();
  if (!raw) return DEFAULT_HOURS;
  const matches = [...raw.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi)].map((m) => {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const mer = m[3] ? m[3].toLowerCase() : null;
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    return { h, min };
  });
  if (matches.length < 2) return DEFAULT_HOURS;
  const toStr = ({ h, min }) => `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  let start = toStr(matches[0]);
  let end = toStr(matches[matches.length - 1]);
  if (end === "00:00") end = "23:59"; // "12 AM" close time
  if (end <= start) return DEFAULT_HOURS;
  return { start, end };
}

function parsePrice(value) {
  const digits = (value || "").replace(/[^\d.]/g, "");
  return digits ? parseFloat(digits).toFixed(2) : null;
}

// parse "Turf A:900; Turf B:850" into [{name, price}] (CSV currently has none)
function parseCourts(value) {
  return splitList(value)
    .map((entry) => {
      const m = entry.match(/^(.+?):\s*(\d[\d.]*)$/);
      if (!m) return null;
      return { name: m[1].trim(), price: parseFloat(m[2]).toFixed(2) };
    })
    .filter(Boolean);
}

// ---------- seed review generation (deterministic) ----------

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

const REVIEW_COMMENTS = [
  "Great surface and good lighting even for late evening slots. Booking was smooth.",
  "Courts are well maintained and parking is a big plus.",
  "Good experience overall, staff was cooperative. Will visit again.",
  "Surface was a bit worn near the corners but overall a fun session.",
  "Perfect for weekend matches with friends, easy to reach.",
  "Clean facilities, washrooms were tidy too.",
  "Fair price for the quality. Recommended.",
  "Booked an evening slot, floodlights were excellent.",
  "Gets crowded on weekends so book early. Otherwise great.",
  "Nice seating area for people who are waiting for their turn.",
  "Equipment rental came in handy. Good session.",
  "Warm-up space is a nice touch. Enjoyed the game.",
];

const RATING_POOL = [5, 5, 4, 4, 4, 4, 3, 5];

function reviewsForVenue(venueIndex, authors) {
  const count = 2 + Math.floor(rng() * 3); // 2-4
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const author = authors[(venueIndex + i) % authors.length];
    const rating = RATING_POOL[Math.floor(rng() * RATING_POOL.length)];
    const comment = REVIEW_COMMENTS[Math.floor(rng() * REVIEW_COMMENTS.length)];
    const daysAgo = Math.floor(rng() * 60) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    reviews.push({ userId: author.id, rating, comment, createdAt });
  }
  return reviews;
}

// ---------- main ----------

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);

  const venues = rows
    .slice(1)
    .filter((r) => (r[col("name")] || "").trim())
    .map((r) => ({
      name: (r[col("name")] || "").trim(),
      city: normalizeCity(r[col("city")]),
      area: (r[col("area")] || "").trim(),
      address: (r[col("address")] || "").replace(/\s+/g, " ").trim(),
      sports: dedupeCaseInsensitive(splitList(r[col("sports")]).map(titleCase)),
      hours: parseHours(r[col("hours")]),
      description: (r[col("description")] || "").trim(),
      amenities: dedupeCaseInsensitive(splitList(r[col("amenities")])),
      courts: parseCourts(r[col("courts")]),
      price: parsePrice(r[col("price")]),
    }))
    .filter((v) => v.name);

  for (const v of venues) {
    if (!v.address) throw new Error(`${v.name}: missing address`);
    if (!v.area) throw new Error(`${v.name}: missing area`);
    if (v.sports.length === 0) throw new Error(`${v.name}: missing sports`);
  }

  console.log(`Parsed ${venues.length} venues:`);
  for (const v of venues) {
    console.log(`  [${v.city}] ${v.name} — ${v.sports.join(", ")}`);
  }

  const sql = neon(dbUrl);

  // owner
  let owner;
  const byEmail = await sql`select id, name from "user" where email = ${OWNER_EMAIL}`;
  if (byEmail.length > 0) {
    owner = byEmail[0];
  } else {
    const admins = await sql`select id, name from "user" where role = 'admin' order by created_at limit 1`;
    if (admins.length === 0) throw new Error(`No user with email ${OWNER_EMAIL} and no admin found`);
    owner = admins[0];
  }
  console.log(`\nOwner: ${owner.name} (${owner.id})`);

  // sports: add any that don't exist yet
  const existingSports = await sql`select id, name from sports`;
  const sportIdByName = new Map(existingSports.map((s) => [s.name.toLowerCase(), s.id]));
  const csvSports = dedupeCaseInsensitive(venues.flatMap((v) => v.sports));
  for (const sportName of csvSports) {
    if (!sportIdByName.has(sportName.toLowerCase())) {
      const inserted = await sql`insert into sports (name) values (${sportName}) returning id`;
      sportIdByName.set(sportName.toLowerCase(), inserted[0].id);
      console.log(`Added new sport: ${sportName}`);
    }
  }

  // fresh wipe (order matters: reports and time_slots reference venues/courts without cascade)
  if (FRESH) {
    await sql`update reports set reported_venue_id = null where reported_venue_id is not null`;
    await sql`delete from time_slots`;
    const gone = await sql`delete from venues returning id`;
    console.log(`\n--fresh: deleted ${gone.length} existing venue(s)`);
  } else {
    const existing = await sql`select count(*)::int as c from venues`;
    if (existing[0].c > 0) {
      throw new Error(
        `Database already has ${existing[0].c} venue(s). Re-run with --fresh to wipe them first ` +
          `(this destroys manual edits like photos and prices).`
      );
    }
  }

  // review authors: real accounts, never the owner
  const authors = await sql`
    select id, name from "user"
    where id <> ${owner.id} and name <> email
    order by created_at limit 6`;

  let reviewCount = 0;
  for (let i = 0; i < venues.length; i++) {
    const v = venues[i];

    const inserted = await sql`
      insert into venues (name, description, address, location, city, images, amenities,
                          owner_id, status, approved_by, approved_at)
      values (${v.name}, ${v.description}, ${v.address}, ${v.area}, ${v.city},
              '[]'::json, ${JSON.stringify(v.amenities)}::json,
              ${owner.id}, 'approved', ${owner.id}, now())
      returning id`;
    const venueId = inserted[0].id;

    for (const sportName of v.sports) {
      const sportId = sportIdByName.get(sportName.toLowerCase());
      await sql`insert into venue_sports (venue_id, sport_id) values (${venueId}, ${sportId})`;
    }

    const courtList =
      v.courts.length > 0
        ? v.courts.map((c) => ({ ...c, sport: v.sports[0] }))
        : v.sports.map((s) => ({ name: `${s} Court 1`, price: v.price ?? PLACEHOLDER_PRICE, sport: s }));
    for (const court of courtList) {
      const sportId = sportIdByName.get(court.sport.toLowerCase());
      if (!sportId) throw new Error(`${v.name}: no sport id for ${court.sport}`);
      await sql`
        insert into courts (venue_id, name, sport_id, price_per_hour,
                            operating_hours_start, operating_hours_end)
        values (${venueId}, ${court.name}, ${sportId}, ${court.price},
                ${v.hours.start}, ${v.hours.end})`;
    }

    const reviews = reviewsForVenue(i, authors);
    for (const r of reviews) {
      await sql`
        insert into reviews (user_id, venue_id, rating, comment, created_at, updated_at)
        values (${r.userId}, ${venueId}, ${r.rating}, ${r.comment}, ${r.createdAt}, ${r.createdAt})`;
      reviewCount++;
    }
  }

  // recompute rating + review_count from seeded reviews
  await sql`
    update venues v set rating = s.avg, review_count = s.cnt
    from (
      select venue_id, round(avg(rating), 2) as avg, count(*)::int as cnt
      from reviews group by venue_id
    ) s
    where s.venue_id = v.id`;

  // verification
  const byCity = await sql`select city, count(*)::int as c from venues group by city order by city`;
  const courts = await sql`select count(*)::int as c from courts`;
  console.log(`\nDone. Inserted ${venues.length} venues, ${courts[0].c} courts, ${reviewCount} reviews.`);
  console.log("Venues by city:", byCity.map((r) => `${r.city}=${r.c}`).join(", "));
  console.log(`\nReminder: all courts use the placeholder price Rs ${PLACEHOLDER_PRICE}/hr — edit them in the owner UI.`);
}

main().catch((e) => {
  console.error("SEED FAILED:", e.message);
  process.exit(1);
});
