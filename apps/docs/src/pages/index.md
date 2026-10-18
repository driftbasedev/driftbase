---
layout: ../layouts/Doc.astro
title: Introduction
description: Driftbase keeps search indexes and caches in sync with Postgres by reading logical replication. Learn how pipelines, sources and sinks fit together.
---

Driftbase keeps the copies of your data honest. It reads committed changes from Postgres
logical replication and applies them, in commit order, to search indexes and caches:
Elasticsearch, OpenSearch, Meilisearch, Typesense, Redis and Valkey.

You can run it two ways, and they use the same binary:

- **The `drift` CLI**, on your own infrastructure. Apache-2.0, a single static binary, no
  runtime dependencies.
- **Driftbase Cloud**, where we run the pipeline for you in `us-east-1`, `us-west-2`,
  `eu-central-1` or `ap-northeast-1`, with monitoring, alerts and a dashboard.

## How it fits together

A **source** is a Postgres database with `wal_level = logical`. Driftbase creates one
publication and one replication slot per source.

A **sink** is a destination: an index, a collection or a key space.

A **pipeline** connects one source to one sink. It says which tables to read, how to shape
each row into a document (a SQL query, a column list, or the table as is) and what to do on
delete.

```
postgres (orders, order_items) ──▶ drift ──▶ meilisearch: orders
                                        └──▶ redis: order:{id}
```

## Where to go next

- New here? [Getting started](/getting-started) takes about ten minutes.
- [Install the CLI](/install) on macOS, Linux, Windows or in Docker.
- Every option in `driftbase.toml` is in the [configuration reference](/configuration).
- Guides for [Meilisearch](/guides/meilisearch), [Redis caches](/guides/redis-cache) and
  [backfills](/guides/backfills).
