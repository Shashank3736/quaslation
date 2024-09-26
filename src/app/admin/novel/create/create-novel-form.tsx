'use client'

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { createNovel } from './actions'
import { markdownToHtml } from '@/lib/utils'
import AutoResizeTextarea from '@/components/auto-resize-textarea'

export const createNovelSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  thumbnail: z.coerce.string().url().or(z.literal(""))
});

export default function CreateNovelForm() {
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof createNovelSchema>>({
    resolver: zodResolver(createNovelSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof createNovelSchema>) => {
    setSubmitting(true)
    const newNovelData = await createNovel(values)
    if (newNovelData.slug) {
      toast({
        description: `New novel with name: ${values.title} is created.`,
        action: <Link href={`/novels/${newNovelData.slug}`}>Check here!</Link>
      })
    } else {
      toast({
        description: `Something feels wrong with the novel.`
      })
    }
    form.reset()
    setSubmitting(false)
    setPreview('')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Cool new novel..." {...field} />
              </FormControl>
              <FormDescription>Title of novel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input required={false} placeholder="Url of novel thumbnail" {...field} />
              </FormControl>
              <FormDescription>Image of novel taken from supabase.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 space-x-2'>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <AutoResizeTextarea 
                    placeholder="Novel description." 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e)
                      markdownToHtml(e.target.value).then(data => setPreview(data))
                    }}
                  />
                </FormControl>
                <FormDescription>Write summary of novel in markdown.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="overflow-y-auto">
            <h3 className="font-semibold mb-2">Preview:</h3>
            <article 
              className="prose dark:prose-invert max-w-none p-4 rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit" disabled={submitting}>Submit</Button>
      </form>
    </Form>
  )
}