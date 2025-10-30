import Link from "next/link";

export function SignInPrompt() {
  return (
    <div className="text-center py-4 px-6 bg-muted rounded-lg">
      <p className="text-muted-foreground">
        Please{" "}
        <Link
          href="/auth/sign-in"
          className="text-primary hover:underline font-medium"
        >
          sign in
        </Link>{" "}
        to post a comment
      </p>
    </div>
  );
}
