# driftbase-sites

The public websites for [Driftbase](https://driftbase.dev): the marketing site and the docs.
The product itself (the `drift` CLI and the hosted sync service) lives in other repos.

## Layout

```
apps/
  web/      driftbase.dev        Next.js 15 (App Router), TypeScript, CSS modules
  docs/     docs.driftbase.dev   Astro 5, static output, Markdown pages
packages/
  brand/    @driftbase/brand     colour tokens (tokens.css) and the logo mark, used by both apps
```

This is a yarn 1 workspaces monorepo. One `yarn.lock` at the root covers every package.

## Branches

The default branch is **`production`**. Both Vercel projects deploy production from it;
every other branch and every pull request gets a preview deployment. `production` is
protected: changes land through a pull request with one approving review.

## Running locally

Node 20 or newer (see `.nvmrc`) and yarn 1.

```sh
yarn install
yarn dev:web     # http://localhost:3000
yarn dev:docs    # http://localhost:4321
```

Build both the way CI does:

```sh
yarn build
```

## Deploying

Each app is its own Vercel project, linked to this repo, with the **Root Directory** set to
the app:

| Vercel project    | Root directory | Framework preset | Domain              |
| ----------------- | -------------- | ---------------- | ------------------- |
| `driftbase-web`   | `apps/web`     | Next.js          | driftbase.dev       |
| `driftbase-docs`  | `apps/docs`    | Astro            | docs.driftbase.dev  |

Vercel installs from the repo root (so the workspace and `@driftbase/brand` resolve) and
builds only the app. Neither site needs environment variables or talks to any service at build
time.

## Editing content

- Marketing pages: `apps/web/app/**/page.tsx`. Blog posts are plain pages under
  `apps/web/app/blog/`; add new ones to the list in `apps/web/app/blog/posts.ts`.
- Changelog: `apps/web/app/changelog/entries.ts`.
- Docs: Markdown in `apps/docs/src/pages/`. The sidebar is `apps/docs/src/nav.ts`.
- Colours and the logo: `packages/brand/`. Change them there, never per app.
