"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  updateComment,
  deleteComment,
  toggleCommentVisibility,
} from "@/lib/actions/comments";

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

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isAdmin: boolean;
  novelSlug: string;
  chapterSlug: string;
  onUpdate: (action: "edit" | "delete" | "hide", commentId: number, updatedData?: Partial<Comment>) => void;
}

interface ClerkUser {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

export function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  novelSlug,
  chapterSlug,
  onUpdate,
}: CommentItemProps) {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentUser, setCommentUser] = useState<ClerkUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const isOwner = currentUserId === comment.userId;

  // Fetch user info from Clerk
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch(`/api/users/${comment.userId}`);
        if (response.ok) {
          const userData = await response.json();
          setCommentUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setIsLoadingUser(false);
      }
    }

    fetchUserInfo();
  }, [comment.userId]);

  const handleEditSubmit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editContent.trim().length > 2000) {
      toast({
        title: "Error",
        description: "Comment cannot exceed 2000 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await updateComment({
      commentId: comment.id,
      content: editContent,
      novelSlug,
      chapterSlug,
    });

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      setIsEditing(false);
      onUpdate("edit", comment.id, { content: editContent, isEdited: true, updatedAt: new Date() });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteComment({
      commentId: comment.id,
      novelSlug,
      chapterSlug,
    });

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      setShowDeleteDialog(false);
      onUpdate("delete", comment.id);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    setIsLoading(true);
    const result = await toggleCommentVisibility({
      commentId: comment.id,
      novelSlug,
      chapterSlug,
    });

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: result.isHidden
          ? "Comment hidden successfully"
          : "Comment unhidden successfully",
      });
      onUpdate("hide", comment.id, { isHidden: result.isHidden, updatedAt: new Date() });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to toggle comment visibility",
        variant: "destructive",
      });
    }
  };

  const getUserDisplayName = () => {
    if (!commentUser) return "Loading...";
    return (
      commentUser.username ||
      `${commentUser.firstName || ""} ${commentUser.lastName || ""}`.trim() ||
      "Anonymous"
    );
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-3 sm:gap-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {isLoadingUser ? (
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            ) : (
              <img
                src={commentUser?.imageUrl || "/default-avatar.png"}
                alt={getUserDisplayName()}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info and Timestamp */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-sm">
                {getUserDisplayName()}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {comment.isEdited && (
                <Badge variant="secondary" className="text-xs">
                  Edited
                </Badge>
              )}
              {comment.isHidden && isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>

            {/* Comment Content or Edit Form */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={2000}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {editContent.length} / 2000
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEditSubmit}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </p>

                {/* Action Buttons */}
                {(isOwner || isAdmin) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {isOwner && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          disabled={isLoading}
                          className="hover:bg-accent transition-colors"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={isLoading}
                          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleToggleVisibility}
                        disabled={isLoading}
                        className="hover:bg-accent transition-colors"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : comment.isHidden ? (
                          <Eye className="h-4 w-4 mr-1" />
                        ) : (
                          <EyeOff className="h-4 w-4 mr-1" />
                        )}
                        {comment.isHidden ? "Unhide" : "Hide"}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
