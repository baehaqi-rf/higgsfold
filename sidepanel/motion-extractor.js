// HiggsFold Studio v4.0 — Motion Control Video Contact-Sheet Extractor
// Samples 3 keyframes (5%, 50%, 95%) or 6 keyframes for clips > 6s onto a composite WebP contact sheet

export function computeMotionSampleTimestamps(durationSec) {
  const dur = Number(durationSec);
  if (!Number.isFinite(dur) || dur <= 0) return [0];
  const ratios =
    dur > 6
      ? [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]
      : [0.05, 0.5, 0.95];
  return ratios.map((r) => Number(Math.max(0, Math.min(dur - 0.04, dur * r)).toFixed(2)));
}

function getBeatTag(idx, total) {
  if (idx === 0) return "START";
  if (idx === total - 1) return "END";
  if (total === 3 && idx === 1) return "MID";
  return `BEAT ${idx + 1}`;
}

function drawAspectContain(ctx, video, dx, dy, dw, dh) {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.min(dw / vw, dh / vh);
  const drawW = vw * scale;
  const drawH = vh * scale;
  const offsetX = dx + (dw - drawW) / 2;
  const offsetY = dy + (dh - drawH) / 2;
  ctx.drawImage(video, 0, 0, vw, vh, offsetX, offsetY, drawW, drawH);
}

/**
 * Extract evenly spaced keyframe thumbnails from a local video File/Blob and
 * stitch them into a single labeled Motion Reference Contact Sheet.
 */
export async function extractMotionContactSheet(videoFile) {
  if (!videoFile) throw new Error("No reference video file provided.");
  const url = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise((resolve, reject) => {
      if (video.readyState >= 2) {
        resolve();
        return;
      }
      const timer = setTimeout(() => reject(new Error("Video frame data load timed out.")), 8000);
      video.onloadeddata = () => {
        clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Unsupported or unreadable video format."));
      };
    });

    const durationSec = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 3;
    const timestamps = computeMotionSampleTimestamps(durationSec);
    const cols = 3;
    const rows = timestamps.length > 3 ? 2 : 1;
    const width = 1280;
    const height = rows === 2 ? 840 : 420;
    const cellW = Math.floor(width / cols);
    const cellH = Math.floor(height / rows);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a0a0d";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < timestamps.length; i += 1) {
      const ts = timestamps[i];
      await new Promise((resolve) => {
        let seekTimer = 0;
        const done = () => {
          clearTimeout(seekTimer);
          video.onseeked = null;
          resolve();
        };
        if (Math.abs((video.currentTime || 0) - ts) < 0.04 && video.readyState >= 2) {
          resolve();
          return;
        }
        video.onseeked = done;
        video.currentTime = ts;
        seekTimer = setTimeout(done, 900);
      });

      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW;
      const y = row * cellH;
      drawAspectContain(ctx, video, x + 2, y + 2, cellW - 4, cellH - 4);

      const label = `${getBeatTag(i, timestamps.length)} • ${ts.toFixed(1)}s`;
      ctx.fillStyle = "rgba(12, 12, 16, 0.78)";
      ctx.fillRect(x + 12, y + 12, 152, 26);
      ctx.strokeStyle = "#d4ff00";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 12, y + 12, 152, 26);
      ctx.fillStyle = "#d4ff00";
      ctx.font = "bold 12px monospace";
      ctx.fillText(label, x + 20, y + 29);
    }

    const webp = canvas.toDataURL("image/webp", 0.86);
    const dataUrl = webp && webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.86);

    return {
      dataUrl,
      frameCount: timestamps.length,
      durationSec: Number(durationSec.toFixed(2)),
      fileName: `motion_contact_${timestamps.length}frames.webp`
    };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
