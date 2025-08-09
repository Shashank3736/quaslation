"use server"

import { Client } from "@gradio/client"

export async function translateText(text: string):Promise<string> {
  const client = await Client.connect(process.env.GRADIO_API_URL!);
  const result = await client.predict("/translate_text", { 		
      text, 		
      source_lang: "Auto Detect", 		
      target_lang: "English", 
  });

  if(!result?.data || (result.data as string[]).length === 0) {
    throw new Error("Translation Failed.")
  }

  return (result.data as string[]).map(str => str.trim()).join("")
}
