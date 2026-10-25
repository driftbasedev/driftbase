import { company } from "@driftbase/brand";
import { posts } from "../blog/posts";
import { entries } from "../changelog/entries";
import { nav } from "../../../docs/src/nav";

export const dynamic = "force-static";

type Link = { title: string; url: string; note: string };

const web = company.webUrl;
const docs = company.docsUrl;

const product: Link[] = [
	{
		title: "Driftbase",
		url: `${web}/`,
		note: "Stream every committed Postgres change to search indexes and caches within a second, from logical replication.",
	},
	{
		title: "Changelog",
		url: `${web}/changelog`,
		note: "Release notes for the drift CLI and the hosted sync service.",
	},
];

const pricing: Link[] = [
	{
		title: "Pricing",
		url: `${web}/pricing`,
		note: "Free up to 1M change events a month, Team at $149/month for 25M events, and Scale for high-volume pipelines with an SLA.",
	},
];

const notes: Record<string, string> = {
	"/": "How pipelines, sources and sinks fit together.",
	"/getting-started": "Connect a Postgres database to a search index in about ten minutes.",
	"/install": "Install the drift CLI on macOS, Linux and Windows with Homebrew, npm, the install script or Docker.",
	"/configuration": "Every option in driftbase.toml: sources, sinks, pipelines, queries, deletes and environment variables.",
	"/limits": "How change events are counted and what happens when a workspace reaches its monthly limit.",
	"/guides/meilisearch": "Keep a Meilisearch index in sync with a Postgres table, including nested documents and deletes.",
	"/guides/redis-cache": "Delete or refresh Redis and Valkey keys the moment the underlying rows change.",
	"/guides/backfills": "Copy existing rows into a new or rebuilt index while live changes keep streaming.",
};

function docsLinks(labels: string[]): Link[] {
	return nav
		.filter((s) => labels.includes(s.label))
		.flatMap((s) => s.items)
		.map((item) => ({
			title: item.title,
			url: `${docs}${item.href}`,
			note: notes[item.href] ?? `${item.title} in the ${company.name} docs.`,
		}));
}

const reference = docsLinks(["Start here", "Reference"]);

const guides: Link[] = [
	...docsLinks(["Guides"]),
	...posts.map((p) => ({ title: p.title, url: `${web}/blog/${p.slug}`, note: p.summary })),
];

const companyPages: Link[] = [
	{ title: "About", url: `${web}/about`, note: "Who builds Driftbase and why." },
	{ title: "Contact", url: `${web}/contact`, note: "Sales, support, security reports and press." },
	{ title: "Blog", url: `${web}/blog`, note: "Engineering write-ups from the Driftbase team." },
];

function section(heading: string, links: Link[]) {
	return [`## ${heading}`, "", ...links.map((l) => `- [${l.title}](${l.url}): ${l.note}`)].join("\n");
}

export function GET() {
	const latest = entries[0];
	const body = [
		`# ${company.name}`,
		"",
		`> ${company.name} is change data capture for application teams. It reads the Postgres write-ahead log through logical replication and applies every committed insert, update and delete to search indexes and caches (Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey) in commit order, usually in under a second, with no triggers and no dual writes. Pipelines run either with the open-source drift CLI on your own infrastructure or hosted by ${company.name}.${latest ? ` The latest release is ${latest.version}, “${latest.title}”.` : ""}`,
		"",
		section("Product", product),
		"",
		section("Pricing", pricing),
		"",
		section("Docs", reference),
		"",
		section("Guides", guides),
		"",
		section("Company", companyPages),
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
