"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deleteCommentAdmin } from "../actions";
import type { DeleteDialogProps } from "../types";

export function DeleteDialog({
  open,
  onOpenChange,
  commentId,
  commentContent,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Truncate comment content for preview (max 150 characters)
  const truncatedContent =
    commentContent.length > 150
      ? commentContent.substring(0, 150) + "..."
      : commentContent;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCommentAdmin(commentId);

      if (result.success) {
        toast({
          variant: "success",
          title: "Success",
          description: "Comment deleted successfully",
        });
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete comment",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this comment? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 p-4 border-2 border-black dark:border-white rounded-md bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-foreground">{truncatedContent}</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
