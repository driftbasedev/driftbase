import type { APIRoute } from "astro";

const pages = Object.keys(import.meta.glob("./**/*.{md,mdx,astro}"));

export const GET: APIRoute = ({ site }) => {
	const urls = pages
		.map((file) => file.replace(/^\.\//, "/").replace(/\.(md|mdx|astro)$/, "").replace(/\/index$/, "") || "/")
		.sort()
		.map((path) => `\t<url><loc>${new URL(path, site)}</loc></url>`);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
