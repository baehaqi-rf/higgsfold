// HiggsFold Studio - Background Service Worker (MV3)

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("[HiggsFold] SidePanel error:", error));

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[HiggsFold] Extension ${details.reason} (v2.0.0) — Side Panel ready.`);
});
