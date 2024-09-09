"use client"

import { getNovelFromId } from '@/lib/db/query'
import { notFound } from 'next/navigation'
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
import { createVolume } from './actions'

const createVolumeFormSchema = z.object({
  number: z.coerce.number(),
  title: z.string().optional(),
  novelId: z.number(),
})

const CreateVolumeForm = ({ novel }:{ novel: Awaited<ReturnType<typeof getNovelFromId>> }) => {
  if(!novel) notFound();
  const form = useForm<z.infer<typeof createVolumeFormSchema>>({
    resolver: zodResolver(createVolumeFormSchema),
    defaultValues: {
      novelId: novel.id
    }
  });

  const [submiting, setSubmiting] = useState(false);

  const onSubmit = async (values: z.infer<typeof createVolumeFormSchema>) => {
    setSubmiting(true);
    await createVolume({ novelId: values.novelId, number: values.number, title: values.title })
    toast({
      description: "Created new volume."
    })
    form.reset()
    setSubmiting(false)
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
                <Input required={false} placeholder='Write title of volume.' {...field} />
              </FormControl>
              <FormDescription>Volume title.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume</FormLabel>
              <FormControl>
                <Input placeholder='Volume number' {...field} />
              </FormControl>
              <FormDescription>Volume number.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField
          control={form.control}
          name="novelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Novel ID</FormLabel>
              <FormControl>
                <Input disabled placeholder='Novel ID' {...field} />
              </FormControl>
              <FormDescription>ID of novel.</FormDescription>
              <FormMessage />
            </FormItem>
          )} 
        />
        <Button type='submit' disabled={submiting}>Submit</Button>
      </form>
    </Form>
  )
}

export default CreateVolumeForm