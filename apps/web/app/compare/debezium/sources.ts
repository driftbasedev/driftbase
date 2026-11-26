import { company } from "@driftbase/brand";

export type Source = {
	key: string;
	title: string;
	url: string;
	quotes: string[];
};

const dbz = "https://debezium.io/documentation/reference/stable";
const docs = company.docsUrl;
const web = company.webUrl;

export const debeziumSources: Source[] = [
	{
		key: "dbz-pg",
		title: "Debezium connector for PostgreSQL: overview",
		url: `${dbz}/connectors/postgresql.html#postgresql-overview`,
		quotes: [
			"The connector produces a change event for every row-level insert, update, and delete operation that was captured and sends change event records for each table in a separate Kafka topic.",
			"decoderbufs: Decoding plug-in that is based on Protobuf and maintained by the Debezium community.",
			"pgoutput: The standard logical decoding output plug-in in PostgreSQL 10+. It is maintained by the PostgreSQL community, and used by PostgreSQL itself for logical replication. This plug-in is always present so no additional libraries need to be installed.",
		],
	},
	{
		key: "dbz-incremental",
		title: "Debezium connector for PostgreSQL: incremental snapshots",
		url: `${dbz}/connectors/postgresql.html#postgresql-incremental-snapshots`,
		quotes: [
			"Incremental snapshots rely on the Debezium mechanism for sending signals to a Debezium connector.",
			"You can run incremental snapshots in parallel with streamed data capture, instead of postponing streaming until the snapshot completes.",
		],
	},
	{
		key: "dbz-wal",
		title: "Debezium connector for PostgreSQL: WAL disk space consumption",
		url: `${dbz}/connectors/postgresql.html#postgresql-wal-disk-space`,
		quotes: [
			"In certain cases, it is possible for PostgreSQL disk space consumed by WAL files to spike or increase out of usual proportions.",
		],
	},
	{
		key: "dbz-pg-metrics",
		title: "Debezium connector for PostgreSQL: monitoring",
		url: `${dbz}/connectors/postgresql.html#postgresql-monitoring`,
		quotes: [
			"The Debezium PostgreSQL connector provides two types of metrics that are in addition to the built-in support for JMX metrics that Kafka and Kafka Connect provide.",
		],
	},
	{
		key: "dbz-monitoring",
		title: "Debezium monitoring: using Prometheus and Grafana",
		url: `${dbz}/operations/monitoring.html#using-prometheus-grafana`,
		quotes: [
			"The metrics exposed by Debezium and Kafka can be exported and displayed with Prometheus and Grafana.",
			"These dashboards are not part of Debezium itself and are maintained on a best-effort basis.",
		],
	},
	{
		key: "dbz-arch",
		title: "Debezium architecture",
		url: `${dbz}/architecture.html`,
		quotes: [
			"Most commonly, you deploy Debezium by means of Apache Kafka Connect.",
			"After change event records are in Apache Kafka, different connectors in the Kafka Connect ecosystem can stream the records to other systems and databases such as Elasticsearch, data warehouses and analytics systems, or caches such as Infinispan.",
			"The Debezium server is a configurable, ready-to-use application that streams change events from a source database to a variety of messaging infrastructures.",
			"In this case, Debezium will not be run via Kafka Connect, but as a library embedded into your custom Java applications.",
		],
	},
	{
		key: "dbz-server",
		title: "Debezium Server",
		url: `${dbz}/operations/debezium-server.html`,
		quotes: [
			"Debezium Server is a ready-to-use application that streams change events from a source database directly to messaging and storage systems without requiring Apache Kafka.",
			"Redis (Stream): The Redis sink stores change events as entries in a Redis stream, supporting both single-instance and cluster deployments.",
		],
	},
	{
		key: "dbz-sources",
		title: "Debezium source connectors",
		url: `${dbz}/connectors/index.html`,
		quotes: [
			"Debezium provides a growing library of source connectors that capture changes from a variety of database management systems.",
			"Each connector produces change events with very similar structures, making it easy for your applications to consume and respond to events, regardless of their origin.",
		],
	},
	{
		key: "dbz-faq-license",
		title: "Debezium FAQ: who governs Debezium, and how is it licensed?",
		url: "https://debezium.io/documentation/faq/#who_governs_debezium_and_how_is_it_licensed",
		quotes: [
			"Debezium is an open source project hosted by the Commonhaus Foundation. The code is licensed under the Apache License 2.0",
		],
	},
	{
		key: "dbz-faq-order",
		title: "Debezium FAQ: how are events for a database organized?",
		url: "https://debezium.io/documentation/faq/#how_are_events_for_a_database_organized",
		quotes: [
			"Most connectors will record all events for a single database table to a single topic. Additionally, all events within a topic are totally-ordered, meaning that the order of all of those events will be maintained.",
		],
	},
	{
		key: "dbz-faq-uses",
		title: "Debezium FAQ: what are some uses of Debezium?",
		url: "https://debezium.io/documentation/faq/#what_are_some_uses_of_debezium",
		quotes: [
			"They might update a derived data store with the same information or with information computed from the changing data, such as with Command Query Responsibility Separation (CQRS).",
			"They might be stored to form an audit log. They might drive streaming queries e.g. with Apache Flink or Kafka Streams. They might be used to propagate data between microservices, e.g. employing the outbox pattern.",
		],
	},
	{
		key: "dbz-faq-kafka",
		title: "Debezium FAQ: what does a Kafka deployment of Debezium look like?",
		url: "https://debezium.io/documentation/faq/#what_does_a_kafka_deployment_of_debezium_look_like",
		quotes: [
			"A cluster of Apache Kafka brokers provides the persistent, replicated, and partitioned transaction logs where Debezium records all events and from which applications consume all events.",
		],
	},
	{
		key: "dbz-faq-connect",
		title: "Debezium FAQ: what is Kafka Connect?",
		url: "https://debezium.io/documentation/faq/#what_is_kafka_connect",
		quotes: [
			"All of Debezium’s connectors are Kafka Connector source connectors, and as such they can be deployed and managed using the Kafka Connect service.",
		],
	},
	{
		key: "dbz-home",
		title: "debezium.io",
		url: "https://debezium.io/",
		quotes: [
			"Take services down for maintenance and Debezium resumes exactly where it left off, in commit order, without dropping an event.",
			"Sinks to Kinesis, Pub/Sub, Pulsar, Redis, RabbitMQ, NATS and more",
			"Development … 3.8.0.Alpha2 New Elasticsearch sink connector",
			"Teams around the world run Debezium against their busiest databases.",
		],
	},
];

export const driftbaseSources: Source[] = [
	{
		key: "db-home",
		title: "Driftbase home page",
		url: `${web}/`,
		quotes: [
			"Driftbase attaches to a logical replication slot with the built-in pgoutput plugin. No triggers, no extension to install, no extra load on your hot tables.",
			"Every pipeline reports end-to-end lag, slot size and per-sink error rates, and exports them to Prometheus and Datadog.",
		],
	},
	{
		key: "db-intro",
		title: "Driftbase docs: introduction",
		url: `${docs}/`,
		quotes: [
			"It reads committed changes from Postgres logical replication and applies them, in commit order, to search indexes and caches: Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey.",
			"You can run it two ways, and they use the same binary",
			"The drift CLI, on your own infrastructure. Apache-2.0, a single static binary, no runtime dependencies.",
			"Driftbase Cloud, where we run the pipeline for you",
		],
	},
	{
		key: "db-query",
		title: "Driftbase docs: pipeline query",
		url: `${docs}/configuration#pipeline-query`,
		quotes: [
			"Use query to join tables and nest child rows. Driftbase finds every table the query reads and re-renders the affected parent documents when any of them changes.",
		],
	},
	{
		key: "db-backfill",
		title: "Driftbase docs: run a backfill",
		url: `${docs}/guides/backfills`,
		quotes: [
			"Live changes keep streaming during the backfill, and a live change to a row always wins over the backfilled copy of that row.",
			"To change a search mapping without serving a half-built index, backfill into a new index and swap an alias when it finishes",
			"The keyset cursor is saved after every chunk, so a backfill also survives a restart or a deploy.",
			"Backfilling from a replica keeps the read load off your primary.",
		],
	},
	{
		key: "db-metrics",
		title: "Driftbase docs: environment variables",
		url: `${docs}/configuration#environment-variables`,
		quotes: ["DRIFT_METRICS_ADDR: Serve Prometheus metrics, for example :9464."],
	},
	{
		key: "db-redis",
		title: "Driftbase docs: invalidate a Redis cache",
		url: `${docs}/guides/redis-cache`,
		quotes: [
			"Delete (default): on any change, delete the key. … Write-through: on any change, write the new value.",
			"Changes to the same key are applied in commit order. Changes to different keys are applied in parallel, up to 64 in flight per pipeline by default.",
		],
	},
	{
		key: "db-wal",
		title: "Why we read the WAL instead of using triggers",
		url: `${web}/blog/why-we-read-the-wal`,
		quotes: ["An unread slot keeps WAL on disk. Driftbase alerts on slot size …"],
	},
	{
		key: "db-limits",
		title: "Driftbase docs: plan limits and metering",
		url: `${docs}/limits`,
		quotes: ["A pipeline run with the CLI and not connected to Driftbase Cloud is never metered."],
	},
	{
		key: "db-pricing",
		title: "Driftbase pricing: Free plan",
		url: `${web}/pricing`,
		quotes: ["1,000,000 change events / month"],
	},
];

const order = [...debeziumSources, ...driftbaseSources].map((s) => s.key);

export function sourceNumber(key: string) {
	const n = order.indexOf(key);
	if (n === -1) throw new Error(`Unknown source: ${key}`);
	return n + 1;
}
