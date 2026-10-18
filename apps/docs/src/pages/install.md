---
layout: ../layouts/Doc.astro
title: Install the CLI
description: Install the drift CLI on macOS, Linux and Windows with Homebrew, npm, the install script or Docker, and keep it up to date.
---

`drift` is a single static binary for macOS (Apple silicon and Intel), Linux (x86-64 and
arm64) and Windows (x86-64). Pick whichever installer you already use.

## Homebrew

```sh
brew install driftbasedev/tap/drift
```

## npm

The npm package downloads the right binary for your platform on install, which is handy in
CI images that already have Node.

```sh
npm install --global @driftbase/cli
```

## Install script

```sh
curl -fsSL https://get.driftbase.dev | sh
```

The script installs to `~/.local/bin` and verifies the SHA-256 checksum published with each
release. Set `DRIFT_INSTALL_DIR` to install somewhere else.

## Docker

```sh
docker run --rm -v "$PWD:/work" -w /work ghcr.io/driftbasedev/drift:1.9 sync
```

Tags follow the CLI version: `1.9` tracks the latest 1.9.x patch, `1.9.0` is pinned.

## Verify

```sh
drift --version
# drift 1.9.0 (linux/arm64, 2026-10-07)
```

## Updating

```sh
drift self-update
```

Homebrew and npm installs should be updated with their own package manager instead.

## Requirements on the database side

The CLI itself needs nothing else, but the source database must allow logical replication.
See [Getting started](/getting-started#2-turn-on-logical-replication).
