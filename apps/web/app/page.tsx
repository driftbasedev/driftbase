import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@driftbase/brand";
import styles from "./home.module.css";

export const metadata: Metadata = {
	title: {
		absolute: "Driftbase · Keep Postgres, search and cache in sync",
	},
	description:
		"Driftbase streams every committed change in Postgres to Elasticsearch, Meilisearch, Typesense and Redis within a second, from logical replication. No triggers, no dual writes.",
	alternates: { canonical: "/" },
};

const sinks = ["Elasticsearch", "OpenSearch", "Meilisearch", "Typesense", "Redis", "Valkey"];

export default function Home() {
	return (
		<>
			<section className={styles.hero}>
				<div className={styles.heroText}>
					<p className={styles.kicker}>Change data capture for application teams</p>
					<h1 className={styles.headline}>Your search index should never be behind your database.</h1>
					<p className={styles.sub}>
						Driftbase reads the Postgres write-ahead log and applies every committed insert, update and
						delete to your search index and cache, in commit order, usually in under a second. You
						delete the cron job, the dual writes and the “reindex everything” button.
					</p>
					<div className={styles.actions}>
						<a className={styles.primary} href={`${company.docsUrl}/getting-started`}>
							Start syncing in 10 minutes
						</a>
						<Link className={styles.secondary} href="/pricing">
							See pricing
						</Link>
					</div>
					<pre className={styles.install}>
						<code>brew install driftbasedev/tap/drift</code>
					</pre>
				</div>
				<img
					className={styles.heroArt}
					src="/hero-flow.svg"
					alt="Rows from a Postgres table flowing through Driftbase into a search index and a cache"
					width={520}
					height={400}
				/>
			</section>

			<section className={styles.band}>
				<p className={styles.bandLabel}>Sinks that ship today</p>
				<ul className={styles.sinks}>
					{sinks.map((s) => (
						<li key={s}>{s}</li>
					))}
				</ul>
			</section>

			<section className={styles.grid}>
				<article>
					<h2>Reads the WAL, not your tables</h2>
					<p>
						Driftbase attaches to a logical replication slot with the built-in <code>pgoutput</code>{" "}
						plugin. No triggers, no extension to install, no extra load on your hot tables. It works on
						RDS, Aurora, Cloud SQL, Neon, Supabase and plain Postgres 12 and up.
					</p>
				</article>
				<article>
					<h2>Shapes documents with SQL you already know</h2>
					<p>
						Describe each index as a query: joins, computed columns, nested arrays. When an
						<code>order_items</code> row changes, Driftbase works out which <code>orders</code> documents
						it belongs to and rewrites only those.
					</p>
				</article>
				<article>
					<h2>Backfills that don’t stop the world</h2>
					<p>
						New index? Changed mapping? <code>drift backfill</code> copies existing rows in keyset
						chunks while live changes keep flowing, then hands over without a gap or a duplicate.
					</p>
				</article>
				<article>
					<h2>Lag you can actually see</h2>
					<p>
						Every pipeline reports end-to-end lag, slot size and per-sink error rates, and exports
						them to Prometheus and Datadog. Alerts fire before the slot can fill your disk.
					</p>
				</article>
			</section>

			<section className={styles.quote}>
				<blockquote>
					<p>
						“We had a nightly reindex and three different places that wrote to Elasticsearch. Driftbase
						replaced all of it in an afternoon, and our support queue about stale search results went to
						zero.”
					</p>
					<footer>Priya Raman, Staff Engineer, Ledgerline</footer>
				</blockquote>
			</section>

			<section className={styles.closer}>
				<h2>Free for your first million changes a month.</h2>
				<p>
					Run the CLI against your own infrastructure or let us host the pipeline. Either way, the Free
					plan covers 1,000,000 change events a month with no card.
				</p>
				<a className={styles.primary} href={company.appUrl}>
					Create a free workspace
				</a>
			</section>
		</>
	);
}
