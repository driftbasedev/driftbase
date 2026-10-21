---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag and ranks newer articles first.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Keep the settings in a file such as `algolia/articles.settings.json`:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["searchable(tags)", "author", "filterOnly(_deleted)"],
  "customRanking": ["desc(published_at_ts)"]
}
```

Apply them once to the `articles` index from the Algolia dashboard or with your usual Algolia
API client, using an admin API key. Algolia's custom ranking needs a number, which is why the
pipeline below sends the publish date as a Unix timestamp.

## Configure the source

The source is the Postgres database Driftbase reads changes from. It must run with
`wal_level = logical`, and the role in the connection string needs the `REPLICATION`
attribute.

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/shop"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Configure the sink

```toml
[sink.search]
type = "algolia"
app_id = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"
batch_size = 500
```

The `env:` prefix makes Driftbase read both values from the environment at startup, so set
those variables wherever `drift` runs and keep the admin key out of `driftbase.toml`.

## Define the pipeline

```toml
[[pipeline]]
source = "main"
sink = "search"
index = "articles"
id = "id"
query = """
SELECT a.id, a.title, a.body,
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

The `id` column becomes each record's `objectID`, so updates replace the existing record
instead of adding a new one. Renaming a tag now updates every article that carries it, and
changing a user’s display name updates all of their articles.

Algolia rejects records above your plan's size limit. If article bodies can be long, send a
trimmed copy, for example `left(a.body, 5000) AS body`.

## Handling deletes

When a row is deleted, Driftbase deletes the record with the same `objectID` from the index.
The `WHERE a.published_at IS NOT NULL` clause matters too: when an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record just as it
would for a `DELETE`.

If you would rather keep deleted records around, for example to audit them, set
`on_delete = "soft"` on the pipeline. Driftbase then sets `_deleted: true` on the record
instead of removing it, and your searches should filter those out:

```js
index.search(query, { filters: "NOT _deleted:true" });
```

## Backfill existing rows

`drift sync` backfills the rows that already exist the first time the pipeline starts. Run a
backfill yourself after changing the pipeline's query or columns:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming while it runs. See [Run a backfill](/guides/backfills) for
pausing, resuming and throttling a backfill.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Algolia indexes asynchronously, so a record can take a moment to become searchable
after Driftbase reports it written.
