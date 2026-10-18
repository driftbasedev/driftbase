export type ChangelogEntry = {
	version: string;
	date: string;
	title: string;
	items: string[];
};

export const entries: ChangelogEntry[] = [
	{
		version: "1.9.0",
		date: "2026-10-07",
		title: "Valkey sink and per-column redaction",
		items: [
			"New `valkey` sink, wire-compatible with the Redis sink and tested against Valkey 8.",
			"`redact` in a pipeline definition drops or hashes columns before they leave the source region.",
			"`drift status` now prints the oldest unacknowledged LSN per sink.",
		],
	},
	{
		version: "1.8.2",
		date: "2026-09-18",
		title: "Faster Typesense batching",
		items: [
			"Typesense sink uses the import endpoint with 500-document batches, cutting p95 apply time by 60%.",
			"Fixed a case where a TRUNCATE inside a larger transaction was applied after the transaction’s inserts.",
		],
	},
	{
		version: "1.8.0",
		date: "2026-08-26",
		title: "Backfills you can pause",
		items: [
			"`drift backfill pause` and `resume` keep the keyset cursor, so a backfill survives a deploy.",
			"Backfill progress is visible in the dashboard with an ETA based on the last 5 minutes.",
			"Postgres 17 is officially supported, including failover slots.",
		],
	},
	{
		version: "1.7.0",
		date: "2026-07-14",
		title: "Datadog and Prometheus exporters",
		items: [
			"End-to-end lag, slot size and sink error rate are exported as metrics.",
			"New `--metrics-addr` flag for self-hosted pipelines.",
		],
	},
	{
		version: "1.6.0",
		date: "2026-06-02",
		title: "Nested documents from joins",
		items: [
			"A pipeline query can aggregate child rows into arrays with `json_agg`, and Driftbase re-renders the parent when any child changes.",
			"Dependency tracking is computed from the query plan; no manual `depends_on` needed.",
		],
	},
];
