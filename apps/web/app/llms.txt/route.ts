import { company } from "@driftbase/brand";
import sitemap from "../sitemap";
import { posts } from "../blog/posts";
import { nav as docsNav } from "../../../docs/src/nav";

export const dynamic = "force-static";

type Kind = "product" | "pricing" | "company" | "blog";

const pages: Record<string, { kind: Kind; title: string; summary: string }> = {
	"/": {
		kind: "product",
		title: "Driftbase",
		summary:
			"What Driftbase does: streams committed Postgres changes to search indexes and caches from logical replication.",
	},
	"/changelog": {
		kind: "product",
		title: "Changelog",
		summary: "Release notes for the drift CLI and Driftbase Cloud, newest first.",
	},
	"/pricing": {
		kind: "pricing",
		title: "Pricing",
		summary: "Free up to 1M change events a month, Team at $149/month for 25M events, and Scale for high-volume pipelines with an SLA.",
	},
	"/about": {
		kind: "company",
		title: "Company",
		summary: "Who builds Driftbase, why, and what the team believes about derived data.",
	},
	"/contact": {
		kind: "company",
		title: "Contact",
		summary: "Reach Driftbase for sales, support, security reports or press.",
	},
	"/blog": {
		kind: "blog",
		title: "Blog",
		summary: "Engineering notes on Postgres logical replication, change data capture and search indexing.",
	},
};

for (const p of posts) {
	pages[`/blog/${p.slug}`] = { kind: "blog", title: p.title, summary: p.summary };
}

const docItems = (guides: boolean) =>
	docsNav
		.filter((section) => (section.label === "Guides") === guides)
		.flatMap((section) => section.items);

const sections: { heading: string; kind: Kind }[] = [
	{ heading: "Product", kind: "product" },
	{ heading: "Pricing", kind: "pricing" },
	{ heading: "Company", kind: "company" },
	{ heading: "Blog", kind: "blog" },
];

export function GET() {
	const entries = sitemap().flatMap((entry) => {
		const path = entry.url.slice(company.webUrl.length) || "/";
		const page = pages[path];
		return page ? [{ ...page, url: entry.url }] : [];
	});

	const link = (title: string, url: string, summary: string) => `- [${title}](${url}): ${summary}`;

	const lines = [
		`# ${company.name}`,
		"",
		`> ${company.name} keeps search indexes and caches in sync with Postgres. It reads committed inserts, updates and deletes from logical replication and applies them, in commit order, to Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey, usually in under a second, with no triggers or dual writes. It runs as the Apache-2.0 drift CLI on your own infrastructure or as the hosted Driftbase Cloud, using the same binary.`,
		"",
	];

	const pushSection = (heading: string, items: string[]) => {
		if (items.length === 0) return;
		lines.push(`## ${heading}`, "", ...items, "");
	};

	for (const { heading, kind } of sections.slice(0, 2)) {
		pushSection(heading, entries.filter((e) => e.kind === kind).map((e) => link(e.title, e.url, e.summary)));
	}
	const docLink = (item: (typeof docsNav)[number]["items"][number]) =>
		link(item.title, `${company.docsUrl}${item.href === "/" ? "" : item.href}`, item.summary);
	pushSection("Docs", docItems(false).map(docLink));
	pushSection("Guides", docItems(true).map(docLink));
	for (const { heading, kind } of sections.slice(2)) {
		pushSection(heading, entries.filter((e) => e.kind === kind).map((e) => link(e.title, e.url, e.summary)));
	}

	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
