---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, the source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Set searchable attributes, facets and custom ranking once, in the Algolia
dashboard or with any Algolia API client:

```json
{
  "searchableAttributes": ["title", "author", "body"],
  "attributesForFaceting": ["filterOnly(tags)", "author"],
  "customRanking": ["desc(published_at)"]
}
```

Algolia ranks on numbers, not dates, so the pipeline below sends `published_at` as a Unix
timestamp.

## Configure the source

The source is the Postgres database Driftbase reads changes from. It must run with
`wal_level = logical`, and the role in `url` needs the `REPLICATION` attribute.

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/blog"
```

Driftbase creates the replication slot and publication on the first `drift sync`. See the
[configuration reference](/configuration) for every source option.

## Configure the sink and pipeline

Keep credentials out of the file: read your Algolia application ID and an API key with write
access to the index from the environment.

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

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles.

## Handle deletes

By default, deleting a row from `articles` deletes its record from the index.

The `WHERE a.published_at IS NOT NULL` clause matters too. When an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record from the
index just as it would for a `DELETE`.

To keep deleted records in the index instead, set `on_delete = "soft"` on the pipeline.
Driftbase then sets `_deleted: true` on the record rather than removing it. Add
`filterOnly(_deleted)` to `attributesForFaceting` and filter it out at query time with
`NOT _deleted:true`.

## Backfill existing rows

`drift sync` backfills the rows already in `articles` the first time the pipeline starts, while
live changes keep streaming. After changing the pipeline's query or columns, run a backfill
yourself:

```sh
drift backfill --pipeline articles
```

See [Run a backfill](/guides/backfills) to pause, resume or throttle it.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows records written, current lag and the last applied LSN for each pipeline.
Algolia indexes asynchronously, so a record can take a moment to become searchable after
Driftbase reports it written.
