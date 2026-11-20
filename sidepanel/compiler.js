// HiggsFold Studio v3.0 — Pure Prompt Compilers, Drama Generator & Color Transfer Analyzer
// Covers all 5 studios: Motion (Stage 2), Keyframe/Soul (Stage 1), Lipsync, Motion Control, Short Drama

import {
  INTENSITY_MODIFIERS,
  LIGHTING_MOODS,
  CAMERA_BODIES,
  LENS_TYPES,
  APERTURE_OPTIONS,
  FILM_GENRES,
  FILM_ERAS,
  COLOR_PALETTES,
  LIPSYNC_EMOTIONS,
  LIPSYNC_FRAMINGS,
  LIPSYNC_VOICES,
  MOTION_CONTROL_MODES
} from "./presets.js";

function findOptionText(list, id) {
  const found = list.find((item) => item.id === id);
  return found?.text ? found.text.trim() : "";
}

function buildOpticsLine(state) {
  const parts = [
    findOptionText(CAMERA_BODIES, state.cameraBody || "auto"),
    findOptionText(LENS_TYPES, state.lensType || "auto"),
    findOptionText(APERTURE_OPTIONS, state.aperture || "auto")
  ].filter(Boolean);
  return parts.join(" ");
}

function buildFilmSetupLine(state) {
  const genre = findOptionText(FILM_GENRES, state.genre || "auto");
  const era = findOptionText(FILM_ERAS, state.era || "auto");
  if (!genre && !era) return "";
  if (genre && era) return `Film Style: ${era} paired with ${genre}.`;
  return `Film Style: ${genre || era}.`;
}

function buildColorGradeLine(state) {
  const paletteText = findOptionText(COLOR_PALETTES, state.palette || "match-ref");
  const transferText = (state.colorTransferSummary || "").trim();
  return [paletteText, transferText].filter(Boolean).join(" ");
}

function buildSubjectWithLock(state, fallback) {
  const rawSubject = (state.subject || "").trim() || fallback;
  const charLock = (state.characterLock || "").trim();
  return charLock ? `${rawSubject} (Character/@Element Lock: ${charLock})` : rawSubject;
}

/**
 * Compile structured prompt for Stage 1 (Keyframe/Soul), Stage 2 (Motion),
 * Stage 3 (Lipsync Studio), or Stage 4 (Motion Control).
 */
export function compilePrompt(state, stage1Presets, stage2Presets) {
  const lightingObj =
    LIGHTING_MOODS.find((l) => l.id === state.lighting) || LIGHTING_MOODS[0];
  const opticsOverride = buildOpticsLine(state);
  const filmSetup = buildFilmSetupLine(state);
  const colorGrade = buildColorGradeLine(state);

  if (state.stage === "stage1") {
    const subjectText = buildSubjectWithLock(
      state,
      "[Subject from uploaded reference image positioned in scene]"
    );
    const preset =
      stage1Presets.find((p) => p.id === state.selectedStage1Id) || stage1Presets[0];
    const resolutionTag = state.resolution ? ` • ${state.resolution.toUpperCase()}` : "";
    const lensLine = opticsOverride
      ? `${preset.lensSpec} ${opticsOverride}`
      : preset.lensSpec;
    const lightingParts = [preset.lightingSpec, lightingObj.text, colorGrade]
      .filter(Boolean)
      .join(" ");

    const lines = [
      `[KEYFRAME • ${preset.name.toUpperCase()} • AR ${state.aspect}${resolutionTag}]`,
      `Subject & Scene: ${subjectText}.`,
      `Camera & Lens: ${lensLine}`,
      `Composition: ${preset.compositionRule}`,
      `Lighting & Grade: ${lightingParts}`
    ];

    if (filmSetup) lines.push(filmSetup);
    lines.push(`Identity Lock: ${preset.soulLockDirective}`);
    return lines.join("\n");
  }

  if (state.stage === "lipsync") {
    const subjectText = buildSubjectWithLock(
      state,
      "Close-up speaker looking into lens"
    );
    const dialogue =
      (state.lipsyncDialogue || "").trim() ||
      "Wait until you see what happens next.";
    const emotionText = findOptionText(LIPSYNC_EMOTIONS, state.lipsyncEmotion || "calm");
    const framingText = findOptionText(LIPSYNC_FRAMINGS, state.lipsyncFraming || "closeup");
    const voiceText = findOptionText(LIPSYNC_VOICES, state.lipsyncVoice || "natural-id");
    const envAudio = (state.lipsyncAmbience || "").trim() || "quiet intimate studio room tone";

    const lines = [
      `[LIPSYNC STUDIO • OMNI 1.2 FLASH • ${state.duration} • AR ${state.aspect}]`,
      `Speaker & Framing: ${subjectText}. ${framingText}.`,
      `Spoken Dialogue (Exact Lip-Sync): "${dialogue}"`,
      `Performance & Expression: ${emotionText}. Exact syllable-accurate jaw, lip, and breath synchronization with natural blinking.`,
      `Voice & Audio Design: ${voiceText}; background ambience: ${envAudio}.`
    ];
    const visualFinish = [opticsOverride, lightingObj.text, colorGrade, filmSetup]
      .filter(Boolean)
      .join(" ");
    if (visualFinish) lines.push(`Optics & Grade: ${visualFinish}`);
    return lines.join("\n");
  }

  if (state.stage === "motion_control") {
    const subjectText = buildSubjectWithLock(
      state,
      "Target character from uploaded portrait/full-body reference"
    );
    const refAction =
      (state.motionRefDescription || "").trim() ||
      "Subject walks forward with confident stride, turns head sharply toward lens, and raises right hand in subtle gesture";
    const modeSpec = findOptionText(
      MOTION_CONTROL_MODES,
      state.motionControlMode || "video-bg"
    );
    const camPreset =
      stage2Presets.find((p) => p.id === state.selectedStage2Id) || stage2Presets[0];

    const lines = [
      `[MOTION CONTROL TRANSFER • ${camPreset.name.toUpperCase()} • ${state.duration} • AR ${state.aspect}]`,
      `Target Character: ${subjectText}.`,
      `Motion Reference Choreography: ${refAction}.`,
      `Scene Control Rule: ${modeSpec}`,
      `Camera Sync: ${camPreset.cameraTrajectory}`,
      `Continuity: Preserve exact target face, outfit details, and anatomy without ghosting or limb morphing. ${[opticsOverride, lightingObj.text, colorGrade].filter(Boolean).join(" ")}`
    ];
    if (state.includeAudio) {
      lines.push(`Native Audio Design: ${camPreset.audioCue}`);
    } else {
      lines.push(`Native Audio Design: Silent / minimal natural room tone only.`);
    }
    return lines.join("\n");
  }

  // Stage 2 (or fallback): Omni 1.2 Flash Multi-Move Camera Motion Compiler
  const subjectText = buildSubjectWithLock(
    state,
    "[Subject from uploaded reference image positioned in scene]"
  );
  const queueIds =
    Array.isArray(state.stage2Queue) && state.stage2Queue.length > 0
      ? state.stage2Queue
      : [state.selectedStage2Id];

  const selectedPresets = queueIds
    .map((id) => stage2Presets.find((p) => p.id === id))
    .filter(Boolean);

  if (selectedPresets.length === 0 && stage2Presets.length > 0) {
    selectedPresets.push(stage2Presets[0]);
  }

  const intensityText =
    INTENSITY_MODIFIERS[state.intensity] || INTENSITY_MODIFIERS.cinematic;

  const titleNames = selectedPresets.map((p) => p.name.toUpperCase()).join(" → ");
  const resolutionTag = state.resolution ? ` • ${state.resolution}` : "";

  let trajectoryBlock;
  if (selectedPresets.length === 1) {
    trajectoryBlock = `Camera Trajectory: ${selectedPresets[0].cameraTrajectory} Execute with ${intensityText}.`;
  } else {
    const sequencedSteps = selectedPresets
      .map((p, idx) => `Phase ${idx + 1} (${p.name}): ${p.cameraTrajectory}`)
      .join(" ");
    trajectoryBlock = `Camera Sequence (Ordered Multi-Move): ${sequencedSteps} Transition seamlessly across phases with ${intensityText}.`;
  }

  const physicsUnique = Array.from(
    new Set(selectedPresets.map((p) => p.physicsSpec.trim()).filter(Boolean))
  ).join(" ");

  const physicsParts = [physicsUnique, opticsOverride, lightingObj.text, colorGrade]
    .filter(Boolean)
    .join(" ");

  const blocks = [
    `[CAMERA MOTION: ${titleNames} • ${state.duration} • AR ${state.aspect}${resolutionTag}]`,
    `Scene Action: ${subjectText}.`,
    trajectoryBlock,
    `Physics & Continuity: ${physicsParts}`
  ];

  if (filmSetup) blocks.push(filmSetup);

  if (state.includeAudio) {
    const audioJoined = Array.from(
      new Set(selectedPresets.map((p) => p.audioCue.trim()).filter(Boolean))
    ).join(" ");
    blocks.push(`Native Audio Design: ${audioJoined}`);
  } else {
    blocks.push(`Native Audio Design: Silent / minimal natural room tone only.`);
  }

  return blocks.join("\n");
}

/**
 * Short Drama Studio: Generates a multi-shot storyboard sequence with consistent cast & grade.
 */
export function generateShortDramaStoryboard(options, stage1Presets, stage2Presets) {
  const premise =
    (options.premise || "").trim() || "Two strangers cross paths on a rain-slicked midnight street";
  const cast = (options.cast || "").trim() || "@lead_character";
  const count = Math.min(8, Math.max(2, Number(options.shotCount) || 4));
  const aspect = options.aspect || "16:9";
  const duration = options.duration || "5s";
  const palette = options.palette || "match-ref";
  const lighting = options.lighting || "match-ref";
  const genre = options.genre || "general";
  const era = options.era || "auto";

  const shotBlueprints = [
    { role: "Establishing Shot", s2Id: "crane-jib-rise", action: `Wide establishing beat: ${premise}` },
    { role: "Hero Introduction", s2Id: "dolly-push-hero", action: `Medium push-in onto ${cast} reacting to the moment (${premise})` },
    { role: "Tension Close-Up", s2Id: "slow-zoom-in", action: `Intimate eye-level close-up on ${cast}, subtle emotional shift` },
    { role: "Dynamic Turn", s2Id: "arc-left", action: `Orbital beat circling ${cast} as tension peaks in the scene` },
    { role: "Kinetic Peak", s2Id: "crash-zoom-in", action: `Sudden dramatic realization / decisive movement by ${cast}` },
    { role: "Tracking Follow", s2Id: "side-tracking-follow", action: `Following ${cast} moving decisively through the environment` },
    { role: "Optical Reveal", s2Id: "rack-focus-shift", action: `Focus shift revealing critical story detail near ${cast}` },
    { role: "Ending Pullback", s2Id: "aerial-pullback", action: `Closing beat pulling away from ${cast} into the wider world` }
  ];

  const shots = [];
  // Shot 0: Master Keyframe anchor in Stage 1
  const keyframePrompt = compilePrompt(
    {
      stage: "stage1",
      selectedStage1Id: options.keyframePresetId || stage1Presets[0]?.id,
      subject: `Master Drama Keyframe: ${premise}`,
      characterLock: cast,
      aspect,
      resolution: "2k",
      lighting,
      palette,
      genre,
      era,
      cameraBody: options.cameraBody || "35mm-film",
      lensType: options.lensType || "anamorphic",
      aperture: options.aperture || "auto"
    },
    stage1Presets,
    stage2Presets
  );

  shots.push({
    id: Date.now(),
    stage: "DRAMA • KEYFRAME",
    preset: "Master Anchor",
    prompt: keyframePrompt,
    createdAt: "Drama"
  });

  for (let i = 0; i < count; i++) {
    const bp = shotBlueprints[i % shotBlueprints.length];
    const presetObj = stage2Presets.find((p) => p.id === bp.s2Id) || stage2Presets[0];
    const prompt = compilePrompt(
      {
        stage: "stage2",
        selectedStage2Id: presetObj.id,
        stage2Queue: [presetObj.id],
        subject: `[Shot ${i + 1}/${count} — ${bp.role}] ${bp.action}`,
        characterLock: cast,
        intensity: "cinematic",
        aspect,
        duration,
        resolution: "1080p",
        lighting,
        palette,
        genre,
        era,
        cameraBody: options.cameraBody || "35mm-film",
        lensType: options.lensType || "anamorphic",
        aperture: options.aperture || "auto",
        includeAudio: options.includeAudio !== false
      },
      stage1Presets,
      stage2Presets
    );
    shots.push({
      id: Date.now() + i + 1,
      stage: `DRAMA • SHOT ${i + 1}`,
      preset: `${bp.role} (${presetObj.name})`,
      prompt,
      createdAt: "Drama"
    });
  }

  return shots;
}

/**
 * Pure Color Transfer quantization & mood detector from sampled RGBA byte triples.
 * @param {Array<[number, number, number]>} rgbSamples
 */
export function analyzeRgbSamplesForColorTransfer(rgbSamples) {
  if (!Array.isArray(rgbSamples) || rgbSamples.length === 0) {
    return { swatches: [], summary: "" };
  }

  // Coarse 5-bit color bucketing to find dominant distinct hues
  const buckets = new Map();
  let sumLuma = 0;
  let sumWarmth = 0;

  for (const [r, g, b] of rgbSamples) {
    sumLuma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sumWarmth += r - b;
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${Math.min(255, qr)},${Math.min(255, qg)},${Math.min(255, qb)}`;
    const prev = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    prev.count += 1;
    prev.r += r;
    prev.g += g;
    prev.b += b;
    buckets.set(key, prev);
  }

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");

  const swatches = [];
  for (const entry of sorted) {
    const ar = entry.r / entry.count;
    const ag = entry.g / entry.count;
    const ab = entry.b / entry.count;
    const tooClose = swatches.some(
      (s) => Math.hypot(s.r - ar, s.g - ag, s.b - ab) < 48
    );
    if (!tooClose) {
      swatches.push({
        r: ar,
        g: ag,
        b: ab,
        hex: `#${toHex(ar)}${toHex(ag)}${toHex(ab)}`
      });
    }
    if (swatches.length >= 5) break;
  }

  const avgLuma = sumLuma / rgbSamples.length;
  const avgWarmth = sumWarmth / rgbSamples.length;
  const keyTone = avgLuma < 85 ? "low-key deep shadow" : avgLuma > 170 ? "high-key bright" : "balanced mid-tone";
  const tempTone = avgWarmth > 18 ? "warm amber-golden bias" : avgWarmth < -18 ? "cool cyan-blue bias" : "neutral color temperature";
  const hexList = swatches.map((s) => s.hex.toUpperCase()).join(", ");

  return {
    swatches: swatches.map((s) => s.hex),
    summary: `Color Transfer Reference: Match dominant palette [${hexList}] with ${keyTone} exposure and ${tempTone}.`
  };
}

/**
 * Validate and normalize a user-defined custom preset for Stage 1 or Stage 2.
 */
export function buildCustomPreset(input, stage) {
  const name = (input.name || "").trim();
  if (!name) {
    throw new Error("Preset name is required.");
  }
  const idSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = `custom-${idSlug || "preset"}-${Date.now().toString(36)}`;
  const badge = ((input.badge || "CUSTOM").trim().toUpperCase()).slice(0, 12) || "CUSTOM";

  if (stage === "stage1") {
    const lensSpec = (input.lensSpec || "").trim();
    const lightingSpec = (input.lightingSpec || "").trim();
    if (!lensSpec && !lightingSpec) {
      throw new Error("Provide at least Lens or Lighting specification.");
    }
    return {
      id,
      custom: true,
      name,
      badge,
      category: input.category || "Cinema",
      tag: (input.tag || "Custom Look").trim(),
      motionPreview: input.motionPreview || "preview-subtle-breath",
      lensSpec: lensSpec || "35mm cinema prime lens at f/2.0, natural optical texture.",
      lightingSpec: lightingSpec || "Balanced cinematic directional lighting.",
      compositionRule:
        (input.compositionRule || "").trim() ||
        "Balanced rule-of-thirds hero framing.",
      soulLockDirective:
        (input.soulLockDirective || "").trim() ||
        "Preserve exact facial identity, proportions, and wardrobe continuity from reference image."
    };
  }

  const cameraTrajectory = (input.cameraTrajectory || "").trim();
  if (!cameraTrajectory) {
    throw new Error("Camera Trajectory description is required.");
  }
  return {
    id,
    custom: true,
    name,
    badge,
    category: input.category || "Dynamic",
    motionPreview: input.motionPreview || "preview-dolly",
    defaultDuration: ["5s", "8s", "12s", "15s"].includes(input.defaultDuration)
      ? input.defaultDuration
      : "5s",
    cameraTrajectory,
    physicsSpec:
      (input.physicsSpec || "").trim() ||
      "Consistent optical perspective, natural motion blur, zero identity warping.",
    audioCue:
      (input.audioCue || "").trim() ||
      "Realistic spatial environmental ambience synchronized to camera speed."
  };
}

/**
 * Format saved Storyboard shots into a clean multi-shot production script.
 */
export function formatStoryboardExport(shots) {
  if (!Array.isArray(shots) || shots.length === 0) return "";
  return shots
    .map(
      (s, i) =>
        `=== SHOT ${i + 1}: ${s.title || s.preset} (${s.stage}) ===\n${s.prompt}`
    )
    .join("\n\n");
}
