import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getChapterSlug } from "./lib/actions";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  if(!auth().userId && isProtectedRoute(req)) return auth().redirectToSignIn();
  const url = new URL(req.url)
  if(url.pathname.startsWith("/chapter")) {
    const chapterSlugs = await getChapterSlug(url.pathname.split("/")[2]);
    return NextResponse.redirect(new URL(`/novels/${chapterSlugs.novel.slug}/${chapterSlugs.slug}`, req.url));
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