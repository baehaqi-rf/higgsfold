// HiggsFold Studio v3.0 — Client-Side Editing Room (Timeline Sequencer & WebM Export)

export function createEditingRoomController(els, showToast) {
  const clips = [];
  let isPlaying = false;
  let stopRequested = false;

  function renderClips() {
    els.clipList.innerHTML = "";
    els.clipCount.textContent = `${clips.length} clips`;

    if (clips.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "color:#71717a;font-size:11.5px;";
      empty.textContent =
        "Drop or add generated .mp4, .webm, or .png/.jpg clips from Google Flow to assemble & preview your edit.";
      els.clipList.appendChild(empty);
      return;
    }

    clips.forEach((clip, idx) => {
      const row = document.createElement("div");
      row.className = "edit-clip-row";

      const meta = document.createElement("div");
      meta.className = "edit-clip-meta";

      const title = document.createElement("div");
      title.className = "edit-clip-title";
      title.textContent = `${idx + 1}. ${clip.name}`;

      const sub = document.createElement("div");
      sub.className = "edit-clip-sub";
      sub.textContent = `${clip.kind.toUpperCase()} • ${clip.durationSec}s`;

      meta.appendChild(title);
      meta.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "edit-clip-actions";

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "text-btn";
      upBtn.textContent = "↑";
      upBtn.disabled = idx === 0;
      upBtn.addEventListener("click", () => {
        [clips[idx - 1], clips[idx]] = [clips[idx], clips[idx - 1]];
        renderClips();
      });

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "text-btn";
      downBtn.textContent = "↓";
      downBtn.disabled = idx === clips.length - 1;
      downBtn.addEventListener("click", () => {
        [clips[idx], clips[idx + 1]] = [clips[idx + 1], clips[idx]];
        renderClips();
      });

      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.className = "text-btn danger";
      rmBtn.textContent = "×";
      rmBtn.addEventListener("click", () => {
        URL.revokeObjectURL(clip.url);
        clips.splice(idx, 1);
        renderClips();
      });

      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(rmBtn);
      row.appendChild(meta);
      row.appendChild(controls);
      els.clipList.appendChild(row);
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      const url = URL.createObjectURL(file);
      let durationSec = 2.5;
      if (isVideo) {
        durationSec = await new Promise((resolve) => {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => resolve(Math.max(0.5, Number((v.duration || 3).toFixed(1))));
          v.onerror = () => resolve(3.0);
          v.src = url;
        });
      }
      clips.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        kind: isVideo ? "video" : "image",
        url,
        durationSec
      });
    }
    renderClips();
    if (clips.length > 0) {
      showToast(`Added ${files.length} clip(s) to Editing Room`);
    }
  }

  async function renderClipToCanvas(clip, ctx, width, height, shouldRecord) {
    if (clip.kind === "image") {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = clip.url;
      });
      const frames = Math.round(clip.durationSec * 24);
      for (let f = 0; f < frames; f++) {
        if (stopRequested) break;
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
        const scale = Math.min(width / img.width, height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
        await new Promise((r) => setTimeout(r, shouldRecord ? 41 : 35));
      }
      return;
    }

    await new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = clip.url;
      video.muted = true;
      video.playsInline = true;
      let rafId = null;

      const drawFrame = () => {
        if (stopRequested || video.ended || video.paused) {
          cancelAnimationFrame(rafId);
          resolve();
          return;
        }
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
        const scale = Math.min(width / (video.videoWidth || width), height / (video.videoHeight || height));
        const w = (video.videoWidth || width) * scale;
        const h = (video.videoHeight || height) * scale;
        ctx.drawImage(video, (width - w) / 2, (height - h) / 2, w, h);
        rafId = requestAnimationFrame(drawFrame);
      };

      video.onended = () => {
        cancelAnimationFrame(rafId);
        resolve();
      };
      video.onerror = () => resolve();
      video.play().then(drawFrame).catch(() => resolve());
    });
  }

  async function playOrExport(exportWebm) {
    if (clips.length === 0) {
      showToast("Add at least 1 video or image clip first");
      return;
    }
    if (isPlaying) {
      stopRequested = true;
      return;
    }

    isPlaying = true;
    stopRequested = false;
    const canvas = els.canvas;
    const ctx = canvas.getContext("2d");
    let recorder = null;
    const chunks = [];

    if (exportWebm) {
      if (typeof canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") {
        isPlaying = false;
        showToast("MediaRecorder export unavailable in this view");
        return;
      }
      const stream = canvas.captureStream(24);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.start();
      showToast("Rendering combined WebM montage...");
    }

    els.btnPlay.textContent = "Stop";
    for (const clip of clips) {
      if (stopRequested) break;
      await renderClipToCanvas(clip, ctx, canvas.width, canvas.height, exportWebm);
    }

    if (recorder && recorder.state !== "inactive") {
      await new Promise((resolve) => {
        recorder.onstop = resolve;
        recorder.stop();
      });
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `higgsfold-edit-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported combined .webm edit!");
    }

    isPlaying = false;
    els.btnPlay.textContent = "Play Edit";
  }

  els.inputFiles.addEventListener("change", async (e) => {
    await addFiles(e.target.files);
    els.inputFiles.value = "";
  });

  els.btnPlay.addEventListener("click", () => playOrExport(false));
  els.btnExport.addEventListener("click", () => playOrExport(true));
  els.btnClear.addEventListener("click", () => {
    stopRequested = true;
    clips.forEach((c) => URL.revokeObjectURL(c.url));
    clips.length = 0;
    const ctx = els.canvas.getContext("2d");
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    renderClips();
    showToast("Editing Room timeline cleared");
  });

  renderClips();
}
