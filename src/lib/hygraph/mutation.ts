"use server"

import { revalidatePath } from "next/cache";

async function runMutation(QUERY: string) {
  try {
    const response = await fetch(process.env.HYGRAPH_MAIN_URL || "", {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'gcms-stage': 'PUBLISHED',
        "Authorization": `Bearer ${process.env.HYGRAPH_TOKEN}`
      },
      body: JSON.stringify({
        query: QUERY
      })
    });

    if(!response.ok) {
        console.log(await response.json())
        throw new Error("Seems like something is wrong with the slug or maybe you are not permitted.")
    }
    const { data } = await response.json()
    return data
  } catch (error) {
    throw new Error("Server closed.")
  }
}

export type PublishChapter = {
  id: string;
  published: Date;
  premium: boolean;
  novel: {
    slug: string;
  }
}

export async function freeChapter(slug: string) {
  const QUERY=`mutation MyMutation {
    updateChapter(
      data: {published: "${new Date().toISOString()}", premium: false}
      where: {slug: "${slug}"}
    ) {
      id
    }
    publishChapter(where: {slug: "${slug}"}) {
      id
      novel {
        slug
      }
      published
      premium
    }
  }`
  try {
    const { publishChapter }:{ publishChapter: PublishChapter } = await runMutation(QUERY);
    revalidatePath(`/admin/premium/${publishChapter.novel.slug}/`)
  } catch (error) {
    throw new Error("Something went wrong!")
  }
}