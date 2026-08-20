"use server";

import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/actions/users";
import { type City, isValidCity } from "@/lib/cities";
import { revalidatePath } from "next/cache";

export async function getUserCity(): Promise<City | null> {
  const result = await getCurrentUser();
  if (!result.success || !result.user?.profile?.city) return null;
  if (isValidCity(result.user.profile.city)) return result.user.profile.city;
  return null;
}

export async function updateUserCity(
  city: City,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidCity(city)) {
    return { success: false, error: "Invalid city" };
  }

  const result = await getCurrentUser();
  if (!result.success || !result.user) {
    return { success: false, error: "Not authenticated" };
  }

  if (result.user.profile) {
    await db
      .update(userProfiles)
      .set({ city, updatedAt: new Date() })
      .where(eq(userProfiles.userId, result.user.id));
  } else {
    await db.insert(userProfiles).values({
      userId: result.user.id,
      city,
    });
  }

  revalidatePath("/");
  revalidatePath("/venues");
  revalidatePath("/profile");

  return { success: true };
}
