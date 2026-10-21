import type { APIRoute } from "astro";

// Every Markdown page under src/pages, so new docs are listed automatically.
const pages = Object.keys(import.meta.glob("./**/*.md"));

export const GET: APIRoute = ({ site }) => {
	const urls = pages
		.map((file) => file.replace(/^\.\//, "/").replace(/\.md$/, "").replace(/\/index$/, "") || "/")
		.sort()
		.map((path) => `\t<url>\n\t\t<loc>${new URL(path, site)}</loc>\n\t</url>`)
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
