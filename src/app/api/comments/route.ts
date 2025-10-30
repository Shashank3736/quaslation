import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { comment as commentTable, user as userTable } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const novelId = searchParams.get("novelId");

    if (!novelId) {
      return NextResponse.json(
        { error: "novelId is required" },
        { status: 400 }
      );
    }

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
          ? eq(commentTable.novelId, parseInt(novelId))
          : and(
              eq(commentTable.novelId, parseInt(novelId)),
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
    const enrichedComments = commentsWithUsers.map((row) => {
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

    return NextResponse.json({
      comments: enrichedComments,
      isAdmin,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
