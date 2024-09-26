'use client'

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Textarea } from "@/components/ui/textarea"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        const newHeight = textarea.scrollHeight
        textarea.style.height = `${newHeight}px`
      }
    }

    useEffect(() => {
      adjustHeight()
    }, [props.value])

    return (
      <div className="w-full">
        <Textarea
          ref={textareaRef}
          onInput={adjustHeight}
          className={`w-full min-h-[100px] resize-none overflow-hidden p-2 ${className}`}
          style={{
            lineHeight: '1.5',
            transition: 'height 0.1s ease-out'
          }}

          {...props}
        />
      </div>
    )
  }
)

AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export default AutoResizeTextarea