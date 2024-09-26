"use client";

import { getLatestChapter } from '@/lib/db/query';
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
import { toast } from '@/components/ui/use-toast';
import { createChapter } from './actions';
import AutoResizeTextarea from '@/components/auto-resize-textarea';
import { markdownToHtml } from '@/lib/utils';

export const createChapterFormSchema = z.object({
  title: z.string(),
  serial: z.coerce.number(),
  number: z.coerce.number(),
  volume: z.coerce.number(),
  content: z.string()
})

export const CreateChapterForm = ({ previousChapter, novelId }:{ previousChapter: Awaited<ReturnType<typeof getLatestChapter>>, novelId: number }) => {
  const form = useForm<z.infer<typeof createChapterFormSchema>>({
    resolver: zodResolver(createChapterFormSchema),
    defaultValues: {
      serial: previousChapter ? previousChapter.serial+1:1,
      number: previousChapter ? previousChapter.number+1:1,
      volume: previousChapter?.volume
    }
  })
  
  const [submiting, setSubmiting] = useState(false);
  const [preview, setPreview] = useState("")

  const onSubmit = async (values: z.infer<typeof createChapterFormSchema>) => {
    setSubmiting(true);
    try {
      await createChapter(novelId, values)
      toast({
        description: "Completed."
      })
      form.setValue("content", "")
      form.setValue("number", values.number+1)
      form.setValue("title", "")
      form.setValue("serial", values.serial+1)
    } catch (error) {
      toast({
        description: "Something went wrong. Check if the volume or novel is already created or not."
      });
    }
    setSubmiting(false);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
        <FormField
          control={form.control}
          name="serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial</FormLabel>
              <FormControl>
                <Input placeholder='Chapter position' {...field} />
              </FormControl>
              <FormDescription>Must be unique for the novel and used in deciding navigation.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter</FormLabel>
              <FormControl>
                <Input placeholder='Write chapter number' {...field} />
              </FormControl>
              <FormDescription>Unique for volume.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume</FormLabel>
              <FormControl>
                <Input placeholder='Volume number' {...field} />
              </FormControl>
              <FormDescription>Volume number of the novel.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <Button type="submit" disabled={submiting}>Submit</Button>
      </form>
    </Form>
  )
}
