---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, sink and pipeline config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Apply them once, from the Algolia dashboard or with any Algolia API client:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["filterOnly(tags)", "filterOnly(author)"],
  "customRanking": ["desc(published_at)"]
}
```

Algolia ranks on numbers, so the pipeline below sends `published_at` as a Unix timestamp.

## Define the source and sink

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/blog"

[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"
```

Driftbase needs an admin key, or another key with write access to the index. Keep it in the
environment and never commit it.

## Define the pipeline

```toml
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

When a row is deleted, Driftbase deletes its record from the index. The `WHERE
a.published_at IS NOT NULL` clause matters too: when an article is unpublished, its row still
exists but no longer matches the query, and Driftbase deletes the record just as it would for
a `DELETE`.

To keep deleted records in the index instead, set `on_delete = "soft"` on the pipeline.
Driftbase then sets `_deleted: true` on the record, and you filter it out at query time.

## Backfill existing rows

`drift sync` backfills the rows that already exist the first time the pipeline starts. After
changing the pipeline's query or columns, run one yourself:

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
