import type { APIRoute } from "astro";

const pages = import.meta.glob("./**/*.{md,mdx,astro}");

export const GET: APIRoute = ({ site }) => {
	const paths = Object.keys(pages)
		.map((file) => file.replace(/^\.\//, "/").replace(/\.(md|mdx|astro)$/, "").replace(/\/?index$/, ""))
		.map((path) => path || "/")
		.sort();

	const urls = paths
		.map((path) => `\t<url>\n\t\t<loc>${new URL(path, site)}</loc>\n\t</url>`)
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
