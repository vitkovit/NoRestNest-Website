# Capturing screenshots (Mac — for the next Claude session)

This is a hand-off for the next Claude session, running on the user's Mac, to capture screenshots and drop them into this site. The Windows machine couldn't boot an Android emulator (no virtualization) and the Mac is the natural place to do this anyway (iOS sim only runs on macOS).

## What needs to happen

Fill in the three hero phone slots and any future screenshot strip with **flat raw screenshots — no fake device frame, with the Android status bar and nav bar cropped out**. These are the user's hard rules:

1. No phone-bezel illustration around the screenshot.
2. Android system chrome (status bar, gesture nav bar) cropped off.

Site already renders the images flat with rounded corners and a soft shadow — you just supply clean PNGs.

## Prereqs on the Mac

- Both repos cloned: this one (`NoRestNest-Website`) and the app repo (`norestnest`).
- Flutter SDK on PATH.
- Android Studio installed (gives you `adb`, `emulator`, AVDs).
- Xcode installed if you want iOS sim screenshots too.
- Python 3 + Pillow for the cropper: `pip3 install pillow`.

Verify quickly:

```bash
flutter doctor
adb devices                  # nothing connected yet — fine
xcrun simctl list devices    # iOS sims listed
```

## Pick a target (Android first — required; iOS optional)

**Android emulator (recommended for the canonical screenshots — Pixel 7 form factor 1080×2400):**

```bash
# list AVDs
$ANDROID_HOME/emulator/emulator -list-avds
# boot one (replace name)
$ANDROID_HOME/emulator/emulator -avd Pixel_7_API_34 &
```

Wait until `adb devices` shows `emulator-5554  device`.

**iOS simulator (optional — gives you iPhone marketing shots):**

```bash
open -a Simulator
# or boot a specific device
xcrun simctl boot "iPhone 15 Pro"
```

## Install + run the app

From the app repo:

```bash
cd ~/Developer/norestnest    # adjust path if different
flutter pub get
flutter run -d <device-id>   # `flutter devices` to get the id
```

For Android emulator: `flutter run -d emulator-5554`.
For iOS simulator: `flutter run -d "iPhone 15 Pro"` (use the booted sim's name).

Sign in (or skip if anonymous works for the screen you're capturing). Pre-seed some workout data so the screens look populated — empty screens don't sell the app.

## Screens to capture (priority order)

These map to the hero phone stack + future screenshot strip on the site. Hit the first three at minimum — they fill the hero. Names in **bold** become the filename.

1. **01-set-table** — Active workout, set table widget mid-session with pre-filled smart-progression suggestions visible. This is THE feature; make sure 2–3 sets are already logged so the next row shows a real precalculated weight.
2. **02-home** — Home / programs dashboard with a recent session visible.
3. **03-body** — Body explorer with a recent session's worked muscles highlighted.
4. **04-nutrition** — Nutrition log for today, showing macros remaining (protein/carb/fat).
5. **05-progress** — Progress / statistics screen with a volume or PR chart.
6. **06-smart-builder** — Smart program builder result screen (optional — Pro feature).

Dark theme. Use Standard accent (Electric Blue) unless something looks better on a specific screen.

## Capture

**Android:**

```bash
mkdir -p ~/Desktop/nrn-shots && cd ~/Desktop/nrn-shots
# drive the app to the screen, then:
adb exec-out screencap -p > 01-set-table.png
```

**iOS:**

```bash
xcrun simctl io booted screenshot 01-set-table.png
```

Repeat per screen. iOS sim screenshots come without the device frame and usually without the status bar interfering — they're closer to "ready to use" than Android.

## Crop (Android only — iOS shots usually skip this)

The site repo has the cropper. From the website repo root:

```bash
cd ~/Developer/NoRestNest-Website
python3 scripts/crop-android.py ~/Desktop/nrn-shots/01-set-table.png
# defaults: --top 96 (status bar) --bottom 66 (gesture nav bar)
# bump if the device profile differs
```

Sanity-check: open the cropped PNG, the Wi-Fi/battery/time row should be gone at the top, the gesture pill gone at the bottom.

## Drop into the site

```bash
mv ~/Desktop/nrn-shots/*.png ~/Developer/NoRestNest-Website/assets/img/screenshots/
```

Then wire them into `index.html`. Find the three hero shots:

```html
<div class="shot is-side-left"  data-placeholder="Workout"></div>
<div class="shot is-front"      data-placeholder="Home"></div>
<div class="shot is-side-right" data-placeholder="Nutrition"></div>
```

Replace each with the matching image and drop the placeholder attribute:

```html
<div class="shot is-side-left"  style="background-image:url('/assets/img/screenshots/04-nutrition.png')"></div>
<div class="shot is-front"      style="background-image:url('/assets/img/screenshots/01-set-table.png')"></div>
<div class="shot is-side-right" style="background-image:url('/assets/img/screenshots/03-body.png')"></div>
```

Suggested hero ordering: **set-table front and center** (it's the headline feature), nutrition or body view on the sides.

## Verify

Open `index.html` in a browser (just drag it onto Chrome — no build needed). Hero should now show real screens, rotating through the stack. If they look squished or off-aspect, the source isn't 9:19.5 — adjust the crop top/bottom or just leave them as-is; the CSS `aspect-ratio: 9/19.5` will fit them.

## Commit + push

```bash
cd ~/Developer/NoRestNest-Website
git add assets/img/screenshots/*.png index.html
git commit -m "feat(site): real Android screenshots in hero stack"
git push
```

GitHub Pages picks it up automatically. Live on `https://www.norestnest.com/` within a minute.

## What NOT to do

- Don't wrap screenshots in a Photoshopped phone bezel. They go in flat.
- Don't crop them into a perfect square — keep tall portrait, 9:19.5 ratio.
- Don't add watermarks, captions, or "available on the App Store" stickers baked into the PNG.
- Don't capture screens that show personal data (real email, real photos). Either use seeded test data or a fresh anonymous account.
- Don't capture the Android system status bar — crop it. The site enforces a clean edge with rounded corners; visible chrome breaks the look.

## If something goes wrong

- **Emulator won't boot:** check `$ANDROID_HOME` is set, AVD exists, HAXM/Hypervisor.framework is healthy. On Apple Silicon, only ARM64 system images work — make sure your AVD uses `system-images;android-34;google_apis;arm64-v8a`.
- **App won't install:** `flutter clean && flutter pub get && flutter run` from the app repo root.
- **Screens look empty:** seed workout/nutrition data in the app first. Hardcoded login + a few logged sets goes a long way.
- **Crop cuts off real content:** lower `--top` / `--bottom` values. The defaults (96 / 66) are tuned for Pixel-class devices; other profiles vary.
