import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getChapterSlug } from "./lib/hygraph/query";
import { NextResponse } from "next/server";
import { getNovelFirstChapter, getNovelLastChapter } from "./lib/db/query";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  if(!auth().userId && isProtectedRoute(req)) return auth().redirectToSignIn();
  if((auth().userId !== process.env.ADMIN_USER_ID) && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/not-found", req.url))
  }
  const url = new URL(req.url)
  if(url.pathname.startsWith("/chapter")) {
    const chapterSlugs = await getChapterSlug(url.pathname.split("/")[2]);
    return NextResponse.redirect(new URL(`/novels/${chapterSlugs.novel.slug}/${chapterSlugs.slug}`, req.url));
  }
  if(url.pathname.startsWith("/_series")) {
    const [_1, _2, novelId, pos] = url.pathname.split("/");
    console.log(novelId)
    let chapter = {
      slug:"",
      novel:""
    }
    if(pos === "0") {
      chapter = await getNovelFirstChapter(parseInt(novelId));
    } else {
      chapter = await getNovelLastChapter(parseInt(novelId));
    }

    return NextResponse.redirect(new URL(`/novels/${chapter.novel}/${chapter.slug}`, req.url));
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