# CLAUDE.md — NoRestNest-Website

This file is the **agent briefing**. If you (Claude) are reading this, you've been pointed at this repo from any machine and need to continue refining the site. Everything below is enough to be useful with zero prior context.

---

## Exercise data + working notes (self-contained)

This repo carries everything needed to build and correct **workout programs** here, without needing the app repo present.

- **Exercise library:** `data/exercises.json` — a list of **1,597 exercises**. Each entry has:
  `id, name, category, primaryMusclesSimple, primaryMusclesAdvanced, secondaryMusclesSimple, secondaryMusclesAdvanced, equipment, instructions, tips, hasVideo, videoMalePath, videoFemalePath, thumbnailMalePath, thumbnailFemalePath`.
  **This is the canonical exercise list — pull exercise names, muscles, and equipment from here.**
  Origin: copied from the app repo at `~/Developer/norestnest/assets/video/exercises_import.json`. If exercises change in the app, re-copy this file to resync.

- **Working-style + personal notes:** `.claude/memory/` — the user's cross-project preferences and context (how to write copy, plain English, ASCII-first explanations, training-plan context, etc.). Start with `.claude/memory/MEMORY.md` (the index).
  **This folder is gitignored** — it holds personal data and must never deploy to the public site. It stays local to whatever machine you're on.

---

## What this repo is

The **public marketing site for the NoRestNest mobile app** (norestnest.com).

- Hosted on **GitHub Pages** (CNAME → `norestnest.com`).
- Pure **static HTML/CSS/JS — no build step, no node_modules, no framework**. Edit-and-refresh.
- Mirrors the app's brand (dark UI, `#4DA3FF` electric blue accent).
- Carries the **legal docs the app stores require** (Privacy, Terms, Refund) as live URLs.
- This is **not** the Flutter app's web build. The Flutter app lives in a separate repo at `~/Developer/norestnest` (path on the original dev machine). On a fresh laptop you may not have that repo at all — that's fine, this site is self-contained.

---

## File layout

```
NoRestNest-Website/
├── CNAME                       # → norestnest.com (GitHub Pages custom domain)
├── .nojekyll                   # tells GitHub Pages "no Jekyll preprocessing"
├── index.html                  # landing page
├── privacy.html                # mirrored from app repo public/privacy-policy.html
├── terms.html                  # mirrored from app repo public/terms-of-service.html
├── refund.html                 # mirrored from app repo public/refund-policy.html
├── support.html                # FAQ + contact + account deletion
├── 404.html
├── assets/
│   ├── css/style.css           # all styles. tokens at the top.
│   ├── js/main.js              # mobile nav toggle, hero set-rating example, footer year
│   ├── img/
│   │   ├── icon.png            # app icon (used as logo + favicon)
│   │   ├── og-image.png        # 1200×630 social-share card (TODO)
│   │   └── screenshots/        # raw, flat Android screenshots (no device frame)
│   │       ├── 01-home.png
│   │       ├── 02-workout.png
│   │       └── …
│   └── video/
│       └── demo.mp4            # optional 20-second product video
├── scripts/
│   └── crop-android.ps1        # strips Android status/nav bars from screenshots
├── CLAUDE.md                   # this file
├── README.md                   # human-facing
└── SCREENSHOTS.md              # how to capture screenshots from any machine
```

---

## Brand tokens (mirrored from the app)

These come straight from `lib/core/theme/app_colors.dart` in the app repo. **Don't drift from them.** If the app changes its theme, mirror the change here.

```
bg            #0E0E0F
surface       #1A1A1C
card          #232326
border        #2A2A2E
text          #FFFFFF
text-muted    #A0A0A5
text-dim      #6B6B70

accent        #4DA3FF   Electric Blue   (primary CTA, links)
mint          #5AC8C8   Neon Mint       (feature accent)
purple        #A78BFA   Soft Purple     (feature accent)
orange        #FF8A3D   Orange Ember    (feature accent, warnings)
premium       #FFC107   Pro / Premium   (badges)
```

Fonts: Inter (body 400/500/600, headlines 700) + JetBrains Mono for labels and numbers. Both from Google Fonts in each HTML head.

Tokens live as CSS variables at the top of `assets/css/style.css`. **Edit them there, not inline.**

---

## How to run locally

No build step — just open `index.html` in a browser, or run a static server so root-relative paths (`/assets/...`) resolve:

```powershell
# from the repo root
python -m http.server 8000
# → http://localhost:8000
```

or

```powershell
npx --yes serve .
```

---

## How to deploy

GitHub Pages serves from the **default branch** (probably `main`). Once the DNS A/CNAME records resolve `norestnest.com` to GitHub Pages:

1. `git add . && git commit -m "..." && git push`
2. GitHub Pages rebuilds within a minute.
3. Verify at https://norestnest.com.

**DNS setup (already done by owner; this is for reference):**

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<github-username>.github.io` |

Verify under the repo's **Settings → Pages**: `norestnest.com` should show "DNS check successful" and "Enforce HTTPS" should be on.

---

## Screenshot rules (important — user instruction)

- **Screenshots are displayed FLAT — no fake Android device frame**, no phone bezel illustration around them. Modern Linear/Stripe/Vercel style. CSS already enforces this with rounded corners + soft shadow.
- **Android status bar and navigation bar must be cropped out** of each screenshot. The site renders the screenshot edge-to-edge — visible system chrome breaks the look.
- Target aspect ratio: **9 / 19.5** (or close — modern phone). Width 1080 is fine.
- See `SCREENSHOTS.md` for the capture + crop workflow.

After dropping new screenshot PNGs into `assets/img/screenshots/`, wire them up in `index.html`:

- **Screens section** (`#screens`): each `<figure>` holds a `<div class="shot">` with a `<video>` (poster = the still PNG, source = `assets/img/videos/tileN.mp4`). Swap the `poster` / `<source>` paths. A still image works too: `<div class="shot"><img src="…"></div>`.
- `.shot` crops the iOS status bar (top 120px of a 1206×2622 capture) and home indicator via a fixed aspect ratio + negative top margin — so uncropped captures are fine as long as they're 1206×2622 (or 320×696 video). Different dimensions: adjust `aspect-ratio` and `margin-top` on `.shot` in `style.css`.

---

## What to NOT add to this site

- No analytics SDK, no tag manager. The site is privacy-respecting on purpose.
- No build pipeline. If you're tempted to add Webpack/Vite/Astro, stop and ask the user first — the whole point is "anyone can edit on any laptop with just a text editor."
- No npm dependencies in source. The two CDN links (Google Fonts) are deliberate exceptions.
- No copying the app's web build into here. This is a marketing site, not the app.
- No emojis in user-facing copy unless explicitly requested. (Site copy is terse + factual — matches the user's preference noted in their cross-project memory.)

---

## Editing playbook

- **Layout language (redesign of 2026-08-30):** the landing page is a numbered spec sheet, not a card grid. No gradients, glows, blur, hover-lift, or scroll-reveal animation — that was the "obvious AI template" look the owner asked to get rid of. Keep it: hairline rules (`--rule`), left-aligned type, mono labels (`.mono`, JetBrains Mono), tabular numbers.
- **Adding a feature:** add a `<div class="spec-row"><dt>Name <span class="tag mono">Area</span></dt><dd>…</dd></div>` to the `<dl class="spec">` in `#features`. Tag colors: `mint`, `purple`, `orange`, `gold` on the `.tag` span.
- **Adding a section:** copy a `<section class="sec" id="…">` block — `.sec-label` (index number + short title, sticky on desktop) on the left, `.sec-body` on the right. Renumber the `.idx` spans.
- **Hero example widget** (`#calc`): the easy/good/hard/failed numbers live in `assets/js/main.js` (`rules`). They are illustrative; the footer line in the widget says so. Don't present them as the app's real algorithm.
- **Buttons:** `.btn` / `.btn-primary` still exist for secondary pages (404). On the landing page the platform links are the `.get` list, not buttons.
- **Updating legal copy:** the canonical source is the app repo's `public/*.html`. If you have access to it, re-extract the body and regenerate. If you don't have access, edit `privacy.html` / `terms.html` / `refund.html` directly and note in the commit message that the app repo also needs updating to match.

---

## Known TODOs (state at last edit)

- `og-image.png` — 1200×630 social-share card, currently missing (Open Graph link is set up; image file is the only thing missing).
- Screenshots/videos in `#screens` are iOS captures; the CLAUDE rule says Android — replace when Android captures exist (same 1206×2622 crop assumption, or adjust `.shot`).
- Legal docs contain `TODO_LEGAL_ENTITY_NAME`, `TODO_REGISTERED_ADDRESS`, `TODO_VAT_NUMBER`, `TODO_POSTAL_ADDRESS`, `TODO_WEBSITE` placeholders — same in the app repo. Sync these when finalized.
- Store badges (Google Play / App Store) currently show generic SVGs. Swap for the official badges from each store's brand guidelines before launch.

---

## Cross-laptop bootstrap

If you (the user) sit at a fresh laptop and want to keep editing:

```powershell
git clone https://github.com/<owner>/NoRestNest-Website.git
cd NoRestNest-Website
# Open in any editor. Run a local server if you want:
python -m http.server 8000
```

Then point Claude at the repo path — Claude reads this file first and has full context. Nothing else needs to be installed.

To capture fresh screenshots on a laptop that has Android tools, follow `SCREENSHOTS.md`.
