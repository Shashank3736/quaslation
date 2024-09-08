"use client";

import React from 'react'
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if(data.richText.content !== values.content) {
      await updateChapterContent(data.richText.id, values.content);
      toast({
        description: "Chapter updated successfully!"
      })
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
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea placeholder='Content of chapter' {...field} />
              </FormControl>
              <FormDescription>Content of chapter</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
