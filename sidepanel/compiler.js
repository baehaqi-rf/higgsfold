// HiggsFold Studio v4.0 — Temporal Beat Prose & Structured Prompt Compilers,
// Drama Arc Generator, Lipsync Pace Estimator & Colorist Color Transfer Analyzer

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
  MOTION_CONTROL_MODES,
  DRAMA_STORY_ARCS
} from "./presets.js";

const ANTI_MORPH_GUARDRAIL =
  "Maintain rigid anatomical consistency, single-subject identity lock, crisp lighting parallax, zero ghosting or limb morphing, and physically accurate cloth and motion momentum throughout the shot.";

const KINETIC_TRANSFORM_GUARDRAIL =
  "Preserve crisp edge fidelity, realistic surface lighting response, conservation of momentum, and clean motion-blur continuity throughout the kinetic transformation — zero muddy artifacts or background tearing.";

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

function buildFilmSetupLine(state, proseMode = false) {
  const genre = findOptionText(FILM_GENRES, state.genre || "auto");
  const era = findOptionText(FILM_ERAS, state.era || "auto");
  if (!genre && !era) return "";
  if (proseMode) {
    if (genre && era) return `Rendered in a ${era} aesthetic with ${genre}.`;
    return `Rendered with ${genre || era}.`;
  }
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

function buildProseSubject(state, fallback) {
  const rawSubject = (state.subject || "").trim() || fallback;
  const charLock = (state.characterLock || "").trim();
  return charLock ? `${rawSubject}, keeping strict identity consistency for ${charLock}` : rawSubject;
}

export function parseDurationSeconds(duration) {
  const num = parseFloat(String(duration || "5s").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return 5;
  return Math.min(30, Math.max(2, num));
}

/**
 * Estimate whether spoken dialogue fits cleanly inside the target video duration.
 * Natural cinema dialogue sits around 2.2 - 2.6 words/sec.
 */
export function estimateLipsyncPace(dialogue, duration = "5s") {
  const durationSec = parseDurationSeconds(duration);
  const words = String(dialogue || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const maxRecommended = Math.max(3, Math.round(durationSec * 2.6));
  const tightLimit = Math.ceil(maxRecommended * 1.25);
  const wordsPerSec = Number((words / durationSec).toFixed(1));

  if (words === 0) {
    return {
      words: 0,
      durationSec,
      maxRecommended,
      wordsPerSec: 0,
      status: "empty",
      label: `0 words • ~${maxRecommended} words recommended for ${durationSec}s`
    };
  }
  if (words <= maxRecommended) {
    return {
      words,
      durationSec,
      maxRecommended,
      wordsPerSec,
      status: "ok",
      label: `${words}w / ~${maxRecommended}w max (${wordsPerSec} w/s • Natural Pace)`
    };
  }
  if (words <= tightLimit) {
    return {
      words,
      durationSec,
      maxRecommended,
      wordsPerSec,
      status: "tight",
      label: `${words}w / ~${maxRecommended}w max (${wordsPerSec} w/s • Brisk Delivery)`
    };
  }
  return {
    words,
    durationSec,
    maxRecommended,
    wordsPerSec,
    status: "fast",
    label: `${words}w / ~${maxRecommended}w max (${wordsPerSec} w/s • Too Long — Raise Duration or Trim)`
  };
}

function buildTemporalStage2Beats(selectedPresets, intensityText, durSec, endObject = "") {
  const endGoal = (endObject || "").trim();
  const isTransform = selectedPresets.some((p) => p.transformMode);

  if (selectedPresets.length === 1) {
    const p = selectedPresets[0];
    const t1 = (durSec * 0.25).toFixed(1);
    const t2 = (durSec * 0.8).toFixed(1);
    const t3 = durSec.toFixed(1);

    if (p.transformMode) {
      return [
        `0.0s–${t1}s: Anchor the opening state clearly in sharp focus with subtle anticipation tension.`,
        `${t1}s–${t2}s: ${p.cameraTrajectory}${endGoal ? ` Morph directly into ${endGoal}.` : ""} Execute with ${intensityText}.`,
        `${t2}s–${t3}s: Snap-settle decisively onto ${endGoal || "the final transformed hero object"}; ${p.physicsSpec}`
      ].join(" ");
    }

    return [
      `0.0s–${t1}s: Open cleanly on the subject with balanced foreground depth as ${p.name} momentum initiates.`,
      `${t1}s–${t2}s: ${p.cameraTrajectory} Execute with ${intensityText}.`,
      `${t2}s–${t3}s: Ease-out deceleration settling onto the final hero framing; ${p.physicsSpec}`
    ].join(" ");
  }

  const seg = durSec / selectedPresets.length;
  const phases = selectedPresets.map((p, idx) => {
    const start = (idx * seg).toFixed(1);
    const end = (idx === selectedPresets.length - 1 ? durSec : (idx + 1) * seg).toFixed(1);
    const targetSuffix = p.transformMode && endGoal ? ` Target end state: ${endGoal}.` : "";
    return `${start}s–${end}s (${p.name}): ${p.cameraTrajectory}${targetSuffix}`;
  });
  return `${phases.join(" ")} Connect phases with ${isTransform ? "seamless kinetic momentum" : "fluid, uninterrupted camera handoff"} and ${intensityText}.`;
}

/**
 * Compile prompt for Stage 1 (Keyframe/Soul), Stage 2 (Motion),
 * Stage 3 (Lipsync Studio), or Stage 4 (Motion Control).
 * Defaults to temporal natural-language "prose" mode (Flow / Omni 1.2 native);
 * pass `promptFormat: "structured"` for labeled production breakdown sheets.
 */
export function compilePrompt(state, stage1Presets, stage2Presets) {
  const proseMode = state.promptFormat !== "structured";
  const useGuardrails = state.guardrails !== false;
  const lightingObj =
    LIGHTING_MOODS.find((l) => l.id === state.lighting) || LIGHTING_MOODS[0];
  const opticsOverride = buildOpticsLine(state);
  const filmSetup = buildFilmSetupLine(state, proseMode);
  const colorGrade = buildColorGradeLine(state);
  const durSec = parseDurationSeconds(state.duration);

  if (state.stage === "stage1") {
    const preset =
      stage1Presets.find((p) => p.id === state.selectedStage1Id) || stage1Presets[0];

    if (proseMode) {
      const subjectText = buildProseSubject(
        state,
        "Hero subject from uploaded reference image positioned naturally in scene"
      );
      const segments = [
        `A cinematic ${state.aspect || "16:9"} still keyframe of ${subjectText}.`,
        opticsOverride ? `${preset.lensSpec} ${opticsOverride}` : preset.lensSpec,
        preset.compositionRule,
        [preset.lightingSpec, lightingObj.text, colorGrade].filter(Boolean).join(" "),
        filmSetup
      ];
      if (useGuardrails) {
        segments.push(preset.soulLockDirective);
      }
      return segments.filter(Boolean).join(" ");
    }

    const subjectText = buildSubjectWithLock(
      state,
      "[Subject from uploaded reference image positioned in scene]"
    );
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
    if (useGuardrails) lines.push(`Identity Lock: ${preset.soulLockDirective}`);
    return lines.join("\n");
  }

  if (state.stage === "lipsync") {
    const dialogue =
      (state.lipsyncDialogue || "").trim() ||
      "Wait until you see what happens next.";
    const emotionText = findOptionText(LIPSYNC_EMOTIONS, state.lipsyncEmotion || "calm");
    const framingText = findOptionText(LIPSYNC_FRAMINGS, state.lipsyncFraming || "closeup");
    const voiceText = findOptionText(LIPSYNC_VOICES, state.lipsyncVoice || "natural-id");
    const envAudio = (state.lipsyncAmbience || "").trim() || "quiet intimate studio room tone";
    const camPreset =
      state.lipsyncCameraId && state.lipsyncCameraId !== "auto"
        ? stage2Presets.find((p) => p.id === state.lipsyncCameraId)
        : null;

    if (proseMode) {
      const subjectText = buildProseSubject(state, "Close-up speaker looking directly into lens");
      const visualFinish = [opticsOverride, lightingObj.text, colorGrade, filmSetup]
        .filter(Boolean)
        .join(" ");
      const segments = [
        `Over 0.0s–${durSec.toFixed(1)}s in ${state.aspect || "9:16"} framing, ${subjectText} delivers spoken dialogue (${framingText}) with ${emotionText}: "${dialogue}".`,
        camPreset
          ? `Camera subtly accompanies performance via ${camPreset.name}: ${camPreset.cameraTrajectory}`
          : "Camera holds steady cinema poise with natural subtle breathing motion.",
        `Syllable-accurate jaw, lip, and breath synchronization with authentic blinking and facial micro-expressions.`,
        visualFinish,
        useGuardrails ? ANTI_MORPH_GUARDRAIL : "",
        `Audio: ${voiceText}; ambient bed: ${envAudio}.`
      ];
      return segments.filter(Boolean).join(" ");
    }

    const subjectText = buildSubjectWithLock(
      state,
      "Close-up speaker looking into lens"
    );
    const lines = [
      `[LIPSYNC STUDIO • OMNI 1.2 FLASH • ${state.duration} • AR ${state.aspect}]`,
      `Speaker & Framing: ${subjectText}. ${framingText}.`,
      `Spoken Dialogue (Exact Lip-Sync): "${dialogue}"`,
      `Performance & Expression: ${emotionText}. Exact syllable-accurate jaw, lip, and breath synchronization with natural blinking.`
    ];
    if (camPreset) {
      lines.push(`Camera Pairing (${camPreset.name}): ${camPreset.cameraTrajectory}`);
    }
    lines.push(`Voice & Audio Design: ${voiceText}; background ambience: ${envAudio}.`);
    const visualFinish = [opticsOverride, lightingObj.text, colorGrade, filmSetup]
      .filter(Boolean)
      .join(" ");
    if (visualFinish) lines.push(`Optics & Grade: ${visualFinish}`);
    if (useGuardrails) lines.push(`Continuity Guardrail: ${ANTI_MORPH_GUARDRAIL}`);
    return lines.join("\n");
  }

  if (state.stage === "motion_control") {
    const refAction =
      (state.motionRefDescription || "").trim() ||
      "Subject walks forward with confident stride, turns head sharply toward lens, and raises right hand in subtle gesture";
    const modeSpec = findOptionText(
      MOTION_CONTROL_MODES,
      state.motionControlMode || "video-bg"
    );
    const camPreset =
      stage2Presets.find((p) => p.id === state.selectedStage2Id) || stage2Presets[0];

    if (proseMode) {
      const subjectText = buildProseSubject(
        state,
        "Target character from uploaded portrait/full-body reference"
      );
      const tEnd = durSec.toFixed(1);
      const visualFinish = [opticsOverride, lightingObj.text, colorGrade, filmSetup]
        .filter(Boolean)
        .join(" ");
      const segments = [
        `Over 0.0s–${tEnd}s (${state.aspect || "16:9"}), transfer motion reference choreography onto ${subjectText}: ${refAction}.`,
        modeSpec,
        `Camera follows with ${camPreset.name}: ${camPreset.cameraTrajectory}`,
        visualFinish,
        useGuardrails
          ? `Preserve exact target face, outfit details, and anatomy without ghosting or limb morphing. ${ANTI_MORPH_GUARDRAIL}`
          : "",
        state.includeAudio
          ? `Audio: ${camPreset.audioCue}`
          : `Audio: Silent / minimal natural room tone only.`
      ];
      return segments.filter(Boolean).join(" ");
    }

    const subjectText = buildSubjectWithLock(
      state,
      "Target character from uploaded portrait/full-body reference"
    );
    const lines = [
      `[MOTION CONTROL TRANSFER • ${camPreset.name.toUpperCase()} • ${state.duration} • AR ${state.aspect}]`,
      `Target Character: ${subjectText}.`,
      `Motion Reference Choreography: ${refAction}.`,
      `Scene Control Rule: ${modeSpec}`,
      `Camera Sync: ${camPreset.cameraTrajectory}`,
      `Continuity: Preserve exact target face, outfit details, and anatomy without ghosting or limb morphing. ${[opticsOverride, lightingObj.text, colorGrade].filter(Boolean).join(" ")}`
    ];
    if (useGuardrails) lines.push(`Guardrail: ${ANTI_MORPH_GUARDRAIL}`);
    if (state.includeAudio) {
      lines.push(`Native Audio Design: ${camPreset.audioCue}`);
    } else {
      lines.push(`Native Audio Design: Silent / minimal natural room tone only.`);
    }
    return lines.join("\n");
  }

  // Stage 2 (or fallback): Omni 1.2 Flash Temporal Multi-Move Camera Motion Compiler
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

  const physicsUnique = Array.from(
    new Set(selectedPresets.map((p) => p.physicsSpec.trim()).filter(Boolean))
  ).join(" ");

  const audioJoined = Array.from(
    new Set(selectedPresets.map((p) => p.audioCue.trim()).filter(Boolean))
  ).join(" ");
  const hasTransformMove = selectedPresets.some((p) => p.transformMode);
  const activeGuardrail = hasTransformMove
    ? KINETIC_TRANSFORM_GUARDRAIL
    : ANTI_MORPH_GUARDRAIL;
  const endObjText = (state.endObject || "").trim();

  if (proseMode) {
    const subjectText = buildProseSubject(
      state,
      hasTransformMove
        ? "Hero object in opening start frame"
        : "Hero subject positioned clearly in the reference scene"
    );
    const temporalBeats = buildTemporalStage2Beats(
      selectedPresets,
      intensityText,
      durSec,
      endObjText
    );
    const lookParts = [opticsOverride, lightingObj.text, colorGrade, filmSetup]
      .filter(Boolean)
      .join(" ");
    const multiPhysics = selectedPresets.length > 1 ? physicsUnique : "";
    const introPrefix = hasTransformMove && endObjText
      ? `${durSec.toFixed(1)}s kinetic transformation shot (${state.aspect || "16:9"}): From ${subjectText} into ${endObjText}.`
      : `${durSec.toFixed(1)}s cinema shot (${state.aspect || "16:9"}): ${subjectText}.`;

    const segments = [
      introPrefix,
      temporalBeats,
      multiPhysics,
      lookParts,
      useGuardrails ? activeGuardrail : "",
      state.includeAudio
        ? `Audio: ${audioJoined}`
        : `Audio: Silent / minimal natural room tone only.`
    ];
    return segments.filter(Boolean).join(" ");
  }

  const subjectText = buildSubjectWithLock(
    state,
    "[Subject from uploaded reference image positioned in scene]"
  );
  const titleNames = selectedPresets.map((p) => p.name.toUpperCase()).join(" → ");
  const resolutionTag = state.resolution ? ` • ${state.resolution}` : "";

  let trajectoryBlock;
  if (selectedPresets.length === 1) {
    trajectoryBlock = `${hasTransformMove ? "Transformation Path" : "Camera Trajectory"}: ${selectedPresets[0].cameraTrajectory}${endObjText ? ` Target end state: ${endObjText}.` : ""} Execute with ${intensityText}.`;
  } else {
    const sequencedSteps = selectedPresets
      .map((p, idx) => `Phase ${idx + 1} (${p.name}): ${p.cameraTrajectory}`)
      .join(" ");
    trajectoryBlock = `Camera Sequence (Ordered Multi-Move): ${sequencedSteps}${endObjText ? ` Target end state: ${endObjText}.` : ""} Transition seamlessly across phases with ${intensityText}.`;
  }

  const physicsParts = [physicsUnique, opticsOverride, lightingObj.text, colorGrade]
    .filter(Boolean)
    .join(" ");

  const blocks = [
    `[${hasTransformMove ? "KINETIC VFX" : "CAMERA MOTION"}: ${titleNames} • ${state.duration} • AR ${state.aspect}${resolutionTag}]`,
    endObjText && hasTransformMove
      ? `Transform Transition: ${subjectText} → ${endObjText}.`
      : `Scene Action: ${subjectText}.`,
    trajectoryBlock,
    `Physics & Continuity: ${physicsParts}`
  ];

  if (filmSetup) blocks.push(filmSetup);
  if (useGuardrails) blocks.push(`Guardrail: ${activeGuardrail}`);

  if (state.includeAudio) {
    blocks.push(`Native Audio Design: ${audioJoined}`);
  } else {
    blocks.push(`Native Audio Design: Silent / minimal natural room tone only.`);
  }

  return blocks.join("\n");
}

/**
 * Short Drama Studio 2.0: Generates a Master Keyframe + N arc-aware linked shots
 * with consistent cast, palette, and narrative beat progression.
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
  const promptFormat = options.promptFormat || "prose";
  const guardrails = options.guardrails !== false;

  const arc =
    DRAMA_STORY_ARCS.find((a) => a.id === options.arcId) || DRAMA_STORY_ARCS[0];

  const baseId = Date.now();
  const shots = [];

  const keyframePrompt = compilePrompt(
    {
      stage: "stage1",
      promptFormat,
      guardrails,
      selectedStage1Id: options.keyframePresetId || stage1Presets[0]?.id,
      subject: `Master Drama Keyframe (${arc.label}): ${premise}`,
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
    id: `${baseId}-kf`,
    stage: "DRAMA • KEYFRAME",
    preset: `Master Anchor (${arc.label})`,
    cameraId: null,
    prompt: keyframePrompt,
    createdAt: "Drama"
  });

  const extraFallbackMoves = [
    { shotType: "KINETIC PEAK", cameraId: "crash-zoom-in", actionVerb: "punches forward abruptly at the turning point of" },
    { shotType: "TRACKING FOLLOW", cameraId: "side-tracking-follow", actionVerb: "glides alongside decisive movement through" },
    { shotType: "OPTICAL REVEAL", cameraId: "rack-focus-shift", actionVerb: "shifts focal depth cleanly toward a critical clue in" },
    { shotType: "CLOSING VISTAS", cameraId: "aerial-pullback", actionVerb: "pulls backward and skyward leaving the world around" }
  ];

  for (let i = 0; i < count; i++) {
    const bp = arc.beats[i] || extraFallbackMoves[(i - arc.beats.length) % extraFallbackMoves.length];
    const presetObj = stage2Presets.find((p) => p.id === bp.cameraId) || stage2Presets[0];
    const actionDesc =
      i === 0
        ? `${bp.shotType}: ${cast} ${bp.actionVerb} ${premise}`
        : `Shot ${i + 1}/${count} (${bp.shotType}): ${cast} ${bp.actionVerb} ${premise}`;

    const prompt = compilePrompt(
      {
        stage: "stage2",
        promptFormat,
        guardrails,
        selectedStage2Id: presetObj.id,
        stage2Queue: [presetObj.id],
        subject: actionDesc,
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
      id: `${baseId}-shot-${i + 1}`,
      stage: `DRAMA • SHOT ${i + 1}`,
      preset: `${bp.shotType} (${presetObj.name})`,
      cameraId: presetObj.id,
      prompt,
      createdAt: "Drama"
    });
  }

  return shots;
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function describeHslAsColoristTerm({ h, s, l }) {
  if (s < 14) {
    if (l < 22) return "deep obsidian charcoal";
    if (l < 42) return "cool slate ash";
    if (l > 78) return "crisp pearl ivory";
    return "neutral silver mist";
  }

  let hueName = "amber ochre";
  if (h >= 345 || h < 16) hueName = l < 42 ? "deep burgundy crimson" : "warm coral vermilion";
  else if (h < 34) hueName = l < 45 ? "burnt copper amber" : "warm apricot peach";
  else if (h < 54) hueName = l < 45 ? "bronze ochre" : "warm honey gold";
  else if (h < 76) hueName = "olive chartreuse";
  else if (h < 148) hueName = l < 38 ? "deep emerald moss" : "luminous sage green";
  else if (h < 178) hueName = l < 42 ? "deep cinema teal" : "seafoam jade";
  else if (h < 208) hueName = "icy cyan slate";
  else if (h < 246) hueName = l < 40 ? "midnight cobalt blue" : "cerulean powder blue";
  else if (h < 282) hueName = "indigo violet";
  else if (h < 322) hueName = "dusky plum magenta";
  else hueName = "dusty rose";

  if (s > 65 && l >= 35 && l <= 68) return `rich ${hueName}`;
  if (s < 32) return `muted ${hueName}`;
  return hueName;
}

/**
 * Pure Color Transfer quantization & natural-language colorist translator.
 * Converts RGB samples -> HSL shadow/midtone/highlight palette language (no raw #HEX codes in prompt summary)
 * while retaining hex swatches strictly for UI visualization.
 * @param {Array<[number, number, number]>} rgbSamples
 */
export function analyzeRgbSamplesForColorTransfer(rgbSamples) {
  if (!Array.isArray(rgbSamples) || rgbSamples.length === 0) {
    return { swatches: [], summary: "" };
  }

  const buckets = new Map();
  let sumLuma = 0;
  let sumWarmth = 0;
  const bandTotals = {
    shadow: new Map(),
    midtone: new Map(),
    highlight: new Map()
  };

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

    const hsl = rgbToHsl(r, g, b);
    const term = describeHslAsColoristTerm(hsl);
    const band = hsl.l < 32 ? bandTotals.shadow : hsl.l > 68 ? bandTotals.highlight : bandTotals.midtone;
    band.set(term, (band.get(term) || 0) + 1);
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

  const topTerm = (map) => {
    let best = "";
    let maxCount = 0;
    for (const [term, count] of map.entries()) {
      if (count > maxCount) {
        maxCount = count;
        best = term;
      }
    }
    return best;
  };

  const shadowDesc = topTerm(bandTotals.shadow) || "crisp deep neutral shadows";
  const midDesc = topTerm(bandTotals.midtone);
  const highDesc = topTerm(bandTotals.highlight) || "clean natural highlights";

  const avgLuma = sumLuma / rgbSamples.length;
  const avgWarmth = sumWarmth / rgbSamples.length;
  const keyTone =
    avgLuma < 85
      ? "low-key moody contrast"
      : avgLuma > 170
        ? "high-key airy luminance"
        : "balanced mid-tone density";
  const tempTone =
    avgWarmth > 18
      ? "warm golden-amber color temperature"
      : avgWarmth < -18
        ? "cool cyan-blue atmospheric cast"
        : "neutral filmic color balance";

  const bandClauses = [`${shadowDesc} shadows`];
  if (midDesc) bandClauses.push(`${midDesc} midtones`);
  bandClauses.push(`${highDesc} highlights`);

  return {
    swatches: swatches.map((s) => s.hex),
    summary: `Color Transfer Reference: Film color grade defined by ${bandClauses.join(", ")}, with ${keyTone} and ${tempTone}.`
  };
}

function generatePresetId(idSlug) {
  const randomSuffix =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return `custom-${idSlug || "preset"}-${randomSuffix}`;
}

/**
 * Validate and normalize a user-defined custom preset for Stage 1 or Stage 2.
 * Preserves existing ID when editing or importing an already-identified preset,
 * and generates collision-free IDs during synchronous batch imports.
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
  const id =
    typeof input.id === "string" && input.id.trim()
      ? input.id.trim()
      : generatePresetId(idSlug);
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

/**
 * Build a precision Cinema Director meta-prompt around HiggsFold's deterministic blueprint
 * so Gemini (Hydrogen / Neon / Flash / Pro) enriches physical lighting, materiality,
 * texture, and choreography without breaking temporal beats, optics, @handles, or guardrails.
 */
export function buildGeminiDirectorMetaPrompt(blueprintPrompt, state = {}) {
  const engineTarget =
    state.stage === "stage1" ? "Nano Banana 2.1 still keyframe" : "Google Flow / Omni 1.2 Flash video";
  const lockNote = (state.characterLock || "").trim()
    ? `\n- Preserve this exact Character/@Element Lock verbatim: ${state.characterLock.trim()}`
    : "";
  const endObjNote = (state.endObject || "").trim()
    ? `\n- Preserve this exact End Morph Target cleanly: ${state.endObject.trim()}`
    : "";
  const durNote =
    state.stage === "stage1"
      ? ""
      : `\n- Keep exact temporal pacing matching ${state.duration || "5s"} and aspect ratio ${state.aspect || "16:9"}.`;

  return [
    `[HIGGSFOLD DIRECTOR ENHANCE]`,
    `Act as an Academy Award-winning Cinematographer & VFX Supervisor upgrading this ${engineTarget} prompt blueprint to production quality.`,
    `Strict rules:`,
    `- Retain ALL camera choreography, temporal timestamps (0.0s–...), optics/lens, color palette grade, physics guardrails, and audio design present in the blueprint.${durNote}${lockNote}${endObjNote}`,
    `- Upgrade sparse nouns/actions into vivid physical materiality (surface reflections, micro-textures, atmospheric particulates, dynamic light interaction, subtle subject micro-acting) while keeping the prompt focused under ~1,400 characters.`,
    `- Output ONLY the final polished prompt text. Zero conversational intro, zero markdown code fences, zero bullet points, zero explanations.`,
    ``,
    `BLUEPRINT:`,
    (blueprintPrompt || "").trim()
  ].join("\n");
}

/**
 * Strip accidental conversational preambles, surrounding quotes, or markdown code fences
 * returned by an LLM so the enhanced prompt injects cleanly into Google Flow.
 */
export function cleanGeminiEnhancedOutput(rawText) {
  let out = String(rawText || "").trim();
  if (!out) return "";

  // Remove fenced code blocks if Gemini wrapped the prompt
  const fenceMatch = out.match(/```(?:text|prompt|markdown)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    out = fenceMatch[1].trim();
  }

  // Remove common chatty lead-in lines
  out = out.replace(
    /^(?:sure|here(?:'s| is)|certainly|below is)[^\n:]*:\s*\n+/i,
    ""
  ).trim();

  // Unwrap wrapping quotes if entire prompt was quoted
  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith("'") && out.endsWith("'"))
  ) {
    out = out.slice(1, -1).trim();
  }

  return out;
}
