"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes';
import DisqusComponent from './DisqusComponent';

const Comments = ({ id, title }:{ id: string, title: string }) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted || !theme) return null;
  return (
    <div>
      <DisqusComponent
        shortname='quaslation'
        identifier={id}
        title={title}
        url={window.location.href}
        theme={theme}
      />
    </div>
  )
}

export default Comments