# HiggsFold Studio v3.0 (Chrome Extension Side Panel)

**HiggsFold** is a clean-room, Higgsfield Cinema Studio 4.0-inspired **Chrome Side Panel Studio (Manifest V3)** built to run directly on top of your **Google AI Pro** subscription (**Google Flow**, **Google Gemini**, and **Google AI Studio**).

## Complete Studio Capabilities (v3.0)

1. **Stage 2 — Camera Motion (`Omni 1.2 Flash`):**
   - **35 Camera Movement Presets** (all 33 Cinema Studio 4.0 movements including *Crush Zoom, Bullet Time, Snorricam, Robot Arm, Rack Focus, Tilt Up/Down, Pan Left/Right, Pedestal Up/Down, Arc Left/Right, Truck Left/Right, Slider Left/Right, Slow Zoom In/Out, Dolly In/Out, Dolly Zoom, Whip Pan, POV, Handheld, Tracking, Drone Orbit, Aerial Pullback, Crane Up/Down, Side Tracking, Static Shot, Helicopter Shot*, plus *FPV Drone Dive* and *Low-Angle Track*).
   - **Ordered Multi-Move Sequence Chain (`Multi-Move: ON`):** Chain up to **3 camera movements** in order per shot.
   - Motion Intensity (`Subtle` / `Cinematic` / `Aggressive`), Target Duration (`5s`–`15s`), and Native Audio Cue toggle.

2. **Stage 1 — Keyframe & Soul Studio (`Nano Banana 2.1`):**
   - **113 Visual & Soul Presets** across 9 categories (*Cinema, TikTok Core, Instagram Aesthetics, Camera Presets, Beauty, Mood, Surreal, Graphic Art*) with search & category filter pills.
   - **`@Character / Element` Lock** for identity continuity across shots.

3. **Lipsync Studio:**
   - Dedicated dialogue compiler for **Omni 1.2 Flash** with Spoken Dialogue script, Speaker Emotion, Framing (*Tight Talking Head, Medium Waist-Up, Walk & Talk*), Voice/Accent, and Ambience controls.

4. **Motion Control Studio:**
   - Load and preview local reference motion videos (`.mp4`/`.webm`), describe choreography, select Scene Control (*Follow Video Scene* vs *Keep Character Scene*), and pair with camera sync presets.

5. **Short Drama Studio & Storyboard Shot List:**
   - Generate a complete multi-shot storyboard (**Master Keyframe + 3 to 8 linked camera shots**) with consistent `@Cast`, Optics, Lighting, and Color Palette, then copy the full production script or inject shots one by one.

6. **Pro Optics, Film Setup, 20 Color Palettes & Client-Side Color Transfer:**
   - Camera Body (`Modern Digital`, `35mm Film`, `8mm Film`, `DV Camcorder`), Lens Glass (`Clean Sharp`, `Anamorphic`, `Vintage Anamorphic`, `Warm Vintage`, `Halation Vintage`), Aperture (`f/1.4`, `f/4`, `f/11`), Film Genre & Era (`1960s`–`2020s`), and all **20 Cinema Studio Color Palettes** with hex swatches.
   - **Color Transfer & Ref Image Bridge:** Load any reference image to extract a 5-hex dominant palette & lighting mood via `<canvas>`, and paste/drop the image directly into Google Flow or Gemini (`Send Ref to Flow`).

7. **Client-Side Editing Room (`Edit`):**
   - Load generated `.mp4`, `.webm`, or `.png`/`.jpg` clips from Google Flow, reorder shots, preview sequential playback on HTML5 `<canvas>`, and export a combined `.webm` montage via `MediaRecorder`.

8. **Resilient DOM Bridge (`content/bridge.js`):**
   - Ground-truth selectors for **Google Flow** (`flow.google.com` ProseMirror + `Start generation` + `Settings trigger` popover sync), **Google Gemini** (`gemini.google.com` Quill `rich-textarea` + dynamic `Send message`), and **AI Studio** (`aistudio.google.com`), plus **Bind UI** 2-click visual selector calibration.

## Project Structure

```text
higgsfold/
├── manifest.json               # Chrome MV3 manifest (flow.google.com, labs.google, gemini, aistudio)
├── background.js               # Side Panel service worker
├── content/
│   └── bridge.js               # ProseMirror/Quill injector, Image paste/drop, Flow Settings sync & Bind UI
├── sidepanel/
│   ├── index.html              # 5-Studio Side Panel UI + Editing Room + Storyboard + Preset Builder
│   ├── styles.css              # Dark Cinema Studio theme (#0a0a0a / #d4ff00)
│   ├── presets.js              # 113 Stage 1 + 35 Stage 2 presets, 20 Palettes, Optics, Lipsync & Motion Control
│   ├── compiler.js             # Prompt compilers, Short Drama generator, Color Transfer & validators
│   ├── color-transfer.js       # Client-side <canvas> 5-hex palette extractor
│   ├── editing-room.js         # Client-side timeline previewer & WebM MediaRecorder exporter
│   └── app.js                  # Side Panel state, storage & event controller
├── tests/
│   ├── compiler.test.mjs       # Node.js unit tests (node --test)
│   └── testbench.html          # Local Flow + Gemini DOM simulator & side panel playtest bench
├── icons/                      # 16px, 48px, 128px studio icons
└── push-to-github.ps1          # PowerShell git commit & push helper
```

## Installation (Load Unpacked in Chrome)

1. Clone this repository locally:
   ```bash
   git clone https://github.com/baehaqi-rf/higgsfold.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `higgsfold` folder.
5. Open **`https://flow.google.com/`** (or `https://gemini.google.com`) using your Google AI Pro account.
6. Click the **HiggsFold** icon in the Chrome toolbar to open the Side Panel.

## Running Tests

```bash
node --test tests/compiler.test.mjs
```

To run the interactive playtest bench locally:
```bash
python -m http.server 8766 --bind 127.0.0.1
# Open http://127.0.0.1:8766/tests/testbench.html
```
