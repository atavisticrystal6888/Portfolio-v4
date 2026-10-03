# Owner launch verification

These are the checks automation cannot close. Each needs a person, a real device, or the owner's accounts. Run them against the live site after a deployment (https://dhruvsinghal.codes). Record results in the tables, with date, device and browser version. A check passes only if it was actually done; "looked fine in Playwright" does not count here.

Time needed: about 90 minutes in total.

## 1. Search Console (owner account, about 10 minutes)

1. Open https://search.google.com/search-console and pick the `dhruvsinghal.codes` property. If it does not exist, add a **Domain** property and verify it with the DNS TXT record Google gives you, at your DNS host.
2. **Sitemaps** → enter `sitemap.xml` → **Submit**. The full URL is `https://dhruvsinghal.codes/sitemap.xml`. Expect "Success" and about 35 discovered URLs.
3. **URL inspection** → paste `https://dhruvsinghal.codes/projects/cohort-retention-studio` → **Test live URL** → expect "URL is available to Google" → **Request indexing**. Repeat for `/projects/sawari`, `/projects/aarchid` and `/`.
4. **URL inspection** on `https://dhruvsinghal.codes/projects/churn-analysis` should say it is not on Google or is a 404. If Google still lists it, use **Removals → New request → Remove this URL only**.
5. Come back after 3 to 7 days: **Pages** report. Any "Excluded" reason other than "Not found (404)" for the withdrawn route is an open item.

| Step | Date | Result |
|---|---|---|
| Sitemap submitted | | |
| Live tests (4 URLs) | | |
| churn-analysis removal | | |
| Pages report after 7 days | | |

## 2. Real mail delivery (about 5 minutes)

The contact API returns 200 only after Resend accepts the message, and 503 when `RESEND_API_KEY` is not configured. Delivery to the inbox is what is left to check.

1. On a phone, open `/contact` and send: name "Launch check", your own second email address, and a message containing today's date.
2. The page shows the success state. Check the inbox set in Vercel `CONTACT_EMAIL`, and spam, within 5 minutes.
3. Hit **Reply**: the reply must go to the sender address you typed, not to `onboarding@resend.dev`.
4. If nothing arrives: Resend dashboard → **Emails** shows whether the send was accepted, bounced or rejected. The free `onboarding@resend.dev` sender can only deliver to the Resend account owner's address. A verified domain (`RESEND_FROM_EMAIL`) removes that limit.

| Check | Result |
|---|---|
| Success state shown | |
| Arrived in inbox (not spam), minutes taken | |
| Reply-to is the sender | |

## 3. Real devices

Use `docs/mobile-device-checklist.md` on one Android phone (Chrome) and one iPhone (Safari), on mobile data, not Wi-Fi. Its results table is the record.

## 4. Real Safari, desktop (about 15 minutes)

Playwright's WebKit is not Safari. On a Mac with Safari 17 or later:

| Check | Expected | Result |
|---|---|---|
| `/` first paint in both themes (toggle, reload) | no flash of the wrong theme | |
| `/projects/desktasks` hero image and lightbox | image loads; Esc closes the lightbox; focus returns to the trigger | |
| `/xyz` | 404 page, then **Back to Home** works; Web Inspector console has no React error | |
| `/blog/cohorts-before-dashboards` contents jump | scrolls to the heading; the heading is not hidden under the navbar | |
| `/contact` empty submit | four inline errors, focus on the first one | |

## 5. Keyboard only (about 15 minutes, any desktop browser)

Unplug or ignore the mouse. Start every route from the address bar.

| Route | Check | Result |
|---|---|---|
| any | First Tab shows **Skip to main content**; Enter moves focus into `main` | |
| any | Focus ring visible on every stop, never lost behind the sticky navbar | |
| any | Ctrl/Cmd+K opens the command palette; arrows + Enter navigate; Esc closes it and returns focus | |
| `/` | Every flagship card and carousel control is reachable with Tab and activates with Enter/Space | |
| `/projects` | Filters toggle with Space/Enter; the result count is announced or visible | |
| a case study | Chapters menu opens with Enter and closes with Esc; lightbox traps focus and Esc closes it | |
| `/contact` | Whole form fillable and sendable; errors are reachable; FAQ items open with Enter | |

## 6. Screen reader (about 20 minutes)

Use VoiceOver on macOS or iOS, NVDA on Windows, or both.

| Route | Check | Result |
|---|---|---|
| `/` | Rotor/elements list shows exactly one h1, then h2s in order; landmarks: banner, navigation, main, contentinfo | |
| a case study | Masthead reads name, tagline, then "Decision …"; the Status / Ownership / Evidence list reads as term + value pairs | |
| a case study | Every image has a meaningful name, or is skipped if decorative | |
| `/contact` | Field labels read; errors are announced on submit; success or failure is announced | |
| `/xyz` | "Page not found" is announced as the heading; the suggested-pages navigation is reachable by landmark | |
| command palette | Opening announces a dialog; options announce their names | |

## 7. Sign-off

| Gate | Done by | Date | Pass / issues |
|---|---|---|---|
| Search Console | | | |
| Mail delivery | | | |
| Real devices | | | |
| Desktop Safari | | | |
| Keyboard | | | |
| Screen reader | | | |
