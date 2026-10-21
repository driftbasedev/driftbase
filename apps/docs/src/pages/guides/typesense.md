---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, covering the collection schema, source and sink config, deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
filtering by category and sorting by price.

## Create the collection schema first

Driftbase writes documents but leaves the collection schema to you, so it lives in version
control next to your app. Typesense needs to know each field's type up front:

```sh
curl -X POST "$TYPESENSE_URL/collections" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
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

Typesense document IDs are strings, and it has no timestamp type, so the pipeline query below
casts `id` to text and `updated_at` to Unix seconds.

## Configure the source and sink

```toml
[source.main]
url = "env:DATABASE_URL"

[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_ADMIN_KEY"
batch_size = 500
```

The source role needs the `REPLICATION` attribute and the database must run with
`wal_level = logical`. See the [configuration reference](/configuration#sources) for every
source and sink option.

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

`index` is the collection name. Renaming a category updates every product in it.

## Handle deletes

With the default `on_delete = "delete"`, deleting a row in Postgres deletes the matching
document from the collection. A row that still exists but no longer matches the query is
treated the same way: archiving a product sets `archived_at`, and Driftbase removes it from
Typesense.

To keep deleted documents and hide them at query time instead, use soft deletes:

```toml
[[pipeline]]
# ...
on_delete = "soft"
```

Driftbase then sets `_deleted: true` on the document. Add the field to the collection schema
so you can filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and search with `filter_by=_deleted:!=true`.

## Backfill existing rows

`drift sync` backfills the rows already in `products` the first time the pipeline starts, then
streams live changes:

```sh
drift sync --pipeline products
drift status
```

To change the schema later, create a new collection such as `products_v2` with the updated
fields, then backfill into it and swap the `products` alias when it finishes, so searches
never hit a half-built collection:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

Point your app at the `products` alias rather than the collection name. Pausing, resuming and
throttling are covered in [Run a backfill](/guides/backfills).
