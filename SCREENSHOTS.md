# Capturing screenshots for the site

The site shows raw, flat screenshots — **no fake Android device frame**, and the Android **status bar + nav bar are cropped out**. This file is the recipe for both, from any laptop with Android tools installed.

## Prereqs (one-time, per machine)

- Android SDK platform-tools on PATH (gives you `adb`).
- A connected Android device with USB debugging on, **or** a running emulator.
- The NoRestNest app installed on that device. (To launch on a real device from the app repo: `flutter run -d android` from `~/Developer/norestnest`. To launch on a fresh emulator: see end of this file.)
- PowerShell (Windows) or any shell that can call `adb`.

Confirm a device is visible:

```powershell
adb devices
```

You should see a single line with a serial + `device`. If the list is empty, plug in the phone / start the emulator first.

## Capture

Drive the app to the screen you want, then:

```powershell
adb exec-out screencap -p > screen.png
```

That writes a raw PNG of the current screen. Repeat per screen — name them descriptively (`01-home.png`, `02-workout.png`, `03-set-table.png`, etc).

## Crop status bar + nav bar

Modern Pixels and Samsung phones use roughly:

- Status bar (top): **84–96 px** at 1080×2400
- Gesture nav bar (bottom): **48–66 px**

The simplest cross-platform crop uses Python + Pillow:

```powershell
pip install pillow
python scripts/crop-android.py screen.png
```

That overwrites `screen.png` cropped. Pass `--top 96 --bottom 66` to override defaults.

If you'd rather not install Pillow, the PowerShell script does the same via .NET's `System.Drawing`:

```powershell
.\scripts\crop-android.ps1 .\screen.png
```

## Drop into the site

1. Move the cropped PNGs into `assets/img/screenshots/`. Use stable filenames you'll keep referencing.
2. In `index.html`, find the screenshot slots:
   - **Hero stack:** three `<div class="shot is-…">` blocks inside `.shot-stack`.
   - **Strip:** seven `<div class="shot-card">` blocks inside `.shots-track`.
3. For each slot, replace `data-placeholder="…"` with an inline background, e.g.:

   ```html
   <div class="shot-card" style="background-image:url('/assets/img/screenshots/02-workout.png')"></div>
   ```

4. Local preview: `python -m http.server 8000` and check `http://localhost:8000/`.

## Optional: launch a fresh Android emulator

If you have Android Studio installed but no AVD yet:

```powershell
# list available system images
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" --list | findstr system-images

# create one (replace with whichever image you have)
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd `
  --name "Pixel_7_API_34" `
  --package "system-images;android-34;google_apis;x86_64" `
  --device "pixel_7"

# launch it
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_7_API_34
```

Once `adb devices` shows the emulator, run `flutter run -d emulator-5554` from the app repo to install NoRestNest into it.

## Hiding the Android status + nav bar at capture time (alternative to cropping)

If you'd rather capture without system chrome at all (no crop needed):

- **Demo mode:** `adb shell settings put global sysui_demo_allowed 1` then `adb shell am broadcast -a com.android.systemui.demo -e command exit` — this clears clock, signal, battery icons (cleaner status bar), but the bar itself stays visible.
- **Full immersive (recommended):** enable Developer options → **Disable HW overlays** off, then in your test build wrap the screen in `SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky)` while you capture. Reset afterwards. This produces a clean screenshot with zero system chrome and no crop needed.

For a launch site, the crop approach is usually simpler and good enough.
