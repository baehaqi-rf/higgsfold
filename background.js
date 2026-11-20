// HiggsFold Studio - Background Service Worker (MV3 v4.0.0)

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("[HiggsFold] SidePanel error:", error));

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[HiggsFold] Extension ${details.reason} (v4.0.0) — Side Panel ready.`);
});

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
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching media`);
  }
  const buf = await res.arrayBuffer();
  const mimeType = res.headers.get("content-type") || "image/png";
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
  return { ok: true, dataUrl, mimeType, byteLength: bytes.length };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "HIGGSFOLD_FETCH_MEDIA_BLOB") {
    fetchMediaAsDataUrl(message.url)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }
});
