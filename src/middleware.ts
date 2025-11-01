import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCachedUserRole } from "./lib/auth/role-cache";
import { chapterIdRedirect } from "./lib/config";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/translate"
])

// Convert chapterIdRedirect object to Map for O(1) lookup performance
const chapterRedirectMap = new Map(Object.entries(chapterIdRedirect));

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  
  // Early return for legacy chapter redirects (before auth checks)
  if (url.pathname.startsWith("/chapter/")) {
    const chapterId = url.pathname.split("/")[2];
    const chapterSlugs = chapterRedirectMap.get(chapterId);
    
    if (chapterSlugs) {
      return NextResponse.redirect(new URL(`/novels/${chapterSlugs.novel}/${chapterSlugs.chapter}`, req.url));
    }
  }
  
  // Early return for public routes - skip all auth processing
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }
  
  // Protected route handling with cached role lookup
  const userId = (await auth()).userId;
  
  if (userId === null) {
    // User not authenticated - redirect to sign in
    return (await auth()).redirectToSignIn();
  }
  
  try {
    const user = await (await clerkClient()).users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Use cached role lookup instead of direct database query
    const role = await getCachedUserRole(userEmail);
    
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (error) {
    // Only log actual errors, not redirect signals
    if (error instanceof Error && !error.message.includes('NEXT_REDIRECT')) {
      console.error("Middleware error:", error);
    }
    // On error, redirect to home page for safety
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};