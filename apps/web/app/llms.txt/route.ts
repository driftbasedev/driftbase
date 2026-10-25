import { readFileSync } from "node:fs";
import path from "node:path";
import { company } from "@driftbase/brand";
import { nav } from "../../../docs/src/nav";
import { posts } from "../blog/posts";

export const dynamic = "force-static";

type Item = { title: string; url: string; note: string };

const base = company.webUrl;
const docs = company.docsUrl;

const docsPages = path.join(process.cwd(), "../docs/src/pages");

function docDescription(href: string) {
	const file = path.join(docsPages, href === "/" ? "index.md" : `${href}.md`);
	const frontmatter = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	return frontmatter.match(/^description:\s*(.+)$/m)?.[1].trim() ?? "";
}

function docsItems(include: (label: string) => boolean): Item[] {
	return nav
		.filter((section) => include(section.label))
		.flatMap((section) => section.items)
		.map((item) => ({ title: item.title, url: `${docs}${item.href}`, note: docDescription(item.href) }));
}

const sections: { heading: string; items: Item[] }[] = [
	{
		heading: "Product",
		items: [
			{
				title: "Driftbase",
				url: `${base}/`,
				note: "Stream every committed Postgres change to search indexes and caches, in commit order, usually in under a second.",
			},
			{
				title: "Changelog",
				url: `${base}/changelog`,
				note: "What shipped in each Driftbase release.",
			},
			{
				title: "Company",
				url: `${base}/about`,
				note: "Who builds Driftbase and what the team believes about derived data.",
			},
			{
				title: "Contact",
				url: `${base}/contact`,
				note: "Reach the team about sales, support, security reports or press.",
			},
		],
	},
	{
		heading: "Pricing",
		items: [
			{
				title: "Pricing",
				url: `${base}/pricing`,
				note: "Free up to 1M change events a month, Team at $149/month for 25M events, and Scale for high-volume pipelines with an SLA.",
			},
		],
	},
	{
		heading: "Docs",
		items: docsItems((label) => label !== "Guides"),
	},
	{
		heading: "Guides",
		items: [
			...docsItems((label) => label === "Guides"),
			...posts.map((p) => ({ title: p.title, url: `${base}/blog/${p.slug}`, note: p.summary })),
		],
	},
];

export function GET() {
	const body = [
		`# ${company.name}`,
		"",
		"> Driftbase is change data capture for application teams. It reads the Postgres write-ahead log through logical replication and applies every committed insert, update and delete to Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey, in commit order, usually in under a second, with no triggers or dual writes. Teams run the Apache-2.0 drift CLI on their own infrastructure or let Driftbase host the pipeline.",
		"",
		...sections.flatMap((s) => [
			`## ${s.heading}`,
			"",
			...s.items.map((i) => `- [${i.title}](${i.url}): ${i.note}`),
			"",
		]),
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
