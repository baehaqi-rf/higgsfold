// HiggsFold Studio v4.0 — Soul Vault (IndexedDB Persistent Character/Look Repository)

const DB_NAME = "higgsfold_vault_db";
const DB_VERSION = 1;
const STORE_NAME = "souls";

function normalizeHandle(raw) {
  const cleaned = String(raw || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_@-]/g, "");
  if (!cleaned) return "@character";
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
}

export async function compressImageToWebP(fileOrBlobOrDataUrl, maxDim = 1024, quality = 0.85) {
  let objectUrl = "";
  try {
    let imgSrc = "";
    if (typeof fileOrBlobOrDataUrl === "string") {
      imgSrc = fileOrBlobOrDataUrl;
    } else {
      objectUrl = URL.createObjectURL(fileOrBlobOrDataUrl);
      imgSrc = objectUrl;
    }

    const img = await new Promise((resolve, reject) => {
      const node = new Image();
      node.crossOrigin = "anonymous";
      node.onload = () => resolve(node);
      node.onerror = () => reject(new Error("Could not decode image for Soul Vault compression."));
      node.src = imgSrc;
    });

    const srcW = img.naturalWidth || img.width || 512;
    const srcH = img.naturalHeight || img.height || 512;
    const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
    const targetW = Math.max(1, Math.round(srcW * scale));
    const targetH = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const webpUrl = canvas.toDataURL("image/webp", quality);
    if (webpUrl && webpUrl.startsWith("data:image/webp")) {
      return webpUrl;
    }
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export function normalizeSoulEntry(raw) {
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : `soul-${
          typeof globalThis.crypto?.randomUUID === "function"
            ? globalThis.crypto.randomUUID().slice(0, 8)
            : Date.now().toString(36)
        }`;
  const displayName = (raw.displayName || raw.name || "Untitled Soul").trim();
  const handle = normalizeHandle(raw.handle || displayName);
  const refs = Array.isArray(raw.refs)
    ? raw.refs
        .filter((r) => r && r.dataUrl)
        .slice(0, 4)
        .map((r, idx) => ({
          id: r.id || `ref-${idx + 1}`,
          dataUrl: r.dataUrl,
          label: r.label || `Ref ${idx + 1}`
        }))
    : [];

  return {
    id,
    handle,
    displayName,
    dnaPrompt: (raw.dnaPrompt || "").trim(),
    defaultLens: raw.defaultLens || "auto",
    defaultPalette: raw.defaultPalette || "match-ref",
    refs,
    updatedAt: Date.now()
  };
}

export class SoulVaultStore {
  constructor() {
    this.dbPromise = null;
    this.memoryFallback = [];
  }

  async open() {
    if (typeof indexedDB === "undefined") return null;
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
    return this.dbPromise;
  }

  async listSouls() {
    const db = await this.open();
    if (!db) return [...this.memoryFallback];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const rows = Array.isArray(req.result) ? req.result : [];
          rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(rows);
        };
        req.onerror = () => resolve([...this.memoryFallback]);
      } catch (_) {
        resolve([...this.memoryFallback]);
      }
    });
  }

  async saveSoul(rawEntry) {
    const entry = normalizeSoulEntry(rawEntry);
    const db = await this.open();
    if (!db) {
      const idx = this.memoryFallback.findIndex((s) => s.id === entry.id);
      if (idx >= 0) this.memoryFallback[idx] = entry;
      else this.memoryFallback.unshift(entry);
      return entry;
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(entry);
        tx.oncomplete = () => resolve(entry);
        tx.onerror = () => reject(tx.error || new Error("IndexedDB write failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteSoul(id) {
    const db = await this.open();
    if (!db) {
      this.memoryFallback = this.memoryFallback.filter((s) => s.id !== id);
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (_) {
        resolve();
      }
    });
  }
}
