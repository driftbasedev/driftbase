import type { Metadata } from "next";
import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import page from "@/components/Page.module.css";
import { formatDate } from "../posts";

const description =
	"Triggers and outbox tables look simpler than logical replication until the first long transaction or the first missed delete. Here is why Driftbase reads the WAL.";

export const metadata: Metadata = {
	title: "Why we read the WAL instead of using triggers",
	description,
	alternates: { canonical: "/blog/why-we-read-the-wal" },
};

export default function Post() {
	return (
		<article className={page.narrow}>
			<ArticleJsonLd slug="why-we-read-the-wal" description={description} />
			<p className={page.eyebrow}>
				<Link href="/blog">Blog</Link>
			</p>
			<h1 className={page.title}>Why we read the WAL instead of using triggers</h1>
			<p className={page.meta}>{formatDate("2026-06-17")} · Tomás Lindqvist</p>
			<div className={page.prose}>
				<p>
					The first prototype of Driftbase used triggers. Every table you wanted to sync got an
					<code>AFTER INSERT OR UPDATE OR DELETE</code> trigger that wrote a row into an outbox table, and
					a worker polled the outbox. It took a weekend to build and three months to give up on.
				</p>

				<h2>Triggers are part of your transaction</h2>
				<p>
					A trigger runs inside the writing transaction. Every insert into <code>orders</code> becomes
					two inserts, on your hottest table, holding locks for longer. One customer’s nightly batch job
					got 30% slower the day they installed us. That is not a tax you should pay for a search index.
				</p>

				<h2>Polling an outbox gets the order wrong</h2>
				<p>
					Outbox rows get IDs when they are written, not when they commit. A long transaction that
					started first can commit last, and a worker that reads “everything after ID 9,000” skips it
					forever. You can patch that with a time window and a re-scan, and now you have duplicates to
					reason about instead.
				</p>

				<h2>The WAL already has the answer</h2>
				<p>
					Postgres writes every committed change to its write-ahead log, in commit order, whether you ask
					it to or not. Logical decoding with the built-in <code>pgoutput</code> plugin turns that into a
					stream of row changes. Reading it costs one replication connection and adds nothing to the
					write path. Deletes, which triggers on partitioned tables and <code>TRUNCATE</code> love to
					lose, are in the stream like everything else.
				</p>

				<h2>What you have to get right instead</h2>
				<ul>
					<li>
						<strong>Slot retention.</strong> An unread slot keeps WAL on disk. Driftbase alerts on slot size
						and, on Team and Scale, can drop and recreate a slot that crosses your limit.
					</li>
					<li>
						<strong>Replica identity.</strong> Updates and deletes need the old key. Tables without a
						primary key need <code>REPLICA IDENTITY FULL</code>, and we tell you which ones.
					</li>
					<li>
						<strong>Schema changes.</strong> DDL is not in the logical stream. We detect relation changes
						from the stream’s metadata messages and re-plan the pipeline.
					</li>
				</ul>
				<p>
					If that sounds like more work than a trigger, it is, once. That’s the part we do for you.{" "}
					<Link href="/pricing">Try it free</Link>.
				</p>
			</div>
		</article>
	);
}
