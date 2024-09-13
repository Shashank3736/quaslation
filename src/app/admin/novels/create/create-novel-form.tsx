"use client";

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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { createNovel } from './actions';
import Link from 'next/link';

export const createNovelSchema = z.object({
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().url().optional()
});

const CreateNovelForm = () => {
  const form = useForm<z.infer<typeof createNovelSchema>>({
    resolver: zodResolver(createNovelSchema)
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async(values: z.infer<typeof createNovelSchema>) => {
    setSubmitting(true);
    const newNovelData = await createNovel(values);
    toast({
      description: `New novel with name: ${values.title} is created.`,
      action: <Link href={`/novels/${newNovelData.slug}`}>Check here!</Link>
    })
    form.reset();
    setSubmitting(false);
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
                <Input placeholder='Cool new novel...' {...field} />
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
                <Input placeholder='Url of novel thumbnail' {...field} />
              </FormControl>
              <FormDescription>Image of novel taken from supabase.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Novel description.' {...field} />
              </FormControl>
              <FormDescription>Write summary of novel in markdown.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <Button type="submit" disabled={submitting}>Submit</Button>
      </form>
    </Form>
  )
}

export default CreateNovelForm