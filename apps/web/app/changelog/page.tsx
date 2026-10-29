import type { Metadata } from "next";
import page from "@/components/Page.module.css";
import styles from "./changelog.module.css";
import { entries } from "./entries";

export const metadata: Metadata = {
	title: "Changelog",
	description:
		"Release notes for the Driftbase CLI and hosted service: new sinks, backfill and pipeline features, and fixes in each version.",
	alternates: { canonical: "/changelog" },
};

function renderInline(text: string) {
	return text.split(/(`[^`]+`)/g).map((part, i) =>
		part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : <span key={i}>{part}</span>,
	);
}

export default function Changelog() {
	return (
		<div className={page.narrow}>
			<p className={page.eyebrow}>Changelog</p>
			<h1 className={page.title}>What’s new in Driftbase</h1>
			<p className={page.lede}>
				The CLI and the hosted service ship from the same release. Upgrade with{" "}
				<code>drift self-update</code>.
			</p>
			<ol className={styles.list}>
				{entries.map((e) => (
					<li key={e.version} id={`v${e.version}`}>
						<p className={styles.meta}>
							<span className={styles.version}>v{e.version}</span>
							<time dateTime={e.date}>
								{new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</time>
						</p>
						<h2>{e.title}</h2>
						<ul>
							{e.items.map((item) => (
								<li key={item}>{renderInline(item)}</li>
							))}
						</ul>
					</li>
				))}
			</ol>
		</div>
	);
}
