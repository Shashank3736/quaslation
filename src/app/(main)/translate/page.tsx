// import { TranslationTool } from "@/components/translation-tool"

import { TranslationTool } from "@/components/update-translation-tool";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Translation Tool</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <SignedIn>
          <TranslationTool />
        </SignedIn>
        <SignedOut>
          <p>You need to sign it to use this feature.</p>
        </SignedOut>
      </main>
    </div>
  )
}
