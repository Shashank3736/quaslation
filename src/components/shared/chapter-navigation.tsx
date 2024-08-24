"use client"

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react'

export const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      window.scrollTo(0, 0)
    }
  }, []);
  return null;
}

export const ChapterNavigation = ({ previousLink, nextLink }: { previousLink?: string, nextLink?: string }) => {
  const router = useRouter();
  const handleKeyPress = useCallback((event:KeyboardEvent) => {
    if(event.key == "ArrowLeft" && previousLink) {
      router.push(previousLink)
    } else if(event.key == "ArrowRight" && nextLink) {
      router.push(nextLink)
    }
  }, [previousLink, nextLink, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])
  return null
}
