// HiggsFold Studio v2.0 — Content Script Bridge
// Grounded in live REA DOM inspection of flow.google.com, gemini.google.com, and aistudio.google.com:
//  - flow.google.com: Angular Material + ProseMirror (`div.ProseMirror[contenteditable="true"]`, `button.generate-icon-button[aria-label="Start generation"]`, `button.settings-trigger-button`)
//  - gemini.google.com: Angular + Quill (`rich-textarea div.ql-editor[contenteditable="true"]`, dynamic `button[aria-label="Send message"]`)
//  - Smart Visual DOM Picker (`Bind UI`) with element-level target normalization

(() => {
  if (window.__HIGGSFOLD_BRIDGE_LOADED__) return;
  window.__HIGGSFOLD_BRIDGE_LOADED__ = true;

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
        'rich-textarea [contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]'
      ],
      submit: [
        'button[aria-label="Send message"]',
        'button[aria-label*="Send" i]'
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
    for (const sel of selectors) {
      try {
        const nodes = document.querySelectorAll(sel);
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

      const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
      const normalizedTarget = normalize(text);
      const currentNorm = () => normalize(el.innerText || el.textContent);

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
      // If user clicks a compact prompt card wrapper (e.g. flow-rich-text-editor or div.base-prompt-box),
      // resolve the inner editable element inside it instead of binding the wrapper.
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

  // Google Flow Settings Auto-Sync (Mode, Aspect Ratio, Batch, Model)
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
      Array.from(document.querySelectorAll(".cdk-overlay-pane:not(.hidden)")).find((p) =>
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
    const clickMatchingRadio = (targetText) => {
      const targetLower = targetText.toLowerCase();
      const radios = Array.from(overlay.querySelectorAll('[role="radio"], .mat-button-toggle-button'));
      const exact = radios.find((el) => getCleanToggleText(el).toLowerCase() === targetLower);
      const match =
        exact ||
        radios.find((el) => getCleanToggleText(el).toLowerCase().includes(targetLower));
      if (match) {
        if (match.getAttribute("aria-checked") !== "true") {
          match.click();
        }
        return true;
      }
      return false;
    };

    if (settings.mode && clickMatchingRadio(settings.mode)) {
      synced.push(`Mode:${settings.mode}`);
      await new Promise((r) => setTimeout(r, 150));
    }

    if (settings.aspectRatio && settings.aspectRatio !== "2.39:1") {
      if (clickMatchingRadio(settings.aspectRatio)) {
        synced.push(`AR:${settings.aspectRatio}`);
      }
    }

    if (settings.batchCount) {
      const batchTag = `x${settings.batchCount}`;
      if (clickMatchingRadio(batchTag)) {
        synced.push(`Batch:${batchTag}`);
      }
    }

    // Optional Model selection inside popover menu
    if (settings.modelHint) {
      const modelBtn = overlay.querySelector('button[aria-label="Select model family"]');
      const currentModelText = modelBtn ? getCleanToggleText(modelBtn).toLowerCase() : "";
      if (modelBtn && !currentModelText.includes(settings.modelHint.toLowerCase())) {
        modelBtn.click();
        await new Promise((r) => setTimeout(r, 180));
        const menuItems = Array.from(
          document.querySelectorAll('.cdk-overlay-pane [role="menuitem"], .cdk-overlay-pane button.mat-mdc-menu-item')
        );
        const targetItem = menuItems.find((m) =>
          (m.textContent || "").toLowerCase().includes(settings.modelHint.toLowerCase())
        );
        if (targetItem) {
          targetItem.click();
          synced.push(`Model:${settings.modelHint}`);
          await new Promise((r) => setTimeout(r, 120));
        }
      }
    }

    if (!wasAlreadyOpen) {
      await new Promise((r) => setTimeout(r, 90));
      if (findSettingsOverlay()) {
        const backdrop = document.querySelector(".cdk-overlay-backdrop-showing");
        if (backdrop) {
          backdrop.click();
        } else if (trigger) {
          trigger.click();
        }
      }
    }

    return { ok: true, synced };
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
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
        const inputEl = findFirstVisible([...profile.input, ...SITE_PROFILES.generic.input], false);
        if (!inputEl) {
          sendResponse({ ok: false, error: "Target editor not found for image paste/drop." });
          return;
        }
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], fileName || "reference.png", { type: mimeType || blob.type || "image/png" });
          const dt = new DataTransfer();
          dt.items.add(file);
          inputEl.focus();
          const pasteEvt = new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: dt
          });
          inputEl.dispatchEvent(pasteEvt);
          const dropEvt = new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt
          });
          inputEl.dispatchEvent(dropEvt);
          sendResponse({ ok: true, site: siteKey });
        } catch (err) {
          sendResponse({ ok: false, error: err?.message || "Image bridge failed." });
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
  });
})();
