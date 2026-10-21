---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, covering the collection schema, source and sink config, deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
filtering by category and sorting by price.

## Create the collection schema

Typesense needs a schema for each collection. Create it yourself before the first sync, so
the field types live in version control next to your app:

```sh
curl -X POST "$TYPESENSE_URL/collections" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "products_v1",
    "fields": [
      {"name": "name", "type": "string"},
      {"name": "description", "type": "string", "optional": true},
      {"name": "category", "type": "string", "facet": true},
      {"name": "price_cents", "type": "int32"},
      {"name": "updated_at", "type": "int64"}
    ],
    "default_sorting_field": "price_cents"
  }'
```

Then point a `products` alias at it. Driftbase and your app both use the alias, which lets you
rebuild the collection later without downtime:

```sh
curl -X PUT "$TYPESENSE_URL/aliases/products" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{"collection_name": "products_v1"}'
```

Typesense stores document IDs as strings and sorts on numbers, so the pipeline below casts
the ID to text and turns timestamps into Unix seconds.

## Configure the source and sink

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"

[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_ADMIN_KEY"
batch_size = 500
```

The source role needs the `REPLICATION` attribute and the database must run with
`wal_level = logical`. The API key needs write access to the collection. Every
option is in the [configuration reference](/configuration).

## Define the pipeline

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "products"
query = """
SELECT p.id::text AS id, p.name, p.description, c.name AS category,
       p.price_cents,
       extract(epoch FROM p.updated_at)::bigint AS updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.archived_at IS NULL
"""
```

Renaming a category updates every product in it, because Driftbase re-renders the affected
documents when any table the query reads changes.

## Handle deletes

By default, deleting a row deletes its document from the collection. A row that still exists
but no longer matches the query is treated the same way, so archiving a product above removes
it from search.

To keep deleted documents in the collection instead, set `on_delete = "soft"` on the pipeline.
Driftbase then sets `_deleted: true` on the document. Add the field to the schema so you can
filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and exclude those documents at query time with `filter_by=_deleted:!=true`.

## Backfill existing rows

`drift sync` backfills existing rows automatically the first time the pipeline starts, and
live changes keep streaming while it runs:

```sh
drift sync --pipeline products
drift status
```

After changing the schema or the pipeline query, rebuild into a fresh collection and swap the
`products` alias when it finishes, so searches never hit a half-built collection. Create
`products_v2` with the updated schema first, then run:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

See [Run a backfill](/guides/backfills) for pausing, resuming and throttling a backfill.
