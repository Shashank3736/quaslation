/**
 * Type definitions for admin comment management feature
 * Centralizes all interfaces and types for strict type safety
 */

/**
 * User information associated with a comment
 * Combines database user data with Clerk user details
 */
export interface CommentUser {
  clerkId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

/**
 * Novel information associated with a comment
 * Minimal data needed for display and navigation
 */
export interface CommentNovel {
  id: number;
  slug: string;
  title: string;
}

/**
 * Admin comment interface with joined user and novel data
 * Used throughout the admin comment management interface
 */
export interface AdminComment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
  isEdited: boolean;
  novelId: number;
  userId: string;
  user: CommentUser;
  novel: CommentNovel;
}

/**
 * Result type for toggle visibility server action
 */
export interface ToggleVisibilityResult {
  success: boolean;
  isHidden?: boolean;
  error?: string;
}

/**
 * Result type for delete comment server action
 */
export interface DeleteCommentResult {
  success: boolean;
  error?: string;
}

/**
 * Props for CommentTable component
 */
export interface CommentTableProps {
  comments: AdminComment[];
}

/**
 * Props for CommentRow component
 */
export interface CommentRowProps {
  comment: AdminComment;
}

/**
 * Props for DeleteDialog component
 */
export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: number;
  commentContent: string;
}
