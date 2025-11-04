import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import H1 from "@/components/typography/h1";
import { Separator } from "@/components/ui/separator";
import { getAllCommentsAdmin } from "./actions";
import { CommentTable } from "./_components/comment-table";

export default async function AdminCommentsPage() {
  // Admin authentication check
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Fetch all comments using server action
  const comments = await getAllCommentsAdmin();

  // If no comments returned, user is not admin (getAllCommentsAdmin handles auth)
  if (comments.length === 0 && userId) {
    // Check if it's truly empty or unauthorized by attempting to fetch
    // The action already handles auth, so empty array could mean no comments or not admin
    // For now, we'll show the empty state
  }

  return (
    <div className="m-8">
      <H1 className="text-gradient-indigo-violet">Comment Management</H1>
      <Separator className="my-4" />

      {comments.length === 0 ? (
        <div className="glass border border-white/15 p-8 rounded-lg text-center">
          <p className="text-muted-foreground">No comments found.</p>
        </div>
      ) : (
        <CommentTable comments={comments} />
      )}
    </div>
  );
}
