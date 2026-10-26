import type { Metadata } from "next";
import Link from "next/link";
import page from "@/components/Page.module.css";
import styles from "./blog.module.css";
import { company } from "@driftbase/brand";
import { formatDate, further, posts } from "./posts";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Engineering notes from Driftbase on Postgres logical replication, change data capture, search indexing and keeping caches honest.",
	alternates: { canonical: "/blog" },
};

export default function Blog() {
	return (
		<div className={page.narrow}>
			<p className={`${page.eyebrow} ${styles.eyebrow}`}>Blog</p>
			<h1 className={`${page.title} ${styles.title}`}>Notes from the replication slot</h1>
			<p className={`${page.lede} ${styles.lede}`}>How Driftbase works inside, and what we learn running it for other people.</p>
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
			<h2 className={styles.heading}>Keep reading</h2>
			<p className={styles.intro}>
				The posts explain why Driftbase works the way it does. The guides show how to use it.
			</p>
			<ul className={styles.list}>
				{further.map((g) => (
					<li key={g.href}>
						<p className={styles.meta}>Guide</p>
						<h2>
							<a href={`${company.docsUrl}${g.href}`}>{g.title}</a>
						</h2>
						<p>{g.summary}</p>
					</li>
				))}
				<li>
					<p className={styles.meta}>Changelog</p>
					<h2>
						<Link href="/changelog">What’s new in Driftbase</Link>
					</h2>
					<p>Every release of the CLI and the hosted service, with what changed in each.</p>
				</li>
			</ul>
		</div>
	);
}
