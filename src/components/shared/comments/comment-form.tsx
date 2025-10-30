"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createComment } from "@/lib/actions/comments";
import { commentSchema } from "@/lib/validation/comment";
import { Loader2 } from "lucide-react";

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

interface CommentFormProps {
  novelId: number;
  novelSlug: string;
  chapterSlug: string;
  onSuccess?: (newComment: Comment) => void;
}

export function CommentForm({
  novelId,
  novelSlug,
  chapterSlug,
  onSuccess,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const characterCount = content.length;
  const maxCharacters = 2000;
  const isNearLimit = characterCount >= 1900;
  const isOverLimit = characterCount > maxCharacters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation using Zod schema
    const validation = commentSchema.safeParse({
      content,
      novelId,
      chapterSlug,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setError(firstError.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createComment({
        content,
        novelId,
        novelSlug,
        chapterSlug,
      });

      if (result.success && result.comment) {
        // Clear form on success
        setContent("");
        setError(null);

        // Show success toast
        toast({
          title: "Comment posted",
          description: "Your comment has been successfully posted.",
        });

        // Call success callback with the new comment
        onSuccess?.(result.comment);
      } else {
        setError(result.error || "Failed to post comment");
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to post comment",
        });
      }
    } catch (err) {
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this chapter..."
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
          aria-label="Comment content"
          aria-describedby={error ? "comment-error" : "character-count"}
        />

        <div className="flex items-center justify-between text-sm">
          <div>
            {error && (
              <p id="comment-error" className="text-destructive">
                {error}
              </p>
            )}
          </div>
          <p
            id="character-count"
            className={`${
              isOverLimit
                ? "text-destructive font-semibold"
                : isNearLimit
                  ? "text-yellow-600 dark:text-yellow-500"
                  : "text-muted-foreground"
            }`}
          >
            {characterCount} / {maxCharacters}
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isOverLimit || content.trim().length === 0}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Comment"
        )}
      </Button>
    </form>
  );
}
