---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Keep them in a file such as `algolia/articles.settings.json`:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["searchable(tags)", "filterOnly(author)"],
  "customRanking": ["desc(published_at)"]
}
```

Apply them once to the `articles` index from the Algolia dashboard or your own deploy
tooling. `customRanking` only sorts numeric and boolean attributes, which is why the query
below sends `published_at` as a Unix timestamp.

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
`wal_level = logical`. See the [configuration reference](/configuration) for every source
option.

The API key needs write access to the index. Never put the key in `driftbase.toml` itself.

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

The `id` column becomes each record's `objectID`, so a change to an article replaces its
existing record instead of adding a duplicate. Renaming a tag updates every article that
carries it, and changing a user’s display name updates all of their articles.

## Handle deletes

A `DELETE` on `articles` removes the matching record from the index. Rows that leave the
query are handled the same way: when an article is unpublished, its row still exists but no
longer matches `WHERE a.published_at IS NOT NULL`, and Driftbase deletes the record.

To keep deleted records in the index and hide them at query time instead, set
`on_delete = "soft"` on the pipeline. Driftbase then sets `_deleted: true` on the record, and
your search requests should filter on it. Add `filterOnly(_deleted)` to
`attributesForFaceting` if you do this.

## Backfill existing rows

`drift sync` backfills the rows that already exist the first time the pipeline starts. After
changing the query or columns, run one yourself:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming while it runs. Alias swapping with `--swap-alias` is not
available for Algolia, so the backfill writes into the live index. See
[Run a backfill](/guides/backfills) for pausing, resuming and throttling.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows records written, current lag and the last applied LSN for each
pipeline. Algolia indexes asynchronously, so a record can take a moment to become searchable
after Driftbase reports it written.
