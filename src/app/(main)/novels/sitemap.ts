import { getNovelList } from "@/lib/db/query";
import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

const getCached = unstable_cache(getNovelList, ["sitemapNovels"], {
  tags: ["novel:create"],
  revalidate: 24*3600
});

export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const base = "https://quaslation.com"
  
  const novels = await getCached();
  return novels.map(novel => (
    {
      url: `${base}/novels/${novel.slug}`,
      lastModified: new Date()
    }
  ));
}

export const revalidate = 86400;
