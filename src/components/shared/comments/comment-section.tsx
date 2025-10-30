"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import { SignInPrompt } from "./sign-in-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Comment {
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

interface CommentSectionProps {
  novelId: number;
  novelSlug: string;
  chapterSlug: string;
}

export function CommentSection({
  novelId,
  novelSlug,
  chapterSlug,
}: CommentSectionProps) {
  const { user, isLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments and admin status on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/comments?novelId=${novelId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [novelId]);

  // Handle successful comment creation by adding to state
  const handleCommentSuccess = async (newComment: any) => {
    // For newly created comments, we need to add user data
    // The user data will be the current logged-in user
    if (user) {
      const enrichedComment: Comment = {
        ...newComment,
        user: {
          clerkId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      };
      // Add the new comment to the top of the list
      setComments((prev) => [enrichedComment, ...prev]);
    }
  };

  // Handle comment updates (edit/delete/hide) by updating state
  const handleCommentUpdate = (
    action: "edit" | "delete" | "hide",
    commentId: number,
    updatedData?: Partial<Comment>
  ) => {
    setComments((prev) => {
      if (action === "delete") {
        // Remove the comment from the list
        return prev.filter((c) => c.id !== commentId);
      } else {
        // Update the comment in the list
        return prev.map((c) =>
          c.id === commentId ? { ...c, ...updatedData } : c
        );
      }
    });
  };

  return (
    <section className="mt-8 sm:mt-12">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
          ) : (
            <>
              {/* Show comment form only for authenticated users */}
              {isLoaded && user ? (
                <CommentForm
                  novelId={novelId}
                  novelSlug={novelSlug}
                  chapterSlug={chapterSlug}
                  onSuccess={handleCommentSuccess}
                />
              ) : (
                <SignInPrompt />
              )}

              {/* Divider between form and comments */}
              {comments.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
                  </h3>
                  {/* Comment list */}
                  <CommentList
                    comments={comments}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    novelSlug={novelSlug}
                    chapterSlug={chapterSlug}
                    onUpdate={handleCommentUpdate}
                  />
                </div>
              )}

              {/* Show comment list without divider when no comments */}
              {comments.length === 0 && (
                <CommentList
                  comments={comments}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  novelSlug={novelSlug}
                  chapterSlug={chapterSlug}
                  onUpdate={handleCommentUpdate}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
