// HiggsFold Studio v4.0 — Client-Side Color Transfer & Image Encoder
import { analyzeRgbSamplesForColorTransfer } from "./compiler.js";

/**
 * Extract Color Transfer semantic grading summary & swatches from a base64 Data URL.
 */
export async function extractColorTransferFromDataUrl(
  dataUrl,
  name = "reference.png",
  type = "image/png"
) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Unsupported image format"));
    el.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const size = 48;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);

  const pixels = ctx.getImageData(0, 0, size, size).data;
  const samples = [];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  const analysis = analyzeRgbSamplesForColorTransfer(samples);
  return {
    name,
    type,
    dataUrl,
    swatches: analysis.swatches,
    summary: analysis.summary
  };
}

/**
 * Extract Color Transfer semantic grading & base64 dataURL from an image File.
 */
export async function extractColorTransferFromFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read reference image"));
    reader.readAsDataURL(file);
  });
  return extractColorTransferFromDataUrl(
    dataUrl,
    file.name,
    file.type || "image/png"
  );
}
