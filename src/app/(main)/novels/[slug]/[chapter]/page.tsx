import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug, getChapterSlugMany } from '@/lib/db/query';
import { shortifyString } from '@/lib/utils';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { getComments } from '@/lib/actions/comments';
import { db } from '@/lib/db';
import { user as userTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CommentSection } from '@/components/shared/comments/comment-section';

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  return await getChapterSlugMany();
}


export async function generateMetadata({ params }:{ params: Promise<{ chapter: string }>}): Promise<Metadata> {
  const paramsResolved = await params;
  const getCacheData = unstable_cache(getChapterBySlug, [], {
    tags: [`chapter:update:content:${paramsResolved.chapter}`],
    revalidate: 7*24*3600
  });
  const chapter = await getCacheData(paramsResolved.chapter);
  return {
    title: `${chapter.volumeNumber < 0 ? "":`Vol. ${chapter.volumeNumber} `}Chapter ${chapter.number} - ${chapter.novelTitle}`,
    description: chapter.title+"\n"+shortifyString(chapter.textContent, 400)
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string, chapter: string }>}) {
  const paramsResolved = await params;
  const getCacheData = unstable_cache(getChapterBySlug, [], {
    tags: [`chapter:update:${paramsResolved.chapter}`],
    revalidate: 24*3600
  });
  const chapter = await getCacheData(paramsResolved.chapter);
  
  // Fetch comments for this novel
  const comments = await getComments(chapter.novelId);
  
  // Get current user info and check if admin
  const { userId } = await auth();
  let isAdmin = false;
  
  if (userId) {
    const currentUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.clerkId, userId))
      .limit(1);
    
    isAdmin = currentUser.length > 0 && currentUser[0].role === 'ADMIN';
  }
  
  return (
    <ChapterPage 
      chapter={chapter} 
      novelSlug={paramsResolved.slug}
      commentSection={
        <CommentSection
          novelId={chapter.novelId}
          novelSlug={paramsResolved.slug}
          chapterSlug={paramsResolved.chapter}
          initialComments={comments}
          isAdmin={isAdmin}
        />
      }
    />
  )
}