---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, including the collection schema, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
search by name, filtering by category and sorting by price.

## Create the collection schema first

Driftbase writes documents but leaves the collection schema to you, so it lives in version
control next to your app. Typesense needs every field you search, filter or sort on declared
up front:

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

curl -X PUT "$TYPESENSE_URL/aliases/products" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{"collection_name": "products_v1"}'
```

Pointing Driftbase at the `products` alias rather than the collection itself lets you rebuild
into a new collection later without downtime. See [Backfill existing rows](#backfill-existing-rows).

Typesense document IDs are strings and it has no timestamp type, so the pipeline query below
casts `id` to text and `updated_at` to Unix seconds.

## Configure the source

The source is the Postgres database Driftbase reads changes from. It must run with
`wal_level = logical`, and the role in `url` needs the `REPLICATION` attribute.

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Configure the sink and pipeline

```toml
[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_ADMIN_KEY"
batch_size = 500

[[pipeline]]
source = "main"
sink = "search"
index = "products"
query = """
SELECT p.id::text AS id, p.name, p.description, c.name AS category, p.price_cents,
       extract(epoch FROM p.updated_at)::bigint AS updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.archived_at IS NULL
"""
```

The API key needs write access to the collection behind the alias. Renaming a category now
updates every product in it. Every option is listed in the
[configuration reference](/configuration).

## Handle deletes

By default `on_delete = "delete"`: when a row is deleted, Driftbase deletes the document from
the collection. A row that still exists but no longer matches the query is treated the same
way, so archiving a product (`archived_at` set) removes it from search.

To keep deleted documents and hide them at query time instead, use soft deletes:

```toml
[[pipeline]]
# ...
on_delete = "soft"
```

Driftbase then sets `_deleted: true` on the document instead of removing it. Add
`{"name": "_deleted", "type": "bool", "optional": true}` to the collection's fields so you can
filter on it, and add `filter_by=_deleted:!=true` to your searches.

## Backfill existing rows

`drift sync` backfills the rows already in `products` the first time the pipeline starts, while
live changes keep streaming:

```sh
drift sync --pipeline products
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline.

When you change the schema or the pipeline query later, create a new collection
(`products_v2`) with the updated schema, then backfill into it and swap the alias when it
finishes:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

Searches keep hitting the old collection until the swap. The
[backfills guide](/guides/backfills) covers pausing, resuming and throttling a backfill.
