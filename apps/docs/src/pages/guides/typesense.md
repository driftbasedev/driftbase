---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, including the collection schema, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
search on name and description, filtering by category and sorting by price.

## Create the collection schema first

Typesense needs a schema before it accepts documents. Driftbase writes documents but leaves
the schema to you, so it lives in version control next to your app. Create the collection
once:

```sh
curl -X POST "$TYPESENSE_URL/collections" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "products",
    "fields": [
      {"name": "name", "type": "string"},
      {"name": "description", "type": "string", "optional": true},
      {"name": "category", "type": "string", "facet": true},
      {"name": "price_cents", "type": "int64"},
      {"name": "updated_at", "type": "int64"}
    ],
    "default_sorting_field": "price_cents"
  }'
```

Typesense document IDs are strings, and `int64` fields expect numbers, so the pipeline below
casts the ID to text and timestamps to Unix seconds.

## Define the source and sink

```toml
[source.main]
url = "env:DATABASE_URL"

[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_API_KEY"
batch_size = 500
```

The source role needs the `REPLICATION` attribute and the database must run with
`wal_level = logical`. The API key needs write access to the `products` collection. See the
[configuration reference](/configuration) for every source and sink option.

## Define the pipeline

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "products"
query = """
SELECT p.id::text AS id, p.name, p.description,
       c.name AS category,
       p.price_cents,
       extract(epoch FROM p.updated_at)::bigint AS updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.archived_at IS NULL
"""
```

For Typesense, `index` is the collection name. Renaming a category now updates every product
in it.

## Handle deletes

By default `on_delete = "delete"`, so deleting a row in Postgres deletes its document from the
collection. A row that still exists but no longer matches the query is treated the same way:
when a product is archived, the `WHERE p.archived_at IS NULL` clause drops it and Driftbase
deletes the document.

To keep deleted documents around instead, set `on_delete = "soft"`. Driftbase then sets
`_deleted: true` on the document rather than removing it. Add the field to the collection
schema so you can filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and exclude those documents at query time with `filter_by=_deleted:!=true`.

## Backfill existing rows

`drift sync` backfills the rows already in `products` the first time the pipeline starts,
while live changes keep streaming. After changing the query or the collection schema, run a
backfill yourself:

```sh
drift backfill --pipeline products
```

To rebuild without serving a half-built collection, backfill into a new collection and swap a
Typesense alias when it finishes. Create `products_v2` with the new schema first, then:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

See [Run a backfill](/guides/backfills) for pausing, resuming and throttling.

## Check it

```sh
drift sync --pipeline products
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline.
