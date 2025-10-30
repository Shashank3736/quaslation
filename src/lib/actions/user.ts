"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the current user's role
 * Returns null if not authenticated
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const currentUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return null;
    }

    return currentUser[0].role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
