import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://docs.driftbase.dev",
	markdown: {
		shikiConfig: {
			theme: "github-dark-dimmed",
		},
	},
});
