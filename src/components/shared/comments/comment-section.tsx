"use client";

import { useState } from "react";
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
}

interface CommentSectionProps {
  novelId: number;
  novelSlug: string;
  chapterSlug: string;
  initialComments: Comment[];
  isAdmin: boolean;
}

export function CommentSection({
  novelId,
  novelSlug,
  chapterSlug,
  initialComments,
  isAdmin,
}: CommentSectionProps) {
  const { user, isLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Handle successful comment creation by adding to state
  const handleCommentSuccess = (newComment: Comment) => {
    // Add the new comment to the top of the list
    setComments((prev) => [newComment, ...prev]);
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
        </CardContent>
      </Card>
    </section>
  );
}
