---
layout: ../../layouts/Doc.astro
title: Sync to Typesense
description: Keep a Typesense collection in sync with a Postgres table using Driftbase, from creating the collection schema to handling deletes and backfilling existing rows.
---

This guide syncs a `products` table into a Typesense `products` collection that supports
filtering by category and sorting by price.

## Create the collection schema first

Driftbase writes documents but leaves the collection schema to you, so it lives in version
control next to your app. Typesense needs a schema before it accepts documents, and its `id`
field is always a string:

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
      {"name": "price_cents", "type": "int32"},
      {"name": "updated_at", "type": "int64"}
    ],
    "default_sorting_field": "updated_at"
  }'
```

Typesense has no date type, so timestamps are stored as Unix seconds.

## Define the source and sink

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"

[sink.search]
type = "typesense"
url = "env:TYPESENSE_URL"
api_key = "env:TYPESENSE_ADMIN_KEY"
batch_size = 500
```

The API key needs write access to the `products` collection. Driftbase writes through the
Typesense import endpoint, `batch_size` documents per request.

## Define the pipeline

Use a `query` so each document matches the collection schema:

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
"""
```

Casting `id` to text matches the string `id` Typesense expects. Renaming a category now
updates every product in it.

## Handling deletes

With the default `on_delete = "delete"`, a `DELETE` on `products` removes the document from
the collection. A row that stops matching the query, for example because you add
`WHERE p.archived_at IS NULL` and a product is archived, is deleted from the collection the
same way.

To keep deleted documents and hide them at query time instead, use soft deletes:

```toml
on_delete = "soft"
```

Driftbase then sets `_deleted: true` on the document. Add the field to the collection schema
so you can filter on it:

```json
{"name": "_deleted", "type": "bool", "optional": true}
```

and search with `filter_by=_deleted:!=true`.

## Backfill existing rows

The first `drift sync` backfills the rows already in `products`, then switches to streaming:

```sh
drift sync --pipeline products
drift status
```

To change the schema later without serving a half-built collection, point the pipeline's
`index` at a Typesense alias, backfill into a new collection and swap the alias when it
finishes:

```sh
drift backfill --pipeline products --index products_v2 --swap-alias products
```

Create `products_v2` with the new schema before you run it. See
[Run a backfill](/guides/backfills) for pausing, resuming and throttling.
