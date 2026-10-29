---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, the source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Apply these once, from the Algolia dashboard or with an Algolia API client:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["filterOnly(tags)", "filterOnly(author)"],
  "customRanking": ["desc(published_at)"]
}
```

Algolia ranks on numbers, so the pipeline below sends `published_at` as a Unix timestamp.

## Define the source

The source is the Postgres database Driftbase reads changes from. It needs a role with the
`REPLICATION` attribute and `wal_level = logical`:

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"
```

See the [configuration reference](/configuration) for the slot, publication and TLS options.

## Define the sink and pipeline

```toml
[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"

[[pipeline]]
source = "main"
sink = "search"
index = "articles"
query = """
SELECT a.id, a.title, a.body,
       extract(epoch FROM a.published_at)::bigint AS published_at,
       u.display_name AS author,
       coalesce(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
FROM articles a
JOIN users u ON u.id = a.author_id
LEFT JOIN article_tags at ON at.article_id = a.id
LEFT JOIN tags t ON t.id = at.tag_id
WHERE a.published_at IS NOT NULL
GROUP BY a.id, u.display_name
"""
```

[Confirm the Algolia sink's `type` value and key names (`app_id`, `api_key`)]

Keep the admin key in the environment, never in `driftbase.toml`. The document ID column is
`id` here. [How Driftbase maps the document ID to Algolia's `objectID`]

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles.

## Handle deletes

When a row is deleted, Driftbase deletes the matching record from the index. The same happens
when a row leaves the query: the `WHERE a.published_at IS NOT NULL` clause means an
unpublished article still exists in Postgres but no longer matches, so its record is removed
just as it would be for a `DELETE`.

To keep deleted records in the index and filter them out at query time instead, set
`on_delete = "soft"` on the pipeline. Driftbase then sets `_deleted: true` on the record.

## Backfill existing rows

The first `drift sync` backfills every row the query already matches, then streams live
changes. After changing the query or the index settings, run a backfill yourself:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming while it runs. See [Run a backfill](/guides/backfills) for
pausing, resuming and throttling.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Algolia indexes asynchronously, so a record can take a moment to become searchable
after Driftbase reports it written.
