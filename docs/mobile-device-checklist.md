# Real-device mobile checklist

Playwright's Pixel 5 / iPhone 13 projects emulate viewport and touch events, not
real browsers. This is the pass that has to happen on hardware: Android Chrome
and iOS Safari. Run it once per release.

## 1. Setup

**Option A — local production build (best for testing unreleased changes)**

1. Phone and laptop on the same Wi-Fi.
2. `npm run build && npm run start` (serves on port 3000; `npm run dev` is
   slower and hides production-only behaviour such as image optimisation).
3. Find the LAN IP: `ipconfig` on Windows (IPv4 Address of the Wi-Fi adapter).
4. On the phone open `http://<LAN-IP>:3000`.
5. If it does not load, allow Node through the Windows Defender firewall for
   private networks. Note that `http://` (not https) means clipboard writes
   (`navigator.clipboard`) and any secure-context API can silently fail — do
   copy-button testing on the deployed site instead.

**Option B — deployed site:** https://dhruvsinghal.codes . Use this for
clipboard, share sheet, install/bookmark and OG-preview checks.

Test both themes (toggle in the nav) and both orientations on at least the home
page and one case study.

## 2. Per-route checks

### `/` — home
- Flagship carousel: swipe horizontally with one finger; cards snap to the
  left edge and the next card peeks in from the right.
- The dot row under the rail follows the swipe (active dot moves), and tapping
  a dot scrolls to that product.
- Prev arrow is disabled on the first card, next arrow on the last.
- The page itself must not move sideways while you swipe the rail.
- Hero CTAs (email, LinkedIn) open the right app.

### Navigation (every route)
- Hamburger (right of the nav bar) opens the drawer; it slides in from the
  right and the page behind it does not scroll.
- Tap a link: the drawer closes and the route changes.
- Tap the hamburger again: drawer closes, no stuck overlay.
- Android back button while the drawer is open — record what happens; there is
  no history entry for the drawer, so back navigates the page. Escape closes it
  only with a hardware keyboard.
- With a Bluetooth keyboard: Tab cycles only inside the drawer while open.
- Ctrl+K / the search button is hidden below 768px by design — the command
  palette is desktop-only. Confirm nothing looks broken by its absence.
- Resume download link is also hidden below 768px; the Contact page carries it.

### `/contact`
- Submit the empty form: four inline errors appear (Name, Email, Subject,
  Message), and focus jumps to the Name field. The mobile keyboard should open.
- Message under 20 characters shows "Message must be at least 20 characters".
- Fill it correctly and send: either the green success line, or a red line
  quoting the server ("temporarily offline", "too many requests") followed by a
  tappable email address.
- Turn on airplane mode and send: the generic "Something went wrong. Please
  email me directly." line with the email link.
- Direct-links grid: **tapping Email or Phone copies the value and shows
  "Copied!" — it does not open the mail app or the dialler**, because the copy
  handler only steps aside for ctrl/cmd/shift-click, which a touch device cannot
  produce. Verify the copy works (paste into Notes) and judge whether that is
  the behaviour you want on a phone; if not, it is a code change, not a test
  failure.
- LinkedIn / GitHub tiles open in a new tab; Resume downloads the PDF (iOS
  Safari opens it in the viewer instead).

### `/projects` and a case study
- Filter to a category with no matches: the empty state shows the
  "Show all projects" button and tapping it restores the full grid.
- Open each flagship: `/projects/aarchid`, `/projects/kite-edge`,
  `/projects/experiment-hub`, `/projects/hackmate`, `/projects/churn-analysis`.
- Wide tables scroll **inside their own box** with a finger drag; the page must
  stay put. Same for code blocks.
- Tap an image: the lightbox opens, pinch-zoom works inside it, and it closes.
- The chapter rail does not overlap the body text or clip off-screen.

### `/blog`
- Type nonsense in the search box: the empty state shows a "Clear search"
  action; tapping it restores the list and empties the box.
- Open one post (e.g. `/blog/why-pms-should-code`) and check headings, code
  blocks and images.

### Other routes
`/about`, `/ai-pm`, `/lab`, `/now`, `/uses`, `/bookshelf`, `/changelog` — each
should render, scroll cleanly and have no element wider than the screen.

### `/404`
- Visit `https://dhruvsinghal.codes/no-such-page`: the 404 block, the "Back to
  Home" button, and the four suggestion cards stacked in one column.

### Theme
- Toggle light/dark in the nav on each of home, a case study and contact.
- Reload: the choice sticks and there is no white flash on a dark theme.
- Check the OS-level dark mode setting is respected before you ever toggle.

## 3. Global checks

- **No horizontal scroll.** On every route, swipe left/right on ordinary body
  text — the page must not shift. Repeat at 320 px (iPhone SE / small Android),
  360 px, 375 px and 414 px. Use Chrome's desktop DevTools device toolbar to
  reproduce anything you find.
- **Tap targets.** Hamburger, theme toggle, carousel dots and arrows, filter
  chips, footer links: all comfortably hittable with a thumb, nothing needing a
  second attempt.
- **Safe area.** On a notched iPhone in landscape, the nav and footer content
  clear the notch and the home indicator.
- **Pinch zoom is allowed.** Double-tap and pinch on body text must zoom; if
  zoom is blocked, the viewport export has a `maximumScale` it should not have.
- **Favicon.** Add the site to the home screen / bookmark it — the icon must be
  the "DS" mark, never the Next.js triangle.
- **Share sheet.** Share a case study URL to a chat app: the preview card shows
  the OG image, the page title and its description, not a bare URL.
- **Reduced motion.** Turn on Reduce Motion (iOS Accessibility / Android
  Developer options) and reload home: carousel scrolling jumps instead of
  animating and the drawer still works.
- **Slow network.** Chrome DevTools remote debugging on Slow 4G, or just
  airplane-mode-toggle mid-load: images fade in, nothing collapses.

## 4. Results

| Route / check | Android Chrome | iOS Safari | Notes |
|---|---|---|---|
| `/` carousel swipe + dots | | | |
| Mobile menu open / close / link tap | | | |
| `/projects` filter empty state | | | |
| Case study tables scroll in place | | | |
| `/blog` search empty state | | | |
| `/contact` inline errors | | | |
| `/contact` send success or error | | | |
| Email / Phone tile behaviour | | | |
| `/404` | | | |
| Theme toggle + persistence | | | |
| No horizontal scroll (all routes) | | | |
| Tap targets / safe area / pinch zoom | | | |
| Favicon + share-sheet preview | | | |

Device / OS / browser version tested:

Date:
