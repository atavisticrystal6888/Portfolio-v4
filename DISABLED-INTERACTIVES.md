# Disabled interactives

> **v5 update (2026-08-22):** the four components below, plus the unused
> `ThemeCustomizer`, `AvailabilityBadge`, `HeroVisuals`, and the home
> `ExperienceTimeline` (redundant with /about's Timeline), were **deleted
> deliberately** in the WS-F subtraction pass — this file's own reasoning was
> the rationale, and the research behind v5 ("a mediocre extra hurts more than
> none") settled it. They live in git history if ever wanted back. The home
> hero's `SignatureScene` mount was also removed (the scene component itself
> stays for dossier/lab variants; three.js deps untouched pending the user's
> call). The tables below are kept as the historical record.

Four interactive extras were **switched off in the round-2 UI pass
(2026-08-20)** and deleted in v5.

## What is off, and why

| Component | File | Was mounted in | Why it is off |
|---|---|---|---|
| `LoadingScreen` | `src/components/ui/LoadingScreen.tsx` | `src/app/layout.tsx` | A splash screen in front of a statically-rendered site that already scores 95+ on Lighthouse. It delayed first contact with the content to hide a wait that was not happening. |
| `CustomCursor` | `src/components/interactive/CustomCursor.tsx` | `src/app/layout.tsx` | Replaced the native pointer site-wide. Native cursors carry affordance (text I-beam, pointer over links, resize handles) and respect OS accessibility settings such as enlarged or high-contrast cursors; a custom one throws all of that away for a visual. |
| `OnekoCat` | `src/components/interactive/OnekoCat.tsx` | `src/app/layout.tsx` (inside `ErrorBoundary`) | A pixel cat that chases the pointer across every page. Charming in isolation, but it appeared in the corner of every screenshot taken of the site and pulls against the editorial product-dossier read the rest of the design is going for. |
| `ParticlesBg` | `src/components/interactive/ParticlesBg.tsx` | `src/components/home/HeroVisuals.tsx` | Drifting dots behind the home hero. Made redundant by `SignatureScene`, which now occupies the same space with a motif that is shared across the home hero, every case-study header, and the Lab header. Two ambient layers in one hero was one too many. |

## What is deliberately still on

- **`AnimatedGradient`** (`src/app/layout.tsx`) — ambient background wash; costs
  nothing and is never in the visitor's way.
- **`MusicToggle` / `BackgroundMusic`** (`src/components/layout/Navbar.tsx`) —
  opt-in and off by default, so it is a feature rather than an imposition.
- **`CommandPalette`** (Ctrl+K), **`ScrollProgress`**, **`ThemeToggle`** — real
  navigation and preference features, not flourish. Palette switching lives in
  the command palette ("Accent: …"), not in a visible control.
- **`ThemeCustomizer`** (`src/components/interactive/ThemeCustomizer.tsx`) — an
  earlier draft of that control. It has **no call site**; this list claimed it
  was live until a round-4 sweep found nothing importing it. Wire it up or
  delete it deliberately.
- **`SignatureScene`** — the site's one piece of 3D, at three scales. See
  `src/components/interactive/signature-spec.ts`.

## Turning one back on

Each is a plain component with no remaining call sites, so re-enabling is an
import plus a mount.

`LoadingScreen`, `CustomCursor`, `OnekoCat` — in `src/app/layout.tsx`, inside
`<ToastProvider>`:

```tsx
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { CustomCursor } from "@/components/interactive/CustomCursor";
import { OnekoCat } from "@/components/interactive/OnekoCat";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

<ToastProvider>
  <LoadingScreen />
  <SkipLink />
  <ScrollProgress />
  <CustomCursor />
  <ErrorBoundary>
    <OnekoCat />
  </ErrorBoundary>
  {/* ...rest unchanged */}
</ToastProvider>
```

`OnekoCat` was wrapped in `ErrorBoundary` because it manipulates DOM nodes
directly; keep that wrapper if you bring it back.

`ParticlesBg` — in `src/components/home/HeroVisuals.tsx`, alongside the
signature scene, remembering it must stay behind a `dynamic(..., { ssr: false })`
import like the scene does:

```tsx
const ParticlesBg = dynamic(
  () =>
    import("@/components/interactive/ParticlesBg").then((m) => ({
      default: m.ParticlesBg,
    })),
  { ssr: false }
);

return (
  <>
    <SignatureScene variant="hero" interactive />
    <ParticlesBg />
  </>
);
```

## If you re-enable anything

Run the accessibility suite before shipping — `CustomCursor` and `OnekoCat` in
particular touch pointer behaviour and the DOM directly:

```bash
npm run build
npx next start -p 3100
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --project=chromium
```
