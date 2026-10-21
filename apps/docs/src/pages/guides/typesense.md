---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, from creating the collection schema to handling deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
filtering by category and sorting by price.

## Create the collection schema first

Typesense needs a schema before it accepts documents, and Driftbase leaves collection schemas
to you so they live in version control next to your app. Create the collection once:

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

Then point a `products` alias at it, so you can rebuild into a new collection later without
changing your app or your pipeline:

```sh
curl -X PUT "$TYPESENSE_URL/aliases/products" \
  -H "X-TYPESENSE-API-KEY: $TYPESENSE_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  --data '{"collection_name": "products_v1"}'
```

Typesense has no date type, so timestamps are stored as Unix seconds in an `int64` field.

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
SELECT p.id::text AS id, p.name, p.description, p.price_cents,
       c.name AS category,
       extract(epoch FROM p.updated_at)::bigint AS updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.archived_at IS NULL
"""
```

The API key needs write access to the collection. `index` is the `products` alias, so writes
go to whichever collection it currently points at.

Typesense document IDs are strings, which is why the query casts `p.id` to text. Renaming a
category now updates every product in it. See the
[configuration reference](/configuration#pipeline-query) for more on shaping documents with SQL.

## Handle deletes

With the default `on_delete = "delete"`, deleting a row in Postgres deletes the matching
document from the collection.

The `WHERE p.archived_at IS NULL` clause matters too. When a product is archived, its row
still exists but no longer matches the query, and Driftbase deletes the document just as it
would for a `DELETE`.

If you would rather keep deleted documents and hide them at query time, use soft deletes:

```toml
[[pipeline]]
# ...
on_delete = "soft"
```

Driftbase then sets `_deleted: true` on the document instead of removing it. Add the field to
your collection schema so you can filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and search with `filter_by=_deleted:!=true`.

## Backfill existing rows

`drift sync` backfills the rows already in `products` the first time the pipeline starts,
while live changes keep streaming:

```sh
drift sync --pipeline products
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline.

When you change the schema or the pipeline query later, create a new collection with the new
schema and backfill into it, then swap the alias when it finishes:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

Search keeps serving the old collection until the new one is complete. See
[Run a backfill](/guides/backfills) for pausing, resuming and throttling backfills.
