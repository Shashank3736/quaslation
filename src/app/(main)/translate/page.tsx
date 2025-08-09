import { TranslationTool } from "@/components/update-translation-tool";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background bg-pattern">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient-indigo-violet">Translation Tool</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <SignedIn>
          <TranslationTool />
        </SignedIn>
        <SignedOut>
          <div className="text-center py-16">
            <Card className="glass max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-gradient-indigo-violet">Sign In Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You need to sign in to access the translation tool. Join our community of translators and help bring amazing stories to readers worldwide!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SignedOut>
      </main>
    </div>
  )
}
