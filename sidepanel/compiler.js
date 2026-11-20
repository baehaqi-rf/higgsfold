// HiggsFold Studio v2.0 — Pure Prompt Compiler & Preset Validators
// Separated from Chrome SidePanel DOM code for deterministic testing & reuse.

import {
  INTENSITY_MODIFIERS,
  LIGHTING_MOODS,
  CAMERA_BODIES,
  LENS_TYPES,
  APERTURE_OPTIONS,
  FILM_GENRES,
  FILM_ERAS,
  COLOR_PALETTES
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

/**
 * Compile a structured HiggsFold 2-Stage Director prompt from current studio state.
 */
export function compilePrompt(state, stage1Presets, stage2Presets) {
  const rawSubject = (state.subject || "").trim();
  const charLock = (state.characterLock || "").trim();
  const subjectBase =
    rawSubject || "[Subject from uploaded reference image positioned in scene]";
  const subjectText = charLock
    ? `${subjectBase} (Character/@Element Lock: ${charLock})`
    : subjectBase;

  const lightingObj =
    LIGHTING_MOODS.find((l) => l.id === state.lighting) || LIGHTING_MOODS[0];
  const opticsOverride = buildOpticsLine(state);
  const filmSetup = buildFilmSetupLine(state);
  const paletteText = findOptionText(COLOR_PALETTES, state.palette || "match-ref");

  if (state.stage === "stage1") {
    const preset =
      stage1Presets.find((p) => p.id === state.selectedStage1Id) || stage1Presets[0];
    const resolutionTag = state.resolution ? ` • ${state.resolution.toUpperCase()}` : "";
    const lensLine = opticsOverride
      ? `${preset.lensSpec} ${opticsOverride}`
      : preset.lensSpec;
    const lightingParts = [preset.lightingSpec, lightingObj.text, paletteText]
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

  // Stage 2: Omni 1.2 Flash Multi-Move Camera Motion Compiler
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

  const physicsParts = [physicsUnique, opticsOverride, lightingObj.text, paletteText]
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
      category: input.category || "Editorial",
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
