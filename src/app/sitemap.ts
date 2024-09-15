import { MetadataRoute } from "next";

export default function sitemap():MetadataRoute.Sitemap {
  const base = "https://quaslation.xyz"
  
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1
    }, {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    }, {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    }, {
      url: `${base}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    }
  ]
}