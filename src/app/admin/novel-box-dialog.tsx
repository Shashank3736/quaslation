"use client"

import { getPremiumChaptersByNovel, NovelIndex, PremiumChaptersByNovel } from '@/lib/hygraph/query';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { freeChapter } from '@/lib/hygraph/mutation';
import { delay } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export const FreeNovelChapterDialog = ({ novel }:{ novel: NovelIndex }) => {
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState<PremiumChaptersByNovel|null|undefined>()

  if(chapter === null) return (
    <Button variant={"secondary"} disabled>Free</Button>
  ) 
  else if (chapter == undefined) return (
    <Button onClick={() => {
      setLoading(true)
      getPremiumChaptersByNovel({ novelSlug: novel.slug })
      .then((data) => setChapter(data[0] || null))
      .finally(() => setLoading(false))
    }}
    disabled={loading}>{loading ? "Checking...":"Check"}</Button>
  )
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={loading}>{`Free v${chapter.volume.number}c${chapter.chapter}`}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{chapter.title}</DialogTitle>
        <DialogDescription>
          <p>
          This chapter will be available for free to every user. Action cannot be undone.
          </p>
          <p>Title: {chapter.title}</p>
          <p>Volume: {chapter.volume.number}</p>
          <p>Chapter: {chapter.chapter}</p>
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button 
            className='ml-2'
            variant={"destructive"}
            onClick={async () => {
              setLoading(true)
              const release = await freeChapter(chapter.slug)
              await delay(500)
              const data = await getPremiumChaptersByNovel({ novelSlug: novel.slug })
              setChapter(data[0] || null)
              setLoading(false)
              toast({
                title: "New Free Chapter",
                description: `Novel: ${release.novel.title}\n
                Vol. ${release.volume.number} Chapter ${release.chapter}: ${chapter.title}`
              })
            }}
            >
              Submit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}