import type { Metadata } from "next";
import "@driftbase/brand/tokens.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
	metadataBase: new URL("https://driftbase.dev"),
	title: {
		default: "Driftbase",
		template: "%s · Driftbase",
	},
	openGraph: {
		siteName: "Driftbase",
		type: "website",
	},
	twitter: {
		card: "summary",
		site: "@driftbasedev",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<script async src="https://lettervisit.com/v.js" data-key="lv_pub_li74smqz2ummqxei9qjq7qif"></script>
			</head>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
			</body>
		</html>
	);
}
