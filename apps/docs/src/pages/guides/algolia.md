---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, handling deletes and backfilling existing rows.
---

This guide uses an `articles` table to build an Algolia `articles` index that supports
searching titles and bodies and filtering by author.

## Create the index settings first

Create an `articles` index in Algolia and apply these settings before starting the sync.
Keep the settings in version control next to your app:

```json
{
  "searchableAttributes": ["title", "body"],
  "attributesForFaceting": ["filterOnly(author)"]
}
```

Algolia uses `objectID` to identify records. Each article needs a stable, unique ID so
updates replace the same record and deletes remove the right one.

## Define the pipeline

Enable logical replication and grant the source role access to the table as described in
[Getting started](/getting-started#2-turn-on-logical-replication). Add the source, sink and
pipeline to `driftbase.toml`:

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"

[sink.search]
# [Algolia sink configuration: confirmed type and credential field names, using env:ALGOLIA_APP_ID and env:ALGOLIA_ADMIN_KEY, plus mapping the pipeline ID to Algolia objectID]

[[pipeline]]
source = "main"
sink = "search"
index = "articles"
id = "id"
on_delete = "delete"
query = """
SELECT id, title, body, author
FROM articles
WHERE published_at IS NOT NULL
"""
```

Replace the sink placeholder before running the pipeline. Supply the Algolia application
ID through `env:ALGOLIA_APP_ID` and the admin API key through `env:ALGOLIA_ADMIN_KEY`.
Keep the admin key on the server running Driftbase.

## Rows that leave the query

With `on_delete = "delete"`, deleting an article removes its document from the index.
The `WHERE published_at IS NOT NULL` clause also matters: unpublishing an article leaves
the row in Postgres but removes it from the query result, so Driftbase deletes its indexed
document too.

## Backfill existing rows

Start syncing after completing the sink configuration:

```sh
drift sync
drift status
```

The first sync automatically backfills existing rows. After changing the query or when
rebuilding the index, run a backfill explicitly:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming during a backfill. See [Run a backfill](/guides/backfills)
for pausing, resuming and throttling it.

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Algolia processes indexing operations asynchronously, so check the index after
its indexing tasks finish to verify that inserts, updates and deletes are searchable.
