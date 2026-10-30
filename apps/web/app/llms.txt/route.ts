import { company } from "@driftbase/brand";
import { posts } from "../blog/posts";

export const dynamic = "force-static";

const base = company.webUrl;

export function GET() {
	const blog = posts.map((p) => `- [${p.title}](${base}/blog/${p.slug}): ${p.summary}`);

	const body = [
		`# ${company.name}`,
		"",
		"> Driftbase reads the Postgres write-ahead log and streams every committed insert, update and delete to search indexes and caches, in commit order, usually in under a second.",
		"",
		"## Product",
		"",
		`- [Home](${base}/): What Driftbase does, how it works and the search and cache destinations it supports.`,
		`- [Pricing](${base}/pricing): Plans priced by change event, from the free tier to Team and Scale.`,
		`- [Changelog](${base}/changelog): Release notes for the drift CLI and the hosted service, which ship from the same release.`,
		"",
		"## Developers",
		"",
		`- [Documentation](${company.docsUrl}): Guides and reference for installing the drift CLI and running a sync.`,
		`- [Install the CLI](${company.docsUrl}/install): How to install the drift command-line tool.`,
		`- [GitHub](${company.github}): Source code for the open-source drift CLI.`,
		"",
		"## Company",
		"",
		`- [About](${base}/about): Who builds Driftbase, where the team is and why the company exists.`,
		`- [Blog](${base}/blog): Engineering notes on Postgres logical replication, change data capture, search indexing and caches.`,
		`- [Contact](${base}/contact): How to reach Driftbase for sales, support, security reports or press.`,
		"",
		"## Blog posts",
		"",
		...blog,
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
