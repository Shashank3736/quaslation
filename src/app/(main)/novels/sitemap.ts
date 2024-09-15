import { getNovelList } from "@/lib/db/query";
import { MetadataRoute } from "next";

export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const base = "https://quaslation.xyz"
  
  const novels = await getNovelList();
  return novels.map(novel => (
    {
      url: `${base}/novels/${novel.slug}`,
      lastModified: new Date()
    }
  ));
}

export const revalidate = 24*60*60
