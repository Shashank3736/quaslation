"use client";

import React, { useState } from 'react'
import { getChapter, updateChapterContent } from './actions';
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
import { toast } from '@/components/ui/use-toast';
import AutoResizeTextarea from '@/components/auto-resize-textarea';
import { markdownToHtml } from '@/lib/utils';

const formSchema = z.object({
  title: z.string(),
  content: z.string().min(1, {
    message: "Bro you need it fill it na."
  }),
});

export const EditChapterForm = ({ data }:{ data: Awaited<ReturnType<typeof getChapter>>}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data.title,
      content: data.richText.content,
    }
  })

  const [preview, setPreview] = useState("")
  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if(data.richText.content !== values.content) {
      setSubmiting(true)
      await updateChapterContent(data.richText.id, values.content, data.slug);
      toast({
        description: "Chapter updated successfully!"
      })
      setSubmiting(false)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 m-4'>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Title of Chapter' {...field} />
              </FormControl>
              <FormDescription>This is the title of chapter.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <div className="grid grid-cols-2 space-x-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <AutoResizeTextarea 
                    placeholder='Write markdown here...' 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e)
                      markdownToHtml(e.target.value)
                      .then(data => setPreview(data));
                    }}
                  />
                </FormControl>
                <FormDescription>Write markdown.</FormDescription>
                <FormMessage />
              </FormItem>
            )} 
          />
          <div className="overflow-y-auto">
            <h3 className="font-semibold mb-2">Preview</h3>
            <article 
              className="prose dark:prose-invert max-w-none p-4 rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
