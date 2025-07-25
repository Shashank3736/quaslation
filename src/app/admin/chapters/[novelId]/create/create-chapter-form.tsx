"use client";

import { getLatestChapter } from '@/lib/db/query';
import React, { useState, useEffect } from 'react'
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
import { translateHtmlContent, type TranslationActionResult } from './translate-actions';
import AutoResizeTextarea from '@/components/auto-resize-textarea';
import { markdownToHtml } from '@/lib/utils';
import { useActionState } from 'react';

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
  const [preview, setPreview] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

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
      setPreview("");
    } catch (error) {
      console.error(error);
      toast({
        description: `${error}` || "Something went wrong.",
        variant: "destructive"
      });
    }
    setSubmiting(false);
  }

  const handleTranslate = async () => {
    if (!htmlContent.trim()) return;
    
    setIsTranslating(true);
    try {
      const formData = new FormData();
      formData.append('html', htmlContent);
      formData.append('targetLanguage', 'en');
      
      const result = await translateHtmlContent(
        { success: false }, // prevState
        formData
      );
      
      if (result.success) {
        // Autopopulate fields from metadata
        if (result.metadata?.title) {
          form.setValue('title', result.metadata.title);
        }
        if (result.metadata?.number != null) {
          form.setValue('number', result.metadata.number);
        }
        
        // Populate markdown editor
        if (result.translatedContent) {
          form.setValue('content', result.translatedContent);
        }
        
        toast({
          description: "Translation completed successfully!",
        });
      } else if (result.error) {
        toast({
          description: typeof result.error === 'string'
            ? result.error
            : "Translation failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        description: "Translation failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
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
              className="prose dark:prose-invert max-w-none p-4 rounded-md border text-sm"
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
        {/* Import HTML section */}
        <div className="space-y-4 mt-6 pt-6 border-t">
          <h3 className="font-semibold text-lg">Import HTML</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="htmlInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Source HTML
              </label>
              <textarea
                id="htmlInput"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Paste HTML content here..."
              />
            </div>
            
            <Button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !htmlContent.trim()}
              className="w-full sm:w-auto"
            >
              {isTranslating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating...
                </span>
              ) : "Translate"}
            </Button>
          </div>
        </div>
        
        <Button type="submit" disabled={submiting}>Submit</Button>
      </form>
    </Form>
  )
}
