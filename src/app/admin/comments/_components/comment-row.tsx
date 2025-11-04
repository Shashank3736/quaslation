"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { timeAgo, truncateText } from "@/lib/utils";
import { toggleCommentVisibilityAdmin } from "../actions";
import type { CommentRowProps } from "../types";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { DeleteDialog } from "./delete-dialog";

export function CommentRow({ comment }: CommentRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const { toast } = useToast();

  // Truncate comment content to 100 characters
  const truncatedContent = truncateText(comment.content, 100);

  // Format user display name
  const userDisplayName = comment.user.username || 
    (comment.user.firstName && comment.user.lastName 
      ? `${comment.user.firstName} ${comment.user.lastName}` 
      : comment.user.firstName || comment.user.lastName || "Unknown User");

  // Handle visibility toggle
  const handleToggleVisibility = async () => {
    setIsTogglingVisibility(true);
    try {
      const result = await toggleCommentVisibilityAdmin(comment.id);
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Success",
          description: result.isHidden ? "Comment hidden" : "Comment visible",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to toggle visibility",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };



  return (
    <>
      <TableRow>
        {/* Content */}
        <TableCell className="max-w-xs">
          <p className="text-sm">{truncatedContent}</p>
        </TableCell>

        {/* Author */}
        <TableCell>
          <div className="flex items-center gap-2">
            <Image
              src={comment.user.imageUrl}
              alt={userDisplayName}
              width={32}
              height={32}
              className="rounded-full border-2 border-black dark:border-white"
            />
            <span className="text-sm font-medium">{userDisplayName}</span>
          </div>
        </TableCell>

        {/* Novel */}
        <TableCell>
          <Link
            href={`/novels/${comment.novel.slug}`}
            className="text-sm font-medium hover:underline"
          >
            {comment.novel.title}
          </Link>
        </TableCell>

        {/* Date */}
        <TableCell>
          <div className="text-sm">
            <p>{timeAgo(comment.createdAt)}</p>
            {comment.isEdited && (
              <p className="text-xs text-muted-foreground">(edited)</p>
            )}
          </div>
        </TableCell>

        {/* Status */}
        <TableCell>
          {comment.isHidden ? (
            <Badge variant="orange">Hidden</Badge>
          ) : (
            <Badge variant="secondary">Visible</Badge>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVisibility}
              disabled={isTogglingVisibility}
            >
              {comment.isHidden ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Unhide
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        commentId={comment.id}
        commentContent={comment.content}
      />
    </>
  );
}
