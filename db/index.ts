import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";
import { env } from "@/env";

// Append timezone option so PostgreSQL DATE() and AT TIME ZONE use IST
const connectionString = env.DATABASE_URL.includes("?")
  ? `${env.DATABASE_URL}&options=timezone%3DAsia%2FKolkata`
  : `${env.DATABASE_URL}?options=timezone%3DAsia%2FKolkata`;

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
