export type Post = {
	slug: string;
	title: string;
	summary: string;
	date: string;
	author: string;
};

export const posts: Post[] = [
	{
		slug: "zero-downtime-backfills",
		title: "How we backfill a 900-million-row table without pausing the stream",
		summary:
			"Keyset chunks, a watermark per chunk and one rule about which write wins. The algorithm behind drift backfill.",
		date: "2026-09-02",
		author: "Jun Watanabe",
	},
	{
		slug: "why-we-read-the-wal",
		title: "Why we read the WAL instead of using triggers",
		summary:
			"Triggers look simpler until the first long transaction. What logical replication gives you that an outbox table can’t.",
		date: "2026-06-17",
		author: "Tomás Lindqvist",
	},
];

export function formatDate(date: string) {
	return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export type Further = {
	title: string;
	href: string;
	summary: string;
};

export const further: Further[] = [
	{
		title: "Run a backfill",
		href: "/guides/backfills",
		summary:
			"Copy existing Postgres rows into a new or rebuilt index with drift backfill while live changes keep streaming.",
	},
	{
		title: "Sync to Meilisearch",
		href: "/guides/meilisearch",
		summary:
			"Keep a Meilisearch index in sync with a Postgres table, including filterable attributes, nested documents and deletes.",
	},
	{
		title: "Invalidate a Redis cache",
		href: "/guides/redis-cache",
		summary:
			"Delete or refresh Redis and Valkey cache keys the moment the underlying Postgres rows change, instead of relying on TTLs.",
	},
	{
		title: "Getting started",
		href: "/getting-started",
		summary:
			"Connect a Postgres database to a search index, from enabling logical replication to watching your first change arrive.",
	},
];
