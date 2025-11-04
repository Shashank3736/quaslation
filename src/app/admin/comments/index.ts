/**
 * Admin comment management module exports
 * Centralizes all exports for cleaner imports
 */

// Type exports
export type {
  AdminComment,
  CommentUser,
  CommentNovel,
  ToggleVisibilityResult,
  DeleteCommentResult,
  CommentTableProps,
  CommentRowProps,
  DeleteDialogProps,
} from "./types";

// Server action exports
export {
  getAllCommentsAdmin,
  toggleCommentVisibilityAdmin,
  deleteCommentAdmin,
} from "./actions";

// Component exports
export { CommentTable } from "./_components/comment-table";
export { CommentRow } from "./_components/comment-row";
export { DeleteDialog } from "./_components/delete-dialog";
