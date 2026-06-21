# CLAUDE.md — NoRestNest-Website

This file is the **agent briefing**. If you (Claude) are reading this, you've been pointed at this repo from any machine and need to continue refining the site. Everything below is enough to be useful with zero prior context.

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
│   ├── js/main.js              # nav scroll, mobile toggle, scroll-reveal, hero rotator
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

Font: Inter (loaded from Google Fonts in each HTML head). Body weight 400, headlines 700.

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

After dropping new screenshot PNGs into `assets/img/screenshots/`, wire them up by editing `index.html`:

- **Hero stack** (3 phones): find `<div class="shot is-…">` blocks and replace the `data-placeholder="…"` attribute with `style="background-image:url(/assets/img/screenshots/FILENAME.png)"`.
- **Screenshots strip** (horizontal scroll): same pattern on `<div class="shot-card">` blocks.

Remove `data-placeholder` once a real image is set, so the placeholder caption disappears.

---

## What to NOT add to this site

- No analytics SDK, no tag manager. The site is privacy-respecting on purpose.
- No build pipeline. If you're tempted to add Webpack/Vite/Astro, stop and ask the user first — the whole point is "anyone can edit on any laptop with just a text editor."
- No npm dependencies in source. The two CDN links (Google Fonts) are deliberate exceptions.
- No copying the app's web build into here. This is a marketing site, not the app.
- No emojis in user-facing copy unless explicitly requested. (Site copy is terse + factual — matches the user's preference noted in their cross-project memory.)

---

## Editing playbook

- **Adding a feature card:** copy a `.feature` block in `index.html`, swap the inline SVG icon, change the `tone-…` class for color. Tones available: default (blue), `tone-mint`, `tone-purple`, `tone-orange`, `tone-premium`.
- **Adding a section:** wrap in `<section><div class="container">…</div></section>`. Use `.eyebrow` + `<h2>` pattern from existing sections.
- **Updating legal copy:** the canonical source is the app repo's `public/*.html`. If you have access to it, re-extract the body and regenerate. If you don't have access, edit `privacy.html` / `terms.html` / `refund.html` directly and note in the commit message that the app repo also needs updating to match.
- **Going live with a video:** drop the file at `assets/video/demo.mp4`, then in `index.html` find `<!-- Drop a real video at assets/video/demo.mp4 …` and uncomment the `<video>` tag. Remove the `.video-placeholder` block.

---

## Known TODOs (state at last edit)

- `og-image.png` — 1200×630 social-share card, currently missing (Open Graph link is set up; image file is the only thing missing).
- Real Android screenshots — currently rendered as intentional gradient placeholders.
- Real demo video — currently a styled placeholder block.
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
