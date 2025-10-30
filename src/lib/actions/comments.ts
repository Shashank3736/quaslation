"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { comment as commentTable, user as userTable } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Create a new comment with automatic user creation if needed
 */
export async function createComment(data: {
  content: string;
  novelId: number;
  chapterSlug: string;
  novelSlug: string;
}) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to post comments",
      };
    }

    // Validate content
    const trimmedContent = data.content.trim();
    if (!trimmedContent) {
      return {
        success: false,
        error: "Comment cannot be empty",
      };
    }

    if (trimmedContent.length > 2000) {
      return {
        success: false,
        error: "Comment cannot exceed 2000 characters",
      };
    }

    // Check if user record exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);

    // Create user record if it doesn't exist
    if (existingUser.length === 0) {
      try {
        await db.insert(userTable).values({
          clerkId: userId,
          role: "MEMBER",
        });
      } catch (error) {
        console.error("Failed to create user record:", error);
        return {
          success: false,
          error: "Failed to create user account. Please try again.",
        };
      }
    }

    // Create comment
    const newComment = await db
      .insert(commentTable)
      .values({
        content: trimmedContent,
        novelId: data.novelId,
        userId: userId,
        isHidden: false,
        isEdited: false,
      })
      .returning();

    // Revalidate the chapter page
    revalidatePath(`/novels/${data.novelSlug}/${data.chapterSlug}`);

    return {
      success: true,
      comment: newComment[0],
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export interface CommentWithUser {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
  isEdited: boolean;
  novelId: number;
  userId: string;
  user: {
    clerkId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
  };
}

/**
 * Get comments for a novel with user data joined and Clerk details batch fetched
 * Filters out hidden comments for non-admin users
 */
export async function getComments(novelId: number): Promise<CommentWithUser[]> {
  try {
    // Get current user to check if admin
    const { userId } = await auth();
    let isAdmin = false;

    if (userId) {
      const currentUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.clerkId, userId))
        .limit(1);

      isAdmin = currentUser.length > 0 && currentUser[0].role === "ADMIN";
    }

    // Fetch comments with user records joined in a single query
    const commentsWithUsers = await db
      .select({
        comment: commentTable,
        user: userTable,
      })
      .from(commentTable)
      .leftJoin(userTable, eq(commentTable.userId, userTable.clerkId))
      .where(
        isAdmin
          ? eq(commentTable.novelId, novelId)
          : and(
              eq(commentTable.novelId, novelId),
              eq(commentTable.isHidden, false)
            )
      )
      .orderBy(desc(commentTable.createdAt));

    // Extract unique Clerk user IDs
    const uniqueUserIds = [
      ...new Set(
        commentsWithUsers
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

    // Map Clerk user data to comments and return enriched objects
    const enrichedComments: CommentWithUser[] = commentsWithUsers.map((row) => {
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
      };
    });

    return enrichedComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

/**
 * Update a comment with ownership validation
 */
export async function updateComment(data: {
  commentId: number;
  content: string;
  novelSlug: string;
  chapterSlug: string;
}) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to edit comments",
      };
    }

    // Validate content
    const trimmedContent = data.content.trim();
    if (!trimmedContent) {
      return {
        success: false,
        error: "Comment cannot be empty",
      };
    }

    if (trimmedContent.length > 2000) {
      return {
        success: false,
        error: "Comment cannot exceed 2000 characters",
      };
    }

    // Get the comment to verify ownership
    const existingComment = await db
      .select()
      .from(commentTable)
      .where(eq(commentTable.id, data.commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Verify ownership
    if (existingComment[0].userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to edit this comment",
      };
    }

    // Update the comment
    await db
      .update(commentTable)
      .set({
        content: trimmedContent,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(commentTable.id, data.commentId));

    // Revalidate the chapter page
    revalidatePath(`/novels/${data.novelSlug}/${data.chapterSlug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Delete a comment with ownership validation
 */
export async function deleteComment(data: {
  commentId: number;
  novelSlug: string;
  chapterSlug: string;
}) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to delete comments",
      };
    }

    // Get the comment to verify ownership
    const existingComment = await db
      .select()
      .from(commentTable)
      .where(eq(commentTable.id, data.commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Verify ownership
    if (existingComment[0].userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to delete this comment",
      };
    }

    // Delete the comment
    await db
      .delete(commentTable)
      .where(eq(commentTable.id, data.commentId));

    // Revalidate the chapter page
    revalidatePath(`/novels/${data.novelSlug}/${data.chapterSlug}`);

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

/**
 * Toggle comment visibility (admin only)
 */
export async function toggleCommentVisibility(data: {
  commentId: number;
  novelSlug: string;
  chapterSlug: string;
}) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to moderate comments",
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
        error: "You don't have permission to moderate comments",
      };
    }

    // Get the comment
    const existingComment = await db
      .select()
      .from(commentTable)
      .where(eq(commentTable.id, data.commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Toggle the isHidden flag
    await db
      .update(commentTable)
      .set({
        isHidden: !existingComment[0].isHidden,
        updatedAt: new Date(),
      })
      .where(eq(commentTable.id, data.commentId));

    // Revalidate the chapter page
    revalidatePath(`/novels/${data.novelSlug}/${data.chapterSlug}`);

    return {
      success: true,
      isHidden: !existingComment[0].isHidden,
    };
  } catch (error) {
    console.error("Error toggling comment visibility:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
