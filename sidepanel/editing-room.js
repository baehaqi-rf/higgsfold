// HiggsFold Studio v4.0 — Client-Side NLE Editing Room (Trim, Crossfade, WebAudio Mux & HD WebM Export)

export function getExportDimensions(aspect = "16:9") {
  switch (aspect) {
    case "9:16":
      return { width: 720, height: 1280 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "2.39:1":
      return { width: 1280, height: 536 };
    case "4:3":
      return { width: 1200, height: 900 };
    case "3:4":
      return { width: 900, height: 1200 };
    case "16:9":
    default:
      return { width: 1280, height: 720 };
  }
}

export function validateTrimBounds(inSec, outSec, maxDurSec) {
  const maxDur = Math.max(0.4, Number(maxDurSec) || 0.4);
  let start = Number(inSec);
  let end = Number(outSec);
  if (!Number.isFinite(start) || start < 0) start = 0;
  if (!Number.isFinite(end) || end <= 0 || end > maxDur) end = maxDur;
  if (start > maxDur - 0.4) start = Math.max(0, Number((maxDur - 0.4).toFixed(1)));
  if (end - start < 0.4) end = Math.min(maxDur, Number((start + 0.4).toFixed(1)));
  return {
    inSec: Number(start.toFixed(1)),
    outSec: Number(end.toFixed(1)),
    trimDurSec: Number((end - start).toFixed(1))
  };
}

export function computeDrawRect(srcW, srcH, dstW, dstH, fitMode = "cover") {
  const sw0 = Math.max(1, Number(srcW) || 1);
  const sh0 = Math.max(1, Number(srcH) || 1);
  const dw0 = Math.max(1, Number(dstW) || 1);
  const dh0 = Math.max(1, Number(dstH) || 1);

  if (fitMode === "contain") {
    const scale = Math.min(dw0 / sw0, dh0 / sh0);
    const dw = sw0 * scale;
    const dh = sh0 * scale;
    return {
      sx: 0,
      sy: 0,
      sw: sw0,
      sh: sh0,
      dx: (dw0 - dw) / 2,
      dy: (dh0 - dh) / 2,
      dw,
      dh
    };
  }

  // Default: cover (center-crop without distortion)
  const scale = Math.max(dw0 / sw0, dh0 / sh0);
  const sw = dw0 / scale;
  const sh = dh0 / scale;
  return {
    sx: (sw0 - sw) / 2,
    sy: (sh0 - sh) / 2,
    sw,
    sh,
    dx: 0,
    dy: 0,
    dw: dw0,
    dh: dh0
  };
}

export function evaluateEasing(type, rawT) {
  const t = Math.max(0, Math.min(1, Number(rawT) || 0));
  switch (type) {
    case "easeOutCubic":
      return 1 - Math.pow(1 - t, 3);
    case "easeOutBack": {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    case "easeOutExpo":
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    case "springElastic": {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    }
    case "linear":
    default:
      return t;
  }
}

export function computeOverlayTransform(overlay, timelineSec, canvasW = 1280, canvasH = 720) {
  const startSec = Math.max(0, Number(overlay.startSec) || 0);
  const durSec = Math.max(0.3, Number(overlay.durSec) || 2.5);
  const tNow = Number(timelineSec) || 0;

  if (tNow < startSec || tNow > startSec + durSec) {
    return {
      visible: false,
      opacity: 0,
      x: canvasW / 2,
      y: canvasH / 2,
      scale: 1,
      rotationRad: 0,
      charRevealRatio: 1
    };
  }

  const localT = tNow - startSec;
  const enterDur = Math.min(0.48, durSec * 0.35);
  const exitDur = Math.min(0.24, durSec * 0.2);
  const enterProg = Math.min(1, localT / Math.max(0.05, enterDur));

  let opacity = 1;
  if (localT < 0.1) opacity = localT / 0.1;
  else if (durSec - localT < exitDur) opacity = Math.max(0, (durSec - localT) / exitDur);

  const posMap = { top: 0.2, center: 0.5, bottom: 0.82 };
  const x = canvasW / 2;
  let y = canvasH * (posMap[overlay.position] ?? 0.5);
  let scale = 1;
  let rotationRad = 0;
  let charRevealRatio = 1;

  switch (overlay.anim || "pop-scale") {
    case "slide-up": {
      const e = evaluateEasing("easeOutCubic", enterProg);
      y += (1 - e) * canvasH * 0.16;
      break;
    }
    case "kinetic-slam": {
      const e = evaluateEasing("easeOutExpo", enterProg);
      scale = 2.35 - 1.35 * e;
      rotationRad = (1 - e) * -0.12;
      break;
    }
    case "spin-fly": {
      const e = evaluateEasing("easeOutBack", enterProg);
      scale = Math.max(0.05, e);
      rotationRad = (1 - e) * Math.PI;
      break;
    }
    case "orbit-float": {
      const e = evaluateEasing("easeOutCubic", enterProg);
      scale = e;
      y += Math.sin(localT * 3.6) * 14;
      rotationRad = Math.cos(localT * 2.4) * 0.08;
      break;
    }
    case "typewriter": {
      charRevealRatio = Math.min(1, localT / Math.max(0.25, durSec * 0.65));
      break;
    }
    case "pop-scale":
    default: {
      const e = evaluateEasing("easeOutBack", enterProg);
      scale = 0.22 + 0.78 * e;
      break;
    }
  }

  return {
    visible: true,
    opacity: Math.max(0, Math.min(1, opacity)),
    x,
    y,
    scale,
    rotationRad,
    charRevealRatio
  };
}

function drawKineticOverlays(ctx, overlays, timelineSec, width, height) {
  if (!overlays || overlays.length === 0) return;
  const scaleUnit = Math.min(width, height) / 720;

  for (const ov of overlays) {
    const tr = computeOverlayTransform(ov, timelineSec, width, height);
    if (!tr.visible || tr.opacity <= 0.01) continue;

    ctx.save();
    ctx.globalAlpha = tr.opacity;
    ctx.translate(tr.x, tr.y);
    ctx.rotate(tr.rotationRad);
    ctx.scale(tr.scale, tr.scale);

    if (ov.kind === "object" && ov._imgEl) {
      const im = ov._imgEl;
      const baseSize = Math.round((Number(ov.sizePx) || 260) * scaleUnit);
      const ratio = (im.naturalWidth || 1) / (im.naturalHeight || 1);
      const drawW = ratio >= 1 ? baseSize : baseSize * ratio;
      const drawH = ratio >= 1 ? baseSize / ratio : baseSize;
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 18;
      ctx.drawImage(im, -drawW / 2, -drawH / 2, drawW, drawH);
    } else if (ov.text) {
      const rawText = String(ov.text);
      const shownCount = Math.max(1, Math.ceil(rawText.length * tr.charRevealRatio));
      const shownText = rawText.slice(0, shownCount);
      const fontSize = Math.max(20, Math.round((Number(ov.sizePx) || 64) * scaleUnit));
      ctx.font = `900 ${fontSize}px "Space Grotesk", "Inter", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.1));
      ctx.strokeStyle = "rgba(8, 8, 12, 0.85)";
      ctx.strokeText(shownText, 0, 0);
      ctx.fillStyle = ov.color || "#d1fe17";
      ctx.fillText(shownText, 0, 0);
    }

    ctx.restore();
  }
}

export function createEditingRoomController(els, showToast) {
  const clips = [];
  const overlays = [];
  let isPlaying = false;
  let stopRequested = false;
  let activeVideo = null;
  let activeRafId = 0;
  let activeRecorder = null;

  function renderOverlays() {
    if (!els.overlayList) return;
    els.overlayList.innerHTML = "";
    if (overlays.length === 0) return;

    overlays.forEach((ov, idx) => {
      const row = document.createElement("div");
      row.className = "edit-clip-row";
      const meta = document.createElement("div");
      meta.className = "edit-clip-meta";
      const title = document.createElement("div");
      title.className = "edit-clip-title";
      title.textContent =
        ov.kind === "object"
          ? `OBJ #${idx + 1}: ${ov.label || "PNG Object"} (${ov.anim})`
          : `TXT #${idx + 1}: "${ov.text}" (${ov.anim})`;
      const sub = document.createElement("div");
      sub.className = "edit-clip-sub";
      sub.textContent = `Start ${ov.startSec}s • Dur ${ov.durSec}s • ${ov.position || "center"}`;
      meta.append(title, sub);

      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.className = "text-btn danger";
      rmBtn.textContent = "×";
      rmBtn.addEventListener("click", () => {
        if (ov.revokeUrl && ov.imageSrc?.startsWith("blob:")) URL.revokeObjectURL(ov.imageSrc);
        overlays.splice(idx, 1);
        renderOverlays();
      });

      row.append(meta, rmBtn);
      els.overlayList.appendChild(row);
    });
  }

  async function addOverlay(config) {
    const entry = {
      id: `ov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: config.kind === "object" ? "object" : "text",
      text: (config.text || "").trim(),
      label: (config.label || "").trim(),
      imageSrc: config.imageSrc || "",
      revokeUrl: Boolean(config.revokeUrl),
      anim: config.anim || "pop-scale",
      color: config.color || "#d1fe17",
      position: config.position || "center",
      sizePx: Number(config.sizePx) || (config.kind === "object" ? 260 : 68),
      startSec: Math.max(0, Number(config.startSec) || 0),
      durSec: Math.max(0.4, Number(config.durSec) || 2.5),
      _imgEl: null
    };

    if (entry.kind === "object" && entry.imageSrc) {
      entry._imgEl = await new Promise((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error("Could not decode PNG/object layer"));
        im.src = entry.imageSrc;
      });
    }

    overlays.push(entry);
    renderOverlays();
    showToast(
      entry.kind === "object"
        ? `Added Kinetic Object layer (${entry.anim})`
        : `Added Kinetic Text "${entry.text}"`
    );
    return entry;
  }

  function renderClips() {
    els.clipList.innerHTML = "";
    els.clipCount.textContent = `${clips.length} clips`;

    if (clips.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "color:#71717a;font-size:11.5px;";
      empty.textContent =
        "Drop .mp4/.webm/.png/.jpg clips or Grab Outputs from Flow to trim, crossfade & export.";
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

      const bounds = validateTrimBounds(clip.inSec, clip.outSec, clip.durationSec);
      const sub = document.createElement("div");
      sub.className = "edit-clip-sub";
      sub.textContent = `${clip.kind.toUpperCase()} • ${bounds.trimDurSec}s (${bounds.inSec}s–${bounds.outSec}s)`;

      const trimRow = document.createElement("div");
      trimRow.className = "edit-clip-trim";

      const inLabel = document.createElement("label");
      inLabel.textContent = "In";
      const inInput = document.createElement("input");
      inInput.type = "number";
      inInput.step = "0.1";
      inInput.min = "0";
      inInput.max = String(Math.max(0, clip.durationSec - 0.4));
      inInput.value = String(bounds.inSec);
      inInput.title = "Trim In (sec)";
      inInput.addEventListener("change", () => {
        const next = validateTrimBounds(inInput.value, clip.outSec, clip.durationSec);
        clip.inSec = next.inSec;
        clip.outSec = next.outSec;
        renderClips();
      });

      const outLabel = document.createElement("label");
      outLabel.textContent = "Out";
      const outInput = document.createElement("input");
      outInput.type = "number";
      outInput.step = "0.1";
      outInput.min = "0.4";
      outInput.max = String(clip.durationSec);
      outInput.value = String(bounds.outSec);
      outInput.title = "Trim Out (sec)";
      outInput.addEventListener("change", () => {
        const next = validateTrimBounds(clip.inSec, outInput.value, clip.durationSec);
        clip.inSec = next.inSec;
        clip.outSec = next.outSec;
        renderClips();
      });

      trimRow.append(inLabel, inInput, outLabel, outInput);
      meta.append(title, sub, trimRow);

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
        if (clip.revokeOnRemove && clip.url.startsWith("blob:")) {
          URL.revokeObjectURL(clip.url);
        }
        clips.splice(idx, 1);
        renderClips();
      });

      controls.append(upBtn, downBtn, rmBtn);
      row.append(meta, controls);
      els.clipList.appendChild(row);
    });
  }

  async function probeMediaDuration(url, kind) {
    if (kind !== "video") return 3.0;
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const dur = Math.max(0.5, Number((v.duration || 3).toFixed(1)));
        v.removeAttribute("src");
        v.load();
        resolve(dur);
      };
      v.onerror = () => resolve(3.0);
      v.src = url;
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    let added = 0;
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      const url = URL.createObjectURL(file);
      const kind = isVideo ? "video" : "image";
      const durationSec = await probeMediaDuration(url, kind);
      clips.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        kind,
        url,
        revokeOnRemove: true,
        durationSec,
        inSec: 0,
        outSec: durationSec
      });
      added += 1;
    }
    renderClips();
    if (added > 0) {
      showToast(`Added ${added} clip(s) to Editing Room`);
    }
  }

  async function addExternalClip(name, srcUrl, kind = "image") {
    const durationSec = await probeMediaDuration(srcUrl, kind);
    clips.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name || `Flow ${kind} ${clips.length + 1}`,
      kind,
      url: srcUrl,
      revokeOnRemove: false,
      durationSec,
      inSec: 0,
      outSec: durationSec
    });
    renderClips();
    showToast(`Added "${name || kind}" to Editing Room`);
  }

  function cleanupActiveVideo() {
    if (activeRafId) {
      cancelAnimationFrame(activeRafId);
      activeRafId = 0;
    }
    if (activeVideo) {
      try {
        activeVideo.pause();
        activeVideo.removeAttribute("src");
        activeVideo.load();
      } catch (_) {}
      activeVideo = null;
    }
  }

  function drawWithCrossfade(ctx, sourceEl, srcW, srcH, dstW, dstH, fitMode, prevFrameCanvas, alpha) {
    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, dstW, dstH);

    if (prevFrameCanvas && alpha < 1) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(prevFrameCanvas, 0, 0, dstW, dstH);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    const r = computeDrawRect(srcW, srcH, dstW, dstH, fitMode);
    ctx.drawImage(sourceEl, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);

    if (prevFrameCanvas && alpha < 1) {
      ctx.restore();
    }
  }

  async function renderClipToCanvas(clip, ctx, width, height, options) {
    const {
      fitMode,
      crossfadeSec,
      prevFrameCanvas,
      baseCanvas,
      baseCtx,
      audioCtx,
      audioDest,
      speakerGain,
      timelineOffsetSec = 0
    } = options;
    const targetCtx = baseCtx || ctx;
    const bounds = validateTrimBounds(clip.inSec, clip.outSec, clip.durationSec);

    if (clip.kind === "image") {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error(`Could not decode image: ${clip.name}`));
        im.src = clip.url;
      });
      const iw = img.naturalWidth || img.width || width;
      const ih = img.naturalHeight || img.height || height;
      const durMs = bounds.trimDurSec * 1000;
      const startTs = performance.now();

      await new Promise((resolve) => {
        const tick = (now) => {
          if (stopRequested) {
            activeRafId = 0;
            resolve();
            return;
          }
          const elapsedSec = (now - startTs) / 1000;
          const alpha = crossfadeSec > 0 ? Math.min(1, elapsedSec / crossfadeSec) : 1;
          drawWithCrossfade(targetCtx, img, iw, ih, width, height, fitMode, prevFrameCanvas, alpha);
          if (baseCanvas && baseCtx) {
            ctx.drawImage(baseCanvas, 0, 0, width, height);
          }
          drawKineticOverlays(ctx, overlays, timelineOffsetSec + elapsedSec, width, height);
          if (now - startTs >= durMs) {
            activeRafId = 0;
            resolve();
            return;
          }
          activeRafId = requestAnimationFrame(tick);
        };
        activeRafId = requestAnimationFrame(tick);
      });
      return bounds.trimDurSec;
    }

    // Video clip with audio muxing & Trim In/Out bounds
    const video = document.createElement("video");
    activeVideo = video;
    video.crossOrigin = "anonymous";
    video.src = clip.url;
    video.playsInline = true;
    video.muted = false;

    try {
      if (audioCtx && audioDest && typeof audioCtx.createMediaElementSource === "function") {
        const mediaSource = audioCtx.createMediaElementSource(video);
        mediaSource.connect(audioDest);
        if (speakerGain) mediaSource.connect(speakerGain);
      }
    } catch (_) {}

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out loading ${clip.name}`)), 8000);
      video.onloadeddata = () => {
        clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to play video: ${clip.name}`));
      };
    });

    if (bounds.inSec > 0) {
      await new Promise((resolve) => {
        let seekTimer = 0;
        const done = () => {
          clearTimeout(seekTimer);
          video.onseeked = null;
          resolve();
        };
        video.onseeked = done;
        video.currentTime = bounds.inSec;
        seekTimer = setTimeout(done, 450);
      });
    }

    try {
      await video.play();
    } catch (_) {
      // Fallback if autoplay without gesture requires muted preview
      video.muted = true;
      await video.play().catch(() => {});
    }

    const vw = video.videoWidth || width;
    const vh = video.videoHeight || height;

    await new Promise((resolve) => {
      const drawFrame = () => {
        if (stopRequested || video.ended || video.paused || video.currentTime >= bounds.outSec) {
          cleanupActiveVideo();
          resolve();
          return;
        }
        const elapsedInClip = Math.max(0, video.currentTime - bounds.inSec);
        const alpha = crossfadeSec > 0 ? Math.min(1, elapsedInClip / crossfadeSec) : 1;
        drawWithCrossfade(targetCtx, video, vw, vh, width, height, fitMode, prevFrameCanvas, alpha);
        if (baseCanvas && baseCtx) {
          ctx.drawImage(baseCanvas, 0, 0, width, height);
        }
        drawKineticOverlays(ctx, overlays, timelineOffsetSec + elapsedInClip, width, height);
        activeRafId = requestAnimationFrame(drawFrame);
      };
      activeRafId = requestAnimationFrame(drawFrame);
    });
    return bounds.trimDurSec;
  }

  async function renderOverlayOnlyStage(ctx, width, height, durSec) {
    const startTs = performance.now();
    const durMs = Math.max(1000, durSec * 1000);
    await new Promise((resolve) => {
      const tick = (now) => {
        if (stopRequested) {
          activeRafId = 0;
          resolve();
          return;
        }
        const elapsedSec = (now - startTs) / 1000;
        const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.5, width * 0.75);
        grad.addColorStop(0, "#14191f");
        grad.addColorStop(1, "#050508");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        drawKineticOverlays(ctx, overlays, elapsedSec, width, height);
        if (now - startTs >= durMs) {
          activeRafId = 0;
          resolve();
          return;
        }
        activeRafId = requestAnimationFrame(tick);
      };
      activeRafId = requestAnimationFrame(tick);
    });
  }

  async function playOrExport(record = false) {
    if (clips.length === 0 && overlays.length === 0) {
      showToast("Add at least 1 clip or Kinetic Overlay first.", true);
      return;
    }
    if (isPlaying) {
      stopRequested = true;
      cleanupActiveVideo();
      if (activeRecorder && activeRecorder.state === "recording") {
        try {
          activeRecorder.stop();
        } catch (_) {}
      }
      return;
    }

    const aspect = els.exportAspect?.value || "16:9";
    const fitMode = els.fitMode?.value || "cover";
    const crossfadeSec = els.crossfadeToggle?.checked ? 0.35 : 0;
    const dims = getExportDimensions(aspect);

    const canvas = els.canvas;
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");

    const playBtnEl = els.btnPlay || els.playBtn;
    const exportBtnEl = els.btnExport || els.exportBtn;
    isPlaying = true;
    stopRequested = false;
    if (playBtnEl) playBtnEl.textContent = "■ Stop";
    if (exportBtnEl) exportBtnEl.disabled = true;

    let audioCtx = null;
    let audioDest = null;
    let speakerGain = null;
    let recorder = null;
    const chunks = [];

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }
        audioDest = audioCtx.createMediaStreamDestination();
        speakerGain = audioCtx.createGain();
        speakerGain.gain.value = record ? 0 : 1;
        speakerGain.connect(audioCtx.destination);
      }

      if (record) {
        const canvasStream = canvas.captureStream(30);
        const combinedTracks = [...canvasStream.getVideoTracks()];
        if (audioDest) {
          combinedTracks.push(...audioDest.stream.getAudioTracks());
        }
        const combinedStream = new MediaStream(combinedTracks);

        const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(
          (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)
        );
        recorder = new MediaRecorder(combinedStream, {
          ...(mime ? { mimeType: mime } : {}),
          videoBitsPerSecond: 6_000_000,
          audioBitsPerSecond: 128_000
        });
        activeRecorder = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        recorder.start(200);
        showToast(`Recording ${dims.width}×${dims.height} WebM…`);
      }

      const prevFrameCanvas = crossfadeSec > 0 ? document.createElement("canvas") : null;
      if (prevFrameCanvas) {
        prevFrameCanvas.width = dims.width;
        prevFrameCanvas.height = dims.height;
      }
      const baseCanvas = document.createElement("canvas");
      baseCanvas.width = dims.width;
      baseCanvas.height = dims.height;
      const baseCtx = baseCanvas.getContext("2d");

      if (clips.length === 0) {
        const maxOvEnd = overlays.reduce(
          (mx, o) => Math.max(mx, (o.startSec || 0) + (o.durSec || 1.5)),
          1.2
        );
        await renderOverlayOnlyStage(ctx, dims.width, dims.height, maxOvEnd);
      } else {
        let timelineOffsetSec = 0;
        for (let i = 0; i < clips.length; i += 1) {
          if (stopRequested) break;
          const playedDur = await renderClipToCanvas(clips[i], ctx, dims.width, dims.height, {
            fitMode,
            crossfadeSec: i > 0 ? crossfadeSec : 0,
            prevFrameCanvas: i > 0 ? prevFrameCanvas : null,
            baseCanvas,
            baseCtx,
            audioCtx,
            audioDest,
            speakerGain,
            timelineOffsetSec
          });
          timelineOffsetSec += playedDur || 0;
          if (prevFrameCanvas && !stopRequested) {
            const pCtx = prevFrameCanvas.getContext("2d");
            pCtx.clearRect(0, 0, dims.width, dims.height);
            // Snapshot overlay-free baseCanvas so overlays never ghost into the next clip crossfade
            pCtx.drawImage(baseCanvas, 0, 0, dims.width, dims.height);
          }
        }
      }

      if (record && recorder && recorder.state !== "inactive") {
        await new Promise((resolve) => {
          recorder.onstop = resolve;
          recorder.stop();
        });
        if (!stopRequested && chunks.length > 0) {
          const blob = new Blob(chunks, { type: "video/webm" });
          const outUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = outUrl;
          a.download = `higgsfold_edit_${dims.width}x${dims.height}_${Date.now()}.webm`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(outUrl), 4000);
          showToast(`Exported ${dims.width}×${dims.height} WebM video!`);
        } else {
          showToast("Export stopped.", true);
        }
      }
    } catch (err) {
      showToast(err?.message || "Editing Room playback error", true);
    } finally {
      cleanupActiveVideo();
      activeRecorder = null;
      if (audioCtx) {
        await audioCtx.close().catch(() => {});
      }
      isPlaying = false;
      stopRequested = false;
      if (playBtnEl) playBtnEl.textContent = "▶ Preview Edit";
      if (exportBtnEl) exportBtnEl.disabled = false;
    }
  }

  function clearAll() {
    stopRequested = true;
    cleanupActiveVideo();
    if (activeRecorder && activeRecorder.state === "recording") {
      try {
        activeRecorder.stop();
      } catch (_) {}
    }
    while (clips.length) {
      const c = clips.pop();
      if (c.revokeOnRemove && c.url?.startsWith("blob:")) URL.revokeObjectURL(c.url);
    }
    while (overlays.length) {
      const o = overlays.pop();
      if (o.revokeUrl && o.imageSrc?.startsWith("blob:")) URL.revokeObjectURL(o.imageSrc);
    }
    renderClips();
    renderOverlays();
  }

  renderClips();
  renderOverlays();
  return {
    addFiles,
    addExternalClip,
    addOverlay,
    renderOverlays,
    getOverlays: () => overlays,
    playOrExport,
    clearAll,
    renderClips,
    getClips: () => clips
  };
}
