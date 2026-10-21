import type { APIRoute } from "astro";

const pages = import.meta.glob("./**/*.md");

export const GET: APIRoute = ({ site }) => {
	const urls = Object.keys(pages)
		.map((file) => file.replace(/^\.\//, "/").replace(/\.md$/, "").replace(/\/index$/, "") || "/")
		.sort()
		.map((path) => `\t<url><loc>${new URL(path, site)}</loc></url>`);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

	return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
