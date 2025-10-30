"use client";

import { CommentItem } from "./comment-item";

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

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  isAdmin: boolean;
  novelSlug: string;
  chapterSlug: string;
  onUpdate: (action: "edit" | "delete" | "hide", commentId: number, updatedData?: Partial<Comment>) => void;
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
  novelSlug,
  chapterSlug,
  onUpdate,
}: CommentListProps) {
  // Empty state when no comments exist
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-sm sm:text-base">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          novelSlug={novelSlug}
          chapterSlug={chapterSlug}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
