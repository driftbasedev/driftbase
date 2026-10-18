---
layout: ../../layouts/Doc.astro
title: Run a backfill
description: Copy existing Postgres rows into a new or rebuilt index with drift backfill while live changes keep streaming, and pause, resume or throttle it safely.
---

A backfill copies rows that already exist into a sink. `drift sync` runs one automatically the
first time a pipeline starts. Run one yourself after changing a pipeline's query or columns,
or to rebuild an index from scratch.

```sh
drift backfill --pipeline orders
```

Live changes keep streaming during the backfill, and a live change to a row always wins over
the backfilled copy of that row. Backfilled rows are not metered.

## Rebuild into a fresh index

To change a search mapping without serving a half-built index, backfill into a new index and
swap an alias when it finishes:

```sh
drift backfill --pipeline orders --index orders_v2 --swap-alias orders
```

Supported for Elasticsearch, OpenSearch and Typesense (aliases) and Meilisearch (index swap).

## Pause and resume

```sh
drift backfill pause --pipeline orders
drift backfill resume --pipeline orders
```

The keyset cursor is saved after every chunk, so a backfill also survives a restart or a
deploy.

## Throttle

| Flag                     | Default | Description                                      |
| ------------------------ | ------- | ------------------------------------------------ |
| `--chunk-size`           | `5000`  | Rows per keyset query.                           |
| `--max-rows-per-second`  | none    | Upper bound on read rate.                        |
| `--read-from`            | source  | A read replica URL to backfill from instead.     |

Backfilling from a replica keeps the read load off your primary. Driftbase waits for the
replica to catch up past each chunk's watermark before emitting it.
