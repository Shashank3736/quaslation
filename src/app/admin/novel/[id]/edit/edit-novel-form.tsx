'use client'

import { useState } from 'react'
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
import { TagPicker, TagOption } from '../../_components/tag-picker'

export const editNovelSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  thumbnail: z.coerce.string().url().or(z.literal("")),
  author: z.string().max(120).optional().default(""),
  language: z.string().max(60).optional().default(""),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS"]).optional().default("ONGOING"),
  tagIds: z.array(z.number().int().positive()).optional().default([]),
});

export default function EditNovelForm({ data, html, initialTags }:{ data: Novel, html: string, initialTags: TagOption[] }) {
  const [preview, setPreview] = useState(html);
  const [submitting, setSubmitting] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    data.novelTags.map((entry) => entry.tag.id)
  )

  const form = useForm<z.infer<typeof editNovelSchema>>({
    resolver: zodResolver(editNovelSchema),
    defaultValues: {
      title: data.title,
      description: data.richText.markdown,
      thumbnail: data.thumbnail || "",
      author: data.author ?? "",
      language: data.language ?? "",
      status: data.status ?? "ONGOING",
      tagIds: [],
    }
  })

  const onSubmit = async (values: z.infer<typeof editNovelSchema>) => {
    const newTagIds = [...selectedTagIds].sort((a, b) => a - b);
    const oldTagIds = data.novelTags.map((entry) => entry.tag.id).sort((a, b) => a - b);
    const tagsChanged =
      newTagIds.length !== oldTagIds.length ||
      newTagIds.some((id, index) => id !== oldTagIds[index]);

    if(
      values.title == data.title &&
      values.description == data.richText.markdown &&
      (values.thumbnail == "" ? data.thumbnail === null : data.thumbnail == values.thumbnail) &&
      (values.author ?? "") == (data.author ?? "") &&
      (values.language ?? "") == (data.language ?? "") &&
      values.status == (data.status ?? "ONGOING") &&
      !tagsChanged
    ) {
      toast({
        description: "First fill something you dumbass.",
      });
      return
    }
    setSubmitting(true)
    const newNovelData = await updateNovel({ ...values, tagIds: selectedTagIds }, data);
    if (newNovelData.message === "ok") {
      toast({
        description: `Updated novel with name: ${values.title}`,
        action: <Link href={`/novels/${data.slug}`}>Check here!</Link>,
        variant: "success"
      })
    } else {
      toast({
        description: `Something feels wrong with the novel.`,
        variant: "destructive"
      })
    }
    setSubmitting(false)
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
            initialSelected={data.novelTags.map((entry) => entry.tag.id)}
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
              className="prose dark:prose-invert max-w-none p-2 prose-sm rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>Submit</Button>
      </form>
    </Form>
  )
}