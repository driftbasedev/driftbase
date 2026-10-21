---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, from the collection schema and pipeline config to handling deletes and backfilling existing rows.
---

This guide syncs a `products` table, with its category name, into a Typesense `products`
collection that supports filtering by category and sorting by price.

## Create the collection schema first

Typesense needs a schema before it accepts documents, and Driftbase leaves collection settings
to you so they live in version control next to your app. Create a versioned collection once:

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

Typesense document IDs are strings and it has no timestamp type, so the pipeline query below
casts `id` to text and sends `updated_at` as a Unix timestamp.

Then point a `products` alias at it. Your app and Driftbase both use the alias, which lets you
rebuild into a new collection later without changing either:

```sh
curl -X PUT "$TYPESENSE_URL/aliases/products" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{"collection_name": "products_v1"}'
```

## Define the source and sink

The source is the Postgres database Driftbase reads changes from, and the sink is your
Typesense cluster. Use an API key that can write to the collection:

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
`wal_level = logical`. See [Getting started](/getting-started#2-turn-on-logical-replication)
and the [configuration reference](/configuration#sources) for every option.

## Define the pipeline

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "products"
query = """
SELECT p.id::text AS id, p.name, p.description, p.price_cents,
       extract(epoch FROM p.updated_at)::bigint AS updated_at,
       c.name AS category
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.archived_at IS NULL
"""
```

`index` is the Typesense collection or alias to write to. Renaming a category now updates every
product in it, because Driftbase re-renders the affected documents when any table in the query
changes.

## Handle deletes

By default `on_delete = "delete"`: when a row is deleted in Postgres, Driftbase deletes the
document with the same ID from the collection.

Rows that stop matching the query are treated the same way. When a product is archived, its
row still exists but no longer matches `WHERE p.archived_at IS NULL`, so Driftbase deletes the
document just as it would for a `DELETE`.

To keep deleted documents and hide them at query time instead, set `on_delete = "soft"`.
Driftbase then sets `_deleted: true` on the document. Add the field to the collection schema so
you can filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and search with `filter_by=_deleted:!=true`.

## Backfill existing rows

The first time you run `drift sync`, Driftbase backfills the rows already in the table, then
switches to streaming:

```sh
drift sync --pipeline products
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline.

After changing the query or the collection schema, rebuild into a fresh collection and swap the
alias when it finishes, so searches never hit a half-built collection:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

Create `products_v2` with the new schema before you run this. See
[Run a backfill](/guides/backfills) for pausing, resuming and throttling a backfill.
