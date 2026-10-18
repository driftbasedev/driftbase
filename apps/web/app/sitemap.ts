import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";

const base = "https://driftbase.dev";

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = ["", "/pricing", "/about", "/contact", "/changelog", "/blog"].map((path) => ({
		url: `${base}${path}`,
		changeFrequency: "weekly" as const,
		priority: path === "" ? 1 : 0.7,
	}));
	const blog = posts.map((p) => ({
		url: `${base}/blog/${p.slug}`,
		lastModified: p.date,
		changeFrequency: "monthly" as const,
		priority: 0.5,
	}));
	return [...pages, ...blog];
}
