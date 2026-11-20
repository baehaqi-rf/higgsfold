# HiggsFold Studio v2.0 (Chrome Extension Side Panel)

**HiggsFold** is a clean-room, Higgsfield Cinema Studio 4.0-inspired **Chrome Side Panel Studio (Manifest V3)** designed to unlock 2-stage AI visual & video direction directly on top of your existing **Google AI Pro** subscription (**Google Flow**, **Google Gemini**, and **Google AI Studio**).

## What Was Improved in v2.0 (REA + Autopilot Audit)

1. **Critical Origin & Selector Fixes (REA Ground-Truth Inspection)**
   - Added `https://flow.google.com/*` to `manifest.json` (`host_permissions` and `content_scripts.matches`) because `labs.google/fx/tools/flow` redirects to `flow.google.com`.
   - Replaced heuristic-only selectors in `content/bridge.js` with site-verified profiles for:
     - **Google Flow (`flow.google.com`):** ProseMirror editor (`div.ProseMirror[contenteditable="true"][role="textbox"]`), `button.generate-icon-button[aria-label="Start generation"]`, and Flow Settings popover (`button.settings-trigger-button`).
     - **Google Gemini (`gemini.google.com`):** Quill `rich-textarea div.ql-editor[contenteditable="true"]` and dynamically mounted `button[aria-label="Send message"]` (with async polling until enabled).
   - Hardened `Bind UI` visual picker so clicking inner `<mat-icon>` / `<svg>` elements automatically normalizes to the enclosing `<button>` or `[contenteditable="true"]` container, with an on-canvas HUD banner.

2. **Higgsfield Cinema Studio 4.0 & Soul Studio Parity**
   - **Stage 1 — Keyframe & Soul Lock (`Nano Banana 2.1`):** 14 categorized visual & editorial presets (*Editorial 35mm, Neon Noir, Luxury Tabletop, Raw Documentary, Golden Epic, Direct Flash, Quiet Luxury, 90s Editorial, 2000s DigiCam, Fisheye Street, 2049 Dystopian, Green Editorial, CCTV Angle, Clean Beauty*).
   - **Stage 2 — Camera Motion & Native Audio (`Omni 1.2 Flash`):** 20 categorized camera motion presets (*Crash Zoom In, Bullet Time Orbit, FPV Drone Dive, Dolly In, Dolly Out, Dolly Zoom (Vertigo), Whip Pan, Low-Angle Track, Handheld Intimate, Crane Up, Crane Down, Slider Lateral, Snorricam Rig, Robot Arm Bolt, Rack Focus, Drone Orbit, Aerial Pullback, Arc Left / Right, Side Tracking, Static Locked*).
   - **Ordered Multi-Move Sequence Chain:** Chain up to **3 camera movements** in order per shot (`Phase 1 → Phase 2 → Phase 3`).
   - **Pro Optics & Film Setup:** Camera Body (`Modern Digital`, `35mm Film`, `8mm Vintage`, `DV Camcorder`), Lens Glass (`Clean Sharp`, `Anamorphic`, `Vintage Anamorphic`, `Warm Vintage`, `Halation Vintage`), Aperture (`f/1.4`, `f/4`, `f/11`), Film Genre & Era, 10 Cinema Color Palettes, 11 Lighting Continuity modes, and `@Character / Element` lock.
   - **1-Click Google Flow Settings Sync:** Automatically syncs Mode (`Image` / `Video`), Aspect Ratio (`16:9`, `9:16`, `1:1`, `4:3`, `3:4`), and Batch Count (`x1`–`x4`) directly with Google Flow's settings popover.
   - **Storyboard Shot List & Custom Preset Builder:** Save multi-shot sequences, export full scripts, create custom Stage 1/Stage 2 presets, and import/export `.json` preset packs.

## Project Structure

```text
higgsfold/
├── manifest.json            # Chrome MV3 manifest (flow.google.com, labs.google, gemini, aistudio)
├── background.js            # Side Panel service worker
├── content/
│   └── bridge.js            # ProseMirror/Quill injector, Flow Settings sync & Bind UI picker
├── sidepanel/
│   ├── index.html           # HiggsFold Studio Side Panel UI
│   ├── styles.css           # Dark Cinema Studio theme (#0a0a0a / #d4ff00)
│   ├── presets.js           # 14 Stage 1 + 20 Stage 2 presets, Optics, Palettes & Lighting
│   ├── compiler.js          # Pure prompt compiler, custom preset builder & storyboard formatter
│   └── app.js               # Side Panel state, history, storyboard & custom preset controller
├── tests/
│   ├── compiler.test.mjs    # Node.js unit tests (node --test)
│   └── testbench.html       # Local Flow + Gemini DOM simulator & side panel playtest bench
├── icons/                   # 16px, 48px, 128px studio icons
└── push-to-github.ps1       # PowerShell git commit & push helper
```

## Installation (Load Unpacked in Chrome)

1. Clone this repository locally:
   ```bash
   git clone https://github.com/baehaqi-rf/higgsfold.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `higgsfold` folder.
5. Open **Google Flow** (`https://flow.google.com/`) or **Gemini** (`https://gemini.google.com`) using your Google AI Pro account.
6. Click the **HiggsFold** icon in the Chrome toolbar to open the Side Panel.

## Running Tests

```bash
node --test tests/compiler.test.mjs
```

To run the interactive playtest bench locally:
```bash
python -m http.server 8765 --bind 127.0.0.1
# Open http://127.0.0.1:8765/tests/testbench.html
```
