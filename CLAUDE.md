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
- Mirrors the app's Glass look over a dark sand background, with a picker for the app's three looks (Neon, Glass, Aurora).
- Carries the **legal docs the app stores require** (Privacy, Terms, Refund) as live URLs.
- This is **not** the Flutter app's web build. The Flutter app lives in a separate repo at `~/Developer/norestnest` (path on the original dev machine). On a fresh laptop you may not have that repo at all — that's fine, this site is self-contained.

---

## File layout

```
NoRestNest-Website/
├── CNAME                       # → norestnest.com (GitHub Pages custom domain)
├── .nojekyll                   # tells GitHub Pages "no Jekyll preprocessing"
├── index.html                  # landing page (site.css + site.js)
├── privacy.html                # mirrored from app repo public/privacy-policy.html
├── terms.html                  # mirrored from app repo public/terms-of-service.html
├── refund.html                 # mirrored from app repo public/refund-policy.html
├── support.html                # FAQ + contact + account deletion
├── delete-account.html, 404.html
├── assets/
│   ├── css/site.css            # landing page styles, look tokens at the top
│   ├── css/style.css           # secondary pages; accent follows the stored look
│   ├── js/site.js              # landing page: look picker, calculator, parallax, year
│   ├── js/main.js              # secondary pages: nav toggle, download menu, year
│   ├── img/
│   │   ├── icon.png            # app icon (favicon, home-screen icon), edge-to-edge eagle head
│   │   ├── logo.png            # header mark: the eagle logo card, in its own colours
│   │   ├── og-image.png        # 1200x630 link preview: logo, name, tagline, eagle on a barbell
│   │   ├── bg-sand.jpg, bg-sand-m.jpg   # page background
│   │   └── scenes/             # generated phone scenes, <scene>_<look>.webp
│   └── …                       # screenshots/, videos/, demo.gif: old, unused
├── CLAUDE.md                   # this file
├── README.md                   # human-facing
└── SCREENSHOTS.md              # old flat-screenshot workflow (no longer used by index.html)
```

---

## Brand tokens (mirrored from the app)

The landing page follows the app's Glass look. The page background (sand image + dark veil) and
text colours stay fixed; only the accent changes with the picked look.

```
bg            #0E0E0F   (under the sand image)
text          #FFFFFF
muted         #CACACF
frost         244,244,255  (glass rims and fills, as rgba)

look     accent    gradient (headline second line)
glass    #FF9A1F   amber → orange → ember        (default)
neon     #C8FF3D   pale lime → lime → green
aurora   #5CF2B8   mint → mint → violet
```

Font: Inter (400–800) from Google Fonts. Tokens live at the top of `assets/css/site.css`
(`[data-look="…"]` blocks). `style.css` keeps its own tokens and only overrides `--accent` per look.

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

## Scenes (phone images)

- Every phone image on the landing page is a generated scene: a real device capture in a phone
  frame, with parts of the screen lifted out in front. Same style as the Play Store screenshots.
- Made by `py store_assets/android/source/web.py [names]` in the app repo, from captures in
  `store_assets/android/raw/`. Output: `assets/img/scenes/<scene>_<look>.webp`, transparent,
  1600 px wide. Capture routine: app repo `claude/deployment/store_screenshots.md`.
- Scenes: `hero`, `load`, `programs`, `progress`, `nutrition`, `exercises`, each in `glass`,
  `neon`, `aurora`. In the HTML each scene is a `.stack` of three `<img data-look="…">`; CSS shows
  the one matching `data-look` on `<html>`.

---

## What to NOT add to this site

- No analytics SDK, no tag manager. The site is privacy-respecting on purpose.
- No build pipeline. If you're tempted to add Webpack/Vite/Astro, stop and ask the user first — the whole point is "anyone can edit on any laptop with just a text editor."
- No npm dependencies in source. The two CDN links (Google Fonts) are deliberate exceptions.
- No copying the app's web build into here. This is a marketing site, not the app.
- No emojis in user-facing copy unless explicitly requested. (Site copy is terse + factual — matches the user's preference noted in their cross-project memory.)

---

## Editing playbook

- **Layout language:** Glass. Frosted cards (`.glass`), accent glow on the key card, gradient on the
  second headline line (`.grad`), numbered eyebrows (`01 · The math`). Sections alternate copy and
  scene (`.row`, `.row.flip`). Background stays the sand image.
- **Look picker:** buttons in the hero set `data-look` on `<html>` and store it as `nrn-look` in
  localStorage. Every page applies the stored look in a tiny `<head>` script before paint. `/#neon`,
  `/#glass`, `/#aurora` open the landing page on that look.
- **Adding a feature row:** copy a `<div class="row feature">` in `#features`, toggle `flip` so sides
  alternate, renumber the eyebrows, and generate its scene with `web.py`.
- **Progression calculator** (`#engine`, section 01): logic in `site.js`, mirrors the weight+reps path
  of the app's progression engine (`~/Developer/norestnest/lib/features/programs/domain/services/progressive_overload_service.dart`).
  Owner's rule: the site must not spell out the rules — no percentages, profile names or rep-range
  mechanics in copy, legends or reason strings. Results only. If the app's engine changes, re-port.
- **Feature copy:** only claims the store listing makes (app repo `store_assets/listing_text.txt`).
- **Updating legal copy:** the canonical source is the app repo's `public/*.html`. If you have access to it, re-extract the body and regenerate. If you don't have access, edit `privacy.html` / `terms.html` / `refund.html` directly and note in the commit message that the app repo also needs updating to match.

---

## Known TODOs (state at last edit)

- Secondary pages (support, legal, 404) still use the older `style.css` layout; only their accent and logo follow the look.
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
