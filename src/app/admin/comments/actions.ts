"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  comment as commentTable,
  user as userTable,
  novel as novelTable,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type {
  AdminComment,
  ToggleVisibilityResult,
  DeleteCommentResult,
} from "./types";

/**
 * Get all comments for admin with joined user and novel data
 * No filtering - shows all comments including hidden ones
 * 
 * @returns Promise<AdminComment[]> Array of all comments with user and novel data
 * @throws Returns empty array on error or unauthorized access
 * 
 * @example
 * const comments = await getAllCommentsAdmin();
 */
export async function getAllCommentsAdmin(): Promise<AdminComment[]> {
  try {
    // Verify admin authentication
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized: No user ID");
      return [];
    }

    // Check if user is admin
    const currentUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);

    if (currentUser.length === 0 || currentUser[0].role !== "ADMIN") {
      console.error("Unauthorized: User is not admin");
      return [];
    }

    // Fetch all comments with user and novel data joined
    const commentsWithData = await db
      .select({
        comment: commentTable,
        user: userTable,
        novel: {
          id: novelTable.id,
          slug: novelTable.slug,
          title: novelTable.title,
        },
      })
      .from(commentTable)
      .leftJoin(userTable, eq(commentTable.userId, userTable.clerkId))
      .leftJoin(novelTable, eq(commentTable.novelId, novelTable.id))
      .orderBy(desc(commentTable.createdAt));

    // Extract unique Clerk user IDs
    const uniqueUserIds = [
      ...new Set(
        commentsWithData
          .map((c) => c.user?.clerkId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    // Batch fetch Clerk user details
    let clerkUsersMap = new Map<string, any>();
    if (uniqueUserIds.length > 0) {
      try {
        const client = await clerkClient();
        const clerkUsers = await client.users.getUserList({
          userId: uniqueUserIds,
        });

        clerkUsers.data.forEach((user) => {
          clerkUsersMap.set(user.id, user);
        });
      } catch (error) {
        console.error("Error fetching Clerk user details:", error);
      }
    }

    // Map Clerk user data and novel data to comments
    const enrichedComments: AdminComment[] = commentsWithData.map((row) => {
      const clerkUser = clerkUsersMap.get(row.comment.userId);

      return {
        ...row.comment,
        user: {
          clerkId: row.comment.userId,
          username: clerkUser?.username || null,
          firstName: clerkUser?.firstName || null,
          lastName: clerkUser?.lastName || null,
          imageUrl: clerkUser?.imageUrl || "/default-avatar.png",
        },
        novel: row.novel || {
          id: 0,
          slug: "deleted-novel",
          title: "Deleted Novel",
        },
      };
    });

    return enrichedComments;
  } catch (error) {
    console.error("Error fetching admin comments:", error);
    return [];
  }
}

/**
 * Toggle comment visibility (admin only)
 * Flips the isHidden flag on a comment
 * 
 * @param commentId - The ID of the comment to toggle
 * @returns Promise<ToggleVisibilityResult> Result object with success status and new hidden state
 * 
 * @example
 * const result = await toggleCommentVisibilityAdmin(123);
 * if (result.success) {
 *   console.log(`Comment is now ${result.isHidden ? 'hidden' : 'visible'}`);
 * }
 */
export async function toggleCommentVisibilityAdmin(
  commentId: number
): Promise<ToggleVisibilityResult> {
  try {
    // Verify admin authentication
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      };
    }

    // Check if user is admin
    const currentUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);

    if (currentUser.length === 0 || currentUser[0].role !== "ADMIN") {
      return {
        success: false,
        error: "Admin access required",
      };
    }

    // Get the comment
    const existingComment = await db
      .select()
      .from(commentTable)
      .where(eq(commentTable.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Toggle the isHidden flag
    const newHiddenState = !existingComment[0].isHidden;
    await db
      .update(commentTable)
      .set({
        isHidden: newHiddenState,
        updatedAt: new Date(),
      })
      .where(eq(commentTable.id, commentId));

    // Revalidate the admin comments page
    revalidatePath("/admin/comments");

    return {
      success: true,
      isHidden: newHiddenState,
    };
  } catch (error) {
    console.error("Error toggling comment visibility:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Delete a comment permanently (admin only)
 * Removes the comment from the database
 * 
 * @param commentId - The ID of the comment to delete
 * @returns Promise<DeleteCommentResult> Result object with success status
 * 
 * @example
 * const result = await deleteCommentAdmin(123);
 * if (result.success) {
 *   console.log('Comment deleted successfully');
 * }
 */
export async function deleteCommentAdmin(
  commentId: number
): Promise<DeleteCommentResult> {
  try {
    // Verify admin authentication
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      };
    }

    // Check if user is admin
    const currentUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);

    if (currentUser.length === 0 || currentUser[0].role !== "ADMIN") {
      return {
        success: false,
        error: "Admin access required",
      };
    }

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(commentTable)
      .where(eq(commentTable.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Delete the comment
    await db.delete(commentTable).where(eq(commentTable.id, commentId));

    // Revalidate the admin comments page
    revalidatePath("/admin/comments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
