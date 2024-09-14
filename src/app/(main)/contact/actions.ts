"use server";

import { createDiscordEmbed, DiscordEmbedOptions } from '@/lib/utils';
import { ContactFormInputs, ContactFormSchema } from './form';

async function sendDiscordEmbed(options: DiscordEmbedOptions) {
  const embed = createDiscordEmbed(options);
  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_SUPPORT_URL || "", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    });
    console.log(response);
    return await response.text()
  } catch (error) {
    throw new Error("Network Error")
  }
}

export async function submitContactForm(values: ContactFormInputs) {
  const res = await sendDiscordEmbed({
    title: `${values.name} (${values.email})`,
    description: values.message
  });

  return {
    message: 'Thank you for your message. We\'ll get back to you soon!',
  };
}