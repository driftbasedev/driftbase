import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@driftbase/brand"],
	poweredByHeader: false,
	outputFileTracingRoot: path.join(__dirname, "../.."),
	async redirects() {
		return [
			{ source: "/docs", destination: "https://docs.driftbase.dev", permanent: true },
			{ source: "/company", destination: "/about", permanent: true },
		];
	},
};

export default nextConfig;
