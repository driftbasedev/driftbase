---
layout: ../../layouts/Doc.astro
title: Sync to Meilisearch
description: Keep a Meilisearch index in sync with a Postgres table using Driftbase, including filterable attributes, nested documents and handling deletes.
---

## Keep a Meilisearch index in sync with Postgres

This guide syncs an `articles` table, with its author and tags, into a Meilisearch `articles`
index that supports filtering by tag.

## Create the index settings first

Driftbase writes documents but leaves index settings to you, so they live in version control
next to your app. Set filterable and sortable attributes once:

```sh
curl -X PATCH "$MEILI_URL/indexes/articles/settings" \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H "Content-Type: application/json" \
  --data '{"filterableAttributes":["tags","author"],"sortableAttributes":["published_at"]}'
```

## Define the pipeline

```toml
[sink.search]
type = "meilisearch"
url = "env:MEILI_URL"
api_key = "env:MEILI_MASTER_KEY"

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

Renaming a tag now updates every article that carries it, and changing a user’s display name
updates all of their articles.

## Rows that leave the query

The `WHERE a.published_at IS NOT NULL` clause matters. When an article is unpublished, its row
still exists but no longer matches the query, and Driftbase deletes the document from the index
just as it would for a `DELETE`.

## Check it

```sh
drift sync --pipeline articles
drift status
```

`drift status` shows documents written, current lag and the last applied LSN for each
pipeline. Meilisearch indexes asynchronously, so a document can take a moment to become
searchable after Driftbase reports it written.
