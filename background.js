// HiggsFold Studio - Background Service Worker (MV3 v4.0.0)

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("[HiggsFold] SidePanel error:", error));

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[HiggsFold] Extension ${details.reason} (v4.0.0) — Side Panel ready.`);
});

const ALLOWED_MEDIA_HOSTS = [
  "googleusercontent.com",
  "googleapis.com",
  "flow.google.com",
  "labs.google",
  "gemini.google.com",
  "higgsfield.ai",
  "higgs.ai",
  "cloudfront.net"
];

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

function isAllowedMediaHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  return ALLOWED_MEDIA_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

async function fetchMediaAsDataUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("Missing media URL.");
  }
  if (url.startsWith("data:")) {
    const mimeMatch = /^data:([^;]+);/i.exec(url);
    return { ok: true, dataUrl: url, mimeType: mimeMatch ? mimeMatch[1] : "image/png" };
  }
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  }
  if (!isAllowedMediaHost(parsed.hostname)) {
    throw new Error(`Blocked media host outside allowlist: ${parsed.hostname}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  let buf;
  let mimeType;
  try {
    const res = await fetch(url, { credentials: "include", signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching media`);
    }
    const contentLen = Number(res.headers.get("content-length") || 0);
    if (contentLen > MAX_MEDIA_BYTES) {
      throw new Error(`Media exceeds 25 MB limit (${Math.round(contentLen / (1024 * 1024))} MB).`);
    }
    buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_MEDIA_BYTES) {
      throw new Error(`Media exceeds 25 MB limit (${Math.round(buf.byteLength / (1024 * 1024))} MB).`);
    }
    mimeType = res.headers.get("content-type") || "image/png";
  } finally {
    clearTimeout(timeoutId);
  }

  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
  return { ok: true, dataUrl, mimeType, byteLength: bytes.length };
}

async function enhanceWithGeminiApi({ apiKey, model = "gemini-2.5-flash", metaPrompt }) {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("Gemini API Key is missing.");
  }
  if (!metaPrompt || !metaPrompt.trim()) {
    throw new Error("Blueprint prompt is empty.");
  }
  const trimmedModel = model.trim() || "gemini-2.5-flash";
  const safeModel = encodeURIComponent(trimmedModel);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent`;
  const generationConfig = {
    temperature: 0.65,
    maxOutputTokens: 2048
  };
  if (trimmedModel.toLowerCase().includes("flash")) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  let res;
  let data = {};
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim()
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: metaPrompt }] }],
        generationConfig
      }),
      signal: controller.signal
    });
    data = await res.json().catch(() => ({}));
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || `Gemini API HTTP ${res.status}`;
    throw new Error(errMsg);
  }
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || "").join("").trim();
  if (!text) {
    const reason = candidate?.finishReason ? ` (${candidate.finishReason})` : "";
    throw new Error(`Gemini API returned an empty response${reason}.`);
  }
  return { ok: true, enhancedText: text };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender?.id && chrome?.runtime?.id && sender.id !== chrome.runtime.id) {
    return false;
  }
  if (message?.type === "HIGGSFOLD_FETCH_MEDIA_BLOB") {
    fetchMediaAsDataUrl(message.url)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }
  if (message?.type === "HIGGSFOLD_GEMINI_API_ENHANCE") {
    enhanceWithGeminiApi(message.payload || {})
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }
});
