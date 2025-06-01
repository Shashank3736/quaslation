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

export const formSchema = z.object({
  title: z.string(),
  content: z.string().min(1, {
    message: "Bro you need it fill it na."
  }),
  serial: z.coerce.number(),
  number: z.coerce.number(),
  volume: z.coerce.number(),
});

export const EditChapterForm = ({ data }:{ data: Awaited<ReturnType<typeof getChapter>>}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data.title,
      content: data.richText.content,
      serial: data.serial,
      number: data.number,
      volume: data.volume,
    }
  });

  const [preview, setPreview] = useState("");
  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmiting(true);
    try {
      await updateChapterContent(data.richText.id, values, data.slug);
      toast({
      description: "Chapter updated successfully!"
      });
    } catch (error) {
      toast({
      description: "Failed to update chapter.",
      variant: "destructive"
      });
    }
    setSubmiting(false);
  };

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
                      field.onChange(e);
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
              className="prose dark:prose-invert max-w-none p-2 text-sm rounded-md border"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
        <Button type="submit" disabled={submiting}>Submit</Button>
      </form>
    </Form>
  );
};
