// HiggsFold Studio v4.0 — Content Script Bridge
// Grounded in live REA DOM inspection of flow.google.com, gemini.google.com, and aistudio.google.com:
//  - Shadow DOM recursive piercing (querySelectorAllDeep)
//  - flow.google.com: ProseMirror + Angular Material (`Image`/`Video`, `Frames`/`Ingredients`, AR, Batch, Model family)
//  - gemini.google.com: Quill rich-textarea + Send button + Generated media Grab Output
//  - Single-path waterfall image injection, ZWS-safe text injection & Smart Visual DOM Picker (`Bind UI`)

(() => {
  const BRIDGE_VERSION = 404;
  if (window.__HIGGSFOLD_BRIDGE_VERSION__ === BRIDGE_VERSION) return;
  if (window.__HIGGSFOLD_BRIDGE_LISTENER__) {
    try {
      chrome.runtime.onMessage.removeListener(window.__HIGGSFOLD_BRIDGE_LISTENER__);
    } catch (_) {}
  }
  window.__HIGGSFOLD_BRIDGE_VERSION__ = BRIDGE_VERSION;

  const SITE_PROFILES = {
    flow: {
      input: [
        'div.ProseMirror[contenteditable="true"][role="textbox"]',
        'div[aria-label="What do you want to create?"][contenteditable="true"]',
        'div.prosemirror-editor [contenteditable="true"]',
        'textarea[placeholder*="Describe" i]'
      ],
      submit: [
        'button.generate-icon-button[aria-label="Start generation"]',
        'button[aria-label="Start generation"][type="submit"]',
        'button[aria-label="Start generation"]',
        'button[aria-label*="Generate" i]',
        'button[type="submit"]'
      ]
    },
    gemini: {
      input: [
        'rich-textarea div.ql-editor[contenteditable="true"][role="textbox"]',
        'div[aria-label="Enter a prompt for Gemini"][contenteditable="true"]',
        'div[aria-label*="Ask Gemini" i][contenteditable="true"]',
        'div[aria-label*="Minta Gemini" i][contenteditable="true"]',
        'div[aria-label*="Masukkan perintah" i][contenteditable="true"]',
        'div[data-placeholder*="Ask Gemini" i][contenteditable="true"]',
        'rich-textarea div[contenteditable="true"]',
        'rich-textarea [contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]'
      ],
      submit: [
        'button[aria-label="Send message"]',
        'button[aria-label="Kirim pesan"]',
        'button[aria-label*="Send" i]',
        'button[aria-label*="Kirim" i]',
        'button[mattooltip*="Send" i]',
        'button[mattooltip*="Kirim" i]',
        'button.send-button'
      ]
    },
    aistudio: {
      input: [
        'textarea[aria-label*="prompt" i]',
        'textarea[placeholder*="Type something" i]',
        'textarea[placeholder*="prompt" i]',
        'div[contenteditable="true"][role="textbox"]',
        'textarea'
      ],
      submit: [
        'button[aria-label="Run"]',
        'button[aria-label*="Run" i]',
        'button[type="submit"]'
      ]
    },
    generic: {
      input: [
        'div.ProseMirror[contenteditable="true"][role="textbox"]',
        'rich-textarea div.ql-editor[contenteditable="true"]',
        'textarea[placeholder*="Describe" i]',
        'textarea[placeholder*="Prompt" i]',
        'textarea[aria-label*="prompt" i]',
        'div[contenteditable="true"][role="textbox"]',
        'textarea'
      ],
      submit: [
        'button.generate-icon-button[aria-label="Start generation"]',
        'button[aria-label="Send message"]',
        'button[aria-label*="Generate" i]',
        'button[aria-label*="Create" i]',
        'button[aria-label*="Send" i]',
        'button[aria-label*="Run" i]',
        'button[type="submit"]'
      ]
    }
  };

  function getSiteKey(hostname) {
    if (!hostname) return "generic";
    if (hostname.includes("flow.google.com") || hostname.includes("labs.google")) return "flow";
    if (hostname.includes("gemini.google.com")) return "gemini";
    if (hostname.includes("aistudio.google.com")) return "aistudio";
    return "generic";
  }

  /**
   * Recursively traverse light DOM and any open ShadowRoot descendants.
   */
  function querySelectorAllDeep(selector, root = document) {
    const found = new Set();
    const walk = (node) => {
      if (!node || typeof node.querySelectorAll !== "function") return;
      try {
        const direct = node.querySelectorAll(selector);
        for (const el of direct) found.add(el);
      } catch (_) {}
      let descendants = [];
      try {
        descendants = node.querySelectorAll("*");
      } catch (_) {
        descendants = [];
      }
      for (const el of descendants) {
        if (el && el.shadowRoot) {
          walk(el.shadowRoot);
        }
      }
    };
    walk(root);
    return Array.from(found);
  }

  function isVisible(node) {
    if (!node || !node.isConnected) return false;
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none"
    );
  }

  function isInteractiveEnabled(node) {
    if (!node) return false;
    if (node.disabled) return false;
    if (node.getAttribute("aria-disabled") === "true") return false;
    if (node.classList?.contains("mat-mdc-button-disabled")) return false;
    return true;
  }

  function findFirstVisible(selectors, requireEnabled = false) {
    // Fast path: check light DOM first to avoid full-DOM '*' shadow traversal on every poll tick
    for (const sel of selectors) {
      try {
        const directNodes = document.querySelectorAll(sel);
        for (const n of directNodes) {
          if (isVisible(n) && (!requireEnabled || isInteractiveEnabled(n))) {
            return n;
          }
        }
      } catch (_) {}
    }
    for (const sel of selectors) {
      try {
        const nodes = querySelectorAllDeep(sel);
        for (const n of nodes) {
          if (isVisible(n) && (!requireEnabled || isInteractiveEnabled(n))) {
            return n;
          }
        }
      } catch (_) {}
    }
    return null;
  }

  async function waitForEnabledSubmit(selectors, timeoutMs = 950) {
    const start = Date.now();
    while (Date.now() - start <= timeoutMs) {
      const btn = findFirstVisible(selectors, true);
      if (btn) return btn;
      await new Promise((r) => setTimeout(r, 90));
    }
    return null;
  }

  // Strip Zero-Width Space / Joiner / BOM characters used by rich-text editors
  function normalizeEditorText(s) {
    return (s || "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Framework-safe value injection (ProseMirror, Quill, React, Angular, Lit)
  function writeValueToElement(el, text) {
    el.focus();

    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const proto =
        el.tagName === "TEXTAREA"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })
      );
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    if (el.isContentEditable || el.getAttribute("contenteditable") === "true") {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);

      let inputFired = false;
      const onInput = () => {
        inputFired = true;
      };
      el.addEventListener("input", onInput, { once: true });

      // 1. Direct execCommand insertText (cleanest for ProseMirror & Quill transactions)
      let inserted = false;
      try {
        inserted = document.execCommand("insertText", false, text);
      } catch (_) {
        inserted = false;
      }

      const normalizedTarget = normalizeEditorText(text);
      const currentNorm = () => normalizeEditorText(el.innerText || el.textContent);

      // 2. Fallback: Clipboard paste event if execCommand did not stick
      if (!inserted || currentNorm() !== normalizedTarget) {
        try {
          range.selectNodeContents(el);
          selection.removeAllRanges();
          selection.addRange(range);
          const dt = new DataTransfer();
          dt.setData("text/plain", text);
          const pasteEvt = new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: dt
          });
          el.dispatchEvent(pasteEvt);
        } catch (_) {}
      }

      // 2b. Fallback: Modern InputEvent("beforeinput") for Slate/Lexical/ProseMirror listeners
      if (currentNorm() !== normalizedTarget) {
        try {
          const beforeEvt = new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: text
          });
          el.dispatchEvent(beforeEvt);
        } catch (_) {}
      }

      // 3. Final fallback: structured <p> paragraphs (preserves ProseMirror/Quill schema)
      if (currentNorm() !== normalizedTarget) {
        el.innerHTML = "";
        const lines = text.split("\n");
        for (const line of lines) {
          const p = document.createElement("p");
          if (line.length > 0) {
            p.textContent = line;
          } else {
            p.appendChild(document.createElement("br"));
          }
          el.appendChild(p);
        }
      }

      el.removeEventListener("input", onInput);
      if (!inputFired) {
        el.dispatchEvent(
          new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })
        );
      }
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: " " }));
      return true;
    }

    return false;
  }

  function normalizePickedTarget(target, step) {
    if (!target || target.nodeType !== Node.ELEMENT_NODE) return target;
    if (step === 1) {
      const direct = target.closest(
        'textarea, input, div.ProseMirror, div.ql-editor, [contenteditable="true"], [role="textbox"]'
      );
      if (direct) return direct;
      const rect = target.getBoundingClientRect();
      if (rect.height > 0 && rect.height < window.innerHeight * 0.55) {
        const inner = target.querySelector(
          'div.ProseMirror, div.ql-editor, [contenteditable="true"], [role="textbox"], textarea'
        );
        if (inner && isVisible(inner)) return inner;
      }
      return null;
    }
    const btn = target.closest('button, [role="button"], [type="submit"], a');
    if (btn) return btn;
    const rect = target.getBoundingClientRect();
    if (rect.height > 0 && rect.height < 140) {
      const innerBtn = target.querySelector('button, [role="button"], [type="submit"]');
      if (innerBtn && isVisible(innerBtn)) return innerBtn;
    }
    return null;
  }

  function buildUniqueSelector(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return "";
    if (el.id) return `#${CSS.escape(el.id)}`;

    const aria = el.getAttribute("aria-label");
    if (aria) {
      const escapedAria = aria.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `${el.tagName.toLowerCase()}[aria-label="${escapedAria}"]`;
    }

    const dataTestId = el.getAttribute("data-test-id") || el.getAttribute("data-testid");
    if (dataTestId) {
      const attr = el.hasAttribute("data-test-id") ? "data-test-id" : "data-testid";
      return `${el.tagName.toLowerCase()}[${attr}="${CSS.escape(dataTestId)}"]`;
    }

    const parts = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let selector = current.tagName.toLowerCase();
      if (current.getAttribute("role")) {
        selector += `[role="${current.getAttribute("role")}"]`;
      } else if (current.classList.length > 0) {
        const safeClass = Array.from(current.classList).find(
          (c) => !c.includes(":") && !c.startsWith("ng-") && c.length < 36
        );
        if (safeClass) selector += `.${CSS.escape(safeClass)}`;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (c) => c.tagName === current.tagName
        );
        if (siblings.length > 1) {
          selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }
      parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function getCleanToggleText(el) {
    const toggleSpan = el.querySelector?.(".toggle-text");
    if (toggleSpan) {
      return (toggleSpan.textContent || "").replace(/\s+/g, " ").trim();
    }
    const clone = el.cloneNode(true);
    clone.querySelectorAll?.("mat-icon, svg").forEach((n) => n.remove());
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  // Google Flow Settings Auto-Sync (Mode, Sub-Mode Frames/Ingredients, Aspect Ratio, Batch, Model Priority)
  async function syncGoogleFlowSettings(settings) {
    const host = window.location.hostname;
    const trigger = findFirstVisible([
      'button.settings-trigger-button[aria-label="Settings trigger"]',
      'button[aria-label="Settings trigger"]'
    ]);
    if (getSiteKey(host) !== "flow" && !trigger) {
      return { ok: false, error: "Flow Settings sync is available on flow.google.com / labs.google." };
    }

    const findSettingsOverlay = () =>
      querySelectorAllDeep(".cdk-overlay-pane:not(.hidden)").find((p) =>
        p.querySelector('[role="radio"], .mat-button-toggle-button')
      );

    const wasAlreadyOpen = Boolean(findSettingsOverlay());
    if (!wasAlreadyOpen && trigger) {
      trigger.click();
      await new Promise((r) => setTimeout(r, 200));
    }

    const overlay = findSettingsOverlay();
    if (!overlay) {
      return { ok: false, error: "Open a Google Flow project first so Settings popover can open." };
    }

    const synced = [];
    const clickMatchingRadio = (candidates) => {
      const list = Array.isArray(candidates) ? candidates : [candidates];
      const radios = Array.from(overlay.querySelectorAll('[role="radio"], .mat-button-toggle-button'));
      for (const candidate of list) {
        if (!candidate) continue;
        const targetLower = candidate.toLowerCase();
        const exact = radios.find((el) => getCleanToggleText(el).toLowerCase() === targetLower);
        const match =
          exact ||
          radios.find((el) => getCleanToggleText(el).toLowerCase().includes(targetLower));
        if (match) {
          const isSelected =
            match.getAttribute("aria-checked") === "true" ||
            match.getAttribute("aria-pressed") === "true";
          if (!isSelected) {
            match.click();
          }
          return getCleanToggleText(match) || candidate;
        }
      }
      return null;
    };

    if (settings.mode) {
      const matchedMode = clickMatchingRadio(settings.mode);
      if (matchedMode) {
        synced.push(`Mode:${matchedMode}`);
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    if (settings.mode === "Video" && settings.videoSubMode) {
      const subCandidates =
        settings.videoSubMode.toLowerCase().includes("ingredient")
          ? ["Ingredients", "Ingredients to Video"]
          : ["Frames", "Frames to Video"];
      const matchedSub = clickMatchingRadio(subCandidates);
      if (matchedSub) {
        synced.push(`SubMode:${matchedSub}`);
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    if (settings.aspectRatio) {
      const mappedRatio = settings.aspectRatio === "2.39:1" ? "16:9" : settings.aspectRatio;
      const matchedRatio = clickMatchingRadio(mappedRatio);
      if (matchedRatio) {
        synced.push(
          settings.aspectRatio === "2.39:1"
            ? `AR:${matchedRatio}(from 2.39:1)`
            : `AR:${matchedRatio}`
        );
      }
    }

    if (settings.batchCount) {
      const batchTag = `x${settings.batchCount}`;
      if (clickMatchingRadio(batchTag)) {
        synced.push(`Batch:${batchTag}`);
      }
    }

    // Priority model selection inside popover menu
    const modelPriority = Array.isArray(settings.modelHints) && settings.modelHints.length > 0
      ? settings.modelHints
      : settings.modelHint
        ? [settings.modelHint]
        : [];

    if (modelPriority.length > 0) {
      const modelBtn = overlay.querySelector('button[aria-label="Select model family"]');
      const currentModelText = modelBtn ? getCleanToggleText(modelBtn).toLowerCase() : "";
      const alreadyMatched = modelPriority.some((hint) =>
        currentModelText.includes(hint.toLowerCase())
      );
      if (modelBtn && !alreadyMatched) {
        modelBtn.click();
        await new Promise((r) => setTimeout(r, 180));
        const menuItems = querySelectorAllDeep(
          '.cdk-overlay-pane [role="menuitem"], .cdk-overlay-pane button.mat-mdc-menu-item'
        );
        let matchedItem = null;
        for (const hint of modelPriority) {
          const hintLower = hint.toLowerCase();
          matchedItem =
            menuItems.find((m) => getCleanToggleText(m).toLowerCase() === hintLower) ||
            menuItems.find((m) => (m.textContent || "").toLowerCase().includes(hintLower));
          if (matchedItem) break;
        }
        if (matchedItem) {
          const chosenLabel = getCleanToggleText(matchedItem) || (matchedItem.textContent || "").trim();
          matchedItem.click();
          synced.push(`Model:${chosenLabel}`);
          await new Promise((r) => setTimeout(r, 120));
        } else {
          const backdrops = querySelectorAllDeep(".cdk-overlay-backdrop-showing");
          const topBackdrop = backdrops[backdrops.length - 1];
          if (topBackdrop) topBackdrop.click();
        }
      }
    }

    if (!wasAlreadyOpen) {
      await new Promise((r) => setTimeout(r, 90));
      if (findSettingsOverlay()) {
        const backdrops = querySelectorAllDeep(".cdk-overlay-backdrop-showing");
        const backdrop = backdrops[backdrops.length - 1];
        if (backdrop) {
          backdrop.click();
        } else if (trigger) {
          trigger.click();
        }
      }
    }

    return { ok: true, synced };
  }

  async function blobUrlToDataUrl(blobUrl, maxBytes = 18 * 1024 * 1024) {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    if (blob.size > maxBytes) {
      throw new Error(`Blob exceeds ${Math.round(maxBytes / (1024 * 1024))} MB transfer limit`);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result, mimeType: blob.type || "image/png" });
      reader.onerror = () => reject(new Error("Failed to read blob data URL"));
      reader.readAsDataURL(blob);
    });
  }

  async function grabLatestVisibleMedia() {
    const mediaNodes = querySelectorAllDeep("img, video");
    const seenSrc = new Set();
    const items = [];

    for (let idx = 0; idx < mediaNodes.length; idx += 1) {
      const el = mediaNodes[idx];
      if (!isVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 256 || rect.height < 256) continue;

      const isVideo = el.tagName === "VIDEO";
      const rawSrc = isVideo ? el.currentSrc || el.src || el.poster : el.currentSrc || el.src;
      if (!rawSrc || rawSrc.startsWith("chrome-extension:") || rawSrc.startsWith("data:image/svg")) {
        continue;
      }
      if (seenSrc.has(rawSrc)) continue;
      seenSrc.add(rawSrc);

      let dataUrl = null;
      let mimeType = isVideo ? "video/mp4" : "image/png";
      if (rawSrc.startsWith("data:")) {
        dataUrl = rawSrc;
      } else if (rawSrc.startsWith("blob:")) {
        try {
          const conv = await blobUrlToDataUrl(rawSrc, isVideo ? 18 * 1024 * 1024 : 10 * 1024 * 1024);
          dataUrl = conv.dataUrl;
          mimeType = conv.mimeType;
        } catch (_) {}
      } else if (isVideo && el.poster && el.poster.startsWith("blob:")) {
        try {
          const conv = await blobUrlToDataUrl(el.poster);
          dataUrl = conv.dataUrl;
          mimeType = conv.mimeType;
        } catch (_) {}
      }

      items.push({
        kind: isVideo ? "video" : "image",
        src: rawSrc,
        poster: el.poster || "",
        dataUrl,
        mimeType,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: Math.round(rect.width * rect.height),
        alt: (el.getAttribute("alt") || "").trim(),
        domOrder: idx
      });
    }

    // Prefer largest high-res generated outputs first, newest DOM order as tie-breaker
    items.sort((a, b) => {
      const areaDiff = b.area - a.area;
      if (Math.abs(areaDiff) > 50000) return areaDiff;
      return b.domOrder - a.domOrder;
    });

    const trimmed = items.slice(0, 8).map(({ domOrder, area, ...rest }) => rest);
    if (trimmed.length === 0) {
      return {
        ok: false,
        error: "No generated output >= 256px found on the current page. Generate or preview an image/video first."
      };
    }
    return { ok: true, items: trimmed };
  }

  // Interactive Visual DOM Picker + On-Canvas HUD
  let pickerState = { active: false, step: 0, inputSelector: null };
  let highlightBox = null;
  let pickerHud = null;

  function ensurePickerUI() {
    if (!highlightBox) {
      highlightBox = document.createElement("div");
      Object.assign(highlightBox.style, {
        position: "fixed",
        pointerEvents: "none",
        zIndex: "2147483646",
        border: "2px solid #d4ff00",
        background: "rgba(212, 255, 0, 0.14)",
        borderRadius: "6px",
        transition: "all 0.06s ease",
        display: "none"
      });
      document.documentElement.appendChild(highlightBox);
    }
    if (!pickerHud) {
      pickerHud = document.createElement("div");
      Object.assign(pickerHud.style, {
        position: "fixed",
        top: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "2147483647",
        background: "#121216",
        color: "#f4f4f6",
        border: "1px solid #d4ff00",
        borderRadius: "999px",
        padding: "8px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow: "0 10px 30px rgba(0,0,0,0.65)",
        pointerEvents: "none",
        display: "none"
      });
      document.documentElement.appendChild(pickerHud);
    }
  }

  function showPickerHud(msg) {
    ensurePickerUI();
    pickerHud.textContent = `HiggsFold Bind UI • ${msg} (ESC to cancel)`;
    pickerHud.style.display = "block";
  }

  function onPickerMove(e) {
    if (!pickerState.active) return;
    const rawTarget = e.target;
    if (!rawTarget || rawTarget === highlightBox || rawTarget === pickerHud) return;
    const target = normalizePickedTarget(rawTarget, pickerState.step);
    ensurePickerUI();
    if (!target) {
      highlightBox.style.display = "none";
      return;
    }
    const rect = target.getBoundingClientRect();
    highlightBox.style.display = "block";
    highlightBox.style.top = `${rect.top}px`;
    highlightBox.style.left = `${rect.left}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;
  }

  async function onPickerClick(e) {
    if (!pickerState.active) return;
    e.preventDefault();
    e.stopPropagation();

    const normalized = normalizePickedTarget(e.target, pickerState.step);
    if (!normalized) {
      showPickerHud(
        pickerState.step === 1
          ? "Click directly inside the text prompt box"
          : "Click directly on the Generate / Send button"
      );
      return;
    }
    const selector = buildUniqueSelector(normalized);

    if (pickerState.step === 1) {
      pickerState.inputSelector = selector;
      pickerState.step = 2;
      const msg = "Step 2/2: Click the Generate / Send button";
      showPickerHud(msg);
      chrome.runtime.sendMessage({
        type: "HIGGSFOLD_PICKER_PROGRESS",
        text: `${msg} on the page.`
      });
    } else if (pickerState.step === 2) {
      const host = window.location.hostname;
      const { customSelectors = {} } = await chrome.storage.local.get("customSelectors");
      customSelectors[host] = {
        input: pickerState.inputSelector,
        submit: selector
      };
      await chrome.storage.local.set({ customSelectors });
      stopPicker(false);
      chrome.runtime.sendMessage({
        type: "HIGGSFOLD_PICKER_DONE",
        selectors: customSelectors[host]
      });
    }
  }

  function onPickerKeydown(e) {
    if (e.key === "Escape" && pickerState.active) {
      stopPicker(true);
    }
  }

  function startPicker() {
    pickerState = { active: true, step: 1, inputSelector: null };
    showPickerHud("Step 1/2: Click the prompt box");
    document.addEventListener("mousemove", onPickerMove, true);
    document.addEventListener("click", onPickerClick, true);
    document.addEventListener("keydown", onPickerKeydown, true);
  }

  function stopPicker(notifyCancel = false) {
    pickerState.active = false;
    document.removeEventListener("mousemove", onPickerMove, true);
    document.removeEventListener("click", onPickerClick, true);
    document.removeEventListener("keydown", onPickerKeydown, true);
    if (highlightBox) highlightBox.style.display = "none";
    if (pickerHud) pickerHud.style.display = "none";
    if (notifyCancel) {
      chrome.runtime.sendMessage({ type: "HIGGSFOLD_PICKER_CANCELLED" });
    }
  }

  // Message Listener from Side Panel
  const onMessageHandler = (message, _sender, sendResponse) => {
    if (message.type === "HIGGSFOLD_PING") {
      sendResponse({
        ok: true,
        site: getSiteKey(window.location.hostname),
        host: window.location.hostname
      });
      return true;
    }

    if (message.type === "HIGGSFOLD_START_PICKER") {
      startPicker();
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "HIGGSFOLD_STOP_PICKER") {
      stopPicker(false);
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "HIGGSFOLD_SYNC_FLOW_SETTINGS") {
      syncGoogleFlowSettings(message.payload || {})
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse({ ok: false, error: err?.message || "Sync failed" }));
      return true;
    }

    if (message.type === "HIGGSFOLD_GRAB_LATEST_MEDIA") {
      grabLatestVisibleMedia()
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse({ ok: false, error: err?.message || "Grab failed" }));
      return true;
    }

    if (message.type === "HIGGSFOLD_INJECT_IMAGE") {
      (async () => {
        const { dataUrl, fileName, mimeType } = message.payload || {};
        if (!dataUrl) {
          sendResponse({ ok: false, error: "No image data provided." });
          return;
        }
        const host = window.location.hostname;
        const siteKey = getSiteKey(host);
        const profile = SITE_PROFILES[siteKey] || SITE_PROFILES.generic;
        const { customSelectors = {} } = await chrome.storage.local.get("customSelectors");
        const saved = customSelectors[host];
        const inputSelectors = saved?.input
          ? [saved.input, ...profile.input, ...SITE_PROFILES.generic.input]
          : [...profile.input, ...SITE_PROFILES.generic.input];

        const inputEl = findFirstVisible(inputSelectors, false);
        const fileInput = querySelectorAllDeep('input[type="file"][accept*="image"], input[type="file"]').find(
          (n) => !n.disabled
        );
        if (!inputEl && !fileInput) {
          sendResponse({ ok: false, error: "Target editor or file input not found for image attachment." });
          return;
        }

        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], fileName || "reference.png", {
            type: mimeType || blob.type || "image/png"
          });
          const dt = new DataTransfer();
          dt.items.add(file);

          // Single-Path Waterfall:
          // 1) Try native Clipboard Paste into prompt editor if present
          if (inputEl) {
            const composerScope =
              (typeof inputEl.closest === "function" &&
                inputEl.closest("form, [class*='composer' i], main")) ||
              document;
            const countThumbs = () =>
              composerScope.querySelectorAll
                ? composerScope.querySelectorAll('img, [class*="thumb" i], [class*="attachment" i]').length
                : querySelectorAllDeep('img[src^="blob:"], img[src^="data:"]').length;

            const beforeThumbs = countThumbs();
            inputEl.focus();
            const pasteEvt = new ClipboardEvent("paste", {
              bubbles: true,
              cancelable: true,
              clipboardData: dt
            });
            const notCancelled = inputEl.dispatchEvent(pasteEvt);
            await new Promise((r) => setTimeout(r, 180));
            const afterThumbs = countThumbs();

            if (!notCancelled || pasteEvt.defaultPrevented || afterThumbs > beforeThumbs) {
              sendResponse({ ok: true, site: siteKey, method: "paste" });
              return;
            }
          }

          // 2) Fallback: native file input assignment FIRST (only defineProperty on mock/legacy failure)
          if (fileInput) {
            let assigned = false;
            try {
              fileInput.files = dt.files;
              assigned = Boolean(fileInput.files && fileInput.files.length > 0);
            } catch (_) {
              assigned = false;
            }
            if (!assigned) {
              try {
                Object.defineProperty(fileInput, "files", {
                  configurable: true,
                  get: () => dt.files
                });
              } catch (_) {}
            }
            fileInput.dispatchEvent(new Event("input", { bubbles: true }));
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            sendResponse({ ok: true, site: siteKey, method: "file-input" });
            return;
          }

          // 3) Final fallback: single Drag & Drop event on prompt editor
          const dropEvt = new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt
          });
          inputEl.dispatchEvent(dropEvt);
          sendResponse({ ok: true, site: siteKey, method: "drop" });
        } catch (err) {
          sendResponse({ ok: false, error: err?.message || "Image bridge failed." });
        }
      })();
      return true;
    }

    if (message.type === "HIGGSFOLD_GEMINI_ENHANCE") {
      (async () => {
        try {
          const { metaPrompt, timeoutMs = 45000 } = message.payload || {};
          if (!metaPrompt) {
            sendResponse({ ok: false, error: "Meta-prompt is empty." });
            return;
          }
          const host = window.location.hostname;
          const inputEl = findFirstVisible(SITE_PROFILES.gemini.input, false);
          if (getSiteKey(host) !== "gemini" && !inputEl) {
            sendResponse({ ok: false, error: "Open gemini.google.com tab (with Hydrogen/Neon/Pro selected) first." });
            return;
          }
          if (!inputEl) {
            sendResponse({ ok: false, error: "Gemini prompt box not found on page." });
            return;
          }

          const respSelector =
            'model-response message-content, message-content, .model-response-text, [data-message-author-role="model"]';
          const readResponses = () => querySelectorAllDeep(respSelector);
          const beforeNodes = readResponses();
          const beforeCount = beforeNodes.length;
          const beforeLastText =
            beforeCount > 0
              ? (beforeNodes[beforeCount - 1].innerText || beforeNodes[beforeCount - 1].textContent || "").trim()
              : "";

          writeValueToElement(inputEl, metaPrompt);
          const sendBtn = await waitForEnabledSubmit(SITE_PROFILES.gemini.submit, 1500);
          if (sendBtn) {
            sendBtn.click();
          } else {
            inputEl.focus();
            const enterInit = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
            inputEl.dispatchEvent(new KeyboardEvent("keydown", enterInit));
            inputEl.dispatchEvent(new KeyboardEvent("keyup", enterInit));
          }

          const start = Date.now();
          let lastObserved = "";
          let stableTicks = 0;
          const requiredStableTicks = timeoutMs > 5000 ? 4 : 2;
          const stopSelectors = [
            'button[aria-label*="Stop" i], button[aria-label*="Hentikan" i], button[mattooltip*="Stop" i], button[mattooltip*="Hentikan" i], button.stop-button, [data-test-id*="stop" i]'
          ];

          while (Date.now() - start <= timeoutMs) {
            await new Promise((r) => setTimeout(r, 220));
            const nowNodes = readResponses();
            const nowLast =
              nowNodes.length > 0
                ? (nowNodes[nowNodes.length - 1].innerText || nowNodes[nowNodes.length - 1].textContent || "").trim()
                : "";
            const hasNewReply =
              Boolean(nowLast) &&
              (nowNodes.length > beforeCount || nowLast !== beforeLastText);
            if (!hasNewReply) continue;

            const stopBtn = findFirstVisible(stopSelectors, false);
            if (nowLast === lastObserved && !stopBtn) {
              stableTicks += 1;
              if (stableTicks >= requiredStableTicks) {
                sendResponse({ ok: true, enhancedText: nowLast });
                return;
              }
            } else {
              lastObserved = nowLast;
              stableTicks = 0;
            }
          }

          if (lastObserved) {
            sendResponse({ ok: true, enhancedText: lastObserved });
          } else {
            sendResponse({ ok: false, error: "Timed out waiting for Gemini response." });
          }
        } catch (err) {
          sendResponse({ ok: false, error: err?.message || String(err) });
        }
      })();
      return true;
    }

    if (message.type === "HIGGSFOLD_INJECT_PROMPT") {
      (async () => {
        const { prompt, autoSubmit } = message.payload;
        const host = window.location.hostname;
        const siteKey = getSiteKey(host);
        const profile = SITE_PROFILES[siteKey] || SITE_PROFILES.generic;
        const { customSelectors = {} } = await chrome.storage.local.get("customSelectors");
        const saved = customSelectors[host];

        const inputSelectors = saved?.input
          ? [saved.input, ...profile.input, ...SITE_PROFILES.generic.input]
          : [...profile.input, ...SITE_PROFILES.generic.input];
        const submitSelectors = saved?.submit
          ? [saved.submit, ...profile.submit, ...SITE_PROFILES.generic.submit]
          : [...profile.submit, ...SITE_PROFILES.generic.submit];

        const inputEl = findFirstVisible(inputSelectors, false);
        if (!inputEl) {
          sendResponse({
            ok: false,
            error: "Prompt input not detected. Click 'Bind UI' to map it."
          });
          return;
        }

        const written = writeValueToElement(inputEl, prompt);
        if (!written) {
          sendResponse({ ok: false, error: "Could not write to target input element." });
          return;
        }

        let submitted = false;
        if (autoSubmit) {
          const submitBtn = await waitForEnabledSubmit(submitSelectors, 950);
          if (submitBtn) {
            submitBtn.click();
            submitted = true;
          }
        }

        sendResponse({ ok: true, submitted, site: siteKey });
      })();
      return true;
    }
  };
  window.__HIGGSFOLD_BRIDGE_LISTENER__ = onMessageHandler;
  chrome.runtime.onMessage.addListener(onMessageHandler);
})();
