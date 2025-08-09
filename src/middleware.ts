import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRole } from "./lib/db/query";
import { chapterIdRedirect } from "./lib/config";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/translate"
])

export default clerkMiddleware(async (auth, req) => {
  if(isProtectedRoute(req)) {
    const userId = auth().userId;
    if(userId !== null) {
      const user = await clerkClient.users.getUser(userId);
      const data = await getUserRole(user.emailAddresses[0] ? user.emailAddresses[0].emailAddress : '');
      if(data !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
    } else {
      auth().redirectToSignIn();
    }
  }
  
  const url = new URL(req.url)
  if(url.pathname.startsWith("/chapter/")) {
    const chapterSlugs = chapterIdRedirect[url.pathname.split("/")[2]];
    return NextResponse.redirect(new URL(`/novels/${chapterSlugs.novel}/${chapterSlugs.chapter}`, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};