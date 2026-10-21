---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports faceting by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Keep them in a file such as `algolia/articles.settings.json`:

```json
{
  "searchableAttributes": ["title", "body", "author", "tags"],
  "attributesForFaceting": ["searchable(tags)", "author"],
  "customRanking": ["desc(published_at)"]
}
```

Apply it once with the [Algolia CLI](https://www.algolia.com/doc/tools/cli/get-started/overview/),
or paste the same values into the index configuration in the Algolia dashboard:

```sh
algolia settings import articles -F algolia/articles.settings.json
```

Algolia ranks on numbers, not timestamps, so the pipeline below sends `published_at` as a Unix
timestamp.

## Define the source

The source is the Postgres database Driftbase reads changes from. It needs a role with the
`REPLICATION` attribute and `wal_level = logical`; see [Configuration](/configuration#sources).

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Define the sink and pipeline

Use an Admin API key, or any key with write access to the index. Read both values from the
environment rather than committing them.

```toml
[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"

[[pipeline]]
source = "main"
sink = "search"
index = "articles"
id = "id"
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

The `id` column becomes each record's Algolia `objectID`. Renaming a tag now updates every
article that carries it, and changing a user’s display name updates all of their articles.

Algolia rejects records larger than your plan's size limit. If article bodies are long, send
a truncated excerpt instead of the full `body`.

## Handling deletes

With the default `on_delete = "delete"`, deleting a row in Postgres deletes the record with
the same `objectID` from the index.

The `WHERE a.published_at IS NOT NULL` clause matters too. When an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record from the
index just as it would for a `DELETE`.

To keep deleted records in the index instead, set `on_delete = "soft"`. Driftbase then sets
`_deleted: true` on the record, so add `"_deleted"` to `attributesForFaceting` and search with
the filter `NOT _deleted:true`.

## Backfill existing rows

`drift sync` backfills the rows already in `articles` the first time the pipeline starts.
After changing the query or the columns, run one yourself:

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

`drift status` shows records written, current lag and the last applied LSN for each pipeline.
Algolia indexes asynchronously, so a record can take a moment to become searchable after
Driftbase reports it written.
