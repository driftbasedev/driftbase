import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@driftbase/brand";
import page from "@/components/Page.module.css";
import styles from "./use-cases.module.css";

export const metadata: Metadata = {
	title: "Use cases",
	description:
		"How teams use Driftbase: keep Elasticsearch, OpenSearch, Meilisearch and Typesense in sync with Postgres, invalidate Redis and Valkey caches, retire dual writes and reindex without downtime.",
	alternates: { canonical: "/use-cases" },
};

type UseCase = {
	id: string;
	label: string;
	title: string;
	problem: string;
	solution: string;
	points: string[];
	code: string;
	link: { href: string; text: string };
};

const useCases: UseCase[] = [
	{
		id: "search",
		label: "Search sync",
		title: "Keep a search index in step with Postgres",
		problem:
			"Search results go stale when a code path writes to Postgres and forgets the index, or when a nightly job is the only thing that catches up.",
		solution:
			"Driftbase reads every committed insert, update and delete from the write-ahead log and applies it to Elasticsearch, OpenSearch, Meilisearch or Typesense in commit order. You describe each index as a SQL query, joins included.",
		points: [
			"Renaming a tag rewrites every document that carries it.",
			"A row that stops matching the query is deleted from the index, just like a DELETE.",
			"Index settings stay in your repo; Driftbase only writes documents.",
		],
		code: `[[pipeline]]
source = "main"
sink = "search"
index = "articles"
query = """
SELECT a.id, a.title, u.display_name AS author
FROM articles a JOIN users u ON u.id = a.author_id
WHERE a.published_at IS NOT NULL
"""`,
		link: { href: `${company.docsUrl}/guides/meilisearch`, text: "Sync to Meilisearch guide" },
	},
	{
		id: "cache",
		label: "Cache invalidation",
		title: "Invalidate Redis and Valkey from the database side",
		problem:
			"Most cache bugs are invalidation bugs. TTLs hide them for a while, and every new write path is another place to forget.",
		solution:
			"Because Driftbase invalidates from the log, every write is covered: application code, migrations and the SQL someone ran by hand at 2 a.m.",
		points: [
			"Delete mode removes the key on any change; your app repopulates it on the next read.",
			"Write-through mode writes the new value as JSON, so reads never miss.",
			"Changes to the same key are applied in commit order.",
		],
		code: `[[pipeline]]
source = "main"
sink = "cache"
table = "products"
index = "product:{id}"
mode = "delete"`,
		link: { href: `${company.docsUrl}/guides/redis-cache`, text: "Invalidate a Redis cache guide" },
	},
	{
		id: "dual-writes",
		label: "Migrations",
		title: "Retire dual writes and the nightly reindex",
		problem:
			"Writing to Postgres and the index in the same request means two systems that can disagree. A cron reindex papers over the gaps until the table is too big to reindex overnight.",
		solution:
			"Point Driftbase at the tables you already write to and let the index derive from the log. The extra writes and the cron job become code you can delete, not code you maintain.",
		points: [
			"No triggers and no outbox table: Driftbase attaches to a logical replication slot with pgoutput.",
			"Works on RDS, Aurora, Cloud SQL, Neon, Supabase and plain Postgres 12 and up.",
			"The first drift sync backfills existing rows, then keeps streaming.",
		],
		code: `drift sync --pipeline articles
drift status`,
		link: { href: "/blog/why-we-read-the-wal", text: "Why we read the WAL instead of using triggers" },
	},
	{
		id: "reindex",
		label: "Reindexing",
		title: "Change a mapping without a half-built index",
		problem:
			"A new mapping or a new field usually means rebuilding the index, and rebuilding usually means a maintenance window or a gap in results.",
		solution:
			"drift backfill copies existing rows in keyset chunks while live changes keep flowing. Backfill into a fresh index and swap the alias when it finishes.",
		points: [
			"A live change to a row always wins over its backfilled copy.",
			"The cursor is saved after every chunk, so a backfill survives a restart or a deploy.",
			"Backfilled rows are not metered, and can read from a replica instead of the primary.",
		],
		code: `drift backfill --pipeline orders \\
  --index orders_v2 --swap-alias orders`,
		link: { href: `${company.docsUrl}/guides/backfills`, text: "Run a backfill guide" },
	},
	{
		id: "observability",
		label: "Observability",
		title: "See replication lag before your users do",
		problem:
			"A sync pipeline that fails quietly is worse than none. And a replication slot nobody reads keeps retaining WAL until it fills the disk.",
		solution:
			"Every pipeline reports end-to-end lag, slot size and per-sink error rates, and exports them to Prometheus and Datadog.",
		points: [
			"drift status shows documents written, current lag and the last applied LSN.",
			"max_slot_mb alerts when retained WAL for a slot grows past a limit you set.",
			"On the Team plan, lag and slot-size alerts go to Slack and PagerDuty.",
		],
		code: `[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
max_slot_mb = 10240`,
		link: { href: `${company.docsUrl}/configuration`, text: "Configuration reference" },
	},
];

export default function UseCases() {
	return (
		<div className={page.wrap}>
			<p className={page.eyebrow}>Use cases</p>
			<h1 className={page.title}>Keep every search index and cache in sync with Postgres.</h1>
			<p className={page.lede}>
				Driftbase reads the write-ahead log and applies each committed change to Elasticsearch,
				OpenSearch, Meilisearch, Typesense, Redis and Valkey, in commit order. Here is what teams use it
				for.
			</p>

			<nav className={styles.toc} aria-label="Use cases">
				<ul>
					{useCases.map((u) => (
						<li key={u.id}>
							<a href={`#${u.id}`}>{u.label}</a>
						</li>
					))}
				</ul>
			</nav>

			<div className={styles.list}>
				{useCases.map((u) => (
					<section key={u.id} id={u.id} className={styles.case}>
						<div>
							<p className={styles.label}>{u.label}</p>
							<h2 className={styles.title}>{u.title}</h2>
							<p className={styles.problem}>{u.problem}</p>
							<p>{u.solution}</p>
							<ul className={styles.points}>
								{u.points.map((p) => (
									<li key={p}>{p}</li>
								))}
							</ul>
							{u.link.href.startsWith("/") ? (
								<Link href={u.link.href}>{u.link.text}</Link>
							) : (
								<a href={u.link.href}>{u.link.text}</a>
							)}
						</div>
						<pre className={styles.code}>
							<code>{u.code}</code>
						</pre>
					</section>
				))}
			</div>

			<section className={styles.closer}>
				<h2>Start with one table.</h2>
				<p>
					Run the Apache-2.0 CLI on your own infrastructure or let us host the pipeline. The Free plan
					covers 1,000,000 change events a month.
				</p>
				<div className={styles.actions}>
					<a className={styles.button} href={`${company.docsUrl}/getting-started`}>
						Sync your first database
					</a>
					<Link className={styles.button} href="/pricing">
						See pricing
					</Link>
				</div>
			</section>
		</div>
	);
}
