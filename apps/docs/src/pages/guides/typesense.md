---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, from creating the collection schema to handling deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection, removes documents
when rows are deleted, and copies in the rows that already exist.

## Create the collection schema first

Driftbase writes documents but leaves the collection schema to you, so it lives in version
control next to your app. Typesense needs the schema before any document arrives:

```sh
curl -X POST "$TYPESENSE_URL/collections" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "products",
    "fields": [
      {"name": "name", "type": "string"},
      {"name": "category", "type": "string", "facet": true},
      {"name": "price_cents", "type": "int32"},
      {"name": "updated_at", "type": "int64"}
    ],
    "default_sorting_field": "updated_at"
  }'
```

Typesense stores document IDs as strings and has no timestamp type, so the pipeline below casts
`id` to text and sends `updated_at` as Unix seconds.

## Define the source and sink

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"

[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_ADMIN_KEY"

[[pipeline]]
source = "main"
sink = "search"
index = "products"
query = """
SELECT p.id::text AS id, p.name, p.category, p.price_cents,
       extract(epoch FROM p.updated_at)::bigint AS updated_at
FROM products p
WHERE p.archived_at IS NULL
"""
```

The source role needs the `REPLICATION` attribute and the database must run with
`wal_level = logical`. The API key needs write access to the `products` collection. See the
[configuration reference](/configuration) for every source and sink option.

## Handle deletes

By default, deleting a row deletes its document from the collection. A row that stops matching
the query is treated the same way: when a product is archived, the `WHERE p.archived_at IS NULL`
clause no longer matches it and Driftbase removes the document.

To keep deleted documents and hide them at search time instead, set `on_delete = "soft"` on
the pipeline. Driftbase then sets `_deleted: true` on the document rather than removing it.
Add the field to the collection schema so Typesense keeps it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

Then filter it out in searches with `filter_by=_deleted:!=true`.

## Backfill existing rows

`drift sync` backfills the existing rows the first time the pipeline starts, while live changes
keep streaming:

```sh
drift sync --pipeline products
drift status
```

After changing the query or the collection schema, rebuild into a fresh collection and swap a
Typesense alias when it finishes, so searches never hit a half-built collection:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

This only helps if your app searches through the `products` alias rather than a collection
name. The
[backfills guide](/guides/backfills) covers pausing, resuming and throttling a backfill.
