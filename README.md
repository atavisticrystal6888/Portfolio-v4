# Portfolio

Production portfolio of [Dhruv Singhal](https://github.com/atavisticrystal6888) — Next.js 16 · React 19 · MDX · TypeScript. Deployed on Vercel.

## Layout

| Path | What it is |
|---|---|
| [`src/`](./src) | App code (App Router pages, components, lib) |
| [`content/`](./content) | Site content — `projects.json`, case studies (MDX), blog, resume sources, lab ideas |
| [`content/drafts/`](./content/drafts) | Unpublished case-study drafts — **not** read by the site build |
| [`public/`](./public) | Static assets, fonts, images, resume PDF |
| [`scripts/`](./scripts) | Utilities (`npm run resume:pdf` regenerates the resume PDF from `content/resume/`) |
| [`tests/`](./tests) | Vitest unit tests + Playwright e2e/a11y |

`portfolio-v4/` (untracked) is a legacy workspace copy that lives in its own repo — not the deploy target.

Earlier portfolio iterations (v1–v3 and experiments) were removed from the working tree in Aug 2026; they remain available in git history and on the `archive/pre-refresh-2026-08` branch.

## Getting started

```bash
npm install
npm run dev
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Vercel deployment details, and
[`DISABLED-INTERACTIVES.md`](./DISABLED-INTERACTIVES.md) for the four interactive
extras that are still in the tree but deliberately not mounted.
