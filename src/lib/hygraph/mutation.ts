"use server"

import { MAIN_HOST } from "../config";
import { hexToDecimal } from "../utils";

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
  slug: string;
  title: string;
  chapter: number;
  description: string;
  novel: {
    slug: string;
    title: string;
    thumbnail?: {
      url: string
    }
  }
  volume: {
    number: number
  }
  published: Date;
  premium: boolean;
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
      slug
      title
      chapter
      description
      novel {
        slug
        title
        thumbnail {
          url
        }
      }
      volume {
        number
      }
      published
      premium
    }
  }`
  try {
    const { publishChapter }:{ publishChapter: PublishChapter } = await runMutation(QUERY);
    const params = {
      embeds: [
        {
          title: `Chapter ${publishChapter.chapter}: ${publishChapter.title}`,
          thumbnail: publishChapter.novel.thumbnail?.url,
          url: `${MAIN_HOST}/novels/${publishChapter.novel.slug}/${publishChapter.slug}`,
          description: publishChapter.description,
          timestamp: publishChapter.published,
          fields: [
          {
            name: "Novel",
            value: `[${publishChapter.novel.title}](${MAIN_HOST}/novels/${publishChapter.novel.slug})`,
            inline: true,
          },
            {
              name: "Volume",
              value: publishChapter.volume.number,
              inline: true,
            }
          ],
          color: hexToDecimal("#008000")
        }
      ]
    }
    console.log(params, params.embeds[0].fields)
    fetch(process.env.DISCORD_WEBHOOK_URL || "", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.error('Error:', error));
  } catch (error) {
    throw new Error("Something went wrong!")
  }
}