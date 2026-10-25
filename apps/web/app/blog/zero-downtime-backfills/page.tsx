import type { Metadata } from "next";
import Link from "next/link";
import page from "@/components/Page.module.css";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { formatDate } from "../posts";

export const metadata: Metadata = {
	title: "How we backfill a 900-million-row table without pausing the stream",
	description:
		"The algorithm behind drift backfill: keyset chunks, per-chunk low and high watermarks, and why a live change always beats a backfilled row.",
	alternates: { canonical: "/blog/zero-downtime-backfills" },
};

export default function Post() {
	return (
		<article className={page.narrow}>
			<ArticleJsonLd slug="zero-downtime-backfills" description={metadata.description} />
			<p className={page.eyebrow}>
				<Link href="/blog">Blog</Link>
			</p>
			<h1 className={page.title}>How we backfill a 900-million-row table without pausing the stream</h1>
			<p className={page.meta}>{formatDate("2026-09-02")} · Jun Watanabe</p>
			<div className={page.prose}>
				<p>
					A change stream only tells you what happened after you started listening. The first time you
					point Driftbase at an existing <code>products</code> table, the index needs every row that
					already exists, and it needs them while new changes keep arriving. That is a backfill, and it
					is where most CDC tools ask you to stop writes for a while.
				</p>
				<p>
					We don’t, and the reason fits in one sentence: <strong>a row from the live stream always wins
					over the same row from the backfill</strong>. The rest of this post is how we make that
					sentence true.
				</p>

				<h2>Keyset chunks, not OFFSET</h2>
				<p>
					The backfiller walks the table by primary key in chunks of 5,000 rows:
				</p>
				<pre>
					<code>{`SELECT * FROM products
WHERE id > $last_id
ORDER BY id
LIMIT 5000;`}</code>
				</pre>
				<p>
					Each query is an index range scan that costs the same on the first chunk as on the
					180,000th. <code>OFFSET</code> would make the last chunks scan nearly the whole table.
				</p>

				<h2>Watermarks around every chunk</h2>
				<p>
					Before reading a chunk we write a low watermark into a tiny signalling table, and after
					reading it we write a high watermark. Both writes travel through the WAL like any other
					change, so the stream sees them in commit order. Any live change to a row in the chunk that
					arrives between the two watermarks means our copy of that row may be stale, so we drop it from
					the chunk before emitting. The live event is already on its way.
				</p>
				<figure>
					<img src="/blog/backfill-lag.svg" width={720} height={300} />
					<figcaption>
						End-to-end lag for live changes during a 900M-row backfill on a customer’s Aurora cluster.
						The backfill ran for 7 hours 40 minutes; live lag stayed under 1.2 seconds.
					</figcaption>
				</figure>

				<h2>What it costs the source</h2>
				<p>
					One read-only connection running short range scans, throttled by replica lag if you point it
					at a replica. On the run above the primary’s CPU rose by 6 percentage points. You can cap it
					with <code>--max-rows-per-second</code>.
				</p>

				<h2>Pausing and resuming</h2>
				<p>
					Since v1.8 the cursor is persisted after every chunk, so <code>drift backfill pause</code> is
					safe and a deploy in the middle of a backfill picks up where it left off. The details are in
					the <a href="https://docs.driftbase.dev/guides/backfills">backfills guide</a>.
				</p>
			</div>
		</article>
	);
}
