// HiggsFold Studio v4.0 — Procedural Bespoke Studio Artwork Generator
// Ensures 100% of Stage 1 (113+), Stage 2 (47+), Kinetic VFX & Custom presets render
// rich, distinct dark-cinema thumbnails offline/instantaneously with zero blank cards.

const svgCache = new Map();

function hashStr(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const CATEGORY_THEMES = {
  "Kinetic VFX": { bg: "#090a0f", a: "#d1fe17", b: "#22d3ee", c: "#ff005b" },
  Aerial: { bg: "#080d14", a: "#38bdf8", b: "#d1fe17", c: "#818cf8" },
  Tracking: { bg: "#0a0c10", a: "#d1fe17", b: "#34d399", c: "#60a5fa" },
  Dynamic: { bg: "#0d090c", a: "#d1fe17", b: "#f97316", c: "#ef4444" },
  Cinema: { bg: "#0b0a09", a: "#f59e0b", b: "#22d3ee", c: "#e5e7eb" },
  "Film Simulation": { bg: "#100c09", a: "#f59e0b", b: "#dc2626", c: "#fde68a" },
  Mood: { bg: "#090a12", a: "#22d3ee", b: "#f43f5e", c: "#a855f7" },
  "Camera Presets": { bg: "#0a0a0d", a: "#d1fe17", b: "#e4e4e7", c: "#38bdf8" },
  Beauty: { bg: "#120c0e", a: "#fda4af", b: "#fde047", c: "#f9a8d4" },
  "Instagram Aesthetics": { bg: "#0e0c0f", a: "#fb923c", b: "#e879f9", c: "#fef08a" },
  "TikTok Core": { bg: "#090b10", a: "#f43f5e", b: "#2dd4bf", c: "#d1fe17" },
  Surreal: { bg: "#0a0814", a: "#c084fc", b: "#22d3ee", c: "#d1fe17" },
  "Graphic Art": { bg: "#0b0b0c", a: "#d1fe17", b: "#ec4899", c: "#06b6d4" },
  Retro: { bg: "#110d08", a: "#fbbf24", b: "#fb7185", c: "#67e8f9" }
};

function resolveMoodPalette(preset) {
  const hay = `${preset.name || ""} ${preset.lightingSpec || ""} ${preset.lensSpec || ""}`.toLowerCase();
  const base = CATEGORY_THEMES[preset.category] || {
    bg: "#0a0b0e",
    a: "#d1fe17",
    b: "#38bdf8",
    c: "#f472b6"
  };

  if (/\b(blackout|monochrome|noir|silver|graphite|b&w|ilford)\b/.test(hay) && !/neon|emerald|magenta/.test(hay)) {
    return { bg: "#080809", a: "#e4e4e7", b: "#71717a", c: "#ffffff" };
  }
  if (/\b(emerald|green|matrix)\b/.test(hay)) {
    return { bg: "#06100c", a: "#10b981", b: "#d1fe17", c: "#fbbf24" };
  }
  if (/\b(cyber|neon|hologram|purple|ultraviolet|laser)\b/.test(hay)) {
    return { bg: "#090714", a: "#22d3ee", b: "#e879f9", c: "#d1fe17" };
  }
  if (/\b(fire|ember|magma|crimson|red|blood|sunburnt|amber|gold|golden|velvetia)\b/.test(hay)) {
    return { bg: "#140908", a: "#fb923c", b: "#ef4444", c: "#fde047" };
  }
  if (/\b(chrome|liquid|silver|ice|arctic|mount|cyan|teal)\b/.test(hay)) {
    return { bg: "#080f14", a: "#38bdf8", b: "#e2e8f0", c: "#2dd4bf" };
  }
  return base;
}

function encodeSvgDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function buildKineticVfxInner(id, pal) {
  switch (id) {
    case "liquid-metal-morph":
      return `
        <path d="M52 128 C34 86, 74 44, 114 58 C144 68, 166 102, 146 134 C126 164, 72 162, 52 128 Z" fill="url(#g1)" stroke="${pal.a}" stroke-width="2.2"/>
        <ellipse cx="88" cy="84" rx="18" ry="8" transform="rotate(-24 88 84)" fill="#fff" opacity="0.65"/>
        <circle cx="152" cy="64" r="10" fill="url(#g2)"/>
        <circle cx="44" cy="146" r="6" fill="${pal.b}" opacity="0.8"/>`;
    case "shatter-reassemble":
      return `
        <polygon points="100,38 124,78 76,78" fill="${pal.a}" opacity="0.9"/>
        <polygon points="56,64 90,88 52,118" fill="${pal.b}" opacity="0.75"/>
        <polygon points="146,66 112,92 150,126" fill="#e4e4e7" opacity="0.7"/>
        <polygon points="74,116 126,116 100,158" fill="url(#g1)" stroke="${pal.a}" stroke-width="1.6"/>
        <path d="M40 44 L76 74 M160 44 L124 74 M100 164 L100 132" stroke="${pal.a}" stroke-width="1.6" stroke-dasharray="4 4"/>`;
    case "match-cut-object-swap":
      return `
        <circle cx="82" cy="100" r="36" fill="none" stroke="${pal.b}" stroke-width="4" stroke-dasharray="10 5"/>
        <polygon points="122,64 156,84 156,118 122,138 88,118 88,84" fill="url(#g1)" opacity="0.88" stroke="${pal.a}" stroke-width="2"/>
        <path d="M44 150 Q100 170 158 144" fill="none" stroke="${pal.a}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "kinetic-elastic-pop":
      return `
        <ellipse cx="100" cy="148" rx="40" ry="9" fill="${pal.a}" opacity="0.22"/>
        <rect x="64" y="54" width="72" height="72" rx="24" transform="rotate(-12 100 90)" fill="url(#g1)" stroke="#fff" stroke-width="1.6" opacity="0.95"/>
        <path d="M48 64 C56 42, 76 34, 96 36 M152 118 C146 138, 130 148, 110 148" fill="none" stroke="${pal.a}" stroke-width="2.2" stroke-linecap="round"/>`;
    case "magnetic-snap-assembly":
      return `
        <rect x="44" y="44" width="32" height="32" rx="6" fill="${pal.b}" opacity="0.85"/>
        <rect x="124" y="44" width="32" height="32" rx="6" fill="${pal.a}" opacity="0.9"/>
        <rect x="44" y="124" width="32" height="32" rx="6" fill="${pal.a}" opacity="0.65"/>
        <rect x="124" y="124" width="32" height="32" rx="6" fill="${pal.c}" opacity="0.8"/>
        <rect x="82" y="82" width="36" height="36" rx="7" fill="none" stroke="#fff" stroke-width="2"/>
        <path d="M76 76 L86 86 M124 76 L114 86 M76 124 L86 114 M124 124 L114 114" stroke="#fff" stroke-width="1.8"/>`;
    case "particle-dust-dissolve":
      return `
        <circle cx="72" cy="106" r="30" fill="url(#g1)" opacity="0.88"/>
        <circle cx="114" cy="86" r="7" fill="${pal.a}"/><circle cx="128" cy="70" r="5" fill="${pal.b}"/>
        <circle cx="138" cy="96" r="8" fill="${pal.a}"/><circle cx="152" cy="60" r="4" fill="#fff"/>
        <circle cx="148" cy="116" r="5" fill="${pal.c}"/><circle cx="122" cy="118" r="6" fill="${pal.b}"/>
        <circle cx="164" cy="84" r="3.5" fill="${pal.a}"/><circle cx="102" cy="68" r="4.5" fill="#fff"/>`;
    case "origami-unfold-reveal":
      return `
        <polygon points="100,40 156,96 100,104" fill="${pal.a}" opacity="0.9"/>
        <polygon points="100,40 44,96 100,104" fill="${pal.b}" opacity="0.72"/>
        <polygon points="44,96 100,104 100,160" fill="#27272a" stroke="#fff" stroke-width="1.2"/>
        <polygon points="156,96 100,104 100,160" fill="url(#g1)" stroke="${pal.a}" stroke-width="1.5"/>`;
    case "data-glitch-swap":
      return `
        <rect x="54" y="54" width="84" height="22" rx="3" fill="${pal.b}" opacity="0.85"/>
        <rect x="68" y="84" width="90" height="22" rx="3" fill="${pal.c}" opacity="0.85"/>
        <rect x="44" y="114" width="88" height="22" rx="3" fill="${pal.a}" opacity="0.9"/>
        <rect x="34" y="92" width="132" height="4" fill="#fff" opacity="0.8"/>`;
    case "gravity-drop-impact":
      return `
        <path d="M100 30 L100 92" stroke="${pal.a}" stroke-width="3" stroke-dasharray="5 4"/>
        <circle cx="100" cy="102" r="24" fill="url(#g1)" stroke="#fff" stroke-width="1.8"/>
        <ellipse cx="100" cy="144" rx="58" ry="14" fill="none" stroke="${pal.a}" stroke-width="2.2"/>
        <ellipse cx="100" cy="144" rx="36" ry="8" fill="none" stroke="${pal.b}" stroke-width="1.8"/>`;
    case "molten-glass-flow":
      return `
        <path d="M62 62 C92 42, 134 52, 142 86 C148 112, 130 156, 98 152 C68 148, 42 94, 62 62 Z" fill="url(#g2)" opacity="0.92" stroke="#fde047" stroke-width="2"/>
        <path d="M74 78 Q94 64 118 82" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.75"/>`;
    case "vortex-portal-warp":
      return `
        <circle cx="100" cy="100" r="56" fill="none" stroke="${pal.b}" stroke-width="2.2" stroke-dasharray="28 12"/>
        <circle cx="100" cy="100" r="39" fill="none" stroke="${pal.a}" stroke-width="3" stroke-dasharray="18 10"/>
        <circle cx="100" cy="100" r="20" fill="url(#g1)"/>
        <polygon points="100,84 114,108 86,108" fill="#090a0f"/>`;
    case "kinetic-typography-punch":
    default:
      return `
        <text x="104" y="122" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="70" fill="${pal.b}" opacity="0.45">Aa</text>
        <text x="98" y="116" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="70" fill="${pal.a}" stroke="#090a0f" stroke-width="2.5">Aa</text>
        <path d="M36 52 L64 68 M164 52 L136 68 M36 148 L64 132 M164 148 L136 132" stroke="#fff" stroke-width="2" opacity="0.6"/>`;
  }
}

function buildCameraFallbackInner(id, pal) {
  if (id === "fpv-drone-dive") {
    return `
      <path d="M24 148 L78 86 L122 86 L176 148" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
      <path d="M40 48 Q95 96 156 144" fill="none" stroke="${pal.a}" stroke-width="3.2" stroke-linecap="round"/>
      <polygon points="158,146 140,142 150,128" fill="${pal.a}"/>
      <circle cx="100" cy="96" r="14" fill="none" stroke="${pal.b}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
  }
  if (id === "low-angle-tracking") {
    return `
      <path d="M20 165 L86 72 M180 165 L114 72 M48 165 L92 72 M152 165 L108 72" stroke="rgba(255,255,255,0.28)" stroke-width="1.6"/>
      <rect x="78" y="54" width="44" height="54" rx="8" fill="url(#g1)" stroke="${pal.a}" stroke-width="2"/>
      <path d="M100 156 L100 120" stroke="${pal.a}" stroke-width="3" stroke-linecap="round"/>
      <polygon points="100,112 92,126 108,126" fill="${pal.a}"/>`;
  }
  // Custom / generic Stage 2 camera vector
  return `
    <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-dasharray="6 5"/>
    <rect x="74" y="82" width="52" height="36" rx="7" fill="url(#g1)" stroke="${pal.a}" stroke-width="2"/>
    <circle cx="100" cy="100" r="9" fill="#0a0a0d" stroke="#fff" stroke-width="1.8"/>
    <path d="M52 100 L66 100 M134 100 L148 100" stroke="${pal.a}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function buildStage1LookInner(preset, pal, h) {
  const cat = preset.category || "Cinema";
  const orbX = 48 + (h % 104);
  const orbY = 44 + ((h >> 8) % 60);
  const hueShift = ((h >> 16) % 24) - 12;

  // Stylized editorial portrait silhouette + category cinema composition motif
  const portraitSilhouette = `
    <circle cx="100" cy="76" r="24" fill="#18181f" stroke="${pal.a}" stroke-width="1.8"/>
    <path d="M56 168 C58 128, 76 112, 100 112 C124 112, 142 128, 144 168 Z" fill="#18181f" stroke="${pal.b}" stroke-width="1.6"/>`;

  let overlayMotif = "";
  if (cat === "Cinema") {
    overlayMotif = `
      <rect x="0" y="0" width="200" height="22" fill="#050507"/>
      <rect x="0" y="178" width="200" height="22" fill="#050507"/>
      <rect x="18" y="${orbY}" width="164" height="3" rx="1.5" fill="${pal.b}" opacity="0.65"/>`;
  } else if (cat === "Camera Presets") {
    overlayMotif = `
      <circle cx="100" cy="96" r="54" fill="none" stroke="${pal.a}" stroke-width="1.8" opacity="0.75"/>
      <circle cx="100" cy="96" r="38" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="5 5" opacity="0.5"/>
      <path d="M36 46 H54 M36 46 V64 M164 46 H146 M164 46 V64 M36 154 H54 M36 154 V136 M164 154 H146 M164 154 V136" stroke="${pal.a}" stroke-width="2" fill="none"/>`;
  } else if (cat === "Film Simulation" || cat === "Retro") {
    overlayMotif = `
      <rect x="14" y="20" width="12" height="16" rx="2" fill="#050507" stroke="rgba(255,255,255,0.22)"/>
      <rect x="14" y="54" width="12" height="16" rx="2" fill="#050507" stroke="rgba(255,255,255,0.22)"/>
      <rect x="14" y="130" width="12" height="16" rx="2" fill="#050507" stroke="rgba(255,255,255,0.22)"/>
      <rect x="174" y="20" width="12" height="16" rx="2" fill="#050507" stroke="rgba(255,255,255,0.22)"/>
      <rect x="174" y="130" width="12" height="16" rx="2" fill="#050507" stroke="rgba(255,255,255,0.22)"/>
      <circle cx="${orbX}" cy="${orbY}" r="26" fill="${pal.b}" opacity="0.22"/>`;
  } else if (cat === "Surreal" || cat === "Graphic Art") {
    overlayMotif = `
      <polygon points="100,${28 + hueShift} 160,136 40,136" fill="none" stroke="${pal.a}" stroke-width="2.2" opacity="0.8"/>
      <circle cx="${orbX}" cy="64" r="18" fill="${pal.b}" opacity="0.45"/>`;
  } else {
    // Beauty / Mood / TikTok Core / Instagram Aesthetics
    overlayMotif = `
      <circle cx="${orbX}" cy="${orbY}" r="20" fill="${pal.a}" opacity="0.32"/>
      <circle cx="${180 - orbX}" cy="${120 - (hueShift * 2)}" r="14" fill="${pal.b}" opacity="0.28"/>`;
  }

  return `${portraitSilhouette}${overlayMotif}`;
}

/**
 * Generate a bespoke SVG Data URI poster for any preset that does not already have
 * a verified remote photo/video asset (or when remote assets fail to load).
 */
export function getPresetPosterUrl(preset, isVideoStage) {
  if (!preset) return "";
  if (preset.poster) return preset.poster;

  const cacheKey = `${isVideoStage ? "s2" : "s1"}:${preset.id}`;
  if (svgCache.has(cacheKey)) return svgCache.get(cacheKey);

  const pal = resolveMoodPalette(preset);
  const h = hashStr(preset.id || preset.name);

  let innerArt = "";
  if (preset.category === "Kinetic VFX" || preset.transformMode) {
    innerArt = buildKineticVfxInner(preset.id, pal);
  } else if (isVideoStage) {
    innerArt = buildCameraFallbackInner(preset.id, pal);
  } else {
    innerArt = buildStage1LookInner(preset, pal, h);
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <radialGradient id="bgGrad" cx="${30 + (h % 45)}%" cy="${22 + ((h >> 4) % 35)}%" r="75%">
          <stop offset="0%" stop-color="${pal.a}" stop-opacity="0.30"/>
          <stop offset="55%" stop-color="${pal.b}" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="${pal.bg}" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${pal.a}"/>
          <stop offset="100%" stop-color="${pal.b}"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="${pal.b}"/>
          <stop offset="100%" stop-color="${pal.c}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="${pal.bg}"/>
      <rect width="200" height="200" fill="url(#bgGrad)"/>
      <path d="M0 100 H200 M100 0 V200" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      ${innerArt}
    </svg>
  `;

  const uri = encodeSvgDataUri(svg);
  svgCache.set(cacheKey, uri);
  return uri;
}
