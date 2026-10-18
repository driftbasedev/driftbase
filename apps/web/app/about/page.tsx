import type { Metadata } from "next";
import Link from "next/link";
import page from "@/components/Page.module.css";
import styles from "./about.module.css";

export const metadata: Metadata = {
	title: "Company",
	description:
		"Driftbase is a nine-person company in Portland, Oregon, founded in 2023 by former Heroku Postgres and Algolia engineers to make derived data stores trustworthy.",
	alternates: { canonical: "/about" },
};

const people = [
	{ name: "Maya Okafor", role: "Co-founder & CEO", note: "Ran the Heroku Postgres follower fleet for five years." },
	{ name: "Tomás Lindqvist", role: "Co-founder & CTO", note: "Built the indexing pipeline at Algolia’s Paris office." },
	{ name: "Jun Watanabe", role: "Founding engineer", note: "Wrote the keyset backfiller and most of the sink adapters." },
	{ name: "Rosa Delgado", role: "Head of customer engineering", note: "Has migrated more Elasticsearch clusters than she will admit." },
];

export default function About() {
	return (
		<div className={page.narrow}>
			<p className={page.eyebrow}>Company</p>
			<h1 className={page.title}>We build the boring pipe between your database and everything that copies it.</h1>
			<div className={page.prose}>
				<p>
					Every application eventually keeps a second copy of its data: a search index, a cache, a
					read model for analytics. And every team eventually finds out that the second copy is wrong.
					A deploy skipped a write, a job retried twice, a delete never made it across.
				</p>
				<p>
					Maya and Tomás met in 2021 on an incident bridge about exactly that, and started Driftbase in
					March 2023 with a simple rule: the database is the source of truth, and the only honest record
					of what changed is its write-ahead log. Everything downstream should be derived from that log,
					in order, and be rebuildable at any time.
				</p>
				<p>
					Today Driftbase moves a little over 40 billion change events a month for about 300 teams, from
					two-person startups to a top-ten US grocery delivery service. We’re nine people, based in
					Portland with two engineers in Lisbon and Osaka, and backed by Boldline Ventures and a group of
					database people we admire.
				</p>

				<h2>What we believe</h2>
				<ul>
					<li>Correctness first. A fast pipeline that loses a delete is a slow outage.</li>
					<li>Open by default. The CLI is Apache-2.0, and the hosted service runs the same binary.</li>
					<li>Boring is a feature. We would rather you forget we exist.</li>
				</ul>

				<h2>Team</h2>
			</div>
			<ul className={styles.people}>
				{people.map((p) => (
					<li key={p.name}>
						<strong>{p.name}</strong>
						<span>{p.role}</span>
						<p>{p.note}</p>
					</li>
				))}
			</ul>
			<div className={page.prose}>
				<h2>Work with us</h2>
				<p>
					We hire slowly and remotely within UTC−8 to UTC+9. If replication slots and idempotent writes
					sound like fun, <Link href="/contact">get in touch</Link> even if nothing is posted.
				</p>
			</div>
		</div>
	);
}
