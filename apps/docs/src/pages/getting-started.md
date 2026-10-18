---
layout: ../layouts/Doc.astro
title: Getting started
description: Connect a Postgres database to a search index with Driftbase in about ten minutes, from enabling logical replication to watching your first change arrive.
---

This walkthrough takes a Postgres database and a Meilisearch instance and keeps a
`products` index in sync with a `products` table. It takes about ten minutes.

You need:

- Postgres 12 or newer where you can change `wal_level` (RDS, Aurora, Cloud SQL, Neon,
  Supabase and self-managed all work).
- A search index or cache to write to. We use Meilisearch here.
- A Driftbase account. The Free plan includes 500,000 change events a month, one source
  database and up to three sinks, and doesn't ask for a card.

## 1. Install the CLI

```sh
brew install driftbasedev/tap/drift
drift --version
```

Other platforms are on the [install page](/install).

## 2. Turn on logical replication

Driftbase reads the write-ahead log, so Postgres must emit logical changes:

```sql
ALTER SYSTEM SET wal_level = logical;
-- restart Postgres, then:
CREATE ROLE driftbase WITH LOGIN REPLICATION PASSWORD '…';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO driftbase;
```

On RDS and Aurora set `rds.logical_replication = 1` in the parameter group instead of
`ALTER SYSTEM`.

## 3. Create a project

```sh
drift login
drift init
```

`drift init` asks for your connection string and writes a `driftbase.toml` in the current
directory:

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"

[sink.search]
type = "meilisearch"
url = "https://search.internal:7700"
api_key = "env:MEILI_MASTER_KEY"

[[pipeline]]
source = "main"
sink = "search"
table = "products"
index = "products"
```

## 4. Start syncing

```sh
drift sync
```

On the first run Driftbase creates the publication and the slot, backfills the existing
rows, then switches to streaming. Update a row in another terminal:

```sql
UPDATE products SET price_cents = 1899 WHERE id = 42;
```

and `drift sync` logs the change within a second:

```
12:04:11.203  main→search  products  UPDATE id=42  lsn=0/1A3F2C8  lag=184ms
```

## Next steps

- Shape documents with joins: see the [configuration reference](/configuration#pipeline-query).
- Deploy it: run `drift sync` in a container, or `drift deploy` to hand it to Driftbase Cloud.
