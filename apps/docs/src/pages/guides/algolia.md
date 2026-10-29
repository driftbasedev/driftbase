---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports faceting by tag and author.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Set searchable attributes and facets once, from the Algolia dashboard or
the settings API, using your admin API key:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["tags", "author"]
}
```

## Configure the source

The source is the Postgres database Driftbase reads changes from. It must run with
`wal_level = logical`, and the role in `url` needs the `REPLICATION` attribute.

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Configure the sink and pipeline

Keep your Algolia credentials out of `driftbase.toml` and read them from the environment with
the `env:` prefix.

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
SELECT a.id, a.title, a.body, a.published_at,
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

[Confirm the Algolia sink's config keys: `type = "algolia"` and `app_id`, alongside `api_key`]

[How Driftbase sets each record's Algolia `objectID`, for example from the `id` column]

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles. See the [configuration reference](/configuration) for every
source, sink and pipeline option.

## Handle deletes

When a row is deleted in Postgres, Driftbase deletes the matching record from the index. The
`WHERE a.published_at IS NOT NULL` clause matters too: when an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record just as it
would for a `DELETE`.

To keep deleted rows in the index instead, set `on_delete = "soft"` on the pipeline.
Driftbase then sets `_deleted: true` on the record, and you filter those records out at
query time.

## Backfill existing rows

`drift sync` backfills the rows that already exist the first time a pipeline starts. After
changing the pipeline's query or columns, run one yourself:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming during the backfill. See [Run a backfill](/guides/backfills) to
pause, resume or throttle it.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline.
