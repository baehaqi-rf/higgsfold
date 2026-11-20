import {
  STAGE1_PRESETS,
  STAGE1_CATEGORIES,
  STAGE2_PRESETS,
  STAGE2_CATEGORIES,
  CAMERA_BODIES,
  LENS_TYPES,
  APERTURE_OPTIONS,
  FILM_GENRES,
  FILM_ERAS,
  COLOR_PALETTES,
  LIGHTING_MOODS,
  LIPSYNC_EMOTIONS,
  LIPSYNC_FRAMINGS,
  LIPSYNC_VOICES,
  MOTION_CONTROL_MODES,
  DRAMA_STORY_ARCS
} from "./presets.js";
import {
  compilePrompt,
  generateShortDramaStoryboard,
  estimateLipsyncPace,
  buildCustomPreset,
  formatStoryboardExport
} from "./compiler.js";
import {
  extractColorTransferFromFile,
  extractColorTransferFromDataUrl
} from "./color-transfer.js";
import { createEditingRoomController } from "./editing-room.js";
import { SoulVaultStore, compressImageToWebP } from "./soul-vault.js";
import { extractMotionContactSheet } from "./motion-extractor.js";

const chrome =
  typeof globalThis.chrome !== "undefined" && globalThis.chrome?.tabs
    ? globalThis.chrome
    : globalThis.parent?.__HIGGSFOLD_CHROME_SHIM__ || globalThis.chrome;

const STORAGE_KEYS = {
  history: "history",
  customPresets: "customPresets",
  storyboard: "storyboard",
  selectors: "customSelectors",
  workspaceState: "workspaceState"
};

const WORKSPACE_PERSIST_FIELDS = [
  "stage",
  "selectedStage1Id",
  "selectedStage2Id",
  "stage2Queue",
  "sequenceMode",
  "subject",
  "characterLock",
  "endObject",
  "intensity",
  "aspect",
  "lighting",
  "duration",
  "resolution",
  "batchCount",
  "flowSubMode",
  "cameraBody",
  "lensType",
  "aperture",
  "genre",
  "era",
  "palette",
  "promptFormat",
  "guardrails",
  "lipsyncDialogue",
  "lipsyncEmotion",
  "lipsyncFraming",
  "lipsyncVoice",
  "lipsyncAmbience",
  "lipsyncCameraId",
  "motionRefDescription",
  "motionControlMode",
  "dramaArcId",
  "includeAudio",
  "autoSubmit",
  "autoSyncFlow"
];

const state = {
  stage: "stage2", // 'stage2' | 'stage1' | 'lipsync' | 'motion_control' | 'drama'
  activePopover: null, // 'references' | 'film' | 'camera' | 'palette' | 'lighting' | null
  selectedStage1Id: STAGE1_PRESETS[0].id,
  selectedStage2Id: STAGE2_PRESETS[0].id,
  stage2Queue: [STAGE2_PRESETS[0].id],
  sequenceMode: false,
  searchQuery: "",
  selectedCategory: "All",
  subject: "",
  characterLock: "",
  endObject: "",
  intensity: "cinematic",
  aspect: "16:9",
  lighting: "match-ref",
  duration: "5s",
  resolution: "1080p",
  batchCount: "1",
  flowSubMode: "Frames",
  cameraBody: "auto",
  lensType: "auto",
  aperture: "auto",
  genre: "auto",
  era: "auto",
  palette: "match-ref",
  promptFormat: "prose", // 'prose' | 'structured'
  guardrails: true,
  colorTransferSummary: "",
  refImageDataUrl: "",
  refImageName: "",
  refImageMime: "",
  endRefImageDataUrl: "",
  endRefImageName: "",
  endRefImageMime: "",
  lipsyncDialogue: "",
  lipsyncEmotion: "calm",
  lipsyncFraming: "closeup",
  lipsyncVoice: "natural-id",
  lipsyncAmbience: "",
  lipsyncCameraId: "auto",
  motionRefDescription: "",
  motionControlMode: "video-bg",
  dramaArcId: DRAMA_STORY_ARCS[0].id,
  includeAudio: true,
  autoSubmit: false,
  autoSyncFlow: false,
  manualOverride: false,
  activeSite: "generic",
  customPresets: {
    stage1: [],
    stage2: []
  }
};

const el = {
  modeBtns: document.querySelectorAll(".stage-tab, .sub-tab"),
  sideNavBtns: document.querySelectorAll("[data-side-nav]"),
  stripPills: document.querySelectorAll("[data-popover]"),
  subpanelRefs: document.getElementById("subpanel-references"),
  subpanelFilm: document.getElementById("subpanel-film"),
  subpanelOptics: document.getElementById("subpanel-optics"),
  subpanelPalette: document.getElementById("subpanel-palette"),
  subpanelLighting: document.getElementById("subpanel-lighting"),
  closeSubpanelBtns: document.querySelectorAll(".close-subpanel"),
  valReferences: document.getElementById("val-references"),
  valFilm: document.getElementById("val-film"),
  valCamera: document.getElementById("val-camera"),
  valPalette: document.getElementById("val-palette"),
  valLighting: document.getElementById("val-lighting"),
  hfModelName: document.getElementById("hf-model-name"),
  audioStateLabel: document.getElementById("audio-state-label"),
  presetLibrarySection: document.getElementById("preset-library-section"),
  popoverStage: document.getElementById("popover-stage"),
  lipsyncPanel: document.getElementById("lipsync-panel"),
  motionControlPanel: document.getElementById("motion-control-panel"),
  dramaPanel: document.getElementById("drama-panel"),
  subjectSection: document.getElementById("subject-section"),
  presetHeading: document.getElementById("preset-heading"),
  presetCount: document.getElementById("preset-count"),
  presetSearch: document.getElementById("preset-search"),
  categoryPills: document.getElementById("category-pills"),
  btnToggleSequence: document.getElementById("btn-toggle-sequence"),
  sequenceBar: document.getElementById("sequence-bar"),
  sequenceChips: document.getElementById("sequence-chips"),
  btnClearSequence: document.getElementById("btn-clear-sequence"),
  presetGrid: document.getElementById("preset-grid"),
  paletteVisualGrid: document.getElementById("palette-visual-grid"),
  lightingVisualGrid: document.getElementById("lighting-visual-grid"),
  subjectInput: document.getElementById("subject-input"),
  characterLock: document.getElementById("character-lock"),
  endObjectRow: document.getElementById("end-object-row"),
  endObjectInput: document.getElementById("end-object-input"),
  btnPickSoul: document.getElementById("btn-pick-soul"),
  btnClearInput: document.getElementById("btn-clear-input"),
  // Lipsync
  lipsyncDialogue: document.getElementById("lipsync-dialogue"),
  lipsyncPaceBadge: document.getElementById("lipsync-pace-badge"),
  selectLipsyncEmotion: document.getElementById("select-lipsync-emotion"),
  selectLipsyncFraming: document.getElementById("select-lipsync-framing"),
  selectLipsyncVoice: document.getElementById("select-lipsync-voice"),
  selectLipsyncCamera: document.getElementById("select-lipsync-camera"),
  lipsyncAmbience: document.getElementById("lipsync-ambience"),
  // Motion Control
  inputMotionVideo: document.getElementById("input-motion-video"),
  btnExtractMotionSheet: document.getElementById("btn-extract-motion-sheet"),
  motionVideoMeta: document.getElementById("motion-video-meta"),
  motionVideoPreview: document.getElementById("motion-video-preview"),
  motionSheetWrap: document.getElementById("motion-sheet-wrap"),
  motionSheetThumb: document.getElementById("motion-sheet-thumb"),
  btnSendMotionSheet: document.getElementById("btn-send-motion-sheet"),
  motionRefDesc: document.getElementById("motion-ref-desc"),
  selectMotionMode: document.getElementById("select-motion-mode"),
  selectMotionCam: document.getElementById("select-motion-cam"),
  // Short Drama
  dramaPremise: document.getElementById("drama-premise"),
  dramaCast: document.getElementById("drama-cast"),
  selectDramaArc: document.getElementById("select-drama-arc"),
  selectDramaShots: document.getElementById("select-drama-shots"),
  btnGenerateDrama: document.getElementById("btn-generate-drama"),
  // Color Transfer & Dual Keyframe References
  inputRefImage: document.getElementById("input-ref-image"),
  inputEndRefImage: document.getElementById("input-end-ref-image"),
  btnSendRefImage: document.getElementById("btn-send-ref-image"),
  btnSendDualFrames: document.getElementById("btn-send-dual-frames"),
  btnClearRefImage: document.getElementById("btn-clear-ref-image"),
  btnClearEndRef: document.getElementById("btn-clear-end-ref"),
  ctPreviewWrap: document.getElementById("ct-preview-wrap"),
  ctThumb: document.getElementById("ct-thumb"),
  ctSwatches: document.getElementById("ct-swatches"),
  ctSummary: document.getElementById("ct-summary"),
  endRefPreviewWrap: document.getElementById("end-ref-preview-wrap"),
  endRefThumb: document.getElementById("end-ref-thumb"),
  endRefMeta: document.getElementById("end-ref-meta"),
  // Controls & Optics
  selectIntensity: document.getElementById("select-intensity"),
  selectAspect: document.getElementById("select-aspect"),
  selectLighting: document.getElementById("select-lighting"),
  selectDuration: document.getElementById("select-duration"),
  selectResolution: document.getElementById("select-resolution"),
  selectBatch: document.getElementById("select-batch"),
  selectFlowSubmode: document.getElementById("select-flow-submode"),
  selectCamera: document.getElementById("select-camera"),
  selectLens: document.getElementById("select-lens"),
  selectAperture: document.getElementById("select-aperture"),
  selectPalette: document.getElementById("select-palette"),
  selectGenre: document.getElementById("select-genre"),
  selectEra: document.getElementById("select-era"),
  btnResetOptics: document.getElementById("btn-reset-optics"),
  controlIntensity: document.getElementById("control-intensity"),
  controlDuration: document.getElementById("control-duration"),
  toggleAudioWrap: document.getElementById("toggle-audio-wrap"),
  chkAudio: document.getElementById("chk-audio"),
  chkProse: document.getElementById("chk-prose"),
  chkGuardrails: document.getElementById("chk-guardrails"),
  chkAutoSubmit: document.getElementById("chk-autosubmit"),
  chkAutoSync: document.getElementById("chk-autosync"),
  // Output & Footer
  compiledPreview: document.getElementById("compiled-preview"),
  btnResetCompiled: document.getElementById("btn-reset-compiled"),
  btnSaveShot: document.getElementById("btn-save-shot"),
  charCount: document.getElementById("char-count"),
  btnCopy: document.getElementById("btn-copy"),
  btnInject: document.getElementById("btn-inject"),
  btnInjectLabel: document.getElementById("btn-inject-label"),
  // Status
  tabStatus: document.getElementById("tab-status"),
  statusText: document.getElementById("status-text"),
  btnGrabOutput: document.getElementById("btn-grab-output"),
  btnSyncFlow: document.getElementById("btn-sync-flow"),
  btnOpenFlow: document.getElementById("btn-open-flow"),
  btnExpandStudio: document.getElementById("btn-expand-studio"),
  // Drawers & Sidebar links
  btnHistory: document.getElementById("btn-history"),
  btnCloseHistory: document.getElementById("btn-close-history"),
  btnClearHistory: document.getElementById("btn-clear-history"),
  historyDrawer: document.getElementById("history-drawer"),
  historyList: document.getElementById("history-list"),
  btnStoryboard: document.getElementById("btn-storyboard"),
  shotCount: document.getElementById("shot-count"),
  storyboardDrawer: document.getElementById("storyboard-drawer"),
  storyboardList: document.getElementById("storyboard-list"),
  btnExportStoryboardJson: document.getElementById("btn-export-storyboard-json"),
  btnCopyStoryboard: document.getElementById("btn-copy-storyboard"),
  btnClearStoryboard: document.getElementById("btn-clear-storyboard"),
  btnCloseStoryboard: document.getElementById("btn-close-storyboard"),
  btnEditingRoom: document.getElementById("btn-editing-room"),
  editingDrawer: document.getElementById("editing-drawer"),
  btnCloseEdit: document.getElementById("btn-close-edit"),
  btnClearEdit: document.getElementById("btn-clear-edit"),
  editCanvas: document.getElementById("edit-canvas"),
  selectEditAspect: document.getElementById("select-edit-aspect"),
  selectEditFit: document.getElementById("select-edit-fit"),
  chkEditCrossfade: document.getElementById("chk-edit-crossfade"),
  inputEditClips: document.getElementById("input-edit-clips"),
  btnPlayEdit: document.getElementById("btn-play-edit"),
  btnExportEdit: document.getElementById("btn-export-edit"),
  editClipList: document.getElementById("edit-clip-list"),
  editClipCount: document.getElementById("edit-clip-count"),
  editOverlayList: document.getElementById("edit-overlay-list"),
  ovText: document.getElementById("ov-text"),
  ovAnim: document.getElementById("ov-anim"),
  ovPos: document.getElementById("ov-pos"),
  ovColor: document.getElementById("ov-color"),
  ovStart: document.getElementById("ov-start"),
  ovDur: document.getElementById("ov-dur"),
  btnAddOvText: document.getElementById("btn-add-ov-text"),
  inputOvObject: document.getElementById("input-ov-object"),
  // Grab Drawer
  grabDrawer: document.getElementById("grab-drawer"),
  grabList: document.getElementById("grab-list"),
  btnRefreshGrab: document.getElementById("btn-refresh-grab"),
  btnCloseGrab: document.getElementById("btn-close-grab"),
  // Soul Vault Drawer
  btnSoulVault: document.getElementById("btn-soul-vault"),
  btnSideSouls: document.getElementById("btn-side-souls"),
  soulVaultDrawer: document.getElementById("soul-vault-drawer"),
  btnCloseSouls: document.getElementById("btn-close-souls"),
  soulVaultCount: document.getElementById("soul-vault-count"),
  soulVaultForm: document.getElementById("soul-vault-form"),
  svName: document.getElementById("sv-name"),
  svHandle: document.getElementById("sv-handle"),
  svDna: document.getElementById("sv-dna"),
  svLens: document.getElementById("sv-lens"),
  svPalette: document.getElementById("sv-palette"),
  svInputRefs: document.getElementById("sv-input-refs"),
  svUseCurrentRef: document.getElementById("sv-use-current-ref"),
  svStagedRefs: document.getElementById("sv-staged-refs"),
  soulVaultList: document.getElementById("soul-vault-list"),
  // Custom Preset Drawer
  btnCustomPreset: document.getElementById("btn-custom-preset"),
  customPresetDrawer: document.getElementById("custom-preset-drawer"),
  customDrawerTitle: document.getElementById("custom-drawer-title"),
  btnCloseCustom: document.getElementById("btn-close-custom"),
  customPresetForm: document.getElementById("custom-preset-form"),
  cpStage: document.getElementById("cp-stage"),
  cpStage1Fields: document.getElementById("cp-stage1-fields"),
  cpStage2Fields: document.getElementById("cp-stage2-fields"),
  btnExportPresets: document.getElementById("btn-export-presets"),
  inputImportPresets: document.getElementById("input-import-presets"),
  btnSideStoryboard: document.getElementById("btn-side-storyboard"),
  btnSideEditing: document.getElementById("btn-side-editing"),
  btnSideCustom: document.getElementById("btn-side-custom"),
  btnSideHistory: document.getElementById("btn-side-history"),
  // Picker & Toast
  btnPicker: document.getElementById("btn-picker"),
  pickerBanner: document.getElementById("picker-banner"),
  pickerStepText: document.getElementById("picker-step-text"),
  btnCancelPicker: document.getElementById("btn-cancel-picker"),
  btnResetSelectors: document.getElementById("btn-reset-selectors"),
  toast: document.getElementById("toast")
};

let isInjecting = false;
let motionVideoObjectUrl = "";
let motionVideoFile = null;
let motionSheetDataUrl = "";
let editingCustomPreset = null; // { stage, id } | null
let persistTimer = null;
let stagedSoulRefs = [];
const soulStore = new SoulVaultStore();

function populateSelect(selectEl, items, valueKey = "id", labelKey = "label") {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    selectEl.appendChild(opt);
  });
}

populateSelect(el.selectLighting, LIGHTING_MOODS);
populateSelect(el.selectCamera, CAMERA_BODIES);
populateSelect(el.selectLens, LENS_TYPES);
populateSelect(el.selectAperture, APERTURE_OPTIONS);
populateSelect(el.selectPalette, COLOR_PALETTES);
populateSelect(el.selectGenre, FILM_GENRES);
populateSelect(el.selectEra, FILM_ERAS);
populateSelect(el.selectLipsyncEmotion, LIPSYNC_EMOTIONS);
populateSelect(el.selectLipsyncFraming, LIPSYNC_FRAMINGS);
populateSelect(el.selectLipsyncVoice, LIPSYNC_VOICES);
populateSelect(el.selectLipsyncCamera, [
  { id: "auto", name: "Static / Natural Pose" },
  ...STAGE2_PRESETS
], "id", "name");
populateSelect(el.selectMotionMode, MOTION_CONTROL_MODES);
populateSelect(el.selectMotionCam, STAGE2_PRESETS, "id", "name");
populateSelect(el.selectDramaArc, DRAMA_STORY_ARCS);
populateSelect(el.svLens, LENS_TYPES);
populateSelect(el.svPalette, COLOR_PALETTES);

function getStage1All() {
  return [...state.customPresets.stage1, ...STAGE1_PRESETS];
}

function getStage2All() {
  return [...state.customPresets.stage2, ...STAGE2_PRESETS];
}

function schedulePersistWorkspace() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const snapshot = {};
    WORKSPACE_PERSIST_FIELDS.forEach((k) => {
      snapshot[k] = state[k];
    });
    storageSet({ [STORAGE_KEYS.workspaceState]: snapshot }).catch(() => {});
  }, 260);
}

function updateLipsyncPaceBadge() {
  if (!el.lipsyncPaceBadge) return;
  const pace = estimateLipsyncPace(state.lipsyncDialogue, state.duration);
  el.lipsyncPaceBadge.textContent = pace.label;
  el.lipsyncPaceBadge.classList.remove("pace-ok", "pace-tight", "pace-fast");
  if (pace.status === "ok") el.lipsyncPaceBadge.classList.add("pace-ok");
  else if (pace.status === "tight") el.lipsyncPaceBadge.classList.add("pace-tight");
  else if (pace.status === "fast") el.lipsyncPaceBadge.classList.add("pace-fast");
}

function updateTopStripLabels() {
  const refCount = (state.refImageDataUrl ? 1 : 0) + (state.endRefImageDataUrl ? 1 : 0);
  el.valReferences.textContent = `${refCount}/2`;

  const eraLabel = state.era !== "auto" ? state.era : "";
  const genreLabel = state.genre !== "auto" ? FILM_GENRES.find((g) => g.id === state.genre)?.label : "";
  el.valFilm.textContent = [eraLabel, genreLabel].filter(Boolean).join(", ") || "Auto";

  const camParts = [
    state.cameraBody !== "auto" ? CAMERA_BODIES.find((c) => c.id === state.cameraBody)?.label : "",
    state.lensType !== "auto" ? LENS_TYPES.find((l) => l.id === state.lensType)?.label : "",
    state.aperture !== "auto" ? state.aperture : ""
  ].filter(Boolean);
  el.valCamera.textContent = camParts[0] || "Auto";

  const palObj = COLOR_PALETTES.find((p) => p.id === state.palette);
  el.valPalette.textContent = state.palette === "match-ref" ? "Auto" : (palObj?.label || "Custom");

  const lightObj = LIGHTING_MOODS.find((l) => l.id === state.lighting);
  el.valLighting.textContent = lightObj?.label || "Match Ref";

  el.hfModelName.textContent = state.stage === "stage1" ? "Nano Banana 2.1" : "Omni 1.2 Flash";
  el.audioStateLabel.textContent = state.includeAudio ? "On" : "Off";
}

function applyReferencePreview(result) {
  state.colorTransferSummary = result.summary || "";
  state.refImageDataUrl = result.dataUrl || "";
  state.refImageName = result.name || "reference.png";
  state.refImageMime = result.type || "image/png";

  el.ctThumb.src = result.dataUrl;
  el.ctSwatches.innerHTML = "";
  (result.swatches || []).forEach((hex) => {
    const chip = document.createElement("span");
    chip.className = "swatch-chip";
    const dot = document.createElement("span");
    dot.className = "swatch-dot";
    dot.style.background = hex;
    const lbl = document.createElement("span");
    lbl.textContent = hex.toUpperCase();
    chip.append(dot, lbl);
    el.ctSwatches.appendChild(chip);
  });
  el.ctSummary.textContent = result.summary || "";
  el.ctPreviewWrap.classList.remove("hidden");
  el.btnSendRefImage.classList.remove("hidden");
  el.btnClearRefImage.classList.remove("hidden");
  el.btnSendDualFrames?.classList.toggle("hidden", !state.endRefImageDataUrl);
  state.manualOverride = false;
  updateCompiledOutput();
}

function renderPaletteVisualGrid() {
  el.paletteVisualGrid.innerHTML = "";
  COLOR_PALETTES.forEach((pal) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `hf-vis-card ${state.palette === pal.id ? "selected" : ""}`;

    const media = document.createElement("div");
    media.className = "hf-vis-media";

    if (pal.imageSrc) {
      const img = document.createElement("img");
      img.src = pal.imageSrc;
      img.alt = pal.label;
      img.loading = "lazy";
      img.onerror = () => img.remove();
      media.appendChild(img);
    }

    if (pal.swatches && pal.swatches.length > 0) {
      const bar = document.createElement("div");
      bar.className = "hf-vis-swatch-bar";
      pal.swatches.forEach((hex) => {
        const s = document.createElement("span");
        s.style.backgroundColor = hex;
        bar.appendChild(s);
      });
      media.appendChild(bar);
    }

    const lbl = document.createElement("span");
    lbl.className = "hf-vis-label";
    lbl.textContent = pal.label;

    btn.append(media, lbl);
    btn.addEventListener("click", () => {
      state.palette = pal.id;
      el.selectPalette.value = pal.id;
      state.manualOverride = false;
      renderPaletteVisualGrid();
      updateCompiledOutput();
    });
    el.paletteVisualGrid.appendChild(btn);
  });
}

function renderLightingVisualGrid() {
  el.lightingVisualGrid.innerHTML = "";
  LIGHTING_MOODS.forEach((mood) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `hf-vis-card ${state.lighting === mood.id ? "selected" : ""}`;

    const media = document.createElement("div");
    media.className = "hf-vis-media";

    if (mood.poster) {
      const img = document.createElement("img");
      img.src = mood.poster;
      img.alt = mood.label;
      img.loading = "lazy";
      img.onerror = () => img.remove();
      media.appendChild(img);
    }

    const lbl = document.createElement("span");
    lbl.className = "hf-vis-label";
    lbl.textContent = mood.label;

    btn.append(media, lbl);
    btn.addEventListener("click", () => {
      state.lighting = mood.id;
      el.selectLighting.value = mood.id;
      state.manualOverride = false;
      renderLightingVisualGrid();
      updateCompiledOutput();
    });
    el.lightingVisualGrid.appendChild(btn);
  });
}

function setActivePopover(name) {
  state.activePopover = state.activePopover === name ? null : name;
  el.stripPills.forEach((p) => {
    p.classList.toggle("active", p.dataset.popover === state.activePopover);
  });
  el.subpanelRefs.classList.toggle("hidden", state.activePopover !== "references");
  el.subpanelFilm.classList.toggle("hidden", state.activePopover !== "film");
  el.subpanelOptics.classList.toggle("hidden", state.activePopover !== "camera");
  el.subpanelPalette.classList.toggle("hidden", state.activePopover !== "palette");
  el.subpanelLighting.classList.toggle("hidden", state.activePopover !== "lighting");

  const isLibrary = state.stage === "stage1" || state.stage === "stage2";
  el.popoverStage.classList.toggle("hidden", !isLibrary && !state.activePopover);

  if (state.activePopover === "palette") renderPaletteVisualGrid();
  if (state.activePopover === "lighting") renderLightingVisualGrid();
}

function updateModeVisibility() {
  const isLibrary = state.stage === "stage1" || state.stage === "stage2";
  const isVideoControls = state.stage === "stage2" || state.stage === "motion_control";
  const isDurationVisible = state.stage !== "stage1";
  const hasPopoverOpen = Boolean(state.activePopover);

  el.presetLibrarySection.classList.toggle("hidden", !isLibrary);
  el.popoverStage.classList.toggle("hidden", !isLibrary && !hasPopoverOpen);
  el.lipsyncPanel.classList.toggle("hidden", state.stage !== "lipsync");
  el.motionControlPanel.classList.toggle("hidden", state.stage !== "motion_control");
  el.dramaPanel.classList.toggle("hidden", state.stage !== "drama");
  el.subjectSection.classList.toggle("hidden", state.stage === "drama");

  el.controlIntensity.classList.toggle("hidden", state.stage !== "stage2");
  el.controlDuration.classList.toggle("hidden", !isDurationVisible);
  el.toggleAudioWrap.classList.toggle("hidden", !isVideoControls);
  el.selectFlowSubmode?.classList.toggle("hidden", state.stage === "stage1");

  const activeStage2HasTransform =
    state.stage === "stage2" &&
    (state.stage2Queue || [state.selectedStage2Id]).some((id) =>
      getStage2All().find((p) => p.id === id)?.transformMode
    );
  el.endObjectRow?.classList.toggle(
    "hidden",
    !(activeStage2HasTransform || Boolean(state.endRefImageDataUrl))
  );

  el.modeBtns.forEach((b) => {
    const active = b.dataset.stage === state.stage;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
  el.sideNavBtns.forEach((b) => {
    b.classList.toggle("active", b.dataset.sideNav === state.stage);
  });
}

function updateCompiledOutput() {
  updateModeVisibility();
  updateTopStripLabels();
  updateLipsyncPaceBadge();
  if (!state.manualOverride && state.stage !== "drama") {
    el.compiledPreview.value = compilePrompt(state, getStage1All(), getStage2All());
  }
  el.btnResetCompiled.classList.toggle("hidden", !state.manualOverride);
  el.charCount.textContent = `${el.compiledPreview.value.length} chars`;
  schedulePersistWorkspace();
}

function renderCategories() {
  if (state.stage !== "stage1" && state.stage !== "stage2") return;
  const categories = state.stage === "stage2" ? STAGE2_CATEGORIES : STAGE1_CATEGORIES;
  if (!categories.includes(state.selectedCategory)) {
    state.selectedCategory = "All";
  }

  el.categoryPills.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `category-pill ${state.selectedCategory === cat ? "active" : ""}`;
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      state.selectedCategory = cat;
      renderCategories();
      renderPresets();
    });
    el.categoryPills.appendChild(btn);
  });
}

function renderSequenceBar() {
  const isVideo = state.stage === "stage2";
  const showBar = isVideo && (state.sequenceMode || state.stage2Queue.length > 1);
  el.sequenceBar.classList.toggle("hidden", !showBar);
  el.btnToggleSequence.classList.toggle("hidden", !isVideo);
  el.btnToggleSequence.classList.toggle("active", state.sequenceMode);
  el.btnToggleSequence.textContent = state.sequenceMode ? "Multi-Move: ON" : "Multi-Move: OFF";

  if (!showBar) return;

  const all = getStage2All();
  el.sequenceChips.innerHTML = "";
  state.stage2Queue.forEach((id, idx) => {
    const preset = all.find((p) => p.id === id);
    if (!preset) return;
    const chip = document.createElement("span");
    chip.className = "sequence-chip";

    const label = document.createElement("span");
    label.textContent = `${idx + 1}. ${preset.name}`;
    chip.appendChild(label);

    if (state.stage2Queue.length > 1) {
      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.textContent = "×";
      rmBtn.title = "Remove from sequence";
      rmBtn.addEventListener("click", () => {
        state.stage2Queue.splice(idx, 1);
        state.selectedStage2Id = state.stage2Queue[0];
        state.manualOverride = false;
        renderSequenceBar();
        renderPresets();
        updateCompiledOutput();
      });
      chip.appendChild(rmBtn);
    }
    el.sequenceChips.appendChild(chip);
  });
}

function addToSequence(presetId) {
  if (!state.stage2Queue.includes(presetId)) {
    if (state.stage2Queue.length >= 3) {
      showToast("Max 3 camera moves per shot sequence");
      return;
    }
    state.stage2Queue.push(presetId);
  }
  state.sequenceMode = true;
  state.selectedStage2Id = state.stage2Queue[0];
  state.manualOverride = false;
  renderSequenceBar();
  renderPresets();
  updateCompiledOutput();
}

async function deleteCustomPreset(stage, presetId) {
  state.customPresets[stage] = state.customPresets[stage].filter((p) => p.id !== presetId);
  await storageSet({ [STORAGE_KEYS.customPresets]: state.customPresets });
  if (stage === "stage1" && state.selectedStage1Id === presetId) {
    state.selectedStage1Id = STAGE1_PRESETS[0].id;
  }
  if (stage === "stage2") {
    state.stage2Queue = state.stage2Queue.filter((id) => id !== presetId);
    if (state.stage2Queue.length === 0) state.stage2Queue = [STAGE2_PRESETS[0].id];
    state.selectedStage2Id = state.stage2Queue[0];
  }
  state.manualOverride = false;
  renderSequenceBar();
  renderPresets();
  updateCompiledOutput();
  showToast("Custom preset deleted");
}

function startEditingCustomPreset(stage, preset) {
  editingCustomPreset = { stage, id: preset.id };
  el.cpStage.value = stage;
  el.cpStage.disabled = true;
  el.cpStage1Fields.classList.toggle("hidden", stage !== "stage1");
  el.cpStage2Fields.classList.toggle("hidden", stage !== "stage2");
  document.getElementById("cp-name").value = preset.name || "";
  document.getElementById("cp-badge").value = preset.badge || "";

  if (stage === "stage2") {
    document.getElementById("cp-s2-category").value = preset.category || "Dynamic";
    document.getElementById("cp-s2-duration").value = preset.defaultDuration || "5s";
    document.getElementById("cp-s2-trajectory").value = preset.cameraTrajectory || "";
    document.getElementById("cp-s2-physics").value = preset.physicsSpec || "";
    document.getElementById("cp-s2-audio").value = preset.audioCue || "";
  } else {
    document.getElementById("cp-s1-category").value = preset.category || "Cinema";
    document.getElementById("cp-s1-tag").value = preset.tag || "";
    document.getElementById("cp-s1-lens").value = preset.lensSpec || "";
    document.getElementById("cp-s1-lighting").value = preset.lightingSpec || "";
    document.getElementById("cp-s1-soul").value = preset.soulLockDirective || "";
  }
  el.customDrawerTitle.textContent = `Edit Custom Preset: ${preset.name}`;
  el.customPresetDrawer.classList.remove("hidden");
}

function renderPresets() {
  if (state.stage !== "stage1" && state.stage !== "stage2") return;
  const isVideo = state.stage === "stage2";
  const fullList = isVideo ? getStage2All() : getStage1All();
  const query = state.searchQuery.trim().toLowerCase();

  const filtered = fullList.filter((p) => {
    const matchesCat = state.selectedCategory === "All" || p.category === state.selectedCategory;
    if (!matchesCat) return false;
    if (!query) return true;
    const hay = `${p.name} ${p.badge} ${p.category} ${p.tag || ""}`.toLowerCase();
    return hay.includes(query);
  });

  el.presetHeading.textContent = isVideo
    ? `Camera & Kinetic VFX (${fullList.length})`
    : `Keyframe & Soul (${fullList.length})`;
  el.presetCount.textContent = `${filtered.length}/${fullList.length} presets`;

  renderSequenceBar();
  el.presetGrid.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#898a8b;font-size:11.5px;grid-column:1/-1;padding:8px 0;";
    empty.textContent = "No presets match your filter. Try clearing the search box.";
    el.presetGrid.appendChild(empty);
    return;
  }

  filtered.forEach((preset) => {
    const isSelected = isVideo
      ? state.stage2Queue.includes(preset.id)
      : preset.id === state.selectedStage1Id;

    const card = document.createElement("div");
    card.className = `preset-card ${isSelected ? "selected" : ""}`;
    card.setAttribute("role", "button");
    card.tabIndex = 0;

    const stageDiv = document.createElement("div");
    stageDiv.className = "preset-stage";

    const camGrid = document.createElement("div");
    camGrid.className = "cam-grid";
    stageDiv.appendChild(camGrid);

    const camSubject = document.createElement("div");
    camSubject.className = `cam-subject ${preset.motionPreview || "preview-dolly"}`;
    stageDiv.appendChild(camSubject);

    if (preset.poster) {
      const posterImg = document.createElement("img");
      posterImg.className = "preset-media-img";
      posterImg.src = preset.poster;
      posterImg.alt = preset.name;
      posterImg.loading = "lazy";
      posterImg.onerror = () => posterImg.remove();
      stageDiv.appendChild(posterImg);
    }

    if (preset.videoSrc) {
      const vid = document.createElement("video");
      vid.className = "preset-media-video";
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = "none";
      vid.onerror = () => vid.remove();
      card.addEventListener("mouseenter", () => {
        if (!vid.src) vid.src = preset.videoSrc;
        vid.play().catch(() => {});
      });
      card.addEventListener("mouseleave", () => {
        if (vid.src) vid.pause();
      });
      stageDiv.appendChild(vid);
    }

    const badge = document.createElement("span");
    badge.className = "preset-badge";
    const queueIndex = isVideo ? state.stage2Queue.indexOf(preset.id) : -1;
    badge.textContent =
      isVideo && state.stage2Queue.length > 1 && queueIndex !== -1
        ? `#${queueIndex + 1} ${preset.badge}`
        : preset.badge;
    stageDiv.appendChild(badge);

    if (preset.custom) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "preset-corner-btn edit-btn";
      editBtn.title = "Edit custom preset";
      editBtn.textContent = "✎";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditingCustomPreset(state.stage, preset);
      });
      stageDiv.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "preset-corner-btn delete-btn";
      delBtn.title = "Delete custom preset";
      delBtn.textContent = "×";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCustomPreset(state.stage, preset.id);
      });
      stageDiv.appendChild(delBtn);
    } else if (isVideo) {
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "preset-corner-btn";
      addBtn.title = "Chain to Multi-Move Sequence";
      addBtn.textContent = "+";
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToSequence(preset.id);
      });
      stageDiv.appendChild(addBtn);
    }

    const meta = document.createElement("div");
    meta.className = "preset-meta";

    const title = document.createElement("div");
    title.className = "preset-title";
    title.textContent = preset.name;

    const sub = document.createElement("div");
    sub.className = "preset-sub";
    sub.textContent = isVideo
      ? `${preset.category} • ${preset.defaultDuration}`
      : `${preset.category} • ${preset.tag}`;

    meta.append(title, sub);
    card.append(stageDiv, meta);

    const selectCard = () => {
      if (isVideo) {
        if (state.sequenceMode) {
          addToSequence(preset.id);
          return;
        }
        state.selectedStage2Id = preset.id;
        state.stage2Queue = [preset.id];
        if (preset.defaultDuration) {
          const validDur = ["5s", "8s", "12s", "15s"].includes(preset.defaultDuration)
            ? preset.defaultDuration
            : "5s";
          el.selectDuration.value = validDur;
          state.duration = validDur;
        }
      } else {
        state.selectedStage1Id = preset.id;
      }
      state.manualOverride = false;
      renderPresets();
      updateCompiledOutput();
    };

    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCard();
      }
    });

    el.presetGrid.appendChild(card);
  });
}

// Toast
let toastTimer = null;
function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 2600);
}

// Smart Tab Discovery
function setStatus(type, text, siteKey = "generic") {
  state.activeSite = siteKey;
  el.tabStatus.className = `status-bar status-${type}`;
  el.statusText.textContent = text;
  el.btnSyncFlow.classList.toggle("hidden", siteKey !== "flow");

  const labelMap = {
    flow: "Flow",
    gemini: "Gemini",
    aistudio: "AI Studio",
    generic: "Tab"
  };
  el.btnInjectLabel.textContent = labelMap[siteKey] || labelMap.generic;
}

async function storageGet(keys) {
  if (chrome?.storage?.local) {
    return await chrome.storage.local.get(keys);
  }
  const keyList = Array.isArray(keys) ? keys : [keys];
  const out = {};
  keyList.forEach((k) => {
    try {
      const raw = localStorage.getItem(`higgsfold:${k}`);
      if (raw) out[k] = JSON.parse(raw);
    } catch (_) {}
  });
  return out;
}

async function storageSet(obj) {
  if (chrome?.storage?.local) {
    return await chrome.storage.local.set(obj);
  }
  Object.entries(obj).forEach(([k, v]) => {
    try {
      localStorage.setItem(`higgsfold:${k}`, JSON.stringify(v));
    } catch (_) {}
  });
}

async function resolveTargetTab() {
  try {
    if (!chrome?.tabs?.query) return null;
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (active?.url && !active.url.startsWith("chrome-extension://")) {
      return active;
    }
    const candidates = await chrome.tabs.query({
      url: [
        "https://flow.google.com/*",
        "https://labs.google/*",
        "https://gemini.google.com/*",
        "https://aistudio.google.com/*"
      ]
    });
    if (candidates && candidates.length > 0) {
      return candidates.find((t) => t.active) || candidates[0];
    }
    return active || null;
  } catch (_) {
    return null;
  }
}

async function checkActiveTab() {
  const tab = await resolveTargetTab();
  if (!tab || !tab.url) {
    setStatus("idle", "No Flow / Gemini tab detected.", "generic");
    return null;
  }
  const url = tab.url;
  if (url.includes("flow.google.com") || url.includes("labs.google")) {
    setStatus("connected", "Connected: Google Flow", "flow");
  } else if (url.includes("gemini.google.com")) {
    setStatus("connected", "Connected: Google Gemini", "gemini");
  } else if (url.includes("aistudio.google.com")) {
    setStatus("connected", "Connected: Google AI Studio", "aistudio");
  } else {
    setStatus("warning", "Open Flow or Gemini to inject", "generic");
  }
  return tab;
}

async function sendMessageWithAutoBridge(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (_) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/bridge.js"]
    });
    return await chrome.tabs.sendMessage(tabId, message);
  }
}

async function fetchMediaDataUrlFromItem(item) {
  if (item.dataUrl) {
    return { dataUrl: item.dataUrl, mimeType: item.mimeType || "image/png" };
  }
  if (!item.src) throw new Error("No media source URL available");
  if (item.src.startsWith("data:")) {
    return { dataUrl: item.src, mimeType: item.mimeType || "image/png" };
  }
  if (chrome?.runtime?.sendMessage) {
    const res = await chrome.runtime.sendMessage({
      type: "HIGGSFOLD_FETCH_MEDIA_BLOB",
      url: item.src
    });
    if (res?.ok && res.dataUrl) {
      return { dataUrl: res.dataUrl, mimeType: res.mimeType || "image/png" };
    }
    if (res?.error) throw new Error(res.error);
  }
  const resp = await fetch(item.src);
  const blob = await resp.blob();
  const dataUrl = await new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(blob);
  });
  return { dataUrl, mimeType: blob.type || "image/png" };
}

function isImageStylePrompt(promptText) {
  if (state.stage === "stage1") return true;
  if (!promptText) return false;
  return /^\s*(\[KEYFRAME|A cinematic [^\n]* still keyframe)/i.test(promptText);
}

async function syncFlowSettings(tabId, promptOverride = "") {
  const isImagePrompt = isImageStylePrompt(promptOverride || el.compiledPreview.value);
  const effectiveSubMode = state.endRefImageDataUrl ? "Frames" : state.flowSubMode;
  const payload = {
    mode: isImagePrompt ? "Image" : "Video",
    videoSubMode: isImagePrompt ? undefined : effectiveSubMode,
    aspectRatio: state.aspect,
    batchCount: state.batchCount,
    modelHints: isImagePrompt
      ? ["Nano Banana 2.1", "Nano Banana 2", "Nano Banana", "Imagen"]
      : ["Omni 1.2 Flash", "Omni 1.2", "Veo 3.1 - Fast", "Veo 3.1", "Veo"]
  };
  try {
    const res = await sendMessageWithAutoBridge(tabId, {
      type: "HIGGSFOLD_SYNC_FLOW_SETTINGS",
      payload
    });
    if (res?.ok) {
      const summary = res.synced?.length ? res.synced.join(", ") : "checked";
      showToast(`Flow synced (${summary})`);
    } else {
      showToast(res?.error || "Could not sync Flow settings");
    }
    return res;
  } catch (_) {
    showToast("Open a Google Flow project first");
    return null;
  }
}

// History & Storyboard
async function saveToHistory(promptText) {
  const { history = [] } = await storageGet(STORAGE_KEYS.history);
  const stageLabels = {
    stage1: "NANO BANANA 2.1",
    stage2: "OMNI 1.2 FLASH",
    lipsync: "LIPSYNC STUDIO",
    motion_control: "MOTION CONTROL",
    drama: "SHORT DRAMA"
  };
  const presetName =
    state.stage === "stage2"
      ? state.stage2Queue
          .map((id) => getStage2All().find((p) => p.id === id)?.name)
          .filter(Boolean)
          .join(" → ")
      : state.stage === "stage1"
        ? getStage1All().find((p) => p.id === state.selectedStage1Id)?.name
        : stageLabels[state.stage];

  const entry = {
    id: Date.now(),
    stage: stageLabels[state.stage] || "STUDIO",
    preset: presetName || "Custom",
    prompt: promptText,
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  const next = [entry, ...history].slice(0, 50);
  await storageSet({ [STORAGE_KEYS.history]: next });
}

async function renderHistory() {
  const { history = [] } = await storageGet(STORAGE_KEYS.history);
  el.historyList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#898a8b;font-size:12px;";
    empty.textContent = "No saved prompts yet. Inject or copy a prompt to log it here.";
    el.historyList.appendChild(empty);
    return;
  }

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    const top = document.createElement("div");
    top.className = "history-top";
    const leftSpan = document.createElement("span");
    leftSpan.textContent = `${item.stage} • ${item.preset}`;
    const rightSpan = document.createElement("span");
    rightSpan.textContent = item.createdAt;
    top.append(leftSpan, rightSpan);

    const body = document.createElement("div");
    body.className = "history-prompt";
    body.textContent = item.prompt;

    div.append(top, body);
    div.addEventListener("click", () => {
      state.manualOverride = true;
      el.compiledPreview.value = item.prompt;
      el.btnResetCompiled.classList.remove("hidden");
      el.charCount.textContent = `${item.prompt.length} chars`;
      el.historyDrawer.classList.add("hidden");
      showToast("Prompt loaded from history");
    });
    el.historyList.appendChild(div);
  });
}

async function refreshShotCount() {
  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  el.shotCount.textContent = String(storyboard.length);
}

async function saveShotToStoryboard() {
  const promptText = el.compiledPreview.value.trim();
  if (!promptText) {
    showToast("Prompt is empty");
    return;
  }
  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  const presetLabel =
    state.stage === "stage2"
      ? state.stage2Queue
          .map((id) => getStage2All().find((p) => p.id === id)?.name)
          .filter(Boolean)
          .join(" → ")
      : state.stage === "stage1"
        ? getStage1All().find((p) => p.id === state.selectedStage1Id)?.name
        : state.stage.toUpperCase();

  const shot = {
    id: Date.now(),
    stage: state.stage.toUpperCase(),
    preset: presetLabel || "Custom",
    prompt: promptText,
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  const next = [...storyboard, shot].slice(0, 40);
  await storageSet({ [STORAGE_KEYS.storyboard]: next });
  await refreshShotCount();
  showToast(`Saved Shot #${next.length} to Storyboard`);
}

async function renderStoryboard() {
  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  el.storyboardList.innerHTML = "";

  if (!storyboard.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#898a8b;font-size:12px;";
    empty.textContent = "Storyboard is empty. Save shots or generate a Short Drama sequence.";
    el.storyboardList.appendChild(empty);
    return;
  }

  storyboard.forEach((shot, idx) => {
    const div = document.createElement("div");
    div.className = "history-item";

    const top = document.createElement("div");
    top.className = "history-top";
    const title = document.createElement("span");
    title.textContent = `SHOT ${idx + 1} • ${shot.stage} • ${shot.preset}`;

    const actions = document.createElement("div");
    actions.className = "sb-card-actions";

    const injectShotBtn = document.createElement("button");
    injectShotBtn.type = "button";
    injectShotBtn.className = "text-btn accent-link";
    injectShotBtn.textContent = "Inject";
    injectShotBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      state.manualOverride = true;
      el.compiledPreview.value = shot.prompt;
      el.btnResetCompiled.classList.remove("hidden");
      el.charCount.textContent = `${shot.prompt.length} chars`;
      await injectPrompt(shot.prompt);
    });

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "text-btn";
    upBtn.textContent = "↑";
    upBtn.disabled = idx === 0;
    upBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const updated = [...storyboard];
      [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
      await storageSet({ [STORAGE_KEYS.storyboard]: updated });
      await renderStoryboard();
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "text-btn";
    downBtn.textContent = "↓";
    downBtn.disabled = idx === storyboard.length - 1;
    downBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const updated = [...storyboard];
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
      await storageSet({ [STORAGE_KEYS.storyboard]: updated });
      await renderStoryboard();
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "text-btn danger";
    del.textContent = "×";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      const updated = storyboard.filter((s) => s.id !== shot.id);
      await storageSet({ [STORAGE_KEYS.storyboard]: updated });
      await refreshShotCount();
      await renderStoryboard();
    });

    actions.append(injectShotBtn, upBtn, downBtn, del);
    top.append(title, actions);

    const body = document.createElement("div");
    body.className = "history-prompt";
    body.textContent = shot.prompt;

    div.append(top, body);
    div.addEventListener("click", () => {
      state.manualOverride = true;
      el.compiledPreview.value = shot.prompt;
      el.btnResetCompiled.classList.remove("hidden");
      el.charCount.textContent = `${shot.prompt.length} chars`;
      el.storyboardDrawer.classList.add("hidden");
      showToast(`Loaded Shot #${idx + 1}`);
    });
    el.storyboardList.appendChild(div);
  });
}

// Inject Prompt with Concurrency Lock ([BUG-13])
async function injectPrompt(promptOverride = null) {
  if (isInjecting) return;
  const promptText = (typeof promptOverride === "string" ? promptOverride : el.compiledPreview.value).trim();
  if (!promptText) {
    showToast("Prompt is empty");
    return;
  }

  isInjecting = true;
  const prevBtnLabel = el.btnInjectLabel.textContent;
  el.btnInject.disabled = true;
  el.btnInjectLabel.textContent = "Sending…";

  try {
    const tab = await checkActiveTab();
    if (!tab) {
      showToast("No active Flow / Gemini tab found");
      return;
    }

    await saveToHistory(promptText);

    if (state.autoSyncFlow && state.activeSite === "flow") {
      await syncFlowSettings(tab.id, promptText);
    }

    const response = await sendMessageWithAutoBridge(tab.id, {
      type: "HIGGSFOLD_INJECT_PROMPT",
      payload: {
        prompt: promptText,
        autoSubmit: state.autoSubmit
      }
    });

    if (response?.ok) {
      showToast(
        response.submitted
          ? "Injected & Generation started!"
          : "Prompt injected into active page!"
      );
    } else {
      showToast(response?.error || "Input not found — use 'Bind' button");
    }
  } catch (_) {
    showToast("Open flow.google.com, gemini.google.com, or aistudio.google.com");
  } finally {
    isInjecting = false;
    el.btnInject.disabled = false;
    el.btnInjectLabel.textContent = prevBtnLabel;
  }
}

async function sendImagePayloadToActiveTab(dataUrl, fileName, mimeType) {
  const tab = await checkActiveTab();
  if (!tab) {
    showToast("No active Flow / Gemini tab found");
    return false;
  }
  try {
    const res = await sendMessageWithAutoBridge(tab.id, {
      type: "HIGGSFOLD_INJECT_IMAGE",
      payload: { dataUrl, fileName, mimeType }
    });
    if (res?.ok) {
      showToast(`Attached reference (${res.method || "ok"}) to page!`);
      return true;
    }
    showToast(res?.error || "Could not attach image directly");
    return false;
  } catch (_) {
    showToast("Open Flow or Gemini tab first");
    return false;
  }
}

// Editing Room controller instance
const editingController = createEditingRoomController(
  {
    canvas: el.editCanvas,
    inputFiles: el.inputEditClips,
    btnPlay: el.btnPlayEdit,
    btnExport: el.btnExportEdit,
    btnClear: el.btnClearEdit,
    clipList: el.editClipList,
    clipCount: el.editClipCount,
    overlayList: el.editOverlayList,
    exportAspect: el.selectEditAspect,
    fitMode: el.selectEditFit,
    crossfadeToggle: el.chkEditCrossfade
  },
  showToast
);

// Closed-Loop Grab Output (Upgrade 2)
async function scanAndOpenGrabDrawer() {
  const tab = await checkActiveTab();
  if (!tab) {
    showToast("Open Flow or Gemini first to grab generated output");
    return;
  }
  el.grabList.innerHTML = '<p style="color:#898a8b;font-size:12px;">Scanning page outputs...</p>';
  el.grabDrawer.classList.remove("hidden");

  try {
    const res = await sendMessageWithAutoBridge(tab.id, { type: "HIGGSFOLD_GRAB_LATEST_MEDIA" });
    el.grabList.innerHTML = "";
    if (!res?.ok || !res.items?.length) {
      const p = document.createElement("p");
      p.style.cssText = "color:#898a8b;font-size:12px;";
      p.textContent = res?.error || "No visible outputs >= 256px detected yet.";
      el.grabList.appendChild(p);
      return;
    }

    res.items.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "grab-card";

      const top = document.createElement("div");
      top.className = "grab-card-top";

      const thumb = document.createElement(item.kind === "video" && !item.dataUrl && !item.poster ? "video" : "img");
      thumb.className = "grab-thumb";
      thumb.src = item.dataUrl || item.poster || item.src;
      if (thumb.tagName === "VIDEO") thumb.muted = true;

      const meta = document.createElement("div");
      meta.className = "ct-info";
      const label = document.createElement("div");
      label.className = "edit-clip-title";
      label.textContent = `${item.kind.toUpperCase()} #${idx + 1} (${item.width}×${item.height})`;
      const sub = document.createElement("div");
      sub.className = "edit-clip-sub";
      sub.textContent = item.alt || item.src.slice(0, 64);
      meta.append(label, sub);
      top.append(thumb, meta);

      const actions = document.createElement("div");
      actions.className = "grab-card-actions";

      const setRefBtn = document.createElement("button");
      setRefBtn.type = "button";
      setRefBtn.className = "pill-btn";
      setRefBtn.textContent = "Set Ref + Palette";
      setRefBtn.addEventListener("click", async () => {
        try {
          const { dataUrl, mimeType } = await fetchMediaDataUrlFromItem(item);
          const analyzed = await extractColorTransferFromDataUrl(
            dataUrl,
            `flow_output_${idx + 1}.png`,
            mimeType
          );
          applyReferencePreview(analyzed);
          el.grabDrawer.classList.add("hidden");
          setActivePopover("references");
          showToast("Output attached as Reference & Color Grade!");
        } catch (err) {
          showToast(err?.message || "Could not decode grabbed output");
        }
      });

      const sendEditBtn = document.createElement("button");
      sendEditBtn.type = "button";
      sendEditBtn.className = "hf-mini-action";
      sendEditBtn.textContent = "+ Editing Room";
      sendEditBtn.addEventListener("click", async () => {
        try {
          const srcForEdit = item.dataUrl || item.src;
          await editingController.addExternalClip(
            `Grabbed_${idx + 1}.${item.kind === "video" ? "mp4" : "png"}`,
            srcForEdit,
            item.kind
          );
          el.grabDrawer.classList.add("hidden");
          el.editingDrawer.classList.remove("hidden");
        } catch (err) {
          showToast(err?.message || "Failed adding clip");
        }
      });

      const saveSoulBtn = document.createElement("button");
      saveSoulBtn.type = "button";
      saveSoulBtn.className = "hf-mini-action accent";
      saveSoulBtn.textContent = "+ Soul Vault";
      saveSoulBtn.addEventListener("click", async () => {
        try {
          const { dataUrl } = await fetchMediaDataUrlFromItem(item);
          const compressed = await compressImageToWebP(dataUrl, 1024, 0.85);
          stagedSoulRefs = [{ id: `ref-${Date.now()}`, dataUrl: compressed, label: `Output #${idx + 1}` }];
          renderStagedSoulRefs();
          el.grabDrawer.classList.add("hidden");
          await renderSoulVault();
          el.soulVaultDrawer.classList.remove("hidden");
          showToast("Staged in Soul Vault — name your @character & Save!");
        } catch (err) {
          showToast(err?.message || "Failed saving to Soul Vault");
        }
      });

      actions.append(setRefBtn, sendEditBtn, saveSoulBtn);
      card.append(top, actions);
      el.grabList.appendChild(card);
    });
  } catch (err) {
    el.grabList.innerHTML = `<p style="color:#f87171;font-size:12px;">${err?.message || "Scan failed on active tab."}</p>`;
  }
}

// Soul Vault Helpers (Upgrade 4)
function renderStagedSoulRefs() {
  el.svStagedRefs.innerHTML = "";
  stagedSoulRefs.forEach((ref, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "sv-ref-thumb-wrap";
    const img = document.createElement("img");
    img.src = ref.dataUrl;
    img.alt = ref.label || "Soul ref";
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "sv-ref-rm";
    rm.textContent = "×";
    rm.addEventListener("click", () => {
      stagedSoulRefs.splice(idx, 1);
      renderStagedSoulRefs();
    });
    wrap.append(img, rm);
    el.svStagedRefs.appendChild(wrap);
  });
}

async function renderSoulVault() {
  const souls = await soulStore.listSouls();
  el.soulVaultCount.textContent = `${souls.length} souls`;
  el.soulVaultList.innerHTML = "";

  if (!souls.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#898a8b;font-size:12px;";
    empty.textContent = "No Souls saved yet. Create a persistent @character identity with WebP reference frames above.";
    el.soulVaultList.appendChild(empty);
    return;
  }

  souls.forEach((soul) => {
    const card = document.createElement("div");
    card.className = "sv-card";

    const top = document.createElement("div");
    top.className = "history-top";
    const title = document.createElement("span");
    title.textContent = `${soul.displayName} (${soul.handle})`;
    const refBadge = document.createElement("span");
    refBadge.textContent = `${soul.refs?.length || 0} refs`;
    top.append(title, refBadge);

    if (soul.refs && soul.refs.length > 0) {
      const strip = document.createElement("div");
      strip.className = "sv-ref-strip";
      soul.refs.forEach((r) => {
        const w = document.createElement("div");
        w.className = "sv-ref-thumb-wrap";
        const im = document.createElement("img");
        im.src = r.dataUrl;
        im.alt = soul.displayName;
        w.appendChild(im);
        strip.appendChild(w);
      });
      card.append(top, strip);
    } else {
      card.append(top);
    }

    if (soul.dnaPrompt) {
      const dna = document.createElement("div");
      dna.className = "history-prompt";
      dna.textContent = soul.dnaPrompt;
      card.appendChild(dna);
    }

    const actions = document.createElement("div");
    actions.className = "sv-card-actions";

    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "pill-btn";
    applyBtn.textContent = "Apply Soul";
    applyBtn.addEventListener("click", async () => {
      const lockText = soul.dnaPrompt ? `${soul.handle}, ${soul.dnaPrompt}` : soul.handle;
      state.characterLock = lockText;
      el.characterLock.value = lockText;
      if (soul.defaultLens && soul.defaultLens !== "auto") {
        state.lensType = soul.defaultLens;
        el.selectLens.value = soul.defaultLens;
      }
      if (soul.defaultPalette && soul.defaultPalette !== "match-ref") {
        state.palette = soul.defaultPalette;
        el.selectPalette.value = soul.defaultPalette;
      }
      if (soul.refs && soul.refs[0]?.dataUrl) {
        try {
          const analyzed = await extractColorTransferFromDataUrl(
            soul.refs[0].dataUrl,
            `${soul.handle.replace("@", "")}.webp`,
            "image/webp"
          );
          applyReferencePreview(analyzed);
        } catch (_) {}
      }
      state.manualOverride = false;
      updateCompiledOutput();
      el.soulVaultDrawer.classList.add("hidden");
      showToast(`Applied Soul "${soul.handle}"`);
    });

    const pushRefsBtn = document.createElement("button");
    pushRefsBtn.type = "button";
    pushRefsBtn.className = "hf-mini-action";
    pushRefsBtn.textContent = `Push ${soul.refs?.length || 0} Refs to Flow`;
    pushRefsBtn.disabled = !soul.refs?.length;
    pushRefsBtn.addEventListener("click", async () => {
      let sent = 0;
      for (let i = 0; i < (soul.refs || []).length; i += 1) {
        const ok = await sendImagePayloadToActiveTab(
          soul.refs[i].dataUrl,
          `${soul.handle.replace("@", "")}_ref${i + 1}.webp`,
          "image/webp"
        );
        if (ok) sent += 1;
      }
      if (sent > 0) showToast(`Pushed ${sent} Soul reference(s) to active page`);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "text-btn danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      await soulStore.deleteSoul(soul.id);
      await renderSoulVault();
      showToast("Soul removed from vault");
    });

    actions.append(applyBtn, pushRefsBtn, delBtn);
    card.appendChild(actions);
    el.soulVaultList.appendChild(card);
  });
}

function switchStage(nextStage) {
  state.stage = nextStage;
  state.selectedCategory = "All";
  state.manualOverride = false;
  renderCategories();
  renderPresets();
  updateCompiledOutput();
}

// Mode Switching
el.modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchStage(btn.dataset.stage));
});
el.sideNavBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchStage(btn.dataset.sideNav));
});

// Top Strip Popovers
el.stripPills.forEach((pill) => {
  pill.addEventListener("click", () => setActivePopover(pill.dataset.popover));
});
el.closeSubpanelBtns.forEach((btn) => {
  btn.addEventListener("click", () => setActivePopover(state.activePopover));
});

// Preset Filter & Multi-Move
el.presetSearch.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderPresets();
});

el.btnToggleSequence.addEventListener("click", () => {
  state.sequenceMode = !state.sequenceMode;
  if (!state.sequenceMode && state.stage2Queue.length > 1) {
    state.stage2Queue = [state.stage2Queue[0]];
    state.selectedStage2Id = state.stage2Queue[0];
    state.manualOverride = false;
    updateCompiledOutput();
  }
  renderPresets();
});

el.btnClearSequence.addEventListener("click", () => {
  state.stage2Queue = [state.selectedStage2Id];
  state.sequenceMode = false;
  state.manualOverride = false;
  renderPresets();
  updateCompiledOutput();
});

// Subject & Character Lock
el.subjectInput.addEventListener("input", (e) => {
  state.subject = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

el.characterLock.addEventListener("input", (e) => {
  state.characterLock = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

el.endObjectInput?.addEventListener("input", (e) => {
  state.endObject = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

el.btnClearInput.addEventListener("click", () => {
  el.subjectInput.value = "";
  el.characterLock.value = "";
  if (el.endObjectInput) el.endObjectInput.value = "";
  state.subject = "";
  state.characterLock = "";
  state.endObject = "";
  state.manualOverride = false;
  updateCompiledOutput();
});

// Lipsync
el.lipsyncDialogue.addEventListener("input", (e) => {
  state.lipsyncDialogue = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});
el.lipsyncAmbience.addEventListener("input", (e) => {
  state.lipsyncAmbience = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

// Motion Control Video & Contact Sheet (Upgrade 5 + [BUG-07])
el.inputMotionVideo.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (motionVideoObjectUrl) {
    URL.revokeObjectURL(motionVideoObjectUrl);
    motionVideoObjectUrl = "";
  }
  motionVideoFile = file;
  motionVideoObjectUrl = URL.createObjectURL(file);
  el.motionVideoPreview.src = motionVideoObjectUrl;
  el.motionVideoPreview.classList.remove("hidden");
  el.btnExtractMotionSheet.classList.remove("hidden");
  el.motionVideoMeta.textContent = file.name;
  showToast("Motion reference video loaded — click Extract Contact Sheet!");
});

el.btnExtractMotionSheet.addEventListener("click", async () => {
  if (!motionVideoFile) {
    showToast("Load a .mp4 or .webm video first");
    return;
  }
  try {
    el.btnExtractMotionSheet.disabled = true;
    el.btnExtractMotionSheet.textContent = "Sampling…";
    const sheet = await extractMotionContactSheet(motionVideoFile);
    motionSheetDataUrl = sheet.dataUrl;
    el.motionSheetThumb.src = sheet.dataUrl;
    el.motionSheetWrap.classList.remove("hidden");
    showToast(`Extracted ${sheet.frameCount}-frame Motion Contact Sheet (${sheet.durationSec}s)!`);
  } catch (err) {
    showToast(err?.message || "Could not extract video frames");
  } finally {
    el.btnExtractMotionSheet.disabled = false;
    el.btnExtractMotionSheet.textContent = "Extract Contact Sheet";
  }
});

el.btnSendMotionSheet.addEventListener("click", async () => {
  if (!motionSheetDataUrl) return;
  const analyzed = await extractColorTransferFromDataUrl(
    motionSheetDataUrl,
    "motion_contact_sheet.webp",
    "image/webp"
  );
  applyReferencePreview(analyzed);
  await sendImagePayloadToActiveTab(motionSheetDataUrl, "motion_contact_sheet.webp", "image/webp");
});

el.motionRefDesc.addEventListener("input", (e) => {
  state.motionRefDescription = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

// Short Drama
el.btnGenerateDrama.addEventListener("click", async () => {
  const shots = generateShortDramaStoryboard(
    {
      premise: el.dramaPremise.value,
      cast: el.dramaCast.value,
      arcId: state.dramaArcId,
      shotCount: el.selectDramaShots.value,
      aspect: state.aspect,
      duration: state.duration,
      palette: state.palette,
      lighting: state.lighting,
      genre: state.genre,
      era: state.era,
      cameraBody: state.cameraBody,
      lensType: state.lensType,
      aperture: state.aperture,
      keyframePresetId: state.selectedStage1Id,
      includeAudio: state.includeAudio,
      promptFormat: state.promptFormat,
      guardrails: state.guardrails
    },
    getStage1All(),
    getStage2All()
  );

  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  const combined = [...storyboard, ...shots].slice(0, 40);
  await storageSet({ [STORAGE_KEYS.storyboard]: combined });
  await refreshShotCount();

  state.manualOverride = true;
  el.compiledPreview.value = shots[0].prompt;
  updateCompiledOutput();
  await renderStoryboard();
  el.storyboardDrawer.classList.remove("hidden");
  showToast(`Generated ${shots.length} Short Drama arc shots!`);
});

// Color Transfer & Image Bridge
el.inputRefImage.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await extractColorTransferFromFile(file);
    applyReferencePreview(result);
    showToast("Color Transfer palette extracted!");
  } catch (err) {
    showToast(err?.message || "Could not analyze reference image");
  } finally {
    el.inputRefImage.value = "";
  }
});

el.btnClearRefImage.addEventListener("click", () => {
  state.colorTransferSummary = "";
  state.refImageDataUrl = "";
  state.refImageName = "";
  state.refImageMime = "";
  el.ctPreviewWrap.classList.add("hidden");
  el.btnSendRefImage.classList.add("hidden");
  el.btnClearRefImage.classList.add("hidden");
  el.btnSendDualFrames?.classList.add("hidden");
  state.manualOverride = false;
  updateCompiledOutput();
});

el.btnSendRefImage.addEventListener("click", async () => {
  if (!state.refImageDataUrl) return;
  await sendImagePayloadToActiveTab(
    state.refImageDataUrl,
    state.refImageName,
    state.refImageMime
  );
});

el.inputEndRefImage?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await compressImageToWebP(file, 1024, 0.88);
    state.endRefImageDataUrl = dataUrl;
    state.endRefImageName = file.name;
    state.endRefImageMime = "image/webp";
    el.endRefThumb.src = dataUrl;
    el.endRefMeta.textContent = `${file.name} — ready for Flow Frames Start→End morph.`;
    el.endRefPreviewWrap.classList.remove("hidden");
    el.btnClearEndRef.classList.remove("hidden");
    el.btnSendDualFrames?.classList.toggle("hidden", !state.refImageDataUrl);
    updateCompiledOutput();
    showToast("End Morph Frame (B) loaded!");
  } catch (err) {
    showToast(err?.message || "Could not load End Morph Frame");
  } finally {
    el.inputEndRefImage.value = "";
  }
});

el.btnClearEndRef?.addEventListener("click", () => {
  state.endRefImageDataUrl = "";
  state.endRefImageName = "";
  state.endRefImageMime = "";
  el.endRefPreviewWrap.classList.add("hidden");
  el.btnClearEndRef.classList.add("hidden");
  el.btnSendDualFrames?.classList.add("hidden");
  updateCompiledOutput();
});

el.btnSendDualFrames?.addEventListener("click", async () => {
  if (!state.refImageDataUrl || !state.endRefImageDataUrl) {
    showToast("Load both Start Frame (A) and End Frame (B) first");
    return;
  }
  const ok1 = await sendImagePayloadToActiveTab(
    state.refImageDataUrl,
    state.refImageName || "start_frame.png",
    state.refImageMime || "image/png"
  );
  await new Promise((r) => setTimeout(r, 220));
  const ok2 = await sendImagePayloadToActiveTab(
    state.endRefImageDataUrl,
    state.endRefImageName || "end_frame.webp",
    state.endRefImageMime || "image/webp"
  );
  if (ok1 && ok2) {
    showToast("Attached Start (A) + End (B) Frames to Flow!");
  }
});

// Select Controls
const selectBindings = [
  [el.selectIntensity, "intensity"],
  [el.selectAspect, "aspect"],
  [el.selectLighting, "lighting"],
  [el.selectDuration, "duration"],
  [el.selectResolution, "resolution"],
  [el.selectBatch, "batchCount"],
  [el.selectFlowSubmode, "flowSubMode"],
  [el.selectCamera, "cameraBody"],
  [el.selectLens, "lensType"],
  [el.selectAperture, "aperture"],
  [el.selectPalette, "palette"],
  [el.selectGenre, "genre"],
  [el.selectEra, "era"],
  [el.selectLipsyncEmotion, "lipsyncEmotion"],
  [el.selectLipsyncFraming, "lipsyncFraming"],
  [el.selectLipsyncVoice, "lipsyncVoice"],
  [el.selectLipsyncCamera, "lipsyncCameraId"],
  [el.selectMotionMode, "motionControlMode"],
  [el.selectMotionCam, "selectedStage2Id"],
  [el.selectDramaArc, "dramaArcId"]
];

selectBindings.forEach(([selectNode, key]) => {
  if (!selectNode) return;
  selectNode.addEventListener("change", (e) => {
    state[key] = e.target.value;
    if (key === "selectedStage2Id") state.stage2Queue = [e.target.value];
    state.manualOverride = false;
    updateCompiledOutput();
  });
});

el.btnResetOptics.addEventListener("click", () => {
  state.cameraBody = "auto";
  state.lensType = "auto";
  state.aperture = "auto";
  state.genre = "auto";
  state.era = "auto";
  state.palette = "match-ref";
  el.selectCamera.value = "auto";
  el.selectLens.value = "auto";
  el.selectAperture.value = "auto";
  el.selectGenre.value = "auto";
  el.selectEra.value = "auto";
  el.selectPalette.value = "match-ref";
  state.manualOverride = false;
  updateCompiledOutput();
  showToast("Optics & Film Setup reset to Auto");
});

el.chkAudio.addEventListener("change", (e) => {
  state.includeAudio = e.target.checked;
  state.manualOverride = false;
  updateCompiledOutput();
});

el.chkProse.addEventListener("change", (e) => {
  state.promptFormat = e.target.checked ? "prose" : "structured";
  state.manualOverride = false;
  updateCompiledOutput();
});

el.chkGuardrails.addEventListener("change", (e) => {
  state.guardrails = e.target.checked;
  state.manualOverride = false;
  updateCompiledOutput();
});

el.chkAutoSubmit.addEventListener("change", (e) => {
  state.autoSubmit = e.target.checked;
  schedulePersistWorkspace();
});

el.chkAutoSync.addEventListener("change", (e) => {
  state.autoSyncFlow = e.target.checked;
  schedulePersistWorkspace();
});

el.compiledPreview.addEventListener("input", () => {
  state.manualOverride = true;
  el.btnResetCompiled.classList.remove("hidden");
  el.charCount.textContent = `${el.compiledPreview.value.length} chars`;
});

el.btnResetCompiled.addEventListener("click", () => {
  state.manualOverride = false;
  updateCompiledOutput();
  showToast("Recompiled from active preset & controls");
});

// [BUG-15] Clean offscreen textarea copy fallback for ANY text (e.g. Storyboard scripts)
async function copyText(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch (_) {
    const tempArea = document.createElement("textarea");
    tempArea.value = text;
    tempArea.setAttribute("readonly", "");
    tempArea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(tempArea);
    try {
      tempArea.select();
      document.execCommand("copy");
      showToast(successMsg);
    } finally {
      tempArea.remove();
    }
  }
}

el.btnCopy.addEventListener("click", async () => {
  const text = el.compiledPreview.value.trim();
  if (!text) return;
  await copyText(text, "Compiled prompt copied!");
  await saveToHistory(text);
});

el.btnInject.addEventListener("click", () => injectPrompt());

el.btnSyncFlow.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (tab) await syncFlowSettings(tab.id);
});

el.btnOpenFlow.addEventListener("click", () => {
  if (chrome?.tabs?.create) chrome.tabs.create({ url: "https://flow.google.com/" });
  else window.open("https://flow.google.com/", "_blank", "noopener");
});

el.btnExpandStudio.addEventListener("click", () => {
  const url = chrome?.runtime?.getURL
    ? chrome.runtime.getURL("sidepanel/index.html?full=1")
    : window.location.href;
  if (chrome?.tabs?.create) chrome.tabs.create({ url });
  else window.open(url, "_blank", "noopener");
});

// Grab Output Drawer
el.btnGrabOutput.addEventListener("click", scanAndOpenGrabDrawer);
el.btnRefreshGrab.addEventListener("click", scanAndOpenGrabDrawer);
el.btnCloseGrab.addEventListener("click", () => el.grabDrawer.classList.add("hidden"));

// Soul Vault Drawer & Quick Picker
const openSoulVault = async () => {
  await renderSoulVault();
  el.soulVaultDrawer.classList.remove("hidden");
};
el.btnSoulVault.addEventListener("click", openSoulVault);
el.btnSideSouls.addEventListener("click", openSoulVault);
el.btnPickSoul.addEventListener("click", openSoulVault);
el.btnCloseSouls.addEventListener("click", () => el.soulVaultDrawer.classList.add("hidden"));

el.svInputRefs.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    if (stagedSoulRefs.length >= 4) break;
    try {
      const dataUrl = await compressImageToWebP(file, 1024, 0.85);
      stagedSoulRefs.push({ id: `ref-${Date.now()}-${stagedSoulRefs.length}`, dataUrl, label: file.name });
    } catch (_) {}
  }
  el.svInputRefs.value = "";
  renderStagedSoulRefs();
});

el.svUseCurrentRef.addEventListener("click", async () => {
  if (!state.refImageDataUrl) {
    showToast("Load or Grab a reference image first");
    return;
  }
  if (stagedSoulRefs.length >= 4) {
    showToast("Max 4 references per Soul");
    return;
  }
  const compressed = await compressImageToWebP(state.refImageDataUrl, 1024, 0.85);
  stagedSoulRefs.push({ id: `ref-${Date.now()}`, dataUrl: compressed, label: state.refImageName || "Active Ref" });
  renderStagedSoulRefs();
});

el.soulVaultForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const displayName = el.svName.value.trim();
  if (!displayName) {
    showToast("Display Name is required");
    return;
  }
  try {
    const saved = await soulStore.saveSoul({
      displayName,
      handle: el.svHandle.value.trim() || displayName,
      dnaPrompt: el.svDna.value.trim(),
      defaultLens: el.svLens.value || "auto",
      defaultPalette: el.svPalette.value || "match-ref",
      refs: stagedSoulRefs
    });
    el.soulVaultForm.reset();
    stagedSoulRefs = [];
    renderStagedSoulRefs();
    await renderSoulVault();
    showToast(`Saved "${saved.handle}" to Soul Vault!`);
  } catch (err) {
    showToast(err?.message || "Failed saving Soul");
  }
});

// Drawers & Sidebar Actions
const openHistory = async () => {
  await renderHistory();
  el.historyDrawer.classList.remove("hidden");
};
const openStoryboard = async () => {
  await renderStoryboard();
  el.storyboardDrawer.classList.remove("hidden");
};
const openEditing = () => el.editingDrawer.classList.remove("hidden");
const openCustom = () => {
  editingCustomPreset = null;
  el.cpStage.disabled = false;
  el.customPresetForm.reset();
  el.customDrawerTitle.textContent = "Custom Preset Builder";
  const targetStage = state.stage === "stage1" ? "stage1" : "stage2";
  el.cpStage.value = targetStage;
  el.cpStage1Fields.classList.toggle("hidden", targetStage !== "stage1");
  el.cpStage2Fields.classList.toggle("hidden", targetStage !== "stage2");
  el.customPresetDrawer.classList.remove("hidden");
};

el.btnHistory.addEventListener("click", openHistory);
el.btnSideHistory.addEventListener("click", openHistory);
el.btnCloseHistory.addEventListener("click", () => el.historyDrawer.classList.add("hidden"));
el.btnClearHistory.addEventListener("click", async () => {
  await storageSet({ [STORAGE_KEYS.history]: [] });
  await renderHistory();
  showToast("History cleared");
});

el.btnSaveShot.addEventListener("click", saveShotToStoryboard);
el.btnStoryboard.addEventListener("click", openStoryboard);
el.btnSideStoryboard.addEventListener("click", openStoryboard);
el.btnCloseStoryboard.addEventListener("click", () => el.storyboardDrawer.classList.add("hidden"));
el.btnCopyStoryboard.addEventListener("click", async () => {
  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  const script = formatStoryboardExport(storyboard);
  if (!script) {
    showToast("Storyboard is empty");
    return;
  }
  await copyText(script, `Copied ${storyboard.length} storyboard shots!`);
});

el.btnExportStoryboardJson.addEventListener("click", async () => {
  const { storyboard = [] } = await storageGet(STORAGE_KEYS.storyboard);
  if (!storyboard.length) {
    showToast("Storyboard is empty");
    return;
  }
  const blob = new Blob([JSON.stringify(storyboard, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `higgsfold_storyboard_${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  showToast(`Exported ${storyboard.length} storyboard shots`);
});

el.btnClearStoryboard.addEventListener("click", async () => {
  await storageSet({ [STORAGE_KEYS.storyboard]: [] });
  await refreshShotCount();
  await renderStoryboard();
  showToast("Storyboard cleared");
});

// Wire Editing Room inputs cleanly (note: clear confirmation handled cleanly here + controller)
el.inputEditClips.addEventListener("change", (e) => {
  editingController.addFiles(e.target.files);
  e.target.value = "";
});
el.btnPlayEdit.addEventListener("click", () => editingController.playOrExport(false));
el.btnExportEdit.addEventListener("click", () => editingController.playOrExport(true));
el.btnClearEdit.addEventListener("click", () => {
  const list = editingController.getClips();
  const ovList = editingController.getOverlays();
  if (!list.length && !ovList.length) return;
  while (list.length) {
    const c = list.pop();
    if (c.revokeOnRemove && c.url?.startsWith("blob:")) URL.revokeObjectURL(c.url);
  }
  while (ovList.length) {
    const ov = ovList.pop();
    if (ov.revokeUrl && ov.imageSrc?.startsWith("blob:")) URL.revokeObjectURL(ov.imageSrc);
  }
  editingController.renderClips();
  editingController.renderOverlays();
  const ctx = el.editCanvas.getContext("2d");
  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, el.editCanvas.width, el.editCanvas.height);
  showToast("Editing Room timeline & overlays cleared");
});

el.btnAddOvText?.addEventListener("click", async () => {
  const text = (el.ovText.value || "").trim();
  if (!text) {
    showToast("Enter kinetic text first");
    return;
  }
  await editingController.addOverlay({
    kind: "text",
    text,
    anim: el.ovAnim.value,
    position: el.ovPos.value,
    color: el.ovColor.value,
    startSec: el.ovStart.value,
    durSec: el.ovDur.value
  });
  el.ovText.value = "";
});

el.inputOvObject?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const objUrl = URL.createObjectURL(file);
  try {
    await editingController.addOverlay({
      kind: "object",
      label: file.name,
      imageSrc: objUrl,
      revokeUrl: true,
      anim: el.ovAnim.value,
      position: el.ovPos.value,
      startSec: el.ovStart.value,
      durSec: el.ovDur.value
    });
  } catch (err) {
    URL.revokeObjectURL(objUrl);
    showToast(err?.message || "Failed loading kinetic object");
  } finally {
    el.inputOvObject.value = "";
  }
});

el.btnEditingRoom.addEventListener("click", openEditing);
el.btnSideEditing.addEventListener("click", openEditing);
el.btnCloseEdit.addEventListener("click", () => el.editingDrawer.classList.add("hidden"));

el.btnCustomPreset.addEventListener("click", openCustom);
el.btnSideCustom.addEventListener("click", openCustom);
el.btnCloseCustom.addEventListener("click", () => {
  editingCustomPreset = null;
  el.cpStage.disabled = false;
  el.customPresetDrawer.classList.add("hidden");
});
el.cpStage.addEventListener("change", (e) => {
  const targetStage = e.target.value;
  el.cpStage1Fields.classList.toggle("hidden", targetStage !== "stage1");
  el.cpStage2Fields.classList.toggle("hidden", targetStage !== "stage2");
});

el.customPresetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetStage = editingCustomPreset ? editingCustomPreset.stage : el.cpStage.value;
  const name = document.getElementById("cp-name").value;
  const badge = document.getElementById("cp-badge").value;

  try {
    let preset;
    if (targetStage === "stage2") {
      preset = buildCustomPreset(
        {
          id: editingCustomPreset?.id,
          name,
          badge,
          category: document.getElementById("cp-s2-category").value,
          defaultDuration: document.getElementById("cp-s2-duration").value,
          cameraTrajectory: document.getElementById("cp-s2-trajectory").value,
          physicsSpec: document.getElementById("cp-s2-physics").value,
          audioCue: document.getElementById("cp-s2-audio").value
        },
        "stage2"
      );
      if (editingCustomPreset) {
        state.customPresets.stage2 = state.customPresets.stage2.map((p) =>
          p.id === preset.id ? preset : p
        );
      } else {
        state.customPresets.stage2.unshift(preset);
      }
      state.selectedStage2Id = preset.id;
      state.stage2Queue = [preset.id];
    } else {
      preset = buildCustomPreset(
        {
          id: editingCustomPreset?.id,
          name,
          badge,
          category: document.getElementById("cp-s1-category").value,
          tag: document.getElementById("cp-s1-tag").value,
          lensSpec: document.getElementById("cp-s1-lens").value,
          lightingSpec: document.getElementById("cp-s1-lighting").value,
          soulLockDirective: document.getElementById("cp-s1-soul").value
        },
        "stage1"
      );
      if (editingCustomPreset) {
        state.customPresets.stage1 = state.customPresets.stage1.map((p) =>
          p.id === preset.id ? preset : p
        );
      } else {
        state.customPresets.stage1.unshift(preset);
      }
      state.selectedStage1Id = preset.id;
    }

    const wasEdit = Boolean(editingCustomPreset);
    editingCustomPreset = null;
    el.cpStage.disabled = false;
    await storageSet({ [STORAGE_KEYS.customPresets]: state.customPresets });
    el.customPresetForm.reset();
    el.customPresetDrawer.classList.add("hidden");
    switchStage(targetStage);
    showToast(wasEdit ? `Updated custom preset "${preset.name}"` : `Saved custom preset "${preset.name}"`);
  } catch (err) {
    showToast(err.message || "Invalid preset fields");
  }
});

el.btnExportPresets.addEventListener("click", () => {
  const payload = JSON.stringify(state.customPresets, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "higgsfold-custom-presets.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
  showToast("Exported custom presets JSON");
});

// [BUG-14] Deduplicate & preserve collision-free IDs during JSON pack import
function mergeCustomPresetList(existing, imported, stage) {
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const raw of imported) {
    const normalized = buildCustomPreset(raw, stage);
    byId.set(normalized.id, normalized);
  }
  return Array.from(byId.values());
}

el.inputImportPresets.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const s1 = Array.isArray(parsed.stage1) ? parsed.stage1 : [];
    const s2 = Array.isArray(parsed.stage2) ? parsed.stage2 : [];
    state.customPresets.stage1 = mergeCustomPresetList(state.customPresets.stage1, s1, "stage1");
    state.customPresets.stage2 = mergeCustomPresetList(state.customPresets.stage2, s2, "stage2");
    await storageSet({ [STORAGE_KEYS.customPresets]: state.customPresets });
    renderPresets();
    showToast(`Imported ${s1.length + s2.length} presets (deduplicated)`);
  } catch (_) {
    showToast("Invalid preset pack JSON");
  } finally {
    el.inputImportPresets.value = "";
  }
});

// Visual DOM Picker
el.btnPicker.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (!tab) return;
  try {
    await sendMessageWithAutoBridge(tab.id, { type: "HIGGSFOLD_START_PICKER" });
    el.pickerBanner.classList.remove("hidden");
    el.pickerStepText.textContent =
      "Step 1/2: Click the prompt box on the active Google Flow / Gemini page.";
  } catch (_) {
    showToast("Open Google Flow or Gemini tab before binding UI");
  }
});

chrome?.runtime?.onMessage?.addListener((msg) => {
  if (msg.type === "HIGGSFOLD_PICKER_PROGRESS") {
    el.pickerStepText.textContent = msg.text;
  }
  if (msg.type === "HIGGSFOLD_PICKER_DONE") {
    el.pickerBanner.classList.add("hidden");
    showToast("Custom UI selectors saved for this site!");
  }
  if (msg.type === "HIGGSFOLD_PICKER_CANCELLED") {
    el.pickerBanner.classList.add("hidden");
  }
});

el.btnCancelPicker.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (tab && chrome?.tabs?.sendMessage) {
    chrome.tabs.sendMessage(tab.id, { type: "HIGGSFOLD_STOP_PICKER" }).catch(() => {});
  }
  el.pickerBanner.classList.add("hidden");
});

el.btnResetSelectors.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (tab?.url) {
    const host = new URL(tab.url).hostname;
    const { customSelectors = {} } = await storageGet(STORAGE_KEYS.selectors);
    delete customSelectors[host];
    await storageSet({ [STORAGE_KEYS.selectors]: customSelectors });
    showToast(`Reset selectors for ${host}`);
  }
});

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    injectPrompt();
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
    const text = el.compiledPreview.value.trim();
    if (text) {
      e.preventDefault();
      copyText(text, "Compiled prompt copied!");
      saveToHistory(text);
    }
  }
});

chrome?.tabs?.onActivated?.addListener(checkActiveTab);
chrome?.tabs?.onUpdated?.addListener((_, info) => {
  if (info.status === "complete") checkActiveTab();
});

function syncDomFromState() {
  el.subjectInput.value = state.subject || "";
  el.characterLock.value = state.characterLock || "";
  if (el.endObjectInput) el.endObjectInput.value = state.endObject || "";
  el.lipsyncDialogue.value = state.lipsyncDialogue || "";
  el.lipsyncAmbience.value = state.lipsyncAmbience || "";
  el.motionRefDesc.value = state.motionRefDescription || "";
  el.chkAudio.checked = state.includeAudio !== false;
  el.chkProse.checked = state.promptFormat !== "structured";
  el.chkGuardrails.checked = state.guardrails !== false;
  el.chkAutoSubmit.checked = Boolean(state.autoSubmit);
  el.chkAutoSync.checked = Boolean(state.autoSyncFlow);

  selectBindings.forEach(([selectNode, key]) => {
    if (selectNode && state[key] !== undefined) {
      selectNode.value = state[key];
    }
  });
}

async function boot() {
  try {
    const stored = await storageGet([
      STORAGE_KEYS.customPresets,
      STORAGE_KEYS.workspaceState
    ]);
    if (stored.customPresets) {
      state.customPresets = {
        stage1: Array.isArray(stored.customPresets.stage1) ? stored.customPresets.stage1 : [],
        stage2: Array.isArray(stored.customPresets.stage2) ? stored.customPresets.stage2 : []
      };
    }
    if (stored.workspaceState && typeof stored.workspaceState === "object") {
      WORKSPACE_PERSIST_FIELDS.forEach((k) => {
        if (stored.workspaceState[k] !== undefined) {
          state[k] = stored.workspaceState[k];
        }
      });
    }
  } catch (_) {}

  syncDomFromState();
  renderCategories();
  renderPresets();
  updateCompiledOutput();
  await refreshShotCount();
  await checkActiveTab();
}

boot();
