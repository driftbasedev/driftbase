import type { Metadata } from "next";
import Link from "next/link";
import page from "@/components/Page.module.css";
import styles from "./blog.module.css";
import { formatDate, posts } from "./posts";

const related = [
	{
		title: "Run a backfill",
		href: "https://docs.driftbase.dev/guides/backfills",
		summary:
			"Copy existing Postgres rows into a new or rebuilt index with drift backfill while live changes keep streaming.",
	},
	{
		title: "Sync to Meilisearch",
		href: "https://docs.driftbase.dev/guides/meilisearch",
		summary:
			"Keep a Meilisearch index in sync with a Postgres table, including filterable attributes, nested documents and deletes.",
	},
	{
		title: "Invalidate a Redis cache",
		href: "https://docs.driftbase.dev/guides/redis-cache",
		summary:
			"Delete or refresh Redis and Valkey cache keys the moment the underlying Postgres rows change, instead of relying on TTLs.",
	},
];

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Engineering notes from Driftbase on Postgres logical replication, change data capture, search indexing and keeping caches honest.",
	alternates: { canonical: "/blog" },
};

export default function Blog() {
	return (
		<div className={page.narrow}>
			<p className={page.eyebrow}>Blog</p>
			<h1 className={page.title}>Notes from the replication slot</h1>
			<p className={page.lede}>How Driftbase works inside, and what we learn running it for other people.</p>
			<ul className={styles.list}>
				{posts.map((p) => (
					<li key={p.slug}>
						<p className={styles.meta}>
							{formatDate(p.date)} · {p.author}
						</p>
						<h2>
							<Link href={`/blog/${p.slug}`}>{p.title}</Link>
						</h2>
						<p>{p.summary}</p>
					</li>
				))}
			</ul>
			<section className={styles.related}>
				<h2>Guides and release notes</h2>
				<ul className={styles.list}>
					{related.map((r) => (
						<li key={r.href}>
							<h3>
								<a href={r.href}>{r.title}</a>
							</h3>
							<p>{r.summary}</p>
						</li>
					))}
					<li>
						<h3>
							<Link href="/changelog">Changelog</Link>
						</h3>
						<p>What’s new in each release of the drift CLI and the hosted service.</p>
					</li>
				</ul>
			</section>
		</div>
	);
}
