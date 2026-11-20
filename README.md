# HiggsFold Studio v4.0 (Chrome Extension Side Panel)

**HiggsFold** is a zero-dependency **Chrome Side Panel Studio (Manifest V3)** inspired by Cinema Studio 4.0 and built to run directly on top of your **Google AI Pro** subscription (**Google Flow**, **Google Gemini**, and **Google AI Studio**).

## Complete Studio Capabilities (v4.0)

1. **Temporal Beat Prose Compiler & Physics Guardrails (Stage 1 & Stage 2):**
   - **Prose Cinema Mode (Default):** Compiles natural-language temporal beats (`0.0s–1.3s`, `1.3s–4.0s`, `4.0s–5.0s`, or proportional split across up to 3 sequential camera moves) with toggleable anti-morphing physics guardrails (`Guardrails`) and legacy `Structured` breakdown mode.
   - **Stage 2 — 35 Camera Movements:** All Cinema Studio 4.0 camera trajectories with distinct directional hover preview animations (`Pan Left/Right`, `Tilt Up/Down`, `Arc Left/Right`, `Truck Left/Right`, `Slider Left/Right`, `Crane Up/Down`, `Dolly In/Out`).
   - **Stage 1 — 113 Keyframe & Soul Studio Looks:** Across 10 categories with search, category filter pills, and deduplicated optical/lighting specs.

2. **Closed-Loop Grab Output (`Grab Output`):**
   - Scans generated `>= 256px` images/videos directly from the active Google Flow or Gemini tab (using MV3 background blob proxying for `googleusercontent.com` / `storage.googleapis.com` and in-page `blob:` conversion).
   - One-click workflows: **Set Ref + Palette**, **+ Editing Room**, or **+ Soul Vault**.

3. **Flow Sub-Mode Sync & Resilient Bridge (`content/bridge.js`):**
   - Open Shadow DOM recursive traversal (`querySelectorAllDeep`), Zero-Width Space normalization, `beforeinput` rich-text support, single-path image waterfall (`paste` -> `file-input` -> `drop`), `Frames` / `Ingredients` Flow sub-mode sync, `2.39:1 -> 16:9` fallback, and priority model matching (`Nano Banana` / `Omni 1.2` / `Veo 3.1`).
   - **Bind UI** 2-click visual selector calibration.

4. **Soul Vault (`Souls` / `@Vault` — IndexedDB):**
   - Persistent IndexedDB character & style repository (`higgsfold_vault_db`) storing `@handle`, DNA prompt, default Lens/Palette, and up to 4 WebP-compressed reference images (`<= 1024px`).
   - One-click **Apply Soul** and **Push Refs to Flow**.

5. **Lipsync Studio & Motion Control Contact Sheet:**
   - Live speech pace validator (`words/sec` estimator against selected duration) and Camera Pairing (`Select`).
   - Local `.mp4`/`.webm` frame sampler stitching **3-frame** (`<= 6s`) or **6-frame** (`> 6s`) labeled (`START` / `MID` / `END`) contact sheets directly attachable to Flow.

6. **Short Drama 2.0 & Storyboard Runner:**
   - 4 narrative **Story Arcs** (*Cinematic Drama, Luxury Commercial, Suspense Thriller, Fashion Lookbook*) generating a Master Keyframe + 3–8 linked shots with `↑/↓` reorder, per-shot direct **Inject**, and JSON/Markdown script export.

7. **Client-Side NLE Editing Room (`Edit`):**
   - Aspect-aware HD canvas & WebM export (`16:9 1280×720`, `9:16 720×1280`, `1:1 1080×1080`, `2.39:1 1280×536`), `cover`/`contain` framing without aspect distortion, per-clip **Trim In/Out**, `0.35s` crossfade transitions, and WebAudio `AudioContext` stream multiplexing (`6 Mbps` video + `128 kbps` audio).

## Project Structure

```text
higgsfold/
├── manifest.json               # Chrome MV3 manifest (v4.0.0)
├── background.js               # MV3 Side Panel worker + CORS-free media blob fetcher
├── content/
│   └── bridge.js               # Shadow DOM bridge, single-path image waterfall, Flow sub-mode sync & Grab Output
├── sidepanel/
│   ├── index.html              # 5-Studio UI + Grab Output + Soul Vault + Editing Room + Storyboard + Preset Builder
│   ├── styles.css              # Dark Cinema Studio UI + 16+ directional Stage 2 preview animations
│   ├── presets.js              # 113 Stage 1 + 35 Stage 2 presets, 20 Palettes, Optics & 4 Drama Story Arcs
│   ├── compiler.js             # Temporal Prose/Structured compilers, Lipsync pace, Colorist Translator & validators
│   ├── color-transfer.js       # Client-side <canvas> Colorist semantic palette analyzer
│   ├── soul-vault.js           # IndexedDB persistent character vault + WebP compressor
│   ├── motion-extractor.js     # Local video keyframe contact-sheet extractor
│   ├── editing-room.js         # Client-side NLE (Trim In/Out, Crossfade, WebAudio Mux & HD WebM Export)
│   └── app.js                  # Debounced workspace persistence, concurrency-locked injection & drawer wiring
├── tests/
│   ├── compiler.test.mjs       # Compiler, prose beats, guardrails, colorist, batch ID tests
│   ├── bridge.test.mjs         # Bridge DOM, Shadow DOM, Flow sync, Grab Output, waterfall tests
│   ├── editing-room.test.mjs   # NLE export dimensions, trim clamping, cover/contain & Soul/Motion helpers
│   └── testbench.html          # Local Flow + Gemini DOM simulator & interactive playtest bench
├── icons/                      # 16px, 48px, 128px studio icons
└── push-to-github.ps1          # PowerShell git commit & push helper
```

## Installation (Load Unpacked in Chrome)

1. Clone this repository locally:
   ```bash
   git clone https://github.com/baehaqi-rf/higgsfold.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** and click **Load unpacked**, selecting the `higgsfold` folder.
4. Open **`https://flow.google.com/`** (or `https://gemini.google.com`) and click the **HiggsFold** extension icon.

## Running Tests

```bash
node --test tests/compiler.test.mjs tests/bridge.test.mjs tests/editing-room.test.mjs
```
