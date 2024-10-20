import { MAIN_HOST } from "@/lib/config";
import { db } from "@/lib/db";
import { sendDiscordEmbed, shortifyString } from "@/lib/utils";
import "server-only";

export const postChapterDiscord = async (slug: string) => {
  const chapter = await db.query.chapter.findFirst({
    where: (chapter, { eq }) => eq(chapter.slug, slug),
    columns: {
      title: true,
      number: true,
      slug: true,
    },
    with: {
      richText: {
        columns: {
          text: true,
        }
      },
      volume: {
        columns: {
          number: true,
        }
      },
      novel: {
        columns: {
          title: true,
          thumbnail: true,
          slug: true,
        }
      }
    }
  });

  if(!chapter) return { status: 404 }

  await sendDiscordEmbed({
    title: `${chapter?.volume.number > -1 ? `Volume ${chapter.volume.number} `:""} Chapter ${chapter.number} ${chapter.title}`,
    url: `${MAIN_HOST}/novels/${chapter.novel.slug}/${chapter.slug}`,
    description: shortifyString(chapter.richText.text, 256),
    thumbnail: chapter.novel.thumbnail || undefined,
    author: {
      name: chapter.novel.title,
      url: `${MAIN_HOST}/novels/${chapter.novel.slug}`
    },
    color: "blue",
  });
}