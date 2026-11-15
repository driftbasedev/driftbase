---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, the source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Keep them in a file such as `algolia/articles.settings.json`:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["filterOnly(tags)", "author"],
  "customRanking": ["desc(published_at_ts)"]
}
```

Apply it once from the Algolia dashboard or with any Algolia API client, using a key that can
edit settings. Algolia ranks on numbers rather than dates, which is why the query below sends
`published_at_ts` as a Unix timestamp.

## Define the source and sink

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/blog"

[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"
```

The source role needs the `REPLICATION` attribute and the database must run with
`wal_level = logical`. See the [configuration reference](/configuration) for every source and
sink option.

## Define the pipeline

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "articles"
query = """
SELECT a.id, a.title, a.body, a.published_at,
       extract(epoch FROM a.published_at)::bigint AS published_at_ts,
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

[How Driftbase maps the document ID column to each Algolia record's `objectID`.]

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles.

## Handle deletes

A `DELETE` on `articles` removes the record from the index. Set `on_delete = "soft"` on the
pipeline to keep the record and set `_deleted: true` instead, then filter it out at query time.

The `WHERE a.published_at IS NOT NULL` clause matters too. When an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record from the
index just as it would for a `DELETE`.

## Backfill existing rows

`drift sync` backfills the rows already in `articles` the first time the pipeline starts. Run
one yourself after changing the query or the columns you send:

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
