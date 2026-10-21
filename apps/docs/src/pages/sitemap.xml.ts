import type { APIRoute } from "astro";

const pages = Object.keys(import.meta.glob("./**/*.md"));

export const GET: APIRoute = ({ site }) => {
	const base = (site?.href ?? "https://docs.driftbase.dev/").replace(/\/$/, "");
	const urls = pages
		.map((file) => file.replace(/^\.\//, "/").replace(/\.md$/, "").replace(/(^|\/)index$/, ""))
		.map((path) => `${base}${path || "/"}`)
		.sort();
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `	<url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;
	return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
