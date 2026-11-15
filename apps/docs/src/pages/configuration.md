---
layout: ../layouts/Doc.astro
title: Configuration reference
description: Every option in driftbase.toml, the configuration file for drift pipelines, covering sources, sinks, pipelines, queries, deletes and environment variables.
---

A project is configured by one `driftbase.toml` file. `drift` looks for it in the current
directory, or wherever `--config` / `DRIFT_CONFIG` points. Any string value can read from the
environment with the `env:` prefix, for example `api_key = "env:MEILI_MASTER_KEY"`.

## Sources

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"
slot = "driftbase_main"
publication = "driftbase_main"
```

| Key           | Default             | Description                                                    |
| ------------- | ------------------- | -------------------------------------------------------------- |
| `url`         | (required)          | Connection string for a role with the `REPLICATION` attribute. |
| `slot`        | `driftbase_<name>`  | Replication slot name. Created on first `drift sync`.          |
| `publication` | `driftbase_<name>`  | Publication name. Driftbase adds pipeline tables to it.        |
| `max_slot_mb` | `10240`             | Alert when retained WAL for the slot exceeds this size.        |
| `tls`         | `"prefer"`          | `disable`, `prefer`, `require` or `verify-full`.               |

The source database must run with `wal_level = logical`, otherwise Driftbase cannot receive
changes and `drift sync` exits with `E102: wal_level is replica`.

## Sinks

```toml
[sink.search]
type = "meilisearch"
url = "https://search.internal:7700"
api_key = "env:MEILI_MASTER_KEY"
batch_size = 500
```

| Key          | Applies to      | Description                                                                 |
| ------------ | --------------- | --------------------------------------------------------------------------- |
| `type`       | all             | `elasticsearch`, `opensearch`, `meilisearch`, `typesense`, `redis`, `valkey` |
| `url`        | all             | Endpoint of the sink.                                                       |
| `api_key`    | search sinks    | API key with write access to the target index.                              |
| `batch_size` | search sinks    | Documents per bulk request. Default `500`.                                  |
| `key_prefix` | `redis`, `valkey` | Prepended to every key, for example `"shop:"`.                            |

## Pipelines

Each `[[pipeline]]` block connects one source to one sink.

```toml
[[pipeline]]
source = "main"
sink = "search"
table = "products"
index = "products"
columns = ["id", "name", "price_cents", "updated_at"]
on_delete = "delete"
```

| Key         | Default     | Description                                                              |
| ----------- | ----------- | ------------------------------------------------------------------------ |
| `table`     | —           | Read one table as is. Use `table` or `query`, not both.                  |
| `query`     | —           | Shape documents with SQL. See below.                                     |
| `index`     | table name  | Index, collection or key pattern in the sink.                            |
| `id`        | primary key | Column used as the document ID.                                          |
| `columns`   | all         | Only send these columns.                                                 |
| `redact`    | none        | Columns to drop (`"drop"`) or hash (`"sha256"`) before sending.          |
| `on_delete` | `"delete"`  | `delete` removes the document; `soft` sets `_deleted: true` instead.     |

### Pipeline query

Use `query` to join tables and nest child rows. Driftbase finds every table the query reads
and re-renders the affected parent documents when any of them changes.

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "orders"
query = """
SELECT o.id, o.status, o.placed_at, c.email AS customer_email,
       json_agg(json_build_object('sku', i.sku, 'qty', i.qty)) AS items
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
GROUP BY o.id, c.email
"""
```

The query must return the document ID column and must be deterministic: no `now()`, no
`random()`.

## Environment variables

| Variable          | Description                                         |
| ----------------- | --------------------------------------------------- |
| `DRIFT_CONFIG`    | Path to `driftbase.toml`.                           |
| `DRIFT_TOKEN`     | API token for Driftbase Cloud, instead of `drift login`. |
| `DRIFT_LOG`       | `error`, `warn`, `info` (default) or `debug`.       |
| `DRIFT_METRICS_ADDR` | Serve Prometheus metrics, for example `:9464`.   |
