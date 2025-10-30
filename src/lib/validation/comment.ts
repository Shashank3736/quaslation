import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
  novelId: z.number().int().positive(),
  chapterSlug: z.string().min(1),
});

export const updateCommentSchema = z.object({
  commentId: z.number().int().positive(),
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
