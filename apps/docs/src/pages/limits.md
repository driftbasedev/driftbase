---
layout: ../layouts/Doc.astro
title: Plan limits and metering
description: How Driftbase counts change events, what each plan includes, and exactly what happens when a workspace reaches its monthly limit.
---

Driftbase meters **change events**: one committed row change read from the write-ahead log.
An `INSERT`, an `UPDATE` and a `DELETE` are one event each. A transaction that touches 40
rows is 40 events. Sending one change to three sinks is still one event.

Not metered: backfills, retries, replays from the replay window, and the watermark rows
Driftbase writes during a backfill.

## Limits by plan

| Plan  | Change events / month | Sources   | Sinks     | Replay window |
| ----- | --------------------- | --------- | --------- | ------------- |
| Free  | 1,000,000             | 1         | 3         | 24 hours      |
| Team  | 25,000,000, then $4 per million | 3 | Unlimited | 7 days        |
| Scale | 250,000,000 and up    | Unlimited | Unlimited | 30 days       |

Prices are on [driftbase.dev/pricing](https://driftbase.dev/pricing).

## At the limit

On Free, when a workspace reaches its monthly events:

1. We email the workspace owners at 80% and again at 100%.
2. Delivery to sinks pauses. The replication slot keeps its position, so nothing is lost,
   but the slot retains WAL until delivery resumes.
3. Delivery resumes from the same LSN when you upgrade or when the month rolls over (UTC).

Because a paused slot retains WAL, keep `max_slot_mb` alerts on. See the
[configuration reference](/configuration#sources).

Team and Scale never pause. Usage over the included events is billed at the end of the month.

## Self-hosted pipelines

A pipeline run with the CLI and **not** connected to Driftbase Cloud is never metered.
Connecting it with `drift login` to get the dashboard and alerts counts its events against your
workspace.
