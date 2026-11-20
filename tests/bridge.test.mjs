import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function createMockDom({ hostname, site }) {
  const listeners = [];
  const storage = { customSelectors: {} };

  const makeEl = (tag, attrs = {}) => {
    const attrMap = new Map(Object.entries(attrs));
    const elListeners = new Map();
    const el = {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      id: attrs.id || "",
      className: attrs.class || "",
      classList: {
        _set: new Set((attrs.class || "").split(/\s+/).filter(Boolean)),
        contains(c) { return this._set.has(c); },
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        [Symbol.iterator]() { return this._set.values(); },
        get length() { return this._set.size; }
      },
      isConnected: true,
      disabled: Boolean(attrs.disabled),
      isContentEditable: attrs.contenteditable === "true",
      textContent: "",
      innerText: "",
      innerHTML: "",
      value: "",
      children: [],
      parentElement: null,
      style: {},
      clicked: 0,
      focused: false,
      getAttribute(k) { return attrMap.has(k) ? String(attrMap.get(k)) : null; },
      setAttribute(k, v) { attrMap.set(k, String(v)); },
      hasAttribute(k) { return attrMap.has(k); },
      getBoundingClientRect() {
        return attrs._rect || { top: 10, left: 10, width: 200, height: 40 };
      },
      cloneNode() {
        const cloned = makeEl(tag, attrs);
        cloned.textContent = this.textContent;
        return cloned;
      },
      focus() { this.focused = true; },
      click() {
        this.clicked += 1;
        (elListeners.get("click") || []).forEach((fn) => fn({ target: this, preventDefault() {}, stopPropagation() {} }));
      },
      appendChild(child) {
        child.parentElement = this;
        this.children.push(child);
        if (child.textContent) {
          this.textContent += (this.textContent ? "\n" : "") + child.textContent;
          this.innerText = this.textContent;
        }
        return child;
      },
      addEventListener(type, fn) {
        if (!elListeners.has(type)) elListeners.set(type, []);
        elListeners.get(type).push(fn);
      },
      removeEventListener(type, fn) {
        const arr = elListeners.get(type) || [];
        elListeners.set(type, arr.filter((f) => f !== fn));
      },
      dispatchEvent(evt) {
        (elListeners.get(evt.type) || []).forEach((fn) => fn(evt));
        return !evt.defaultPrevented;
      },
      closest(sel) {
        if (sel.includes("button") && this.tagName === "BUTTON") return this;
        if (sel.includes("ProseMirror") && this.classList.contains("ProseMirror")) return this;
        return this.parentElement ? this.parentElement.closest(sel) : null;
      },
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
    return el;
  };

  const flowEditor = makeEl("div", {
    class: "ProseMirror",
    contenteditable: "true",
    role: "textbox",
    "aria-label": "What do you want to create?"
  });
  const flowBtn = makeEl("button", {
    class: "generate-icon-button mat-mdc-button-disabled",
    type: "submit",
    "aria-label": "Start generation",
    disabled: true
  });
  const flowIcon = makeEl("span", { class: "mat-icon" });
  flowBtn.appendChild(flowIcon);

  const geminiEditor = makeEl("div", {
    class: "ql-editor",
    contenteditable: "true",
    role: "textbox",
    "aria-label": "Enter a prompt for Gemini"
  });
  const geminiBtn = makeEl("button", {
    "aria-label": "Send message"
  });
  geminiBtn.isConnected = false; // mounted dynamically after input

  flowEditor.addEventListener("input", () => {
    setTimeout(() => {
      flowBtn.disabled = false;
      flowBtn.classList.remove("mat-mdc-button-disabled");
    }, 50);
  });

  geminiEditor.addEventListener("input", () => {
    setTimeout(() => {
      geminiBtn.isConnected = true;
    }, 50);
  });

  // Flow settings popover mock
  const settingsBtn = makeEl("button", {
    class: "settings-trigger-button",
    "aria-label": "Settings trigger"
  });
  const popover = makeEl("div", { class: "cdk-overlay-pane hidden" });
  const radioImage = makeEl("button", { role: "radio" }); radioImage.textContent = "Image";
  const radioVideo = makeEl("button", { role: "radio" }); radioVideo.textContent = "Video";
  const radioFrames = makeEl("button", { role: "radio" }); radioFrames.textContent = "Frames to Video";
  const radioIngredients = makeEl("button", { role: "radio" }); radioIngredients.textContent = "Ingredients to Video";
  const radio169 = makeEl("button", { role: "radio" }); radio169.textContent = "16:9";
  const radio916 = makeEl("button", { role: "radio" }); radio916.textContent = "9:16";
  const radioX2 = makeEl("button", { role: "radio" }); radioX2.textContent = "x2";
  const modelBtn = makeEl("button", { "aria-label": "Select model family" }); modelBtn.textContent = "Imagen 3";
  const veoItem = makeEl("button", { role: "menuitem", class: "mat-mdc-menu-item" }); veoItem.textContent = "Veo 3.1 - Fast";
  popover.appendChild(radioImage);
  popover.appendChild(radioVideo);
  popover.appendChild(radioFrames);
  popover.appendChild(radioIngredients);
  popover.appendChild(radio169);
  popover.appendChild(radio916);
  popover.appendChild(radioX2);
  popover.appendChild(modelBtn);
  popover.querySelectorAll = (sel) => {
    if (sel && sel.includes("Select model family")) return [];
    return [radioImage, radioVideo, radioFrames, radioIngredients, radio169, radio916, radioX2];
  };
  popover.querySelector = (sel) => {
    if (sel && sel.includes("Select model family")) return modelBtn;
    if (sel && sel.includes('role="radio"')) return radioImage;
    return null;
  };

  // Generated media mock (>= 256px vs small 32px avatar)
  const smallIconImg = makeEl("img", { _rect: { top: 10, left: 10, width: 32, height: 32 } });
  smallIconImg.currentSrc = "https://lh3.googleusercontent.com/avatar32.png";
  const largeGenImg = makeEl("img", { alt: "Generated portrait", _rect: { top: 50, left: 50, width: 512, height: 512 } });
  largeGenImg.currentSrc = "https://lh3.googleusercontent.com/generated512.png";

  // Shadow DOM host mock for Shadow DOM traversal test
  const shadowEditor = makeEl("textarea", { "aria-label": "Shadow prompt" });
  const shadowHost = makeEl("custom-shadow-host");
  shadowHost.shadowRoot = {
    querySelectorAll(sel) {
      if (sel === "*") return [shadowEditor];
      if (sel.includes("Shadow prompt")) return [shadowEditor];
      return [];
    }
  };
  settingsBtn.addEventListener("click", () => {
    if (popover.classList.contains("hidden")) popover.classList.remove("hidden");
    else popover.classList.add("hidden");
  });

  const docListeners = new Map();
  const document = {
    documentElement: makeEl("html"),
    createElement: (tag) => makeEl(tag),
    createRange: () => ({ selectNodeContents() {} }),
    execCommand: () => false, // force structured <p> fallback in Node mock
    addEventListener(type, fn) {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const arr = docListeners.get(type) || [];
      docListeners.set(type, arr.filter((f) => f !== fn));
    },
    dispatchDocClick(target) {
      (docListeners.get("click") || []).forEach((fn) =>
        fn({ target, preventDefault() {}, stopPropagation() {} })
      );
    },
    querySelector(sel) {
      if (sel.includes(".cdk-overlay-pane:not(.hidden)")) {
        return popover.classList.contains("hidden") ? null : popover;
      }
      return null;
    },
    querySelectorAll(sel) {
      if (sel === "*") {
        return site === "shadow" ? [shadowHost] : [];
      }
      if (sel.includes("img, video")) {
        return [smallIconImg, largeGenImg];
      }
      if (sel.includes("menuitem")) {
        return [veoItem];
      }
      if (sel.includes(".cdk-overlay-pane:not(.hidden)")) {
        return popover.classList.contains("hidden") ? [] : [popover];
      }
      if (site === "flow") {
        if (sel.includes("ProseMirror") || sel.includes("What do you want to create")) return [flowEditor];
        if (sel.includes("Start generation")) return [flowBtn];
        if (sel.includes("Settings trigger")) return [settingsBtn];
      }
      if (site === "gemini") {
        if (sel.includes("ql-editor") || sel.includes("Enter a prompt for Gemini")) return [geminiEditor];
        if (sel.includes("Send message")) return [geminiBtn];
      }
      return [];
    }
  };

  const workspaceBackdrop = makeEl("div", {
    class: "cdk-virtual-scrollable page-container",
    _rect: { top: 0, left: 0, width: 1200, height: 900 }
  });

  const sandbox = {
    window: null,
    innerHeight: 900,
    document,
    Node: { ELEMENT_NODE: 1 },
    CSS: { escape: (s) => s },
    InputEvent: class InputEvent { constructor(t) { this.type = t; } },
    Event: class Event { constructor(t) { this.type = t; } },
    KeyboardEvent: class KeyboardEvent { constructor(t) { this.type = t; } },
    ClipboardEvent: class ClipboardEvent {
      constructor(t, init = {}) {
        this.type = t;
        this.clipboardData = init.clipboardData;
        this.defaultPrevented = false;
      }
      preventDefault() { this.defaultPrevented = true; }
    },
    DragEvent: class DragEvent {
      constructor(t, init = {}) {
        this.type = t;
        this.dataTransfer = init.dataTransfer;
        this.defaultPrevented = false;
      }
    },
    DataTransfer: class DataTransfer {
      constructor() {
        const list = [];
        this.files = list;
        this.items = { add(f) { list.push(f); } };
      }
      setData() {}
    },
    File: class File {
      constructor(parts, name, opts = {}) {
        this.parts = parts;
        this.name = name;
        this.type = opts.type || "image/png";
      }
    },
    fetch: async () => ({
      blob: async () => ({ type: "image/png" })
    }),
    HTMLTextAreaElement: { prototype: {} },
    HTMLInputElement: { prototype: {} },
    chrome: {
      storage: {
        local: {
          async get(k) { return k === "customSelectors" ? { customSelectors: storage.customSelectors } : {}; },
          async set(obj) { Object.assign(storage, obj); }
        }
      },
      runtime: {
        onMessage: { addListener(fn) { listeners.push(fn); } },
        sendMessage() {}
      }
    },
    setTimeout,
    clearTimeout,
    console
  };
  sandbox.window = sandbox;
  sandbox.location = { hostname };
  sandbox.getSelection = () => ({ removeAllRanges() {}, addRange() {} });
  sandbox.getComputedStyle = () => ({ visibility: "visible", display: "block" });

  const bridgeSrc = fs.readFileSync(new URL("../content/bridge.js", import.meta.url), "utf8");
  vm.runInNewContext(bridgeSrc, sandbox);

  const dispatchMsg = (msg) =>
    new Promise((resolve) => {
      listeners.forEach((fn) => fn(msg, {}, resolve));
    });

  return {
    dispatchMsg,
    flowEditor,
    flowBtn,
    flowIcon,
    geminiEditor,
    geminiBtn,
    radioImage,
    radioVideo,
    radioIngredients,
    radio169,
    radio916,
    radioX2,
    veoItem,
    shadowEditor,
    storage,
    document,
    workspaceBackdrop
  };
}

test("bridge.js injects into Google Flow ProseMirror and waits for enabled Start generation", async () => {
  const ctx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  const ping = await ctx.dispatchMsg({ type: "HIGGSFOLD_PING" });
  assert.equal(ping.site, "flow");

  const res = await ctx.dispatchMsg({
    type: "HIGGSFOLD_INJECT_PROMPT",
    payload: { prompt: "Line 1\nLine 2", autoSubmit: true }
  });
  assert.equal(res.ok, true);
  assert.equal(res.submitted, true);
  assert.equal(ctx.flowBtn.clicked, 1);
  assert.match(ctx.flowEditor.textContent, /Line 1\nLine 2/);
});

test("bridge.js injects into Gemini Quill and waits for dynamically mounted Send message", async () => {
  const ctx = createMockDom({ hostname: "gemini.google.com", site: "gemini" });
  const ping = await ctx.dispatchMsg({ type: "HIGGSFOLD_PING" });
  assert.equal(ping.site, "gemini");

  const res = await ctx.dispatchMsg({
    type: "HIGGSFOLD_INJECT_PROMPT",
    payload: { prompt: "Gemini Prompt", autoSubmit: true }
  });
  assert.equal(res.ok, true);
  assert.equal(res.submitted, true);
  assert.equal(ctx.geminiBtn.clicked, 1);
});

test("bridge.js syncs Google Flow Settings popover (Mode, AR, Batch)", async () => {
  const ctx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  const res = await ctx.dispatchMsg({
    type: "HIGGSFOLD_SYNC_FLOW_SETTINGS",
    payload: { mode: "Image", aspectRatio: "9:16", batchCount: "2" }
  });
  assert.equal(res.ok, true);
  assert.deepEqual(Array.from(res.synced), ["Mode:Image", "AR:9:16", "Batch:x2"]);
  assert.equal(ctx.radioImage.clicked, 1);
  assert.equal(ctx.radio916.clicked, 1);
  assert.equal(ctx.radioX2.clicked, 1);
});

test("bridge.js Bind UI picker ignores 1200x900 workspace container and normalizes <span.mat-icon> to <button>", async () => {
  const ctx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  await ctx.dispatchMsg({ type: "HIGGSFOLD_START_PICKER" });
  // Clicking the 1200x900 workspace backdrop must NOT advance to step 2
  ctx.document.dispatchDocClick(ctx.workspaceBackdrop);
  ctx.document.dispatchDocClick(ctx.flowEditor);
  ctx.document.dispatchDocClick(ctx.flowIcon);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(
    ctx.storage.customSelectors["flow.google.com"].input,
    'div[aria-label="What do you want to create?"]'
  );
  assert.equal(
    ctx.storage.customSelectors["flow.google.com"].submit,
    'button[aria-label="Start generation"]'
  );
});

test("bridge.js syncs Video sub-mode (Ingredients), maps 2.39:1 -> 16:9, and matches Model priority list", async () => {
  const ctx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  const res = await ctx.dispatchMsg({
    type: "HIGGSFOLD_SYNC_FLOW_SETTINGS",
    payload: {
      mode: "Video",
      videoSubMode: "Ingredients",
      aspectRatio: "2.39:1",
      modelHints: ["Omni 1.2 Flash", "Veo 3.1"]
    }
  });
  assert.equal(res.ok, true);
  assert.ok(res.synced.includes("SubMode:Ingredients to Video"));
  assert.ok(res.synced.includes("AR:16:9(from 2.39:1)"));
  assert.ok(res.synced.includes("Model:Veo 3.1 - Fast"));
  assert.equal(ctx.radioIngredients.clicked, 1);
  assert.equal(ctx.radio169.clicked, 1);
  assert.equal(ctx.veoItem.clicked, 1);
});

test("bridge.js HIGGSFOLD_INJECT_IMAGE uses single-path waterfall (no duplicate drop if paste handled)", async () => {
  const ctx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  let pasteCount = 0;
  let dropCount = 0;
  ctx.flowEditor.addEventListener("paste", (e) => {
    pasteCount += 1;
    e.preventDefault();
  });
  ctx.flowEditor.addEventListener("drop", () => {
    dropCount += 1;
  });

  const res = await ctx.dispatchMsg({
    type: "HIGGSFOLD_INJECT_IMAGE",
    payload: { dataUrl: "data:image/png;base64,AA==", fileName: "ref.png", mimeType: "image/png" }
  });
  assert.equal(res.ok, true);
  assert.equal(res.method, "paste");
  assert.equal(pasteCount, 1);
  assert.equal(dropCount, 0, "Must NOT fire drop when paste already handled attachment");
});

test("bridge.js traverses open ShadowRoot and grabs >= 256px generated outputs", async () => {
  const shadowCtx = createMockDom({ hostname: "shadow.example.com", site: "shadow" });
  shadowCtx.storage.customSelectors["shadow.example.com"] = {
    input: 'textarea[aria-label="Shadow prompt"]',
    submit: ""
  };
  const inj = await shadowCtx.dispatchMsg({
    type: "HIGGSFOLD_INJECT_PROMPT",
    payload: { prompt: "Shadow Prompt", autoSubmit: false }
  });
  assert.equal(inj.ok, true);
  assert.equal(shadowCtx.shadowEditor.value, "Shadow Prompt");

  const flowCtx = createMockDom({ hostname: "flow.google.com", site: "flow" });
  const grabbed = await flowCtx.dispatchMsg({ type: "HIGGSFOLD_GRAB_LATEST_MEDIA" });
  assert.equal(grabbed.ok, true);
  assert.equal(grabbed.items.length, 1);
  assert.equal(grabbed.items[0].width, 512);
});
