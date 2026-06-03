# Elixir-project

Personal workspace for POCs, experiments, and iteration on the current production version of [Dhruv Singhal's](https://github.com/atavisticrystal6888) portfolio.

## Active work

| Path | What it is |
|---|---|
| [`./`](./) | **Production portfolio** — Next.js 16 · React 19 · MDX · TypeScript. Source of truth. |
| [`portfolio-v4/`](./portfolio-v4) | Ignored legacy workspace copy. Not the deploy target for this repo. |
| [`specs/`](./specs) | Design specs, constitutions, and execution plans. |
| [`prompt/`](./prompt) | Prompt library + agent configuration. |

## Archive

Earlier portfolio iterations are preserved in [`archive/`](./archive) for reference. None are deployed; do not modify.

- `archive/portfolio-v1/` — first static build
- `archive/portfolio-v2/` — static HTML/CSS/JS, 14 pages (full content canon)
- `archive/portfolio-v3/` — first Next.js attempt (superseded by v4)
- `archive/portfolio/` — scratch static copy
- `archive/portfolio-next/` — earlier Next.js experiment

## Getting started (production app)

```bash
npm install
npm run dev
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Vercel deployment details. App code lives at the repo root, with content sourced from [`content/`](./content).

