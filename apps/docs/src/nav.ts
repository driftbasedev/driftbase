export type NavSection = {
	label: string;
	items: { title: string; href: string; summary: string }[];
};

export const nav: NavSection[] = [
	{
		label: "Start here",
		items: [
			{ title: "Introduction", href: "/", summary: "How sources, sinks and pipelines fit together." },
			{ title: "Getting started", href: "/getting-started", summary: "Connect Postgres to a search index in about ten minutes." },
			{ title: "Install the CLI", href: "/install", summary: "Install drift on macOS, Linux and Windows." },
		],
	},
	{
		label: "Reference",
		items: [
			{ title: "Configuration", href: "/configuration", summary: "Every option in driftbase.toml." },
			{ title: "Plan limits and metering", href: "/limits", summary: "How change events are counted and what happens at each limit." },
		],
	},
	{
		label: "Guides",
		items: [
			{ title: "Sync to Meilisearch", href: "/guides/meilisearch", summary: "Keep a Meilisearch index in sync with a Postgres table." },
			{ title: "Invalidate a Redis cache", href: "/guides/redis-cache", summary: "Delete or refresh Redis and Valkey keys when rows change." },
			{ title: "Run a backfill", href: "/guides/backfills", summary: "Copy existing rows into a sink while live changes keep streaming." },
		],
	},
];
