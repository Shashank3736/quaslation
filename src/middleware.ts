import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getChapterSlug } from "./lib/hygraph/query";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  if(!auth().userId && isProtectedRoute(req)) return auth().redirectToSignIn();
  if((auth().userId !== process.env.ADMIN_USER_ID) && isProtectedRoute(req)) return NextResponse.redirect(new URL("/", req.url))
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