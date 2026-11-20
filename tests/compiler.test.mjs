import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGE1_PRESETS,
  STAGE2_PRESETS,
  STAGE1_CATEGORIES,
  STAGE2_CATEGORIES,
  COLOR_PALETTES,
  DRAMA_STORY_ARCS
} from "../sidepanel/presets.js";
import {
  compilePrompt,
  generateShortDramaStoryboard,
  analyzeRgbSamplesForColorTransfer,
  estimateLipsyncPace,
  buildCustomPreset,
  formatStoryboardExport,
  buildGeminiDirectorMetaPrompt,
  cleanGeminiEnhancedOutput
} from "../sidepanel/compiler.js";

test("preset catalog includes 110+ Stage 1 looks, 47 Stage 2 camera+Kinetic VFX moves, and zero brand leakage", () => {
  assert.ok(STAGE1_PRESETS.length >= 110, `Expected >= 110 Stage 1 presets, got ${STAGE1_PRESETS.length}`);
  assert.equal(STAGE2_PRESETS.length, 47, "Expected 35 camera + 12 Kinetic VFX presets");
  assert.ok(STAGE2_CATEGORIES.includes("Kinetic VFX"));
  assert.equal(STAGE2_PRESETS.filter((p) => p.category === "Kinetic VFX").length, 12);
  assert.equal(COLOR_PALETTES.length, 21, "Expected Match Reference + 20 Cinema Studio palettes");
  assert.equal(DRAMA_STORY_ARCS.length, 4, "Expected 4 Short Drama Story Arcs");

  const s1Ids = new Set(STAGE1_PRESETS.map((p) => p.id));
  const s2Ids = new Set(STAGE2_PRESETS.map((p) => p.id));
  assert.equal(s1Ids.size, STAGE1_PRESETS.length, "Stage 1 IDs must be unique");
  assert.equal(s2Ids.size, STAGE2_PRESETS.length, "Stage 2 IDs must be unique");

  for (const p of STAGE1_PRESETS) {
    assert.ok(STAGE1_CATEGORIES.includes(p.category), `Invalid Stage 1 category: ${p.category}`);
    assert.ok(p.lensSpec && p.lightingSpec && p.soulLockDirective);
    assert.ok(!/higgsfield/i.test(p.lensSpec), `Brand leakage in lensSpec: ${p.id}`);
    assert.ok(!/higgsfield/i.test(p.lightingSpec), `Brand leakage in lightingSpec: ${p.id}`);
  }
  for (const p of STAGE2_PRESETS) {
    assert.ok(STAGE2_CATEGORIES.includes(p.category), `Invalid Stage 2 category: ${p.category}`);
    assert.ok(p.cameraTrajectory && p.physicsSpec && p.audioCue);
  }

  // Opposite directional moves must have distinct preview classes
  const getMotionClass = (id) => STAGE2_PRESETS.find((p) => p.id === id)?.motionPreview;
  assert.notEqual(getMotionClass("pan-left"), getMotionClass("pan-right"));
  assert.notEqual(getMotionClass("tilt-up"), getMotionClass("tilt-down"));
  assert.notEqual(getMotionClass("arc-left"), getMotionClass("arc-right"));
  assert.notEqual(getMotionClass("truck-left"), getMotionClass("truck-right"));
  assert.notEqual(getMotionClass("slider-left"), getMotionClass("slider-right"));
  assert.notEqual(getMotionClass("crane-jib-rise"), getMotionClass("crane-down-drop"));
});

test("compilePrompt defaults to Temporal Beat Prose with zero bracketed boilerplate and obeys Guardrails toggle", () => {
  const prose = compilePrompt(
    {
      stage: "stage2",
      selectedStage2Id: "dolly-push-hero",
      stage2Queue: ["dolly-push-hero"],
      subject: "Courier stepping out of rain into neon lobby",
      characterLock: "@courier_kai",
      intensity: "cinematic",
      aspect: "16:9",
      duration: "5s",
      lighting: "practicals",
      includeAudio: true
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.equal(/\[[A-Z0-9\s•→-]+\]/.test(prose), false, "Default prose must not contain bracketed headers");
  assert.match(prose, /0\.0s–1\.2s:|0\.0s–1\.3s:/);
  assert.match(prose, /4\.0s–5\.0s:/);
  assert.match(prose, /rigid anatomical consistency/);

  const multiProse = compilePrompt(
    {
      stage: "stage2",
      stage2Queue: ["dolly-push-hero", "rack-focus-shift"],
      subject: "Subject turns toward window",
      duration: "8s",
      aspect: "16:9",
      guardrails: false
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.match(multiProse, /0\.0s–4\.0s \(Dolly In\)/);
  assert.match(multiProse, /4\.0s–8\.0s \(Rack Focus\)/);
  assert.equal(/rigid anatomical consistency/.test(multiProse), false, "Guardrail disabled must omit anti-morph block");
});

test("compilePrompt still supports structured breakdown format when promptFormat='structured'", () => {
  const prompt = compilePrompt(
    {
      stage: "stage1",
      promptFormat: "structured",
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
      colorTransferSummary: "Color Transfer Reference: Film color grade defined by deep obsidian charcoal shadows."
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.match(prompt, /^\[KEYFRAME • NEON NOIR • AR 16:9 • 2K\]/);
  assert.match(prompt, /Character\/@Element Lock: @detective_kai, charcoal coat/);
  assert.match(prompt, /35mm motion picture film stock/);

  const multiStruct = compilePrompt(
    {
      stage: "stage2",
      promptFormat: "structured",
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
  assert.match(multiStruct, /\[CAMERA MOTION: DOLLY IN → RACK FOCUS → CRUSH ZOOM • 8s • AR 9:16 • 1080p\]/);
  assert.match(multiStruct, /Phase 1 \(Dolly In\):/);
});

test("Lipsync Studio Pace Estimator & Camera Pairing compile accurately", () => {
  const okPace = estimateLipsyncPace("Halo semua, selamat datang di studio malam ini.", "5s");
  assert.equal(okPace.status, "ok");

  const fastPace = estimateLipsyncPace(
    "This dialogue line is intentionally far too long to comfortably fit inside a five second video generation without rushing unnaturally or breaking audio lip synchronization.",
    "5s"
  );
  assert.equal(fastPace.status, "fast");

  const pairedPrompt = compilePrompt(
    {
      stage: "lipsync",
      subject: "Presenter seated at desk",
      lipsyncDialogue: "Selamat datang.",
      lipsyncEmotion: "confident",
      lipsyncFraming: "closeup",
      lipsyncVoice: "natural-id",
      lipsyncCameraId: "dolly-push-hero",
      duration: "5s",
      aspect: "9:16"
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.match(pairedPrompt, /Dolly In/);
  assert.match(pairedPrompt, /"Selamat datang\."/);
});

test("generateShortDramaStoryboard respects Story Arcs and compiles narrative progression", () => {
  const thriller = generateShortDramaStoryboard(
    {
      premise: "Two detectives argue beside a burning car",
      cast: "@detective_a, @detective_b",
      arcId: "suspense-thriller",
      shotCount: 4,
      aspect: "16:9",
      duration: "5s"
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );
  assert.equal(thriller.length, 5);
  assert.equal(thriller[0].stage, "DRAMA • KEYFRAME");
  assert.match(thriller[1].preset, /UNEASY OBSERVATION/);
  assert.match(thriller[3].preset, /VERTIGO SHOCK/);
  assert.match(thriller[4].prompt, /@detective_a, @detective_b/);
});

test("analyzeRgbSamplesForColorTransfer outputs zero #HEX codes in prompt summary while keeping UI swatches", () => {
  const samples = [
    [220, 80, 20],
    [222, 82, 22],
    [15, 25, 45],
    [16, 26, 46],
    [200, 190, 175]
  ];
  const res = analyzeRgbSamplesForColorTransfer(samples);
  assert.ok(res.swatches.length >= 2);
  assert.ok(res.swatches.every((s) => /^#[0-9a-f]{6}$/i.test(s)));
  assert.match(res.summary, /Color Transfer Reference:/);
  assert.equal(/#[0-9a-fA-F]{3,6}/.test(res.summary), false, "Color Transfer prose must never contain raw #HEX codes");
  assert.match(res.summary, /shadows/);
  assert.match(res.summary, /highlights/);
});

test("buildCustomPreset generates 10 unique IDs in synchronous batch loop & formats Storyboard", () => {
  assert.throws(() => buildCustomPreset({ name: "  " }, "stage2"), /Preset name is required/);

  const batch = Array.from({ length: 10 }, (_, idx) =>
    buildCustomPreset(
      {
        name: "Same Look Name",
        category: "Dynamic",
        cameraTrajectory: `Trajectory batch #${idx}`
      },
      "stage2"
    )
  );
  const uniqueIds = new Set(batch.map((p) => p.id));
  assert.equal(uniqueIds.size, 10, "Batch preset imports must never collide on Date.now() IDs");

  const out = formatStoryboardExport([
    { stage: "STAGE1", preset: "Editorial 35mm", prompt: "LINE1" }
  ]);
  assert.match(out, /=== SHOT 1: Editorial 35mm \(STAGE1\) ===\nLINE1/);
});

test("Kinetic VFX preset compiles Start->End object morph beats without anti-morph contradiction", () => {
  const morphPrompt = compilePrompt(
    {
      stage: "stage2",
      selectedStage2Id: "liquid-metal-morph",
      stage2Queue: ["liquid-metal-morph"],
      subject: "matte black running sneaker on studio pedestal",
      endObject: "chrome sculptural sports coupe",
      duration: "5s",
      aspect: "16:9",
      guardrails: true
    },
    STAGE1_PRESETS,
    STAGE2_PRESETS
  );

  assert.match(morphPrompt, /From matte black running sneaker on studio pedestal into chrome sculptural sports coupe/);
  assert.match(morphPrompt, /Morph directly into chrome sculptural sports coupe/);
  assert.match(morphPrompt, /kinetic transformation/);
  assert.equal(/zero ghosting or limb morphing/.test(morphPrompt), false);
});

test("buildGeminiDirectorMetaPrompt & cleanGeminiEnhancedOutput preserve locks and strip conversational chatter", () => {
  const meta = buildGeminiDirectorMetaPrompt("5.0s cinema shot (16:9): Rain-slicked courier.", {
    stage: "stage2",
    duration: "5s",
    aspect: "16:9",
    characterLock: "@courier_kai",
    endObject: "chrome hypercar"
  });
  assert.match(meta, /\[HIGGSFOLD DIRECTOR ENHANCE\]/);
  assert.match(meta, /@courier_kai/);
  assert.match(meta, /chrome hypercar/);

  const messy = `Sure, here is your enhanced prompt:\n\n\`\`\`text\n5.0s kinetic cinema shot (16:9): Slicked courier transforms seamlessly.\n\`\`\``;
  assert.equal(
    cleanGeminiEnhancedOutput(messy),
    "5.0s kinetic cinema shot (16:9): Slicked courier transforms seamlessly."
  );
  assert.equal(cleanGeminiEnhancedOutput('"Quoted cinema prompt."'), "Quoted cinema prompt.");
});

test("Every Stage 1 (113) and Stage 2 (47) preset has a real HTTPS Higgsfield CDN poster", () => {
  for (const p of STAGE1_PRESETS) {
    assert.ok(p.poster && p.poster.startsWith("https://"), `Missing real poster for S1 ${p.id}`);
  }
  for (const p of STAGE2_PRESETS) {
    assert.ok(p.poster && p.poster.startsWith("https://"), `Missing real poster for S2 ${p.id}`);
  }
});
