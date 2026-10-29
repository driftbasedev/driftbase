---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, handling deletes and backfilling existing rows.
---

## Keep an Algolia index in sync with Postgres

This guide syncs an `articles` table into an Algolia `articles` index with searchable
titles and bodies and filtering by author and tag.

## Create the index settings first

Create an `articles` index in Algolia and configure its settings before starting the
pipeline. Keep the settings in version control next to your app:

```json
{
  "searchableAttributes": ["title", "body"],
  "attributesForFaceting": ["filterOnly(author)", "filterOnly(tags)"]
}
```

Apply these settings in the Algolia dashboard. `filterOnly` allows filtering on an
attribute without returning facet counts. This example assumes the Postgres `articles`
table has `id`, `title`, `body`, `author`, `tags` and `published_at` columns.

## Define the source and sink

Enable logical replication and grant the source role access to the table as described
in [Getting started](/getting-started#2-turn-on-logical-replication). Add the source,
sink and pipeline to `driftbase.toml`:

```toml
[source.main]
url = "env:DATABASE_URL"
slot = "driftbase_main"
publication = "driftbase_main"

[sink.search]
type = "[Algolia sink type]"
"[Algolia application ID setting]" = "env:ALGOLIA_APP_ID"
api_key = "env:ALGOLIA_ADMIN_KEY"

[[pipeline]]
source = "main"
sink = "search"
index = "articles"
id = "id"
on_delete = "delete"
query = """
SELECT id, title, body, author, tags, published_at
FROM articles
WHERE published_at IS NOT NULL
"""
```

The Algolia sink type and application ID setting above are placeholders: the
[configuration reference](/configuration) does not yet document their names. Replace
them with the confirmed settings before running the pipeline. Credentials belong in the
environment; the configuration refers to them only through `env:ALGOLIA_APP_ID` and
`env:ALGOLIA_ADMIN_KEY`.

Algolia uses `objectID` to identify each record. Updates and deletes must use the same
stable ID for a Postgres row. [How the Algolia sink maps the pipeline id to objectID,
including any required configuration].

## Rows that leave the query

With `on_delete = "delete"`, deleting a source row removes its document from the index.
The `WHERE published_at IS NOT NULL` clause also matters: when an article is unpublished,
its row still exists but no longer matches the query. Driftbase removes the document
just as it would for a `DELETE`.

## Backfill existing rows and start syncing

After filling in the sink settings and ID mapping, start the pipeline:

```sh
drift sync
drift status
```

The first sync automatically backfills existing rows. To copy existing rows again after
changing the query or rebuilding the index, run:

```sh
drift backfill --pipeline articles
```

Live changes keep streaming during a backfill, and a live change to a row takes precedence
over its backfilled copy. See [Run a backfill](/guides/backfills) for pausing, resuming and
throttling a backfill.

`drift status` shows documents written, current lag and the last applied LSN. Algolia
processes indexing tasks asynchronously, so also check the index in Algolia to confirm
that a published article appears, an edit updates it and an unpublish or delete removes it.
