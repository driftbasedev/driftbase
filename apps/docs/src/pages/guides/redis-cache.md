---
layout: ../../layouts/Doc.astro
title: Invalidate a Redis cache
description: Use Driftbase to delete or refresh Redis and Valkey cache keys the moment the underlying Postgres rows change, instead of relying on TTLs.
---

Most cache bugs are invalidation bugs: a code path writes to Postgres and forgets the cache.
Driftbase invalidates from the database side, so every write path is covered, including
migrations and the SQL someone ran by hand at 2 a.m.

## Two modes

- **Delete** (default): on any change, delete the key. Your app repopulates it on the next
  read. Simple and safe.
- **Write-through**: on any change, write the new value. Reads never miss, but the cached
  value must be something you can build from the row.

## Delete on change

```toml
[sink.cache]
type = "redis"
url = "env:REDIS_URL"
key_prefix = "shop:"

[[pipeline]]
source = "main"
sink = "cache"
table = "products"
index = "product:{id}"
mode = "delete"
```

An update to product 42 deletes `shop:product:42`.

## Write-through with a TTL

```toml
[[pipeline]]
source = "main"
sink = "cache"
table = "products"
index = "product:{id}"
mode = "write"
columns = ["id", "name", "price_cents", "stock"]
ttl_seconds = 3600
```

Values are written as JSON. Keep a TTL even in write-through mode as a safety net for keys
your app writes directly.

## Valkey

Use `type = "valkey"`. The options are identical.

## Ordering

Changes to the same key are applied in commit order. Changes to different keys are applied
in parallel, up to 64 in flight per pipeline by default.
