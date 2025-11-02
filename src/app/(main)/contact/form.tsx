'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitContactForm } from "./actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters long" }),
});

export type ContactFormInputs = z.infer<typeof ContactFormSchema>;

export default function ContactForm() {
  const [submiting, setSubmiting] = useState(false);
  const form = useForm<ContactFormInputs>({
    resolver: zodResolver(ContactFormSchema)
  });

  const onSubmit = async (values: ContactFormInputs) => {
    setSubmiting(true);
    const { message } = await submitContactForm(values);
    toast({
        description: message
    })
    setSubmiting(false)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-foreground">Name</FormLabel>
              <FormControl>
                <Input placeholder='Your name' className="glass border border-primary/15 bg-background/70 backdrop-blur-md" {...field} />
              </FormControl>
              <FormDescription className="text-muted-foreground">Write your name here</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-foreground">Email</FormLabel>
              <FormControl>
                <Input placeholder='example@xyz.com' className="glass border border-primary/15 bg-background/70 backdrop-blur-md" {...field} />
              </FormControl>
              <FormDescription className="text-muted-foreground">Write your email here</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-foreground">Message</FormLabel>
              <FormControl>
                <Textarea placeholder='Your message' className="glass border border-primary/15 bg-background/70 backdrop-blur-md min-h-[120px]" {...field} />
              </FormControl>
              <FormDescription className="text-muted-foreground">Write your message here</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={submiting} className="hover:opacity-90 transition-opacity w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}