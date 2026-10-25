import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { company } from "@driftbase/brand";
import sitemap from "../sitemap";
import { entries } from "../changelog/entries";
import { metadata as homeMetadata } from "../page";

export const dynamic = "force-static";

type Kind = "Product" | "Pricing" | "Docs" | "Guides";
type Link = { kind: Kind; title: string; url: string; line: string };

const kinds: Kind[] = ["Product", "Pricing", "Docs", "Guides"];

// Pages whose metadata has no description of their own.
const fallbackLines: Record<string, string> = {
	"/changelog": `Release notes; latest is ${entries[0].version}, ${entries[0].title}.`,
};

function webKind(pathname: string): Kind {
	if (pathname === "/pricing") return "Pricing";
	if (pathname === "/blog" || pathname.startsWith("/blog/")) return "Guides";
	return "Product";
}

function titleOf(metadata: Metadata): string | undefined {
	const t = metadata.title;
	if (!t) return undefined;
	if (typeof t === "string") return t;
	if ("absolute" in t && t.absolute) return t.absolute;
	if ("default" in t) return t.default;
	return undefined;
}

function nameFromPath(pathname: string) {
	const last = pathname.split("/").filter(Boolean).pop() ?? "";
	return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

async function webPages(): Promise<Link[]> {
	const seen = new Set<string>();
	const links: Link[] = [];
	for (const entry of sitemap()) {
		const pathname = new URL(entry.url).pathname.replace(/\/$/, "");
		const metadata: Metadata =
			pathname === "" ? homeMetadata : (await import(`../${pathname.slice(1)}/page`)).metadata ?? {};
		let title = pathname === "" ? "Home" : titleOf(metadata) ?? nameFromPath(pathname);
		if (seen.has(title)) title = nameFromPath(pathname);
		seen.add(title);
		const line = metadata.description ?? fallbackLines[pathname] ?? title;
		links.push({ kind: webKind(pathname), title, url: entry.url, line });
	}
	return links;
}

function frontmatter(source: string) {
	const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	const fields: Record<string, string> = {};
	for (const row of block.split("\n")) {
		const m = row.match(/^(\w+):\s*(.*)$/);
		if (m) fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
	}
	return fields;
}

function docsPages(): Link[] {
	const root = path.join(process.cwd(), "../docs/src/pages");
	if (!fs.existsSync(root)) return [];
	const files = (fs.readdirSync(root, { recursive: true }) as string[])
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.split(path.sep).join("/"));
	return files
		.map((file) => {
			const slug = file.replace(/\.md$/, "").replace(/(^|\/)index$/, "");
			const fm = frontmatter(fs.readFileSync(path.join(root, file), "utf8"));
			return {
				kind: (slug.startsWith("guides/") ? "Guides" : "Docs") as Kind,
				title: fm.title ?? nameFromPath(`/${slug}`),
				url: `${company.docsUrl}/${slug}`,
				line: fm.description ?? fm.title ?? slug,
			};
		})
		.sort((a, b) => a.url.localeCompare(b.url));
}

export async function GET() {
	const links = [...(await webPages()), ...docsPages()];
	const sections = kinds.map((kind) =>
		[`## ${kind}`, "", ...links.filter((l) => l.kind === kind).map((l) => `- [${l.title}](${l.url}): ${l.line}`)].join(
			"\n",
		),
	);
	const body = [
		`# ${company.name}`,
		"",
		`> ${company.name} keeps search indexes and caches in sync with Postgres. It reads every committed insert, update and delete from the write-ahead log through logical replication and applies it, in commit order and usually within a second, to Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey. No triggers and no dual writes. Teams run the drift CLI on their own infrastructure or use the hosted service, and the Free plan covers 1,000,000 change events a month.`,
		"",
		sections.join("\n\n"),
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
