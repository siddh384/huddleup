import { auth } from "@/auth";
import { headers } from "next/headers";

export const getSession = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    // Log the error for debugging but return null instead of throwing
    console.warn("Session validation failed in auth-utils:", error);
    return null;
  }
};

export const getUser = async () => {
  const session = await getSession();
  return session?.user;
};
