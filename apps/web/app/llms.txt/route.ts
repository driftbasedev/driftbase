import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { company } from "@driftbase/brand";
import sitemap from "../sitemap";
import { posts } from "../blog/posts";

export const dynamic = "force-static";

type Kind = "Product" | "Pricing" | "Docs" | "Guides" | "Company";

const pages: Record<string, { kind: Kind; title: string; note: string }> = {
	"/": {
		kind: "Product",
		title: "Driftbase",
		note: "Streams every committed Postgres change to search indexes and caches from logical replication, with no triggers or dual writes.",
	},
	"/changelog": {
		kind: "Product",
		title: "Changelog",
		note: "What’s new in Driftbase, release by release.",
	},
	"/pricing": {
		kind: "Pricing",
		title: "Pricing",
		note: "Free, Team and Scale plans, metered by change events per month.",
	},
	"/blog": {
		kind: "Guides",
		title: "Blog",
		note: "Engineering notes on Postgres logical replication, change data capture, search indexing and caches.",
	},
	"/about": {
		kind: "Company",
		title: "About",
		note: "Who builds Driftbase and why.",
	},
	"/contact": {
		kind: "Company",
		title: "Contact",
		note: "Reach Driftbase for sales, support, security reports or press.",
	},
};

const docsRoot = path.join(process.cwd(), "../docs/src");

function frontmatter(source: string) {
	const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
	const field = (key: string) =>
		block
			.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]
			.trim()
			.replace(/^["']|["']$/g, "");
	return { title: field("title"), description: field("description") };
}

function markdownFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return markdownFiles(full);
		return /\.mdx?$/.test(entry.name) ? [full] : [];
	});
}

// Docs pages come from the docs app's Markdown pages, ordered and grouped by its sidebar (src/nav.ts).
function docsPages() {
	const sidebar: { href: string; section: string }[] = [];
	let section = "";
	for (const line of readFileSync(path.join(docsRoot, "nav.ts"), "utf8").split("\n")) {
		const label = line.match(/label:\s*"([^"]+)"/);
		if (label) section = label[1];
		const href = line.match(/href:\s*"([^"]+)"/);
		if (href) sidebar.push({ href: href[1], section });
	}
	const pagesDir = path.join(docsRoot, "pages");
	return markdownFiles(pagesDir)
		.map((file) => {
			const route = `/${path.relative(pagesDir, file).split(path.sep).join("/")}`
				.replace(/\.mdx?$/, "")
				.replace(/\/index$/, "") || "/";
			const { title, description } = frontmatter(readFileSync(file, "utf8"));
			const order = sidebar.findIndex((item) => item.href === route);
			const group = order >= 0 ? sidebar[order].section : route.startsWith("/guides/") ? "Guides" : "";
			const kind: Kind = group === "Guides" ? "Guides" : "Docs";
			return { kind, route, title: title ?? route, note: description ?? "", order: order >= 0 ? order : Infinity };
		})
		.sort((a, b) => a.order - b.order || a.route.localeCompare(b.route));
}

const sections: Kind[] = ["Product", "Pricing", "Docs", "Guides", "Company"];

export function GET() {
	const links: Record<Kind, string[]> = { Product: [], Pricing: [], Docs: [], Guides: [], Company: [] };

	for (const entry of sitemap()) {
		const pathname = new URL(entry.url).pathname.replace(/\/$/, "") || "/";
		const page = pages[pathname];
		if (page) {
			links[page.kind].push(`- [${page.title}](${entry.url}): ${page.note}`);
			continue;
		}
		const post = posts.find((p) => `/blog/${p.slug}` === pathname);
		if (post) links.Guides.push(`- [${post.title}](${entry.url}): ${post.summary}`);
	}
	for (const doc of docsPages()) {
		const url = doc.route === "/" ? company.docsUrl : `${company.docsUrl}${doc.route}`;
		links[doc.kind].push(`- [${doc.title}](${url})${doc.note ? `: ${doc.note}` : ""}`);
	}

	const body = [
		`# ${company.name}`,
		"",
		`> ${company.name} keeps search indexes and caches in sync with Postgres. It reads committed changes from the write-ahead log through logical replication and applies every insert, update and delete, in commit order, to Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey, usually in under a second. Run it yourself with the open-source drift CLI or let Driftbase Cloud run the pipeline for you.`,
		"",
		...sections.flatMap((kind) => (links[kind].length ? [`## ${kind}`, "", ...links[kind], ""] : [])),
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
