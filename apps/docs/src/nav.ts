export type NavSection = {
	label: string;
	items: { title: string; href: string }[];
};

export const nav: NavSection[] = [
	{
		label: "Start here",
		items: [
			{ title: "Introduction", href: "/" },
			{ title: "Getting started", href: "/getting-started" },
			{ title: "Install the CLI", href: "/install" },
		],
	},
	{
		label: "Reference",
		items: [
			{ title: "Configuration", href: "/configuration" },
			{ title: "Plan limits and metering", href: "/limits" },
		],
	},
	{
		label: "Guides",
		items: [
			{ title: "Sync to Meilisearch", href: "/guides/meilisearch" },
			{ title: "Sync to Algolia", href: "/guides/algolia" },
			{ title: "Invalidate a Redis cache", href: "/guides/redis-cache" },
			{ title: "Run a backfill", href: "/guides/backfills" },
		],
	},
];
