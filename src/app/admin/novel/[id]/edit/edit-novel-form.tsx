'use client'

import React, { useEffect, useState } from 'react'
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
import { markdownToHtml } from '@/lib/utils'
import AutoResizeTextarea from '@/components/auto-resize-textarea'
import { Novel } from './server'
import { updateNovel } from './actions'

export const editNovelSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  thumbnail: z.coerce.string().url().or(z.literal("")),
});

export default function EditNovelForm({ data }:{ data: Novel }) {
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof editNovelSchema>>({
    resolver: zodResolver(editNovelSchema),
    defaultValues: {
      title: data.title,
      description: data.richText.markdown,
      thumbnail: data.thumbnail || "",
    }
  })
  
  const onSubmit = async (values: z.infer<typeof editNovelSchema>) => {
    if(values.title == data.title && values.description == data.richText.markdown && (values.thumbnail == "" ? data.thumbnail === null : data.thumbnail == values.thumbnail)) {
      toast({
        description: "First fill something you dumbass.",
      });
      return
    }
    setSubmitting(true)
    const newNovelData = await updateNovel(values, data);
    if (newNovelData.message === "ok") {
      toast({
        description: `Updated novel with name: ${values.title}`,
        action: <Link href={`/novels/${data.slug}`}>Check here!</Link>
      })
    } else {
      toast({
        description: `Something feels wrong with the novel.`
      })
    }
    setSubmitting(false)
  }

  useEffect(() => {
    markdownToHtml(data.richText.markdown)
    .then(html => setPreview(html));
  },[data.richText.markdown]);

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
              className="prose dark:prose-invert max-w-none p-2 prose-sm rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit" disabled={submitting}>Submit</Button>
      </form>
    </Form>
  )
}