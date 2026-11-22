---
layout: ../../layouts/Doc.astro
title: Sync to Algolia
description: Keep an Algolia index in sync with a Postgres table using Driftbase, including index settings, source and sink config, handling deletes and backfilling existing rows.
---

This guide syncs an `articles` table, with its author and tags, into an Algolia `articles`
index that supports filtering by tag.

## Create the index settings first

Driftbase writes records but leaves index settings to you, so they live in version control
next to your app. Set searchable attributes, facets and ranking once:

```json
{
  "searchableAttributes": ["title", "body", "author"],
  "attributesForFaceting": ["filterOnly(tags)", "author"],
  "customRanking": ["desc(published_at)"]
}
```

Apply them from the Algolia dashboard or with any Algolia API client. Use an admin key for
this step, and keep it out of the file.

## Define the source

The source is the Postgres database Driftbase reads changes from. It needs a role with the
`REPLICATION` attribute and `wal_level = logical`. See the
[configuration reference](/configuration#sources) for every option.

```toml
[source.main]
url = "postgres://driftbase@db.internal:5432/app"
slot = "driftbase_main"
publication = "driftbase_main"
```

## Define the sink and pipeline

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

Both credentials are read from the environment with the `env:` prefix, so set
`ALGOLIA_APP_ID` and `ALGOLIA_ADMIN_KEY` wherever `drift` runs.

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles.

## Handle deletes

When a row is deleted in Postgres, Driftbase deletes the matching record from the index.

The `WHERE a.published_at IS NOT NULL` clause matters too. When an article is unpublished, its
row still exists but no longer matches the query, and Driftbase deletes the record from the
index just as it would for a `DELETE`.

To keep deleted records instead, set `on_delete = "soft"` on the pipeline. Driftbase then sets
`_deleted: true` on the record rather than removing it. Add `filterOnly(_deleted)` to
`attributesForFaceting` and filter on `_deleted:false` in your searches so those records stay
hidden.

## Backfill existing rows

The first `drift sync` for a pipeline backfills the rows already in the table, while live
changes keep streaming. After you change the pipeline's query or columns, run a backfill
yourself so existing records pick up the new shape:

```sh
drift backfill --pipeline articles
```

See [Run a backfill](/guides/backfills) to pause, resume or throttle a backfill, or to read
from a replica instead of your primary.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Algolia indexes asynchronously, so a record can take a moment to become searchable
after Driftbase reports it written.
