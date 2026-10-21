---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports faceting by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Keep them in a `settings.json`:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["searchable(tags)", "author"],
  "customRanking": ["desc(published_at)"]
}
```

Apply them once with the [Algolia CLI](https://www.algolia.com/doc/tools/cli/), or paste the
same values into the index's configuration in the Algolia dashboard:

```sh
algolia settings import articles -F settings.json
```

`customRanking` sorts numerically, so the pipeline below sends `published_at` as a Unix
timestamp rather than a date string.

## Configure the source

The source is the Postgres database Driftbase reads changes from. It needs `wal_level = logical`
and a role with the `REPLICATION` attribute. See the [configuration reference](/configuration#sources)
for every option.

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Configure the sink and pipeline

Driftbase needs your Algolia application ID and an API key with write access to the index.
Read both from the environment instead of committing them:

```toml
[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"
batch_size = 500

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

The document ID column, `id` here, becomes each record's `objectID`, so a change to a row
replaces its record instead of adding a new one. Renaming a tag updates every article that
carries it, and changing a user’s display name updates all of their articles.

Algolia limits the size of a single record. If long `body` values hit that limit, send a
trimmed excerpt instead of the full text.

## Handle deletes

Deleting a row from `articles` deletes its record from the index. This is the default,
`on_delete = "delete"`.

The `WHERE a.published_at IS NOT NULL` clause matters too. When an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record from the
index just as it would for a `DELETE`.

If you would rather keep deleted records and hide them at query time, set `on_delete = "soft"`
on the pipeline. Driftbase then sets `_deleted: true` on the record instead of removing it. Add
`filterOnly(_deleted)` to `attributesForFaceting` and search with the filter `NOT _deleted:true`.

## Backfill existing rows

`drift sync` backfills the rows that already exist the first time the pipeline starts, while
live changes keep streaming. After changing the query or the columns it returns, run a
backfill yourself so every record picks up the new shape:

```sh
drift backfill --pipeline articles
```

Backfills can be paused, resumed and throttled, or read from a replica to keep load off your
primary. See [Run a backfill](/guides/backfills).

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Algolia indexes asynchronously, so a record can take a moment to become searchable
after Driftbase reports it written.
