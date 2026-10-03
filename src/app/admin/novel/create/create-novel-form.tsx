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
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { createNovel } from './actions'
import { markdownToHtml } from '@/lib/utils'
import AutoResizeTextarea from '@/components/auto-resize-textarea'
import { TagPicker, TagOption } from '../_components/tag-picker'

export const createNovelSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  thumbnail: z.coerce.string().url().or(z.literal("")),
  author: z.string().max(120).optional().default(""),
  language: z.string().max(60).optional().default(""),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS"]).optional().default("ONGOING"),
  tagIds: z.array(z.number().int().positive()).optional().default([]),
});

export default function CreateNovelForm({ initialTags }: { initialTags: TagOption[] }) {
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof createNovelSchema>>({
    resolver: zodResolver(createNovelSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
      author: '',
      language: '',
      status: 'ONGOING',
      tagIds: [],
    }
  })

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  const onSubmit = async (values: z.infer<typeof createNovelSchema>) => {
    setSubmitting(true)
    const newNovelData = await createNovel({ ...values, tagIds: selectedTagIds })
    if (newNovelData.slug) {
      toast({
        description: `New novel with name: ${values.title} is created.`,
        action: <Link href={`/novels/${newNovelData.slug}`}>Check here!</Link>,
        variant: "success"
      })
    } else {
      toast({
        description: `Something feels wrong with the novel.`,
        variant: "destructive"
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
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Translator</FormLabel>
                <FormControl>
                  <Input placeholder="Translator or author name" {...field} />
                </FormControl>
                <FormDescription>Indexed for search; shown under hit titles.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Chinese" {...field} />
                </FormControl>
                <FormDescription>Filterable on the search page.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border-brutal-mobile md:border-brutal border-black dark:border-white bg-background px-3 py-2 text-sm"
                  {...field}
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="HIATUS">Hiatus</option>
                </select>
              </FormControl>
              <FormDescription>Serialization status, shown on search hits.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Tags</FormLabel>
          <TagPicker
            allTags={initialTags}
            initialSelected={selectedTagIds}
            onChange={setSelectedTagIds}
          />
          <FormDescription>Search filters and ranking weight D.</FormDescription>
        </div>
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
              className="prose dark:prose-invert max-w-none p-2 text-sm rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>Submit</Button>
      </form>
    </Form>
  )
}