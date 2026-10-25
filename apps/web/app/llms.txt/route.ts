import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { company } from "@driftbase/brand";
import sitemap from "../sitemap";

export const dynamic = "force-static";

type Kind = "Product" | "Pricing" | "Docs" | "Guides" | "Blog" | "Company";
type Link = { kind: Kind; title: string; url: string; summary?: string };

const sections: Kind[] = ["Product", "Pricing", "Docs", "Guides", "Blog", "Company"];

function siteKind(pathname: string): Kind {
	if (pathname.startsWith("/pricing")) return "Pricing";
	if (pathname.startsWith("/blog")) return "Blog";
	if (/^\/(about|contact|company)(\/|$)/.test(pathname)) return "Company";
	return "Product";
}

function docsKind(pathname: string): Kind {
	return pathname.startsWith("/guides/") ? "Guides" : "Docs";
}

function titleOf(title: Metadata["title"]): string | undefined {
	if (!title) return undefined;
	if (typeof title === "string") return title;
	if ("absolute" in title && title.absolute) return title.absolute;
	if ("default" in title) return title.default;
	return undefined;
}

async function sitePages(): Promise<Link[]> {
	return Promise.all(
		sitemap().map(async ({ url }) => {
			const pathname = new URL(url).pathname;
			const dir = pathname === "/" ? "" : `${pathname.slice(1)}/`;
			const { metadata } = (await import(`../${dir}page`)) as { metadata?: Metadata };
			return {
				kind: siteKind(pathname),
				title: titleOf(metadata?.title) ?? company.name,
				url,
				summary: metadata?.description ?? undefined,
			};
		}),
	);
}

function frontmatter(source: string): Record<string, string> {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const fields: Record<string, string> = {};
	for (const line of match?.[1].split(/\r?\n/) ?? []) {
		const field = line.match(/^(\w+):\s*(.*)$/);
		if (field) fields[field[1]] = field[2].replace(/^(["'])(.*)\1$/, "$2");
	}
	return fields;
}

function docsPages(): Link[] {
	const root = path.join(process.cwd(), "../docs/src/pages");
	if (!fs.existsSync(root)) return [];

	const files = (fs.readdirSync(root, { recursive: true }) as string[])
		.filter((file) => /\.mdx?$/.test(file))
		.map((file) => file.split(path.sep).join("/"));

	return files
		.map((file) => {
			const pathname = `/${file.replace(/\.mdx?$/, "").replace(/(^|\/)index$/, "")}`;
			const { title, description } = frontmatter(fs.readFileSync(path.join(root, file), "utf8"));
			return {
				kind: docsKind(pathname),
				title: title ?? pathname,
				url: pathname === "/" ? company.docsUrl : `${company.docsUrl}${pathname}`,
				summary: description,
			};
		})
		.sort((a, b) => (a.url === company.docsUrl ? -1 : b.url === company.docsUrl ? 1 : a.url.localeCompare(b.url)));
}

export async function GET() {
	const links = [...(await sitePages()), ...docsPages()];

	const body = [
		`# ${company.name}`,
		"",
		`> ${company.name} keeps search indexes and caches in sync with Postgres. It reads committed changes from Postgres logical replication and applies every insert, update and delete, in commit order and usually in under a second, to Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey, with no triggers and no dual writes. Teams run the drift CLI on their own infrastructure or use the hosted sync service. ${company.legalName} is based in Portland, Oregon.`,
		...sections.flatMap((kind) => {
			const lines = links
				.filter((l) => l.kind === kind)
				.map((l) => `- [${l.title}](${l.url})${l.summary ? `: ${l.summary}` : ""}`);
			return lines.length ? ["", `## ${kind}`, "", ...lines] : [];
		}),
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
