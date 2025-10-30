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

  // Handle successful comment creation with optimistic update
  const handleCommentSuccess = () => {
    // Refresh comments by reloading the page data
    // The server action already revalidates the path, so we can just refresh
    window.location.reload();
  };

  // Handle comment updates (edit/delete/hide)
  const handleCommentUpdate = () => {
    // Refresh comments by reloading the page data
    // The server action already revalidates the path, so we can just refresh
    window.location.reload();
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
