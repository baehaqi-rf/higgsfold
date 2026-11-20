import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGE1_PRESETS,
  STAGE2_PRESETS,
  STAGE1_CATEGORIES,
  STAGE2_CATEGORIES,
  COLOR_PALETTES
} from "../sidepanel/presets.js";
import {
  compilePrompt,
  generateShortDramaStoryboard,
  analyzeRgbSamplesForColorTransfer,
  buildCustomPreset,
  formatStoryboardExport
} from "../sidepanel/compiler.js";

test("preset catalog includes all 110+ Stage 1 Soul looks, 35 Stage 2 moves, and 20 Palettes", () => {
  assert.ok(STAGE1_PRESETS.length >= 110, `Expected >= 110 Stage 1 presets, got ${STAGE1_PRESETS.length}`);
  assert.equal(STAGE2_PRESETS.length, 35, "Expected 35 Stage 2 camera presets");
  assert.equal(COLOR_PALETTES.length, 21, "Expected Match Reference + 20 Cinema Studio palettes");

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

test("compilePrompt compiles Stage 1 Keyframe with Pro Optics, Color Transfer & Character Lock", () => {
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
      palette: "nostalgic-blue",
      colorTransferSummary: "Color Transfer Reference: Match dominant palette [#112233, #EEAA55]."
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.match(prompt, /^\[KEYFRAME • NEON NOIR • AR 16:9 • 2K\]/);
  assert.match(prompt, /Character\/@Element Lock: @detective_kai, charcoal coat/);
  assert.match(prompt, /35mm motion picture film stock/);
  assert.match(prompt, /Color Transfer Reference: Match dominant palette/);
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

  assert.match(prompt, /\[CAMERA MOTION: DOLLY IN → RACK FOCUS → CRUSH ZOOM • 8s • AR 9:16 • 1080p\]/);
  assert.match(prompt, /Camera Sequence \(Ordered Multi-Move\):/);
  assert.match(prompt, /Phase 1 \(Dolly In\):/);
  assert.match(prompt, /Phase 2 \(Rack Focus\):/);
  assert.match(prompt, /Phase 3 \(Crush Zoom\):/);
});

test("compilePrompt compiles Lipsync Studio & Motion Control modes", () => {
  const lipsync = compilePrompt(
    {
      stage: "lipsync",
      subject: "Host looking directly into lens",
      characterLock: "@host_aria",
      lipsyncDialogue: "Selamat datang di studio baru kita.",
      lipsyncEmotion: "confident",
      lipsyncFraming: "closeup",
      lipsyncVoice: "natural-id",
      lipsyncAmbience: "quiet studio room tone",
      duration: "8s",
      aspect: "9:16",
      lighting: "auto"
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.match(lipsync, /\[LIPSYNC STUDIO • OMNI 1\.2 FLASH • 8s • AR 9:16\]/);
  assert.match(lipsync, /Spoken Dialogue \(Exact Lip-Sync\): "Selamat datang di studio baru kita\."/);

  const motionCtrl = compilePrompt(
    {
      stage: "motion_control",
      selectedStage2Id: "side-tracking-follow",
      subject: "Cyberpunk courier",
      motionRefDescription: "Strides forward and leaps onto concrete ledge",
      motionControlMode: "image-bg",
      duration: "5s",
      aspect: "16:9",
      lighting: "match-ref",
      includeAudio: true
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.match(motionCtrl, /\[MOTION CONTROL TRANSFER • SIDE TRACKING • 5s • AR 16:9\]/);
  assert.match(motionCtrl, /Strides forward and leaps onto concrete ledge/);
  assert.match(motionCtrl, /preserving the background and lighting of the target character image/);
});

test("generateShortDramaStoryboard generates Master Keyframe + N linked shots", () => {
  const shots = generateShortDramaStoryboard(
    {
      premise: "Two detectives argue beside a burning car",
      cast: "@detective_a, @detective_b",
      shotCount: 4,
      aspect: "16:9",
      duration: "5s"
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.equal(shots.length, 5); // 1 master keyframe + 4 shots
  assert.equal(shots[0].stage, "DRAMA • KEYFRAME");
  assert.match(shots[1].prompt, /Shot 1\/4/);
  assert.match(shots[4].prompt, /@detective_a, @detective_b/);
});

test("analyzeRgbSamplesForColorTransfer extracts swatches and mood", () => {
  const samples = [
    [220, 80, 20],
    [222, 82, 22],
    [15, 25, 45],
    [16, 26, 46],
    [200, 190, 175]
  ];
  const res = analyzeRgbSamplesForColorTransfer(samples);
  assert.ok(res.swatches.length >= 2);
  assert.match(res.summary, /Color Transfer Reference:/);
});

test("buildCustomPreset & formatStoryboardExport work cleanly", () => {
  assert.throws(() => buildCustomPreset({ name: "  " }, "stage2"), /Preset name is required/);
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

  const out = formatStoryboardExport([
    { stage: "STAGE1", preset: "Editorial 35mm", prompt: "LINE1" }
  ]);
  assert.match(out, /=== SHOT 1: Editorial 35mm \(STAGE1\) ===\nLINE1/);
});
