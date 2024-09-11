// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { getChapterSlug } from "./lib/_hygraph/query";
import { NextRequest } from "next/server";
// import { getNovelFirstChapter, getNovelLastChapter } from "./lib/db/query";
import { updateSession } from "./lib/supabase/middleware";

// const isProtectedRoute = createRouteMatcher([
//   "/admin(.*)"
// ])

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};