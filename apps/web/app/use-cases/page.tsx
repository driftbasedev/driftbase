import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@driftbase/brand";
import page from "@/components/Page.module.css";
import styles from "./use-cases.module.css";

export const metadata: Metadata = {
	title: "Use cases",
	description:
		"How teams use Driftbase: keep Elasticsearch, OpenSearch, Meilisearch and Typesense in sync with Postgres, keep Redis and Valkey caches current, retire dual writes and cron reindex jobs, and backfill without downtime.",
	alternates: { canonical: "/use-cases" },
};

const useCases = [
	{
		id: "search",
		title: "Keep your search index in sync with Postgres",
		sinks: ["Elasticsearch", "OpenSearch", "Meilisearch", "Typesense"],
		before:
			"A cron job reindexes every hour, so search is up to an hour stale. Deletes are the worst: a product you removed keeps showing up in results until the next full run, and customers file tickets about it.",
		after:
			"Driftbase applies every committed insert, update and delete to the index in commit order, usually in under a second. You describe each document as a SQL query, joins and nested arrays included. When a child row changes, Driftbase works out which parent documents it belongs to and rewrites only those.",
		code: `SELECT o.id, o.status, c.name AS customer,
       json_agg(i.sku) AS skus
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
GROUP BY o.id, c.name;`,
		codeLabel: "An orders document, shaped with SQL",
	},
	{
		id: "cache",
		title: "Keep Redis and Valkey caches current",
		sinks: ["Redis", "Valkey"],
		before:
			"Cache invalidation lives in application code. Every write path has to remember to delete the right keys, and the one that forgets serves stale data until the TTL runs out.",
		after:
			"The cache is fed from the write-ahead log instead of from your application. Any change that commits in Postgres reaches the cache, whichever service, migration or psql session made it. Deletes and TRUNCATEs are in the stream like every other change.",
	},
	{
		id: "dual-writes",
		title: "Retire dual writes and nightly reindex jobs",
		sinks: [],
		before:
			"Writing to Postgres and then to the index from the same request means two systems that can disagree. A deploy skips a write, a retry runs twice, a transaction rolls back after the index call already went out.",
		after:
			"Postgres stays the only place your application writes. Driftbase reads the WAL through a logical replication slot with the built-in pgoutput plugin: no triggers, no outbox table and no extra work in your write transaction. Then you delete the second write path and the cron job.",
		quote: {
			text: "“We had a nightly reindex and three different places that wrote to Elasticsearch. Driftbase replaced all of it in an afternoon, and our support queue about stale search results went to zero.”",
			by: "Priya Raman, Staff Engineer, Ledgerline",
		},
	},
	{
		id: "backfills",
		title: "Add an index or change a mapping without downtime",
		sinks: [],
		before:
			"A new index or a changed mapping usually means a full rebuild, and most rebuilds ask you to pause writes or accept a window where the index is missing rows.",
		after:
			"drift backfill copies existing rows in keyset chunks while live changes keep flowing, then hands over without a gap or a duplicate. A live change always wins over the same row from the backfill. You can cap the load with --max-rows-per-second, and pause and resume a backfill across a deploy.",
		code: `drift backfill pause
drift backfill resume`,
		codeLabel: "Backfills keep their cursor across a deploy",
		link: { href: "/blog/zero-downtime-backfills", label: "How we backfill a 900-million-row table" },
	},
	{
		id: "observability",
		title: "See lag and slot size before they become an incident",
		sinks: [],
		before:
			"An unread replication slot keeps WAL on disk. Without monitoring, the first sign of a stuck pipeline is a full disk on the primary or a customer reporting stale results.",
		after:
			"Every pipeline reports end-to-end lag, slot size and per-sink error rates, and exports them to Prometheus and Datadog. drift status prints the oldest unacknowledged LSN per sink. Alerts fire before the slot can fill your disk.",
		link: { href: "/blog/why-we-read-the-wal", label: "Why we read the WAL instead of using triggers" },
	},
];

export default function UseCases() {
	return (
		<div className={page.wrap}>
			<p className={page.eyebrow}>Use cases</p>
			<h1 className={page.title}>Your search index and cache, in Postgres commit order.</h1>
			<p className={page.lede}>
				Postgres is the source of truth. Driftbase reads its write-ahead log and keeps every copy
				downstream current, without triggers, outbox tables or a second write in your application.
			</p>
			<div className={styles.actions}>
				<a className={styles.button} href={`${company.docsUrl}/getting-started`}>
					Sync your first database
				</a>
				<Link className={styles.button} href="/pricing">
					See pricing
				</Link>
			</div>

			<nav className={styles.toc} aria-label="Use cases">
				<ul>
					{useCases.map((u) => (
						<li key={u.id}>
							<a href={`#${u.id}`}>{u.title}</a>
						</li>
					))}
				</ul>
			</nav>

			{useCases.map((u) => (
				<section key={u.id} id={u.id} className={styles.useCase}>
					<h2>{u.title}</h2>
					{u.sinks.length > 0 && (
						<ul className={styles.sinks} aria-label="Sinks">
							{u.sinks.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					)}
					<div className={styles.columns}>
						<div className={styles.card}>
							<h3>Without Driftbase</h3>
							<p>{u.before}</p>
						</div>
						<div className={styles.card}>
							<h3>With Driftbase</h3>
							<p>{u.after}</p>
						</div>
					</div>
					{u.code && (
						<figure className={styles.code}>
							<pre>
								<code>{u.code}</code>
							</pre>
							<figcaption>{u.codeLabel}</figcaption>
						</figure>
					)}
					{u.quote && (
						<blockquote className={styles.quote}>
							<p>{u.quote.text}</p>
							<footer>{u.quote.by}</footer>
						</blockquote>
					)}
					{u.link && (
						<p className={styles.more}>
							Read more: <Link href={u.link.href}>{u.link.label}</Link>
						</p>
					)}
				</section>
			))}

			<section className={styles.closer}>
				<h2>Free for your first million changes a month.</h2>
				<p>
					Run the Apache-2.0 CLI on your own infrastructure or let us host the pipeline. It works on RDS,
					Aurora, Cloud SQL, Neon, Supabase and plain Postgres 12 and up.
				</p>
				<div className={styles.actions}>
					<a className={styles.button} href={company.appUrl}>
						Create a free workspace
					</a>
					<Link className={styles.button} href="/contact">
						Talk to us
					</Link>
				</div>
			</section>
		</div>
	);
}
