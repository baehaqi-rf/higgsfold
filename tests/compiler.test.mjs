import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGE1_PRESETS,
  STAGE2_PRESETS,
  STAGE1_CATEGORIES,
  STAGE2_CATEGORIES
} from "../sidepanel/presets.js";
import {
  compilePrompt,
  buildCustomPreset,
  formatStoryboardExport
} from "../sidepanel/compiler.js";

test("preset catalog has unique IDs and valid categories", () => {
  assert.ok(STAGE1_PRESETS.length >= 14, "Expected >= 14 Stage 1 presets");
  assert.ok(STAGE2_PRESETS.length >= 20, "Expected >= 20 Stage 2 presets");

  const s1Ids = new Set(STAGE1_PRESETS.map((p) => p.id));
  const s2Ids = new Set(STAGE2_PRESETS.map((p) => p.id));
  assert.equal(s1Ids.size, STAGE1_PRESETS.length, "Stage 1 IDs must be unique");
  assert.equal(s2Ids.size, STAGE2_PRESETS.length, "Stage 2 IDs must be unique");

  for (const p of STAGE1_PRESETS) {
    assert.ok(STAGE1_CATEGORIES.includes(p.category), `Invalid Stage 1 category: ${p.category}`);
    assert.ok(p.lensSpec && p.lightingSpec && p.soulLockDirective);
  }
  for (const p of STAGE2_PRESETS) {
    assert.ok(STAGE2_CATEGORIES.includes(p.category), `Invalid Stage 2 category: ${p.category}`);
    assert.ok(p.cameraTrajectory && p.physicsSpec && p.audioCue);
  }
});

test("compilePrompt compiles Stage 1 Keyframe with Pro Optics & Character Lock", () => {
  const prompt = compilePrompt(
    {
      stage: "stage1",
      selectedStage1Id: "neon-noir-anamorphic",
      subject: "Detective checking watch under neon rain",
      characterLock: "@detective_kai, charcoal coat",
      aspect: "16:9",
      resolution: "2k",
      lighting: "practicals",
      cameraBody: "35mm-film",
      lensType: "vintage-anamorphic",
      aperture: "f1.4",
      genre: "noir",
      era: "1980s",
      palette: "nostalgic-blue"
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.match(prompt, /^\[KEYFRAME • NEON NOIR • AR 16:9 • 2K\]/);
  assert.match(prompt, /Character\/@Element Lock: @detective_kai, charcoal coat/);
  assert.match(prompt, /35mm motion picture film stock/);
  assert.match(prompt, /1970s vintage anamorphic optics/);
  assert.match(prompt, /f\/1\.4/);
  assert.match(prompt, /1980s nocturnal analog cinema vibe/);
  assert.match(prompt, /nostalgic cool slate blue/);
  assert.match(prompt, /Identity Lock:/);
});

test("compilePrompt compiles Stage 2 Multi-Move ordered camera sequence", () => {
  const prompt = compilePrompt(
    {
      stage: "stage2",
      selectedStage2Id: "dolly-push-hero",
      stage2Queue: ["dolly-push-hero", "rack-focus-shift", "crash-zoom-in"],
      subject: "Singer steps toward microphone",
      intensity: "aggressive",
      aspect: "9:16",
      duration: "8s",
      resolution: "1080p",
      lighting: "contre-jour",
      includeAudio: true
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.match(prompt, /\[CAMERA MOTION: DOLLY IN → RACK FOCUS → CRASH ZOOM IN • 8s • AR 9:16 • 1080p\]/);
  assert.match(prompt, /Camera Sequence \(Ordered Multi-Move\):/);
  assert.match(prompt, /Phase 1 \(Dolly In\):/);
  assert.match(prompt, /Phase 2 \(Rack Focus\):/);
  assert.match(prompt, /Phase 3 \(Crash Zoom In\):/);
  assert.match(prompt, /high-octane, visceral camera momentum/);
  assert.match(prompt, /Native Audio Design:/);
});

test("compilePrompt respects silent audio option", () => {
  const prompt = compilePrompt(
    {
      stage: "stage2",
      selectedStage2Id: "static-cinema-lock",
      stage2Queue: ["static-cinema-lock"],
      subject: "Wind blowing curtains",
      intensity: "subtle",
      aspect: "16:9",
      duration: "5s",
      lighting: "match-ref",
      includeAudio: false
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.match(prompt, /Native Audio Design: Silent \/ minimal natural room tone only\./);
});

test("buildCustomPreset validates required fields and builds Stage 1/2 presets", () => {
  assert.throws(() => buildCustomPreset({ name: "  " }, "stage2"), /Preset name is required/);
  assert.throws(
    () => buildCustomPreset({ name: "Empty Motion" }, "stage2"),
    /Camera Trajectory description is required/
  );

  const s2 = buildCustomPreset(
    {
      name: "Tokyo Whip",
      badge: "tokyo",
      category: "Dynamic",
      defaultDuration: "8s",
      cameraTrajectory: "Fast sideways whip into neon reflection."
    },
    "stage2"
  );
  assert.equal(s2.custom, true);
  assert.equal(s2.badge, "TOKYO");
  assert.equal(s2.defaultDuration, "8s");
  assert.ok(s2.id.startsWith("custom-tokyo-whip-"));

  const s1 = buildCustomPreset(
    {
      name: "Velvet Look",
      lensSpec: "50mm prime at f/1.8"
    },
    "stage1"
  );
  assert.equal(s1.custom, true);
  assert.ok(s1.soulLockDirective.length > 10);
});

test("formatStoryboardExport formats multi-shot script cleanly", () => {
  const out = formatStoryboardExport([
    { stage: "NANO BANANA 2.1", preset: "Editorial 35mm", prompt: "LINE1" },
    { stage: "OMNI 1.2 FLASH", preset: "Dolly In → Crash Zoom In", prompt: "LINE2" }
  ]);
  assert.match(out, /=== SHOT 1: Editorial 35mm \(NANO BANANA 2\.1\) ===\nLINE1/);
  assert.match(out, /=== SHOT 2: Dolly In → Crash Zoom In \(OMNI 1\.2 FLASH\) ===\nLINE2/);
});
