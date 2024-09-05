"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PremiumChapters } from './novel-list';
import { freeChapter } from './actions';

export const FreeNovelChapterDialog = ({ novel }:{ novel: PremiumChapters[number] }) => {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const chapters = useMemo(() => novel.Chapter, [novel]);
  const chapter = useMemo(() => chapters.at(index), [chapters, index]);

  if(chapters.length === 0) return (
    <Button variant={"secondary"} disabled>Free</Button>
  )
  else if (chapter == undefined) {
    return <Button disabled>Limit Reached</Button>
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={loading}>{`Free v${chapter.volume.number}c${chapter.number}`}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{chapter.title}</DialogTitle>
        <DialogDescription>
          <p>
          This chapter will be available for free to every user. Action cannot be undone.
          </p>
          <p>Title: {chapter.title}</p>
          <p>Volume: {chapter.volume.number}</p>
          <p>Chapter: {chapter.number}</p>
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
              setIndex(i => i+1)
              setLoading(false)
              toast({
                title: "New Free Chapter",
                description: `Novel: ${release.novel.title}\n
                Vol. ${release.volume.number} Chapter ${release.number}: ${chapter.title}`
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