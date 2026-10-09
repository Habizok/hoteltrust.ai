import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Impressum und Datenschutz bleiben bewusst draußen (noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
