import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@driftbase/brand";
import page from "@/components/Page.module.css";
import styles from "./compare.module.css";
import { debeziumSources, driftbaseSources, sourceNumber, type Source } from "./sources";

export const metadata: Metadata = {
	title: "Driftbase vs Debezium for Postgres CDC",
	description:
		"Driftbase and Debezium both read the Postgres WAL. A sourced comparison for teams keeping Elasticsearch, Meilisearch, Typesense or Redis in sync with Postgres.",
	alternates: { canonical: "/compare/debezium" },
};

function Cite({ ids }: { ids: string[] }) {
	return (
		<sup className={styles.cite}>
			{ids.map((id) => {
				const n = sourceNumber(id);
				return (
					<a key={id} href={`#source-${n}`} aria-label={`Source ${n}`}>
						[{n}]
					</a>
				);
			})}
		</sup>
	);
}

const rows: { label: string; driftbase: React.ReactNode; debezium: React.ReactNode }[] = [
	{
		label: "Source databases",
		driftbase: <>Postgres only.</>,
		debezium: (
			<>
				Postgres, MySQL, MariaDB, MongoDB, SQL Server, Oracle, Db2, Cassandra, CockroachDB and more.
				<Cite ids={["dbz-sources"]} />
			</>
		),
	},
	{
		label: "How it reads Postgres",
		driftbase: (
			<>
				A logical replication slot with the built-in <code>pgoutput</code> plugin. No triggers.
				<Cite ids={["db-home"]} />
			</>
		),
		debezium: (
			<>
				Logical decoding, with <code>pgoutput</code> or the community <code>decoderbufs</code> plugin.
				<Cite ids={["dbz-pg"]} />
			</>
		),
	},
	{
		label: "Where changes land",
		driftbase: (
			<>
				Documents and keys written directly into Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis
				and Valkey.
				<Cite ids={["db-intro"]} />
			</>
		),
		debezium: (
			<>
				Change events on Kafka topics, one per table by default, for sink connectors or your own consumers
				to deliver onward. Debezium Server sends to Kinesis, Pub/Sub, Pulsar, Redis streams and more.
				<Cite ids={["dbz-pg", "dbz-arch", "dbz-server", "dbz-home"]} />
			</>
		),
	},
	{
		label: "Search documents",
		driftbase: (
			<>
				Each index is a SQL query: joins, computed columns, nested arrays.
				<Cite ids={["db-query"]} />
			</>
		),
		debezium: (
			<>
				One event per changed row. Combining rows into a document happens downstream.
				<Cite ids={["dbz-pg", "dbz-faq-uses"]} />
			</>
		),
	},
	{
		label: "Backfills",
		driftbase: (
			<>
				<code>drift backfill</code> runs alongside live changes, with alias swap, pause and resume.
				<Cite ids={["db-backfill"]} />
			</>
		),
		debezium: (
			<>
				Incremental snapshots run in parallel with streaming, started by a signal.
				<Cite ids={["dbz-incremental"]} />
			</>
		),
	},
	{
		label: "Lag and slot metrics",
		driftbase: (
			<>
				End-to-end lag, slot size and per-sink error rates, exported to Prometheus and Datadog.
				<Cite ids={["db-home"]} />
			</>
		),
		debezium: (
			<>
				Connector metrics over JMX; Prometheus and Grafana through example configuration.
				<Cite ids={["dbz-pg-metrics", "dbz-monitoring"]} />
			</>
		),
	},
	{
		label: "Ordering",
		driftbase: (
			<>
				Applied in commit order.
				<Cite ids={["db-intro"]} />
			</>
		),
		debezium: (
			<>
				Totally ordered within a topic; resumes in commit order after a stop.
				<Cite ids={["dbz-faq-order", "dbz-home"]} />
			</>
		),
	},
	{
		label: "What you run",
		driftbase: (
			<>
				One static binary, or Driftbase Cloud running the same binary.
				<Cite ids={["db-intro"]} />
			</>
		),
		debezium: (
			<>
				Most commonly Kafka Connect with Kafka brokers; Debezium Server or the embedded engine without
				Kafka.
				<Cite ids={["dbz-arch", "dbz-faq-kafka"]} />
			</>
		),
	},
	{
		label: "License",
		driftbase: (
			<>
				Apache-2.0 CLI. Hosted Free plan: 1,000,000 change events a month.
				<Cite ids={["db-intro", "db-pricing"]} />
			</>
		),
		debezium: (
			<>
				Apache License 2.0, hosted by the Commonhaus Foundation.
				<Cite ids={["dbz-faq-license"]} />
			</>
		),
	},
];

function SourceList({ sources }: { sources: Source[] }) {
	return (
		<ol className={styles.sources} start={sourceNumber(sources[0].key)}>
			{sources.map((s) => (
				<li key={s.key} id={`source-${sourceNumber(s.key)}`}>
					<a href={s.url}>{s.title}</a>
					{s.quotes.map((q) => (
						<p key={q}>“{q}”</p>
					))}
				</li>
			))}
		</ol>
	);
}

export default function CompareDebezium() {
	return (
		<div className={page.wrap}>
			<header className={styles.intro}>
				<p className={page.eyebrow}>Compare</p>
				<h1 className={styles.title}>Driftbase vs Debezium for Postgres change data capture</h1>
				<p className={page.lede}>
					Both read the Postgres write-ahead log through logical replication. Debezium turns it into change
					events for Kafka and whatever consumes them. Driftbase turns it into the documents and keys in your
					search index and cache. If keeping that second copy right is the job, here is how they compare.
				</p>
				<div className={styles.actions}>
					<a className={styles.button} href={`${company.docsUrl}/getting-started`}>
						Sync your first database
					</a>
					<a className={styles.button} href="#where-debezium-fits">
						Where Debezium fits better
					</a>
				</div>
				<p className={styles.checked}>
					Debezium details are quoted from its own documentation (version 3.7, read in November 2026). Every
					claim links to its source at the bottom of the page.
				</p>
			</header>

			<section className={styles.section} aria-labelledby="short-answer">
				<h2 id="short-answer">The short answer</h2>
				<div className={styles.choices}>
					<div className={styles.card}>
						<h3>Choose Driftbase if</h3>
						<ul>
							<li>
								Postgres is the source, and the destination is Elasticsearch, OpenSearch, Meilisearch,
								Typesense, Redis or Valkey.
							</li>
							<li>You want to describe each search document as a SQL query, joins and nested arrays included.</li>
							<li>
								You would rather run one binary, or have us run the same binary, than operate Kafka and Kafka
								Connect for this one job.
							</li>
							<li>You want replication lag and slot size in Prometheus or Datadog from day one.</li>
						</ul>
					</div>
					<div className={styles.card}>
						<h3>Choose Debezium if</h3>
						<ul>
							<li>You capture changes from more than Postgres: MySQL, MongoDB, SQL Server, Oracle and others.</li>
							<li>Kafka is already your backbone, or many services need to read the same change events.</li>
							<li>The destination is a message broker or stream, such as Kinesis, Pub/Sub or Pulsar.</li>
							<li>You want raw change events for an audit log, microservices or the outbox pattern.</li>
						</ul>
					</div>
				</div>
			</section>

			<section className={`${page.prose} ${styles.section} ${styles.text}`} aria-labelledby="same">
				<h2 id="same">What both do the same way</h2>
				<p>
					Neither tool needs triggers on your tables. Debezium’s PostgreSQL connector can use{" "}
					<code>pgoutput</code>, the logical decoding plugin that ships with Postgres 10 and later and needs
					no extra libraries.
					<Cite ids={["dbz-pg"]} /> Driftbase attaches to a logical replication slot with the same built-in
					plugin: no triggers, no extension to install, no extra load on your hot tables.
					<Cite ids={["db-home"]} />
				</p>
				<p>
					Both are Apache-2.0 licensed.
					<Cite ids={["dbz-faq-license", "db-intro"]} /> Both can copy rows that already exist while live
					changes keep streaming.
					<Cite ids={["dbz-incremental", "db-backfill"]} /> And with either one, an unread replication slot
					holds WAL on disk, so slot health needs watching.
					<Cite ids={["dbz-wal", "db-wal"]} />
				</p>
				<p>
					So the choice is not about how changes leave Postgres. It is about what happens to them next, and
					how much you run to get them where they need to be.
				</p>
			</section>

			<section className={styles.section} aria-labelledby="at-a-glance">
				<h2 id="at-a-glance">At a glance</h2>
				<table className={styles.table}>
					<thead>
						<tr>
							<th scope="col">
								<span className={styles.visuallyHidden}>Criterion</span>
							</th>
							<th scope="col">Driftbase</th>
							<th scope="col">Debezium</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.label}>
								<th scope="row">{r.label}</th>
								<td data-label="Driftbase">{r.driftbase}</td>
								<td data-label="Debezium">{r.debezium}</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>

			<section className={`${page.prose} ${styles.section} ${styles.text}`} aria-labelledby="in-practice">
				<h2 id="in-practice">How the differences play out</h2>

				<h3>Where the changes land</h3>
				<p>
					Debezium’s PostgreSQL connector produces a change event for every row-level insert, update and
					delete, and sends each table’s events to its own Kafka topic.
					<Cite ids={["dbz-pg"]} /> From Kafka, connectors in the Kafka Connect ecosystem stream the records on
					to systems such as Elasticsearch or caches such as Infinispan.
					<Cite ids={["dbz-arch"]} /> Debezium Server skips Kafka and delivers to messaging infrastructure; its
					Redis sink stores change events as entries in a Redis stream.
					<Cite ids={["dbz-arch", "dbz-server"]} /> A new Elasticsearch sink connector is in Debezium’s 3.8
					development release.
					<Cite ids={["dbz-home"]} />
				</p>
				<p>
					Driftbase writes into the destination itself: documents into Elasticsearch, OpenSearch,
					Meilisearch and Typesense, and keys into Redis and Valkey.
					<Cite ids={["db-intro"]} /> For a cache you pick whether a change deletes the key or writes the new
					value through.
					<Cite ids={["db-redis"]} />
				</p>

				<h3>Shaping search documents</h3>
				<p>
					A search document is rarely one row. An order document wants the customer’s email and every line
					item. In Driftbase you write that as the pipeline’s SQL query, and Driftbase finds every table the
					query reads and re-renders the affected parent documents when any of them changes.
					<Cite ids={["db-query"]} />
				</p>
				<p>
					Debezium emits one event per changed row.
					<Cite ids={["dbz-pg"]} /> Its FAQ describes applications using those events to update a derived
					store with information computed from the changes, or to drive streaming queries with Apache Flink
					or Kafka Streams.
					<Cite ids={["dbz-faq-uses"]} /> With Debezium, joining rows into a document is the job of that
					downstream step.
				</p>

				<h3>Backfills</h3>
				<p>
					Both copy existing rows without stopping the stream. Debezium’s incremental snapshots run in
					parallel with streamed data capture, and you start one by sending the connector a signal.
					<Cite ids={["dbz-incremental"]} /> In Driftbase, <code>drift backfill</code> runs alongside live
					traffic, and a live change to a row always wins over the backfilled copy. It can fill a fresh index
					and swap an alias when it finishes, pause and resume from its saved cursor, and read from a replica
					to keep load off your primary.
					<Cite ids={["db-backfill"]} />
				</p>

				<h3>Lag and replication slot health</h3>
				<p>
					Debezium’s PostgreSQL connector exposes snapshot and streaming metrics over JMX, alongside the JMX
					metrics Kafka and Kafka Connect provide.
					<Cite ids={["dbz-pg-metrics"]} /> They can be exported to Prometheus and Grafana; Debezium keeps
					example configuration and dashboards for that, maintained on a best-effort basis.
					<Cite ids={["dbz-monitoring"]} />
				</p>
				<p>
					Every Driftbase pipeline reports end-to-end lag, slot size and per-sink error rates, and exports
					them to Prometheus and Datadog.
					<Cite ids={["db-home"]} /> A self-hosted pipeline serves Prometheus metrics on an address you set.
					<Cite ids={["db-metrics"]} />
				</p>

				<h3>Ordering</h3>
				<p>
					Debezium keeps all events within a topic totally ordered, and resumes in commit order after
					maintenance.
					<Cite ids={["dbz-faq-order", "dbz-home"]} /> Driftbase applies changes to your search index and
					cache in commit order.
					<Cite ids={["db-intro"]} /> For caches, changes to the same key are applied in commit order and
					changes to different keys in parallel.
					<Cite ids={["db-redis"]} />
				</p>

				<h3>What you operate</h3>
				<p>
					Debezium is most commonly deployed on Kafka Connect.
					<Cite ids={["dbz-arch"]} /> In that setup a cluster of Kafka brokers holds the events that
					applications consume.
					<Cite ids={["dbz-faq-kafka"]} /> Debezium Server, and the Debezium engine embedded in a Java
					application, run without Kafka.
					<Cite ids={["dbz-server", "dbz-arch"]} />
				</p>
				<p>
					Driftbase is one static binary. Run the Apache-2.0 <code>drift</code> CLI on your own
					infrastructure, or let Driftbase Cloud run the same binary for you.
					<Cite ids={["db-intro"]} /> A self-hosted pipeline that isn’t connected to Driftbase Cloud is never
					metered, and the hosted Free plan covers 1,000,000 change events a month.
					<Cite ids={["db-limits", "db-pricing"]} />
				</p>
			</section>

			<section
				id="where-debezium-fits"
				className={`${page.prose} ${styles.section} ${styles.text}`}
				aria-labelledby="debezium-fit"
			>
				<h2 id="debezium-fit">Where Debezium is the better fit</h2>
				<ul>
					<li>
						<strong>More than one kind of database.</strong> Debezium has a growing library of source
						connectors, and each produces change events with very similar structures.
						<Cite ids={["dbz-sources"]} /> Driftbase reads Postgres and nothing else.
					</li>
					<li>
						<strong>Kafka is already your backbone.</strong> Debezium’s connectors are Kafka Connect source
						connectors, so changes land in topics any number of services can consume.
						<Cite ids={["dbz-faq-connect", "dbz-faq-kafka"]} /> Driftbase is not a general-purpose streaming
						platform; it delivers to search indexes and caches, not to a message bus.
					</li>
					<li>
						<strong>Events rather than documents.</strong> Audit logs, streaming queries and propagating data
						between microservices with the outbox pattern are all uses Debezium names for its events.
						<Cite ids={["dbz-faq-uses"]} />
					</li>
					<li>
						<strong>Brokers and streams as destinations.</strong> Debezium Server sends to Kinesis, Pub/Sub,
						Pulsar, Redis, RabbitMQ, NATS and more.
						<Cite ids={["dbz-home"]} />
					</li>
					<li>
						<strong>Maturity and community.</strong> Debezium is an open-source project hosted by the
						Commonhaus Foundation, and its site lists teams around the world running it against their
						busiest databases.
						<Cite ids={["dbz-faq-license", "dbz-home"]} />
					</li>
				</ul>

				<h2>What Driftbase is not</h2>
				<p>
					To keep the comparison honest: Driftbase reads Postgres and only Postgres. It is not a
					general-purpose streaming platform like Kafka, not a batch ETL or reindex job, not a search engine,
					and not a Postgres extension. It is the pipe between Postgres and the search indexes and caches
					that copy it.
				</p>
			</section>

			<section className={styles.closer} aria-labelledby="next-step">
				<h2 id="next-step">Try it on your own schema.</h2>
				<p>
					Getting started takes about ten minutes: turn on logical replication, describe a pipeline in{" "}
					<code>driftbase.toml</code> and run <code>drift sync</code>. The Free plan covers 1,000,000 change
					events a month with no card.
				</p>
				<div className={styles.actions}>
					<a className={styles.button} href={`${company.docsUrl}/getting-started`}>
						Read the getting started guide
					</a>
					<a className={styles.button} href={company.appUrl}>
						Create a free workspace
					</a>
				</div>
				<p className={styles.more}>
					Or read <Link href="/blog/why-we-read-the-wal">why we read the WAL instead of using triggers</Link>.
				</p>
			</section>

			<section className={`${styles.section} ${styles.text}`} aria-labelledby="sources">
				<h2 id="sources">Sources</h2>
				<h3 className={styles.sourceGroup}>Debezium documentation</h3>
				<SourceList sources={debeziumSources} />
				<h3 className={styles.sourceGroup}>Driftbase documentation and site</h3>
				<SourceList sources={driftbaseSources} />
			</section>
		</div>
	);
}
