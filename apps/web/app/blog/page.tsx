import type { Metadata } from "next";
import Link from "next/link";
import page from "@/components/Page.module.css";
import styles from "./blog.module.css";
import { formatDate, posts } from "./posts";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Engineering notes from Driftbase on Postgres logical replication, change data capture, search indexing and keeping caches honest.",
	alternates: { canonical: "/blog" },
};

export default function Blog() {
	return (
		<div className={page.narrow}>
			<p className={page.eyebrow}>Blog</p>
			<h1 className={page.title}>Notes from the replication slot</h1>
			<p className={page.lede}>How Driftbase works inside, and what we learn running it for other people.</p>
			<p className={styles.aside}>
				Choosing a Postgres CDC pipeline? Read <Link href="/compare/debezium">Driftbase vs Debezium</Link>.
			</p>
			<ul className={styles.list}>
				{posts.map((p) => (
					<li key={p.slug}>
						<p className={styles.meta}>
							{formatDate(p.date)} · {p.author}
						</p>
						<h2>
							<Link href={`/blog/${p.slug}`}>{p.title}</Link>
						</h2>
						<p>{p.summary}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
