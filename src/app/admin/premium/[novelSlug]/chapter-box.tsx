"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { freeChapter } from '@/lib/hygraph/mutation'
import { PremiumChaptersByNovel } from '@/lib/hygraph/query'
import React, { useState } from 'react'

export const ChapterBox = ({ chapter, novelSlug }:{ chapter: PremiumChaptersByNovel, novelSlug: string }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className='flex items-center m-4'>
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={loading}>Free</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This chapter will be available for free to every user. Action cannot be undone.
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
              onClick={() => {
                setLoading(true)
                freeChapter(chapter.slug).then(() => setLoading(false))
              }}
              >
                Submit
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className='ml-2'>
      {`v${chapter.volume.number}c${chapter.chapter} ${chapter.title}`}
      </p>
    </div>
  )
}
