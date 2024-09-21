"use client"

import React, { useEffect, useState } from 'react'
import { DiscussionEmbed } from 'disqus-react';
import { useTheme } from 'next-themes';

const Comments = ({ id, title }:{ id: string, title: string }) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return null;
  return (
    <DiscussionEmbed
      shortname='quaslation'
      key={theme}
      config={
        {
          url: window.location.href,
          identifier: id,
          title,
        }
      }
    />
  )
}

export default Comments