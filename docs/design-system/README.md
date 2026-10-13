# Portfolio design system (local, sync-ready bundle)

The design system behind dhruvsinghal.in (Next.js 16, `src/`): the editorial
"working paper" identity, captured as self-contained HTML previews, a token
file and a machine-readable token map, so it can be pushed to a
claude.ai/design design-system project with the `/design-sync` skill and
browsed as cards there.

The source of truth is the repo (`src/styles/tokens.css`, `src/styles/base.css`,
`src/styles/section.module.css` and the components under `src/components/`).
Nothing in this folder is imported by the site; it is a faithful, standalone
replica for design tooling. When a component changes in `src/`, rebuild or
hand-edit the matching preview here.

## Identity in one paragraph

A working paper, not a dashboard. Cool paper ground (`#f6f5f1`) with ink text
and one signal-blue working colour (`#2137c4`) used the way a reviewer's pen
is; a Prussian-ink "night blueprint" (`#0d1322`, accent lifted to `#8fa2ff`)
in dark mode. Three faces: Fraunces for display and metric numerals, Manrope
for running text and controls, JetBrains Mono for every field label (always
uppercase, `--text-xs`, `0.14em` tracking). Surfaces are flat and
hairline-ruled with a single 4px editorial corner (`--radius-editorial`);
no blur except on things that genuinely float (navbar, toast, palette).
Page bands open with a strong rule and a numbered mono section label
("01, a short rule, Selected work"). Metrics are Fraunces numerals over a
mono caption; evidence is always qualified (status pill, evidence ladder,
last-verified date). Focus is one 2px accent ring at a 3px offset,
everywhere. Light is the default; the OS preference is ignored.

## Folder layout

```
docs/design-system/
  README.md                 this file
  _ds_index.json            manifest: {name, path, group, subtitle} per preview
  tokens/
    tokens.css              verbatim copy of src/styles/tokens.css (header comment added)
    tokens.json             machine-readable tokens keyed by CSS var name
  foundations/              Colors, Type, Spacing and radii
  components/               one preview per UI component, every variant and state
  patterns/                 composed page patterns (masthead, home selected work, article header)
  plates/                   3D product plate placeholder (parallel workstream)
```

Every preview:

- starts with `<!-- @dsCard group="..." -->` on line 1 (groups: Foundations,
  Type, Colors, Spacing, Components, Patterns, Plates); the sync tool builds
  its card index from that line;
- is a single HTML file with inline CSS, no external scripts (Google Fonts
  stylesheet links are the only external request);
- inlines the `:root`, light and dark token blocks and switches exactly like
  the site: `data-theme="light|dark"` on `<html>`, read before first paint
  from `localStorage["ds-portfolio-theme"]` (`{ mode, palette }`), light when
  nothing is stored. A small "Light theme / Dark theme" button in the page
  head toggles it; setting `document.documentElement.dataset.theme` works too;
- shows hover, focus-visible, active and disabled states statically through
  `.is-hover`, `.is-focus`, `.is-active` twins of the real pseudo-class rules,
  so a card can show every state at once;
- stays under 60 KB (largest is home-selected-work at about 41 KB).

Class names are the CSS-module names un-hashed and prefixed per component
(`.button-primary`, `.listrow-rail`, `.masthead-plate`), and the rules are
copied from the modules, not re-interpreted.

## Pushing to claude.ai/design with /design-sync

1. Open a Claude Code session in this repo and run `/design-sync`.
2. When asked for the source folder, give `docs/design-system`. The skill
   reads `_ds_index.json` for names and subtitles, and the `@dsCard` first
   line of each HTML for the card group.
3. Pick (or create) the target design-system project. Choose "replace cards
   of the same path" so a re-sync updates in place instead of duplicating.
4. Confirm the upload list: 27 previews, `tokens/tokens.css`,
   `tokens/tokens.json`, this README and `plates/README.md`.
5. After the push, open the project and spot-check Colors, Type, Button,
   Filter chip, Surface, List row and Case-study masthead in both themes
   (use the toggle in each card's head).
6. Re-run `/design-sync` after any change in `src/styles/` or
   `src/components/`; rebuild the previews first so they match the live site.

## House rules for copy in this folder

- No em-dashes anywhere (copy, titles, comments, JSON). The site banned them
  in commit 05e4c84 and every file here follows suit; use a colon, a comma,
  a middle dot (`&middot;`) or a full stop instead. Check with
  `grep -rP '\xE2\x80\x94' docs/design-system` which must return nothing.
- Sentence case for every label, button and title.
- Copy comes from the live site (project names, taglines, decisions, article
  titles, the author bio); do not invent claims about the products.
- The owner's portrait is not embedded; previews stand in a monogram where
  the site uses the photo (navbar mark, author bio avatar).
