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
  MOTION_CONTROL_MODES
} from "./presets.js";
import {
  compilePrompt,
  generateShortDramaStoryboard,
  buildCustomPreset,
  formatStoryboardExport
} from "./compiler.js";
import { extractColorTransferFromFile } from "./color-transfer.js";
import { createEditingRoomController } from "./editing-room.js";

const chrome =
  typeof globalThis.chrome !== "undefined" && globalThis.chrome?.tabs
    ? globalThis.chrome
    : globalThis.parent?.__HIGGSFOLD_CHROME_SHIM__ || globalThis.chrome;

const STORAGE_KEYS = {
  history: "history",
  customPresets: "customPresets",
  storyboard: "storyboard",
  selectors: "customSelectors"
};

const state = {
  stage: "stage2", // 'stage2' | 'stage1' | 'lipsync' | 'motion_control' | 'drama'
  selectedStage1Id: STAGE1_PRESETS[0].id,
  selectedStage2Id: STAGE2_PRESETS[0].id,
  stage2Queue: [STAGE2_PRESETS[0].id],
  sequenceMode: false,
  searchQuery: "",
  selectedCategory: "All",
  subject: "",
  characterLock: "",
  intensity: "cinematic",
  aspect: "16:9",
  lighting: "match-ref",
  duration: "5s",
  resolution: "1080p",
  batchCount: "1",
  cameraBody: "auto",
  lensType: "auto",
  aperture: "auto",
  genre: "auto",
  era: "auto",
  palette: "match-ref",
  colorTransferSummary: "",
  refImageDataUrl: "",
  refImageName: "",
  refImageMime: "",
  lipsyncDialogue: "",
  lipsyncEmotion: "calm",
  lipsyncFraming: "closeup",
  lipsyncVoice: "natural-id",
  lipsyncAmbience: "",
  motionRefDescription: "",
  motionControlMode: "video-bg",
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
  presetLibrarySection: document.getElementById("preset-library-section"),
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
  subjectInput: document.getElementById("subject-input"),
  characterLock: document.getElementById("character-lock"),
  btnClearInput: document.getElementById("btn-clear-input"),
  // Lipsync
  lipsyncDialogue: document.getElementById("lipsync-dialogue"),
  selectLipsyncEmotion: document.getElementById("select-lipsync-emotion"),
  selectLipsyncFraming: document.getElementById("select-lipsync-framing"),
  selectLipsyncVoice: document.getElementById("select-lipsync-voice"),
  lipsyncAmbience: document.getElementById("lipsync-ambience"),
  // Motion Control
  inputMotionVideo: document.getElementById("input-motion-video"),
  motionVideoMeta: document.getElementById("motion-video-meta"),
  motionVideoPreview: document.getElementById("motion-video-preview"),
  motionRefDesc: document.getElementById("motion-ref-desc"),
  selectMotionMode: document.getElementById("select-motion-mode"),
  selectMotionCam: document.getElementById("select-motion-cam"),
  // Short Drama
  dramaPremise: document.getElementById("drama-premise"),
  dramaCast: document.getElementById("drama-cast"),
  selectDramaShots: document.getElementById("select-drama-shots"),
  btnGenerateDrama: document.getElementById("btn-generate-drama"),
  // Color Transfer
  inputRefImage: document.getElementById("input-ref-image"),
  btnSendRefImage: document.getElementById("btn-send-ref-image"),
  btnClearRefImage: document.getElementById("btn-clear-ref-image"),
  ctBadge: document.getElementById("ct-badge"),
  ctPreviewWrap: document.getElementById("ct-preview-wrap"),
  ctThumb: document.getElementById("ct-thumb"),
  ctSwatches: document.getElementById("ct-swatches"),
  ctSummary: document.getElementById("ct-summary"),
  // Controls & Optics
  selectIntensity: document.getElementById("select-intensity"),
  selectAspect: document.getElementById("select-aspect"),
  selectLighting: document.getElementById("select-lighting"),
  selectDuration: document.getElementById("select-duration"),
  selectResolution: document.getElementById("select-resolution"),
  selectBatch: document.getElementById("select-batch"),
  selectCamera: document.getElementById("select-camera"),
  selectLens: document.getElementById("select-lens"),
  selectAperture: document.getElementById("select-aperture"),
  selectPalette: document.getElementById("select-palette"),
  selectGenre: document.getElementById("select-genre"),
  selectEra: document.getElementById("select-era"),
  paletteSwatchBar: document.getElementById("palette-swatch-bar"),
  opticsSummaryBadge: document.getElementById("optics-summary-badge"),
  btnResetOptics: document.getElementById("btn-reset-optics"),
  controlIntensity: document.getElementById("control-intensity"),
  controlDuration: document.getElementById("control-duration"),
  toggleAudioWrap: document.getElementById("toggle-audio-wrap"),
  chkAudio: document.getElementById("chk-audio"),
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
  btnSyncFlow: document.getElementById("btn-sync-flow"),
  btnOpenFlow: document.getElementById("btn-open-flow"),
  // Drawers
  btnHistory: document.getElementById("btn-history"),
  btnCloseHistory: document.getElementById("btn-close-history"),
  btnClearHistory: document.getElementById("btn-clear-history"),
  historyDrawer: document.getElementById("history-drawer"),
  historyList: document.getElementById("history-list"),
  btnStoryboard: document.getElementById("btn-storyboard"),
  shotCount: document.getElementById("shot-count"),
  storyboardDrawer: document.getElementById("storyboard-drawer"),
  storyboardList: document.getElementById("storyboard-list"),
  btnCopyStoryboard: document.getElementById("btn-copy-storyboard"),
  btnClearStoryboard: document.getElementById("btn-clear-storyboard"),
  btnCloseStoryboard: document.getElementById("btn-close-storyboard"),
  btnEditingRoom: document.getElementById("btn-editing-room"),
  editingDrawer: document.getElementById("editing-drawer"),
  btnCloseEdit: document.getElementById("btn-close-edit"),
  btnClearEdit: document.getElementById("btn-clear-edit"),
  editCanvas: document.getElementById("edit-canvas"),
  inputEditClips: document.getElementById("input-edit-clips"),
  btnPlayEdit: document.getElementById("btn-play-edit"),
  btnExportEdit: document.getElementById("btn-export-edit"),
  editClipList: document.getElementById("edit-clip-list"),
  editClipCount: document.getElementById("edit-clip-count"),
  btnCustomPreset: document.getElementById("btn-custom-preset"),
  customPresetDrawer: document.getElementById("custom-preset-drawer"),
  btnCloseCustom: document.getElementById("btn-close-custom"),
  customPresetForm: document.getElementById("custom-preset-form"),
  cpStage: document.getElementById("cp-stage"),
  cpStage1Fields: document.getElementById("cp-stage1-fields"),
  cpStage2Fields: document.getElementById("cp-stage2-fields"),
  btnExportPresets: document.getElementById("btn-export-presets"),
  inputImportPresets: document.getElementById("input-import-presets"),
  // Picker & Toast
  btnPicker: document.getElementById("btn-picker"),
  pickerBanner: document.getElementById("picker-banner"),
  pickerStepText: document.getElementById("picker-step-text"),
  btnCancelPicker: document.getElementById("btn-cancel-picker"),
  btnResetSelectors: document.getElementById("btn-reset-selectors"),
  toast: document.getElementById("toast")
};

function populateSelect(selectEl, items, valueKey = "id", labelKey = "label") {
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
populateSelect(el.selectMotionMode, MOTION_CONTROL_MODES);
populateSelect(el.selectMotionCam, STAGE2_PRESETS, "id", "name");

function getStage1All() {
  return [...state.customPresets.stage1, ...STAGE1_PRESETS];
}

function getStage2All() {
  return [...state.customPresets.stage2, ...STAGE2_PRESETS];
}

function renderPaletteSwatches() {
  const pal = COLOR_PALETTES.find((p) => p.id === state.palette);
  el.paletteSwatchBar.innerHTML = "";
  if (!pal || !pal.swatches || pal.swatches.length === 0) return;
  pal.swatches.forEach((hex) => {
    const chip = document.createElement("span");
    chip.className = "swatch-chip";
    const dot = document.createElement("span");
    dot.className = "swatch-dot";
    dot.style.background = hex;
    const lbl = document.createElement("span");
    lbl.textContent = hex.toUpperCase();
    chip.appendChild(dot);
    chip.appendChild(lbl);
    el.paletteSwatchBar.appendChild(chip);
  });
}

function updateOpticsBadge() {
  const activeCount = [
    state.cameraBody !== "auto",
    state.lensType !== "auto",
    state.aperture !== "auto",
    state.genre !== "auto",
    state.era !== "auto",
    state.palette !== "match-ref"
  ].filter(Boolean).length;
  el.opticsSummaryBadge.textContent = activeCount > 0 ? `${activeCount} active` : "Auto";
}

function updateModeVisibility() {
  const isLibrary = state.stage === "stage1" || state.stage === "stage2";
  const isVideoControls = state.stage === "stage2" || state.stage === "motion_control";
  const isDurationVisible = state.stage !== "stage1";

  el.presetLibrarySection.classList.toggle("hidden", !isLibrary);
  el.lipsyncPanel.classList.toggle("hidden", state.stage !== "lipsync");
  el.motionControlPanel.classList.toggle("hidden", state.stage !== "motion_control");
  el.dramaPanel.classList.toggle("hidden", state.stage !== "drama");
  el.subjectSection.classList.toggle("hidden", state.stage === "drama");

  el.controlIntensity.classList.toggle("hidden", state.stage !== "stage2");
  el.controlDuration.classList.toggle("hidden", !isDurationVisible);
  el.toggleAudioWrap.classList.toggle("hidden", !isVideoControls);
}

function updateCompiledOutput() {
  updateModeVisibility();
  renderPaletteSwatches();
  if (!state.manualOverride && state.stage !== "drama") {
    el.compiledPreview.value = compilePrompt(state, getStage1All(), getStage2All());
  }
  el.btnResetCompiled.classList.toggle("hidden", !state.manualOverride);
  el.charCount.textContent = `${el.compiledPreview.value.length} chars`;
  updateOpticsBadge();
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
  await chrome.storage.local.set({ [STORAGE_KEYS.customPresets]: state.customPresets });
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
    ? "Camera Motion (35 Cinema Moves)"
    : "Keyframe & Soul Studio";
  el.presetCount.textContent = `${filtered.length}/${fullList.length} presets`;

  renderSequenceBar();
  el.presetGrid.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#71717a;font-size:11.5px;grid-column:1/-1;padding:8px 0;";
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

    const badge = document.createElement("span");
    badge.className = "preset-badge";
    const queueIndex = isVideo ? state.stage2Queue.indexOf(preset.id) : -1;
    badge.textContent =
      isVideo && state.stage2Queue.length > 1 && queueIndex !== -1
        ? `#${queueIndex + 1} ${preset.badge}`
        : preset.badge;
    stageDiv.appendChild(badge);

    if (preset.custom) {
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

    const camSubject = document.createElement("div");
    camSubject.className = `cam-subject ${preset.motionPreview || "preview-dolly"}`;
    stageDiv.appendChild(camSubject);

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

    meta.appendChild(title);
    meta.appendChild(sub);
    card.appendChild(stageDiv);
    card.appendChild(meta);

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

// Active Tab Compatibility
function setStatus(type, text, siteKey = "generic") {
  state.activeSite = siteKey;
  el.tabStatus.className = `status-bar status-${type}`;
  el.statusText.textContent = text;
  el.btnSyncFlow.classList.toggle("hidden", siteKey !== "flow");

  const labelMap = {
    flow: "Inject to Google Flow",
    gemini: "Inject to Gemini",
    aistudio: "Inject to AI Studio",
    generic: "Inject to Active Tab"
  };
  el.btnInjectLabel.textContent = labelMap[siteKey] || labelMap.generic;
}

async function checkActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      setStatus("idle", "No active browser tab detected.", "generic");
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
  } catch (_) {
    setStatus("warning", "Tab check unavailable", "generic");
    return null;
  }
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

async function syncFlowSettings(tabId) {
  const isImageStage = state.stage === "stage1";
  const payload = {
    mode: isImageStage ? "Image" : "Video",
    aspectRatio: state.aspect,
    batchCount: state.batchCount,
    modelHint: isImageStage ? "Nano Banana 2.1" : "Omni 1.2 Flash"
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
  const { history = [] } = await chrome.storage.local.get(STORAGE_KEYS.history);
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
  await chrome.storage.local.set({ [STORAGE_KEYS.history]: next });
}

async function renderHistory() {
  const { history = [] } = await chrome.storage.local.get(STORAGE_KEYS.history);
  el.historyList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#71717a;font-size:12px;";
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
    top.appendChild(leftSpan);
    top.appendChild(rightSpan);

    const body = document.createElement("div");
    body.className = "history-prompt";
    body.textContent = item.prompt;

    div.appendChild(top);
    div.appendChild(body);
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
  const { storyboard = [] } = await chrome.storage.local.get(STORAGE_KEYS.storyboard);
  el.shotCount.textContent = String(storyboard.length);
}

async function saveShotToStoryboard() {
  const promptText = el.compiledPreview.value.trim();
  if (!promptText) {
    showToast("Prompt is empty");
    return;
  }
  const { storyboard = [] } = await chrome.storage.local.get(STORAGE_KEYS.storyboard);
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
  await chrome.storage.local.set({ [STORAGE_KEYS.storyboard]: next });
  await refreshShotCount();
  showToast(`Saved Shot #${next.length} to Storyboard`);
}

async function renderStoryboard() {
  const { storyboard = [] } = await chrome.storage.local.get(STORAGE_KEYS.storyboard);
  el.storyboardList.innerHTML = "";

  if (!storyboard.length) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:#71717a;font-size:12px;";
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

    const del = document.createElement("button");
    del.type = "button";
    del.className = "text-btn danger";
    del.textContent = "Remove";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      const updated = storyboard.filter((s) => s.id !== shot.id);
      await chrome.storage.local.set({ [STORAGE_KEYS.storyboard]: updated });
      await refreshShotCount();
      await renderStoryboard();
    });

    top.appendChild(title);
    top.appendChild(del);

    const body = document.createElement("div");
    body.className = "history-prompt";
    body.textContent = shot.prompt;

    div.appendChild(top);
    div.appendChild(body);
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

// Inject Prompt
async function injectPrompt() {
  const promptText = el.compiledPreview.value.trim();
  if (!promptText) {
    showToast("Prompt is empty");
    return;
  }

  const tab = await checkActiveTab();
  if (!tab) {
    showToast("No active tab found");
    return;
  }

  await saveToHistory(promptText);

  try {
    if (state.autoSyncFlow && state.activeSite === "flow") {
      await syncFlowSettings(tab.id);
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
  }
}

// Mode Switching
el.modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    el.modeBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    state.stage = btn.dataset.stage;
    state.selectedCategory = "All";
    state.manualOverride = false;
    renderCategories();
    renderPresets();
    updateCompiledOutput();
  });
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

el.btnClearInput.addEventListener("click", () => {
  el.subjectInput.value = "";
  el.characterLock.value = "";
  state.subject = "";
  state.characterLock = "";
  state.manualOverride = false;
  updateCompiledOutput();
});

// Lipsync Bindings
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

// Motion Control Bindings
el.inputMotionVideo.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  el.motionVideoPreview.src = url;
  el.motionVideoPreview.classList.remove("hidden");
  el.motionVideoMeta.textContent = file.name;
  showToast("Motion reference video loaded for preview");
});

el.motionRefDesc.addEventListener("input", (e) => {
  state.motionRefDescription = e.target.value;
  state.manualOverride = false;
  updateCompiledOutput();
});

// Short Drama Generator
el.btnGenerateDrama.addEventListener("click", async () => {
  const shots = generateShortDramaStoryboard(
    {
      premise: el.dramaPremise.value,
      cast: el.dramaCast.value,
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
      includeAudio: state.includeAudio
    },
    getStage1All(),
    getStage2All()
  );

  const { storyboard = [] } = await chrome.storage.local.get(STORAGE_KEYS.storyboard);
  const combined = [...storyboard, ...shots].slice(0, 40);
  await chrome.storage.local.set({ [STORAGE_KEYS.storyboard]: combined });
  await refreshShotCount();

  state.manualOverride = true;
  el.compiledPreview.value = shots[0].prompt;
  updateCompiledOutput();
  await renderStoryboard();
  el.storyboardDrawer.classList.remove("hidden");
  showToast(`Generated ${shots.length} Short Drama shots!`);
});

// Color Transfer & Image Bridge
el.inputRefImage.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await extractColorTransferFromFile(file);
    state.colorTransferSummary = result.summary;
    state.refImageDataUrl = result.dataUrl;
    state.refImageName = result.name;
    state.refImageMime = result.type;

    el.ctThumb.src = result.dataUrl;
    el.ctSwatches.innerHTML = "";
    result.swatches.forEach((hex) => {
      const chip = document.createElement("span");
      chip.className = "swatch-chip";
      const dot = document.createElement("span");
      dot.className = "swatch-dot";
      dot.style.background = hex;
      const lbl = document.createElement("span");
      lbl.textContent = hex.toUpperCase();
      chip.appendChild(dot);
      chip.appendChild(lbl);
      el.ctSwatches.appendChild(chip);
    });
    el.ctSummary.textContent = result.summary;
    el.ctBadge.textContent = `${result.swatches.length} colors`;
    el.ctPreviewWrap.classList.remove("hidden");
    el.btnSendRefImage.classList.remove("hidden");
    el.btnClearRefImage.classList.remove("hidden");

    state.manualOverride = false;
    updateCompiledOutput();
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
  el.ctBadge.textContent = "None";
  el.ctPreviewWrap.classList.add("hidden");
  el.btnSendRefImage.classList.add("hidden");
  el.btnClearRefImage.classList.add("hidden");
  state.manualOverride = false;
  updateCompiledOutput();
});

el.btnSendRefImage.addEventListener("click", async () => {
  if (!state.refImageDataUrl) return;
  const tab = await checkActiveTab();
  if (!tab) return;
  try {
    const res = await sendMessageWithAutoBridge(tab.id, {
      type: "HIGGSFOLD_INJECT_IMAGE",
      payload: {
        dataUrl: state.refImageDataUrl,
        fileName: state.refImageName,
        mimeType: state.refImageMime
      }
    });
    if (res?.ok) {
      showToast("Reference image pasted/dropped to page!");
    } else {
      showToast(res?.error || "Could not paste image directly");
    }
  } catch (_) {
    showToast("Open Flow or Gemini tab first");
  }
});

// Select Controls Bindings
const selectBindings = [
  [el.selectIntensity, "intensity"],
  [el.selectAspect, "aspect"],
  [el.selectLighting, "lighting"],
  [el.selectDuration, "duration"],
  [el.selectResolution, "resolution"],
  [el.selectBatch, "batchCount"],
  [el.selectCamera, "cameraBody"],
  [el.selectLens, "lensType"],
  [el.selectAperture, "aperture"],
  [el.selectPalette, "palette"],
  [el.selectGenre, "genre"],
  [el.selectEra, "era"],
  [el.selectLipsyncEmotion, "lipsyncEmotion"],
  [el.selectLipsyncFraming, "lipsyncFraming"],
  [el.selectLipsyncVoice, "lipsyncVoice"],
  [el.selectMotionMode, "motionControlMode"],
  [el.selectMotionCam, "selectedStage2Id"]
];

selectBindings.forEach(([selectNode, key]) => {
  selectNode.addEventListener("change", (e) => {
    state[key] = e.target.value;
    if (key === "selectedStage2Id") {
      state.stage2Queue = [e.target.value];
    }
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

el.chkAutoSubmit.addEventListener("change", (e) => {
  state.autoSubmit = e.target.checked;
});

el.chkAutoSync.addEventListener("change", (e) => {
  state.autoSyncFlow = e.target.checked;
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

async function copyText(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch (_) {
    el.compiledPreview.select();
    document.execCommand("copy");
    showToast(successMsg);
  }
}

el.btnCopy.addEventListener("click", async () => {
  const text = el.compiledPreview.value.trim();
  if (!text) return;
  await copyText(text, "Compiled prompt copied!");
  await saveToHistory(text);
});

el.btnInject.addEventListener("click", injectPrompt);

el.btnSyncFlow.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (tab) await syncFlowSettings(tab.id);
});

el.btnOpenFlow.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://flow.google.com/" });
});

// Drawers: History, Storyboard, Editing Room, Custom Presets
el.btnHistory.addEventListener("click", async () => {
  await renderHistory();
  el.historyDrawer.classList.remove("hidden");
});
el.btnCloseHistory.addEventListener("click", () => el.historyDrawer.classList.add("hidden"));
el.btnClearHistory.addEventListener("click", async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.history]: [] });
  await renderHistory();
  showToast("History cleared");
});

el.btnSaveShot.addEventListener("click", saveShotToStoryboard);
el.btnStoryboard.addEventListener("click", async () => {
  await renderStoryboard();
  el.storyboardDrawer.classList.remove("hidden");
});
el.btnCloseStoryboard.addEventListener("click", () => el.storyboardDrawer.classList.add("hidden"));
el.btnCopyStoryboard.addEventListener("click", async () => {
  const { storyboard = [] } = await chrome.storage.local.get(STORAGE_KEYS.storyboard);
  const script = formatStoryboardExport(storyboard);
  if (!script) {
    showToast("Storyboard is empty");
    return;
  }
  await copyText(script, `Copied ${storyboard.length} storyboard shots!`);
});
el.btnClearStoryboard.addEventListener("click", async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.storyboard]: [] });
  await refreshShotCount();
  await renderStoryboard();
  showToast("Storyboard cleared");
});

createEditingRoomController(
  {
    canvas: el.editCanvas,
    inputFiles: el.inputEditClips,
    btnPlay: el.btnPlayEdit,
    btnExport: el.btnExportEdit,
    btnClear: el.btnClearEdit,
    clipList: el.editClipList,
    clipCount: el.editClipCount
  },
  showToast
);

el.btnEditingRoom.addEventListener("click", () => el.editingDrawer.classList.remove("hidden"));
el.btnCloseEdit.addEventListener("click", () => el.editingDrawer.classList.add("hidden"));

el.btnCustomPreset.addEventListener("click", () => {
  const targetStage = state.stage === "stage1" ? "stage1" : "stage2";
  el.cpStage.value = targetStage;
  el.cpStage1Fields.classList.toggle("hidden", targetStage !== "stage1");
  el.cpStage2Fields.classList.toggle("hidden", targetStage !== "stage2");
  el.customPresetDrawer.classList.remove("hidden");
});
el.btnCloseCustom.addEventListener("click", () => el.customPresetDrawer.classList.add("hidden"));
el.cpStage.addEventListener("change", (e) => {
  const targetStage = e.target.value;
  el.cpStage1Fields.classList.toggle("hidden", targetStage !== "stage1");
  el.cpStage2Fields.classList.toggle("hidden", targetStage !== "stage2");
});

el.customPresetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetStage = el.cpStage.value;
  const name = document.getElementById("cp-name").value;
  const badge = document.getElementById("cp-badge").value;

  try {
    let preset;
    if (targetStage === "stage2") {
      preset = buildCustomPreset(
        {
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
      state.customPresets.stage2.unshift(preset);
      state.selectedStage2Id = preset.id;
      state.stage2Queue = [preset.id];
    } else {
      preset = buildCustomPreset(
        {
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
      state.customPresets.stage1.unshift(preset);
      state.selectedStage1Id = preset.id;
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.customPresets]: state.customPresets });
    el.customPresetForm.reset();
    el.customPresetDrawer.classList.add("hidden");

    state.stage = targetStage;
    el.modeBtns.forEach((b) => {
      const active = b.dataset.stage === targetStage;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    state.selectedCategory = "All";
    state.manualOverride = false;
    renderCategories();
    renderPresets();
    updateCompiledOutput();
    showToast(`Saved custom preset "${preset.name}"`);
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
  URL.revokeObjectURL(url);
  showToast("Exported custom presets JSON");
});

el.inputImportPresets.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const s1 = Array.isArray(parsed.stage1) ? parsed.stage1 : [];
    const s2 = Array.isArray(parsed.stage2) ? parsed.stage2 : [];
    const normalizedS1 = s1.map((p) => buildCustomPreset(p, "stage1"));
    const normalizedS2 = s2.map((p) => buildCustomPreset(p, "stage2"));
    state.customPresets.stage1 = [...normalizedS1, ...state.customPresets.stage1];
    state.customPresets.stage2 = [...normalizedS2, ...state.customPresets.stage2];
    await chrome.storage.local.set({ [STORAGE_KEYS.customPresets]: state.customPresets });
    renderPresets();
    showToast(`Imported ${normalizedS1.length + normalizedS2.length} presets`);
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

chrome.runtime.onMessage.addListener((msg) => {
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
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { type: "HIGGSFOLD_STOP_PICKER" }).catch(() => {});
  }
  el.pickerBanner.classList.add("hidden");
});

el.btnResetSelectors.addEventListener("click", async () => {
  const tab = await checkActiveTab();
  if (tab?.url) {
    const host = new URL(tab.url).hostname;
    const { customSelectors = {} } = await chrome.storage.local.get(STORAGE_KEYS.selectors);
    delete customSelectors[host];
    await chrome.storage.local.set({ [STORAGE_KEYS.selectors]: customSelectors });
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

chrome.tabs.onActivated.addListener(checkActiveTab);
chrome.tabs.onUpdated.addListener((_, info) => {
  if (info.status === "complete") checkActiveTab();
});

async function boot() {
  try {
    const stored = await chrome.storage.local.get([STORAGE_KEYS.customPresets]);
    if (stored.customPresets) {
      state.customPresets = {
        stage1: Array.isArray(stored.customPresets.stage1) ? stored.customPresets.stage1 : [],
        stage2: Array.isArray(stored.customPresets.stage2) ? stored.customPresets.stage2 : []
      };
    }
  } catch (_) {}

  renderCategories();
  renderPresets();
  updateCompiledOutput();
  await refreshShotCount();
  await checkActiveTab();
}

boot();
