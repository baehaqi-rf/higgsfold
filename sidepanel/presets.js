// HiggsFold Studio v3.0 — Complete Higgsfield Cinema Studio 4.0 & Soul Catalog
// - Stage 1: 14 Cinema Keyframes + 106 Higgsfield Soul Studio Presets (120 total)
// - Stage 2: All 33 Cinema Studio 4.0 Camera Movements + 2 Action/Track presets (35 total)
// - All 20 Cinema Studio Color Palettes, Camera Bodies, Lenses, Apertures, Genres, Eras, Lighting
// - Lipsync Studio & Motion Control options

export const STAGE1_CATEGORIES = [
  "All",
  "Cinema",
  "TikTok Core",
  "Instagram Aesthetics",
  "Camera Presets",
  "Beauty",
  "Mood",
  "Surreal",
  "Graphic Art"
];

const CORE_STAGE1_PRESETS = [
  {
    id: "soul-editorial-35mm",
    name: "Editorial 35mm",
    badge: "SOUL LOCK",
    category: "Cinema",
    tag: "Portrait / Commercial",
    motionPreview: "preview-subtle-breath",
    lensSpec: "Shot on 35mm anamorphic prime lens at f/2.0, shallow depth of field, razor-sharp focus on subject's eyes, subtle organic film grain.",
    lightingSpec: "Soft directional key light with natural rim separation, rich shadow roll-off, Kodak Portra 400 color science.",
    compositionRule: "Rule-of-thirds medium close-up, cinematic negative space for upcoming camera movement.",
    soulLockDirective: "Preserve exact facial structure, skin texture, hairline, and wardrobe continuity from reference image without smoothing or altering identity."
  },
  {
    id: "neon-noir-anamorphic",
    name: "Neon Noir",
    badge: "CINEMA",
    category: "Mood",
    tag: "Night / Urban",
    motionPreview: "preview-neon-pulse",
    lensSpec: "Shot on 50mm vintage anamorphic lens, subtle horizontal cyan/amber lens flare, high micro-contrast.",
    lightingSpec: "Wet street reflections, moody practical neon rim lighting against deep obsidian shadows, volumetric light haze.",
    compositionRule: "Low-angle three-quarter hero framing with deep leading lines in the background.",
    soulLockDirective: "Keep subject identity and outfit 100% consistent with reference while realistically wrapping ambient neon reflections onto skin and clothing."
  },
  {
    id: "luxury-studio-product",
    name: "Luxury Tabletop",
    badge: "PRODUCT",
    category: "Cinema",
    tag: "Commercial / Macro",
    motionPreview: "preview-shimmer",
    lensSpec: "85mm macro cinema lens at f/4, crisp edge definition, optical specular highlights, zero chromatic distortion.",
    lightingSpec: "Controlled softbox overhead diffusion with crisp silver reflector edge kicks on matte obsidian pedestal.",
    compositionRule: "Centered symmetrical hero placement with clean foreground-background depth separation.",
    soulLockDirective: "Maintain exact product geometry, logo typography, surface material finish, and color accuracy from reference image."
  },
  {
    id: "raw-docu-handheld",
    name: "Raw Documentary",
    badge: "REALISM",
    category: "Cinema",
    tag: "Authentic / Street",
    motionPreview: "preview-handheld",
    lensSpec: "28mm documentary lens at f/2.8, candid unposed framing, natural slight vignette, authentic optical texture.",
    lightingSpec: "Available overcast daylight, unpolished true-to-life skin tones, high dynamic range without artificial HDR look.",
    compositionRule: "Eye-level candid framing with natural environmental clutter in soft foreground bokeh.",
    soulLockDirective: "Retain natural facial imperfections, exact identity, and authentic clothing folds from reference without glossy AI polish."
  },
  {
    id: "golden-hour-epic",
    name: "Golden Epic",
    badge: "WIDE",
    category: "Cinema",
    tag: "Outdoor / Travel",
    motionPreview: "preview-pan",
    lensSpec: "24mm wide-angle cinema lens, expansive horizon depth, warm atmospheric aerial perspective.",
    lightingSpec: "Low-angle golden hour backlight creating warm rim glow on hair and shoulders, soft lens bloom.",
    compositionRule: "Wide establishing hero shot positioning subject off-center with sweeping environmental scale.",
    soulLockDirective: "Preserve subject face, posture, and wardrobe faithfully while integrating natural warm sunset light wrap."
  },
  {
    id: "high-fashion-flash",
    name: "Direct Flash",
    badge: "TREND",
    category: "Camera Presets",
    tag: "Editorial / Paparazzi",
    motionPreview: "preview-flash",
    lensSpec: "35mm compact film camera aesthetic, crisp on-camera direct flash falloff, hard drop shadow behind subject.",
    lightingSpec: "High-energy paparazzi/editorial direct strobe against dimly lit textured interior background.",
    compositionRule: "Slightly tilted Dutch-angle medium shot with raw magazine cover energy.",
    soulLockDirective: "Lock facial likeness, hairstyle, and accessories strictly to reference image under realistic direct flash speculars."
  },
  {
    id: "quiet-luxury",
    name: "Quiet Luxury",
    badge: "SOUL",
    category: "Instagram Aesthetics",
    tag: "Minimal / Architectural",
    motionPreview: "preview-subtle-breath",
    lensSpec: "50mm medium-format portrait lens at f/2.8, refined micro-contrast, creamy tonal transitions, clean architectural geometry.",
    lightingSpec: "Diffused north-facing window daylight bouncing off travertine and warm linen surfaces.",
    compositionRule: "Balanced editorial full-or-three-quarter framing with generous negative space and poised posture.",
    soulLockDirective: "Preserve exact facial proportions, understated fabric textures, and natural complexion from reference."
  },
  {
    id: "cyber-2049",
    name: "2049 Dystopian",
    badge: "SCI-FI",
    category: "Cinema",
    tag: "Atmospheric / Teal-Orange",
    motionPreview: "preview-neon-pulse",
    lensSpec: "40mm Master Anamorphic lens at f/2.0, tall oval bokeh, subtle atmospheric diffusion filter.",
    lightingSpec: "Dense amber fog and cyan volumetric light shafts cutting across brutalist wet concrete.",
    compositionRule: "Monumental architectural scale framing the lone subject cleanly against misty silhouettes.",
    soulLockDirective: "Preserve exact subject identity and silhouette while integrating atmospheric haze and directional rim light."
  }
];

// All 106 Higgsfield Soul Studio Presets [name, category, badge, visualCue]
const SOUL_PRESET_DEFS = [
  ["General", "Cinema", "SOUL", "clean natural editorial look with balanced optics and lifelike skin texture"],
  ["iPhone", "TikTok Core", "MOBILE", "authentic smartphone computational photography look, casual handheld framing, natural HDR"],
  ["Realistic", "Cinema", "REAL", "unretouched photorealistic 50mm portrait with true pores, natural fabric drape, and ambient light"],
  ["DigitalCam", "Camera Presets", "CCD", "retro compact digital camera flash, crisp foreground, slight sensor bloom and candid night vibe"],
  ["Flight mode", "Instagram Aesthetics", "TRAVEL", "window-seat cabin daylight, serene soft cloud reflection, minimal travel lookbook framing"],
  ["Sunset beach", "Instagram Aesthetics", "GOLDEN", "warm coastal golden-hour sun flare, sea breeze hair motion, sandy natural glow"],
  ["Mt. Fuji", "Instagram Aesthetics", "SCENIC", "crisp alpine morning air with distant snow-capped Mt. Fuji skyline and serene wide composition"],
  ["Street view", "TikTok Core", "URBAN", "wide urban crosswalk perspective, passing city motion, candid street-style silhouette"],
  ["Tokyo Streetstyle", "Instagram Aesthetics", "FASHION", "Shibuya/Harajuku asphalt texture, layered streetwear styling, overcast diffused city light"],
  ["Bimbocore", "TikTok Core", "Y2K", "glossy Y2K pink highlights, playful high-flash pop aesthetic, saturated studio sparkle"],
  ["CCTV", "Camera Presets", "FOUND", "elevated corner surveillance camera angle, slight wide-angle distortion, overhead fluorescent pools"],
  ["Elevator Mirror", "TikTok Core", "MIRROR", "brushed-steel elevator mirror selfie framing, overhead warm strip light, candid outfit check"],
  ["Y2K", "TikTok Core", "2000S", "early-2000s glossy magazine aesthetic, metallic accents, cool cyan-magenta studio tint"],
  ["RingSelfie", "TikTok Core", "CREATOR", "crisp circular catchlights in eyes from studio ring light, clean modern creator close-up"],
  ["Spotlight", "Mood", "STAGE", "dramatic narrow theatrical spotlight cutting through pitch-black studio background"],
  ["Y2K Posters", "Graphic Art", "POSTER", "bold graphic magazine poster layout energy, vibrant pop-art color blocking and crisp edges"],
  ["Nail Check", "Beauty", "DETAIL", "tight foreground hand & manicure focus framing face softly in shallow bokeh"],
  ["Gorpcore", "Instagram Aesthetics", "OUTDOOR", "technical outdoor shell fabrics, misty rocky trail backdrop, cool crisp mountain daylight"],
  ["90s Grain", "Camera Presets", "35MM", "tactile 1990s Kodak 35mm film grain, warm shadow lift, nostalgic analog halation"],
  ["0.5 Selfie", "TikTok Core", "0.5X", "ultra-wide 0.5x mobile lens perspective with exaggerated arm reach and dynamic background curvature"],
  ["0.5 Outfit", "TikTok Core", "FIT", "high-angle 0.5x ultra-wide full-outfit check looking down from above eye level"],
  ["Medieval", "Surreal", "EPIC", "dramatic painterly chiaroscuro torchlight, textured stone castle atmosphere, period drapery"],
  ["Japandi", "Instagram Aesthetics", "MINIMAL", "warm oak, raw plaster, shoji-diffused soft daylight, calm wabi-sabi minimalist harmony"],
  ["Coquette core", "Instagram Aesthetics", "SOFT", "delicate pastel daylight, satin ribbon textures, soft dreamy bloom and romantic framing"],
  ["Sand", "Mood", "DESERT", "sculptural desert dune shadows, warm ochre horizon, wind-swept minimalist editorial"],
  ["2000s Cam", "Camera Presets", "DIGI", "early-2000s point-and-shoot flash snapshot, punchy shadow edge, candid party realism"],
  ["Giant Accessory", "Surreal", "SCALE", "playful surreal oversized fashion accessory scale contrast inside clean studio composition"],
  ["HairClips", "Beauty", "HAIR", "close-up editorial beauty styling highlighting sculptural hair clips and luminous skin"],
  ["505room", "Mood", "INDIE", "moody late-night motel/bedroom tungsten lamp glow, nostalgic indie album cover framing"],
  ["Eating Food", "TikTok Core", "CANDID", "unposed cafe table candid moment, warm ambient bistro light, shallow foreground tableware"],
  ["Rainy Day", "Mood", "RAIN", "raindrops streaking glass window, cool overcast reflections, wet street atmosphere"],
  ["Foggy Morning", "Mood", "MIST", "soft morning mist enveloping background trees/buildings, muted pastel atmospheric depth"],
  ["Avant-garde", "Surreal", "ART", "sculptural high-fashion silhouette, bold architectural shadows, gallery-grade composition"],
  ["Tumblr", "Instagram Aesthetics", "2014", "moody 2014 indie monochrome-tinted contrast, soft vignette, nostalgic nocturnal glow"],
  ["Through The Glass", "Mood", "PRISM", "shot through textured window glass with layered city reflections and dreamy foreground blur"],
  ["Vintage PhotoBooth", "Camera Presets", "STRIP", "crisp monochrome/warm flash inside tight vintage curtain photo booth"],
  ["Fisheye", "Camera Presets", "8MM", "extreme 8mm fisheye barrel distortion close to subject, skate-video wide energy"],
  ["Geominimal", "Graphic Art", "GEO", "clean brutalist geometric shadows and crisp architectural color planes"],
  ["7\"", "Graphic Art", "VINYL", "square 7-inch vinyl sleeve art framing, rich analog ink print texture"],
  ["Selfcare", "Beauty", "GLOW", "dewy morning bathroom daylight, soft towel textures, fresh hydrated skin finish"],
  ["Babydoll MakeUp", "Beauty", "DOLL", "luminous porcelain editorial blush, fluttery lash detail, soft diffused beauty dish"],
  ["Fairycore", "Surreal", "DREAM", "ethereal forest sunbeams, iridescent shimmer dust, soft vintage lens glow"],
  ["Office beach", "Surreal", "SURREAL", "surreal juxtaposition of tailored office tailoring on sun-drenched coastal sand"],
  ["Swords Hill", "Surreal", "FANTASY", "windswept dramatic hilltop silhouette with heroic epic storm clouds"],
  ["Amalfi Summer", "Instagram Aesthetics", "SUMMER", "bright Mediterranean sun, terracotta and azure sea bokeh, effortless linen aesthetic"],
  ["Creatures", "Surreal", "FANTASY", "otherworldly biomechanical or mythical surreal couture detail with cinema lighting"],
  ["Grunge", "Mood", "RAW", "gritty 90s basement tungsten flash, distressed textures, raw high-contrast grain"],
  ["Glazed doll skin makeup", "Beauty", "GLASS", "ultra-dewy glass-skin specular highlights, macro beauty lens clarity"],
  ["Invertethereal", "Surreal", "INVERT", "ethereal inverted tonal glow, luminous pale aura against deep velvet shadows"],
  ["Indie sleaze", "TikTok Core", "FLASH", "raw 2008 club paparazzi flash, motion blur streaks, sweat and high-energy candid angle"],
  ["Mixed Media", "Graphic Art", "COLLAGE", "tactile paper cutout accents, halftone ink overlays, mixed-media art direction"],
  ["Paper Face", "Graphic Art", "PRINT", "editorial portrait layered with torn newsprint and graphic typography textures"],
  ["2000s Fashion", "Instagram Aesthetics", "RUNWAY", "archival early-2000s backstage runway look, cool fluorescent flash and glossy fabrics"],
  ["Movie", "Cinema", "ANAMORPH", "2.39:1 widescreen cinema still with anamorphic bokeh and theatrical color grade"],
  ["Overexposed", "Camera Presets", "HIGHKEY", "stylized dreamy overexposed sunlit highlights with soft ethereal skin bloom"],
  ["Long legs", "Instagram Aesthetics", "LOWANG", "low-angle 24mm wide fashion perspective elongating full-body silhouette"],
  ["Night Beach", "Mood", "NIGHT", "flash-lit shoreline against pitch-black crashing ocean waves under moonlight"],
  ["90’s Editorial", "Camera Presets", "MAG", "timeless 1990s Vogue/Harper's studio monochrome & warm film stock elegance"],
  ["Sitting on the Street", "TikTok Core", "STREET", "low-curb seated street portrait with passing urban depth and candid posture"],
  ["Glitch", "Graphic Art", "VHS", "subtle RGB chromatic shift, analog VHS scanline artifacts, cyber-retro edge"],
  ["FashionShow", "Instagram Aesthetics", "CATWALK", "front-row runway spotlight flare, crisp tailored motion, high-energy flash"],
  ["Artwork", "Graphic Art", "PAINT", "expressive fine-art oil brushstroke texture integrated with lifelike subject likeness"],
  ["Graffiti", "Graphic Art", "STREET", "vibrant spray-painted concrete alley backdrop with crisp urban directional light"],
  ["Angel Wings", "Surreal", "ANGEL", "ethereal backlit feathered wing silhouette with soft heavenly rim halo"],
  ["PixeletedFace", "Graphic Art", "PIXEL", "stylized mosaic pixelation framing surrounding sharp high-fashion styling"],
  ["Grillz Selfie", "TikTok Core", "BLING", "close-up direct flash capturing metallic dental jewelry reflections and bold attitude"],
  ["Shoe Check", "TikTok Core", "SNEAKER", "low ground-level sneaker hero perspective looking up toward outfit"],
  ["Bleached Brows", "Beauty", "AVANT", "high-fashion bleached-brow editorial beauty close-up with sculpted cheekbones"],
  ["Object Makeup", "Beauty", "ART", "avant-garde editorial beauty incorporating miniature metallic or pearl facial accents"],
  ["360 cam", "Camera Presets", "360", "tiny-planet / wraparound 360-degree spherical lens curvature"],
  ["Giant People", "Surreal", "GIANT", "towering monumental scale illusion placing giant subject amidst miniature cityscape"],
  ["Help It's Too Big", "Surreal", "MACRO", "playful miniature-world perspective next to gigantic everyday objects"],
  ["Duplicate", "Surreal", "CLONE", "seamless multiple-exposure twin composition within a single architectural frame"],
  ["Library", "Mood", "DARKACAD", "warm brass desk-lamp light amidst towering mahogany bookshelves, dark academia tone"],
  ["Escalator", "Instagram Aesthetics", "TRANSIT", "symmetrical brushed-metal escalator leading lines with cool overhead subway light"],
  ["Gallery", "Instagram Aesthetics", "ART", "clean white-cube museum lighting, minimal concrete floor, contemplative silhouette"],
  ["Crossing the street", "Instagram Aesthetics", "MOTION", "dynamic mid-stride crosswalk shot with slight shutter motion on background crowd"],
  ["Sunbathing", "Instagram Aesthetics", "SUN", "harsh midday pool-deck sunlight, crisp water caustics and warm bronzed skin"],
  ["Subway", "Mood", "TRANSIT", "flickering subway car fluorescent light, scratched window reflections, urban solitude"],
  ["birthday mess", "TikTok Core", "PARTY", "direct-flash cake candles, confetti scatter, candid celebratory midnight energy"],
  ["static glow", "Mood", "CRT", "soft CRT television phosphor glow illuminating face in a darkened room"],
  ["Clouded Dream", "Surreal", "CLOUD", "subject floating amid sunlit cumulus clouds with soft pastel haze"],
  ["Double take", "Camera Presets", "SHUTTER", "slow-shutter ghosting trail capturing dual-motion silhouette in warm club light"],
  ["Red balloon", "Surreal", "CINEMA", "iconic vibrant crimson balloon accent contrasting against muted overcast streets"],
  ["tokyo drift", "TikTok Core", "DRIFT", "wet Tokyo parking-deck neon reflections, JDM automotive glow and dynamic stance"],
  ["Rhyme & blues", "Mood", "SOUL", "smoky jazz-lounge amber backlight, velvet shadows, soulful 70s film richness"],
  ["Bike mafia", "TikTok Core", "MOTO", "aggressive low-angle night motorcycle pack with glowing headlight flares"],
  ["dmv", "Camera Presets", "ID", "flat institutional fluorescent ID-photo lighting against muted pale blue backdrop"],
  ["Sea breeze", "Instagram Aesthetics", "COAST", "soft coastal wind, crisp white linen, natural sparkling ocean horizon"],
  ["It’s french", "Instagram Aesthetics", "PARIS", "Parisian cafe wrought-iron balcony, warm morning croissant light, effortless chic"],
  ["Fish-eye twin", "Camera Presets", "DUO", "ultra-close dual-subject fisheye lens framing with playful dynamic perspective"],
  ["hallway noir", "Mood", "NOIR", "long hotel corridor symmetry, venetian-blind shadow slices and brooding tension"],
  ["burgundy suit", "Instagram Aesthetics", "TAILOR", "rich deep-burgundy tailored suiting lit by warm architectural sconces"],
  ["Nicotine glow", "Mood", "EMBER", "moody nocturnal close-up lit by warm ember practicals and curling haze"],
  ["green editorial", "Mood", "EMERALD", "Wong Kar-wai emerald fluorescent key balanced with warm amber shadow fill"],
  ["afterparty cam", "TikTok Core", "LATE", "3am handheld flash snapshot, warm skin sheen, dreamy bokeh city lights"],
  ["2049", "Surreal", "NEON", "rain-soaked holographic neon orange-teal atmospheric cyberpunk solitude"],
  ["Fireproof", "Surreal", "FIRE", "dramatic golden sparks and warm firelight rim against dark smoke backdrop"],
  ["Night rider", "Mood", "MOTO", "motion-streaked midnight highway lights reflecting off visor and leather"],
  ["chrome exit", "Graphic Art", "CHROME", "liquid chrome specular reflections, futuristic silver metallic studio aesthetic"],
  ["brick shade", "Instagram Aesthetics", "WARM", "sun-baked terracotta brick backdrop with sharp architectural afternoon shadows"],
  ["blackout fit", "Instagram Aesthetics", "MONOCHR", "all-black textured tonal layering against matte charcoal minimalist backdrop"],
  ["cocktail", "Instagram Aesthetics", "LOUNGE", "candlelit crystal glassware bokeh, warm intimate evening glamour"],
  ["mount view", "Instagram Aesthetics", "ALPINE", "panoramic mountain ridge overlook at crisp blue-hour twilight"],
  ["Sunburnt", "Beauty", "SUMMER", "warm sun-kissed golden cheek glow, freckles visible, late-afternoon beach sun"]
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSoulPresets() {
  const existingNames = new Set(CORE_STAGE1_PRESETS.map((p) => p.name.toLowerCase()));
  const out = [...CORE_STAGE1_PRESETS];

  for (const [name, category, badge, visualCue] of SOUL_PRESET_DEFS) {
    if (existingNames.has(name.toLowerCase())) continue;
    existingNames.add(name.toLowerCase());
    const id = `soul-${slugify(name) || "look"}`;
    out.push({
      id,
      name,
      badge,
      category,
      tag: `${category} • Soul`,
      motionPreview:
        category === "Camera Presets"
          ? "preview-flash"
          : category === "Mood"
            ? "preview-neon-pulse"
            : "preview-subtle-breath",
      lensSpec: `Higgsfield ${name} visual grammar: ${visualCue}.`,
      lightingSpec: `Lighting tailored to ${name} style (${visualCue}) with natural highlight roll-off.`,
      compositionRule: `Editorial ${category.toLowerCase()} framing supporting clean subject separation.`,
      soulLockDirective:
        "Preserve exact facial identity, proportions, skin texture, and wardrobe continuity from the uploaded reference image."
    });
  }
  return out;
}

export const STAGE1_PRESETS = buildSoulPresets();

export const STAGE2_CATEGORIES = [
  "All",
  "Dynamic",
  "Orbit",
  "Aerial",
  "Tracking",
  "Classic",
  "Optical",
  "Handheld"
];

// All 33 Cinema Studio 4.0 Camera Movements + FPV Drone Dive + Low-Angle Hero Track (35 total)
export const STAGE2_PRESETS = [
  {
    id: "crash-zoom-in",
    name: "Crush Zoom",
    badge: "SIGNATURE",
    category: "Dynamic",
    motionPreview: "preview-crash-zoom",
    defaultDuration: "5s",
    cameraTrajectory: "Starts on a wide establishing framing, then executes an explosive high-speed optical crash zoom straight into an extreme close-up of the subject's eyes with tight ease-out deceleration.",
    physicsSpec: "Authentic optical focal length compression, subtle directional motion blur during the rapid zoom ramp, micro camera settle at the end frame, zero warping of subject face.",
    audioCue: "Tight rising sub-bass tension sweep peaking with a crisp cinematic whoosh-impact hit on zoom lock, followed by intimate room tone."
  },
  {
    id: "bullet-time-orbit",
    name: "Bullet Time",
    badge: "360 ARC",
    category: "Orbit",
    motionPreview: "preview-orbit",
    defaultDuration: "8s",
    cameraTrajectory: "Smooth 180-degree high-speed circular orbital arc around the subject while the subject's motion slows into ultra-smooth slow motion (time-dilation effect).",
    physicsSpec: "Strong parallax shift across background layers, floating dust/debris or hair strands suspended in slow motion, consistent lighting angle relative to the world.",
    audioCue: "Deep time-slowing low-pass filter hum with subtle spatial wind sweeping left-to-right matching the orbital camera arc."
  },
  {
    id: "fpv-drone-dive",
    name: "FPV Drone Dive",
    badge: "ACTION",
    category: "Aerial",
    motionPreview: "preview-fpv",
    defaultDuration: "8s",
    cameraTrajectory: "High-velocity FPV cinewhoop drone dive swooping down from an elevated high angle, banking smoothly into a tight low pass that skims past the subject and pulls up dynamically.",
    physicsSpec: "Realistic banking roll tilt on turns, natural high-speed shutter motion blur on passing foreground objects, rock-solid geometric continuity.",
    audioCue: "Distant airy wind rush accelerating into a dramatic high-speed air-cut pass-by whoosh, subtle cinematic pulse underneath."
  },
  {
    id: "dolly-push-hero",
    name: "Dolly In",
    badge: "SMOOTH",
    category: "Classic",
    motionPreview: "preview-dolly",
    defaultDuration: "5s",
    cameraTrajectory: "Deliberate, silky-smooth motorized track dolly push-in directly toward the subject at eye level, maintaining rock-steady horizon stabilization.",
    physicsSpec: "Natural foreground parallax widening past the lens edges, subtle natural blinking and breathing of subject, creamy progressive bokeh separation.",
    audioCue: "Subtle atmospheric cinema bed with realistic quiet environmental ambience matching the scene."
  },
  {
    id: "dolly-out-reveal",
    name: "Dolly Out",
    badge: "REVEAL",
    category: "Classic",
    motionPreview: "preview-crane",
    defaultDuration: "5s",
    cameraTrajectory: "Begins in an intimate close-up on the subject and smoothly dollies backward on precision tracks, progressively revealing the surrounding environment and spatial story.",
    physicsSpec: "Consistent focal plane tracking, natural foreground frame-edge reveal, zero geometry pop or background morphing.",
    audioCue: "Intimate close-mic room tone gradually expanding into wide ambient environmental acoustics."
  },
  {
    id: "vertigo-dolly-zoom",
    name: "Dolly Zoom",
    badge: "HITCHCOCK",
    category: "Optical",
    motionPreview: "preview-vertigo",
    defaultDuration: "5s",
    cameraTrajectory: "Classic contra-zoom (dolly zoom): camera physically dollies backward while simultaneously zooming in optically, keeping subject size constant in frame while the background dramatically stretches and compresses.",
    physicsSpec: "Pure optical perspective warp strictly on background geometry while subject proportions and facial identity remain anchored and undistorted.",
    audioCue: "Unsettling subtle rising tonal resonance and low-frequency tension swell synchronized with the perspective shift."
  },
  {
    id: "whip-pan-reveal",
    name: "Whip Pan",
    badge: "TRANSITION",
    category: "Dynamic",
    motionPreview: "preview-whip",
    defaultDuration: "5s",
    cameraTrajectory: "Starts locked on environmental detail, executes an ultra-fast horizontal whip pan with heavy directional streak blur, and snaps sharply onto the hero subject.",
    physicsSpec: "Authentic 180-degree shutter streak blur during peak angular velocity, realistic mechanical overshoot and micro-settle on target lock.",
    audioCue: "Sharp percussive air-whip whoosh transition snapping cleanly into crisp foreground ambient sound."
  },
  {
    id: "snorricam-chest",
    name: "Snorricam",
    badge: "VISCERAL",
    category: "Handheld",
    motionPreview: "preview-handheld",
    defaultDuration: "5s",
    cameraTrajectory: "Body-mounted Snorricam rig locked rigidly facing the subject's face while the entire surrounding environment rushes and tilts dynamically behind them as they move.",
    physicsSpec: "Subject face remains locked dead-center in frame while background architecture streaks past with authentic wide-angle parallax.",
    audioCue: "Tight rhythmic footsteps, close heartbeat/breath presence, and rushing urban or room ambience."
  },
  {
    id: "robot-arm-bolt",
    name: "Robot Arm",
    badge: "BOLT RIG",
    category: "Dynamic",
    motionPreview: "preview-fpv",
    defaultDuration: "5s",
    cameraTrajectory: "High-speed Bolt motion-control robot arm sweep arcing rapidly from a tight low-angle detail into a sharp deceleration whip-stop framing the hero subject.",
    physicsSpec: "Pinpoint robotic ease-in/ease-out velocity curve, crisp optical rack stability, dynamic specular light streaks.",
    audioCue: "Precision mechanical servo-whoosh accented by a tight cinematic bass drop on final frame lock."
  },
  {
    id: "rack-focus-shift",
    name: "Rack Focus",
    badge: "OPTICAL",
    category: "Optical",
    motionPreview: "preview-dolly",
    defaultDuration: "5s",
    cameraTrajectory: "Locked-off tripod or subtle micro-drift shot executing a deliberate cinema follow-focus pull from soft foreground element onto the sharp eyes of the background subject (or reverse).",
    physicsSpec: "Authentic shallow-depth anamorphic focus breathing and creamy circular/oval bokeh bloom during transition.",
    audioCue: "Quiet atmospheric tension bed subtly sharpening in spatial clarity as focus locks onto the subject."
  },
  {
    id: "tilt-up",
    name: "Tilt Up",
    badge: "REVEAL",
    category: "Classic",
    motionPreview: "preview-track",
    defaultDuration: "5s",
    cameraTrajectory: "Smooth fluid-head tripod vertical tilt upward from ground/wardrobe detail slowly ascending to reveal the subject's face and towering overhead architecture.",
    physicsSpec: "Level horizon axis, zero sideways drift, natural vertical perspective shift.",
    audioCue: "Subtle rising atmospheric ambience opening as the camera tilts toward the sky or ceiling."
  },
  {
    id: "tilt-down",
    name: "Tilt Down",
    badge: "DESCEND",
    category: "Classic",
    motionPreview: "preview-crane",
    defaultDuration: "5s",
    cameraTrajectory: "Smooth fluid-head vertical tilt downward from overhead sky or ceiling fixtures onto the hero subject and foreground action.",
    physicsSpec: "Controlled fluid-head deceleration at end frame, crisp optical alignment.",
    audioCue: "Ambient room/street audio grounding smoothly onto foreground subject presence."
  },
  {
    id: "pov-first-person",
    name: "POV",
    badge: "IMMERSIVE",
    category: "Handheld",
    motionPreview: "preview-handheld",
    defaultDuration: "5s",
    cameraTrajectory: "True first-person point-of-view camera eye movement walking forward and turning naturally toward focal objects with human head-turn cadence.",
    physicsSpec: "Authentic human eye-level parallax, natural subtle step bob, realistic peripheral motion.",
    audioCue: "Binaural first-person footsteps, subtle fabric movement, and immediate spatial acoustics."
  },
  {
    id: "pan-left",
    name: "Pan Left",
    badge: "PAN",
    category: "Classic",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Steady tripod-mounted horizontal pan sweeping smoothly from right to left across the scene before settling cleanly on the subject.",
    physicsSpec: "Consistent angular velocity with smooth ease-out lock on final composition.",
    audioCue: "Gentle stereo ambience panning smoothly across the soundfield."
  },
  {
    id: "pan-right",
    name: "Pan Right",
    badge: "PAN",
    category: "Classic",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Steady tripod-mounted horizontal pan sweeping smoothly from left to right across the environment to frame the hero subject.",
    physicsSpec: "Consistent angular velocity with natural cinema shutter cadence and clean horizon.",
    audioCue: "Balanced stereo spatial ambience gliding smoothly left-to-right."
  },
  {
    id: "crane-jib-rise",
    name: "Crane Up",
    badge: "EPIC",
    category: "Aerial",
    motionPreview: "preview-crane",
    defaultDuration: "8s",
    cameraTrajectory: "Begins tight at eye level on the subject, then smoothly ascends upward and backward on a sweeping cinema crane jib to reveal the grand surrounding landscape.",
    physicsSpec: "Graceful vertical parallax expansion, consistent environmental wind physics on hair/foliage, stable light continuity.",
    audioCue: "Expanding wide-stereo environmental soundscape opening up as camera rises into the wider vista."
  },
  {
    id: "crane-down-drop",
    name: "Crane Down",
    badge: "DESCEND",
    category: "Aerial",
    motionPreview: "preview-track",
    defaultDuration: "5s",
    cameraTrajectory: "Starts elevated above the scene looking down, then glides downward smoothly on a cinema crane arm to settle at eye level with the hero subject.",
    physicsSpec: "Balanced vertical horizon leveling, seamless depth transition from wide establishing to intimate portrait.",
    audioCue: "Soft atmospheric air descent fading into clear foreground environmental ambience."
  },
  {
    id: "side-tracking-follow",
    name: "Side Tracking",
    badge: "FOLLOW",
    category: "Tracking",
    motionPreview: "preview-slider",
    defaultDuration: "8s",
    cameraTrajectory: "Parallel lateral tracking shot gliding effortlessly alongside the moving subject at matching speed through foreground pillars or environmental layers.",
    physicsSpec: "Crisp foreground wipe parallax, natural subject stride/motion cadence, stable vertical framing.",
    audioCue: "Steady rhythmic motion ambience with brief acoustic reflections as foreground objects pass camera."
  },
  {
    id: "pedestal-up",
    name: "Pedestal Up",
    badge: "ELEVATE",
    category: "Classic",
    motionPreview: "preview-crane",
    defaultDuration: "5s",
    cameraTrajectory: "Vertical camera column pedestal lift moving straight upward without tilting angle, rising cleanly past foreground tables or barriers to reveal the subject.",
    physicsSpec: "True vertical translation without pitch distortion, crisp foreground reveal parallax.",
    audioCue: "Subtle spatial clarity shift as camera rises above foreground occlusion."
  },
  {
    id: "pedestal-down",
    name: "Pedestal Down",
    badge: "DROP",
    category: "Classic",
    motionPreview: "preview-track",
    defaultDuration: "5s",
    cameraTrajectory: "Vertical camera pedestal descent lowering straight down while keeping horizon perfectly level, transitioning from standing eye-level to low hero stature.",
    physicsSpec: "Pure vertical linear elevation change with smooth motorized damping.",
    audioCue: "Grounded low-level street/floor ambience rising into focus."
  },
  {
    id: "handheld-docu-follow",
    name: "Handheld",
    badge: "RAW",
    category: "Handheld",
    motionPreview: "preview-handheld",
    defaultDuration: "8s",
    cameraTrajectory: "Organic shoulder-rig handheld movement with gentle human breathing sway, subtle micro-adjustments reframing as the subject turns naturally toward the lens.",
    physicsSpec: "Natural optical focus-pull micro-adjustment, authentic candid eye movement and micro-expressions, zero robotic interpolation.",
    audioCue: "Intimate close-mic natural environmental soundscape, subtle breathing and authentic real-world acoustics."
  },
  {
    id: "tracking-shot",
    name: "Tracking",
    badge: "FOLLOW",
    category: "Tracking",
    motionPreview: "preview-track",
    defaultDuration: "8s",
    cameraTrajectory: "Steadicam follow-tracking shot moving dynamically behind or ahead of the subject through the environment at matching velocity.",
    physicsSpec: "Fluid gimbal isolation, realistic footsteps/cloth motion, natural lighting changes across space.",
    audioCue: "Continuous dynamic movement footsteps and evolving environmental room tone."
  },
  {
    id: "low-angle-tracking",
    name: "Low-Angle Track",
    badge: "HERO",
    category: "Tracking",
    motionPreview: "preview-track",
    defaultDuration: "8s",
    cameraTrajectory: "Low-to-the-ground gimbal tracking shot moving backward at matching pace as the subject strides confidently toward camera.",
    physicsSpec: "Realistic cloth dynamics, natural footstep weight transfer, subtle lens flare shifts as overhead lights pass across frame.",
    audioCue: "Crisp rhythmic footsteps on ground surface, subtle fabric rustle, and wide atmospheric street/room ambience."
  },
  {
    id: "drone-orbit-wide",
    name: "Drone Orbit",
    badge: "ORBIT",
    category: "Orbit",
    motionPreview: "preview-orbit",
    defaultDuration: "8s",
    cameraTrajectory: "Sweeping elevated cinema drone orbit circling 120 degrees around the subject and surrounding architecture while maintaining subject centered in frame.",
    physicsSpec: "Expansive multi-plane parallax between foreground, hero subject, and distant skyline with rock-solid horizon stabilization.",
    audioCue: "Open-air cinematic wind ambience and distant environmental spatial texture."
  },
  {
    id: "aerial-pullback",
    name: "Aerial Pullback",
    badge: "SCALE",
    category: "Aerial",
    motionPreview: "preview-crane",
    defaultDuration: "8s",
    cameraTrajectory: "Starts close on the subject, then pulls rapidly backward and upward into a dramatic high-altitude aerial pullback revealing the massive scale of the landscape.",
    physicsSpec: "Smooth exponential speed ramp as camera clears foreground obstacles, realistic atmospheric perspective haze.",
    audioCue: "Gradual transition from intimate foreground acoustics into a vast open-sky wind swell."
  },
  {
    id: "static-cinema-lock",
    name: "Static Shot",
    badge: "LOCKED",
    category: "Classic",
    motionPreview: "preview-subtle-breath",
    defaultDuration: "5s",
    cameraTrajectory: "Rock-solid tripod-locked cinema frame with zero camera translation, letting natural subject micro-acting, wind, lighting, and environmental motion command the shot.",
    physicsSpec: "Zero camera jitter or unintended drift; realistic subtle cloth movement, natural eye blinks, and light shimmer.",
    audioCue: "Clean high-fidelity ambient soundscape anchored naturally to the static visual perspective."
  },
  {
    id: "slow-zoom-in",
    name: "Slow Zoom In",
    badge: "TENSION",
    category: "Optical",
    motionPreview: "preview-dolly",
    defaultDuration: "8s",
    cameraTrajectory: "Hypnotic, ultra-gradual motorized cinema zoom lens creep slowly tightening framing from medium shot onto the subject's eyes without moving camera position.",
    physicsSpec: "Pure optical focal-length elongation subtly compressing background depth over the full duration.",
    audioCue: "Low subtle dramatic room tone and quiet tension drone."
  },
  {
    id: "slow-zoom-out",
    name: "Slow Zoom Out",
    badge: "ISOLATE",
    category: "Optical",
    motionPreview: "preview-crane",
    defaultDuration: "8s",
    cameraTrajectory: "Gradual optical zoom pull-out widening focal length from tight portrait into the solitary subject surrounded by expansive architecture.",
    physicsSpec: "Smooth focal decompression revealing wider environmental context cleanly.",
    audioCue: "Intimate breath/presence opening subtly into wider room acoustics."
  },
  {
    id: "arc-left",
    name: "Arc Left",
    badge: "ARC",
    category: "Orbit",
    motionPreview: "preview-orbit",
    defaultDuration: "5s",
    cameraTrajectory: "Steadicam 90-degree lateral arc sweeping smoothly counter-clockwise (leftward) around the subject from profile to front hero angle.",
    physicsSpec: "Natural light wrap shifting smoothly across facial planes, subtle parallax of background bokeh lights.",
    audioCue: "Smooth spatial room tone shifting subtly across stereo field with the leftward arc."
  },
  {
    id: "arc-right",
    name: "Arc Right",
    badge: "ARC",
    category: "Orbit",
    motionPreview: "preview-orbit",
    defaultDuration: "5s",
    cameraTrajectory: "Steadicam 90-degree lateral arc sweeping smoothly clockwise (rightward) around the subject to reveal background depth.",
    physicsSpec: "Silky circular tracking motion with consistent subject distance and creamy optical bokeh.",
    audioCue: "Balanced environmental ambience panning softly in sync with the rightward arc."
  },
  {
    id: "truck-left",
    name: "Truck Left",
    badge: "LATERAL",
    category: "Tracking",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Camera physically translates straight sideways to the left on a dolly track perpendicular to lens axis, gliding past foreground framing.",
    physicsSpec: "Clean horizontal parallax sweep across foreground, midground, and distant planes.",
    audioCue: "Subtle acoustic shift as camera moves laterally past environmental objects."
  },
  {
    id: "truck-right",
    name: "Truck Right",
    badge: "LATERAL",
    category: "Tracking",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Camera physically translates straight sideways to the right on a precision track perpendicular to lens axis.",
    physicsSpec: "Linear lateral tracking motion with rock-steady horizon and optical focus lock.",
    audioCue: "Natural directional environmental ambience gliding smoothly rightward."
  },
  {
    id: "slider-left",
    name: "Slider Left",
    badge: "SLIDER",
    category: "Classic",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Short-travel precision motorized macro slider gliding smoothly leftward across product or portrait details.",
    physicsSpec: "Crisp specular light reflections sweeping smoothly across surface textures, ultra-shallow depth-of-field glide.",
    audioCue: "Clean minimalist luxury sound design with subtle studio resonance."
  },
  {
    id: "slider-right",
    name: "Slider Right",
    badge: "SLIDER",
    category: "Classic",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Short-travel precision motorized macro slider gliding smoothly rightward with subtle 15-degree rotational arc to catch highlights.",
    physicsSpec: "Crisp metallic/glass reflections gliding cleanly across textures with zero micro-jitter.",
    audioCue: "Minimalist studio ambience with delicate tactile texture audio."
  },
  {
    id: "helicopter-shot",
    name: "Helicopter Shot",
    badge: "CINEMA",
    category: "Aerial",
    motionPreview: "preview-fpv",
    defaultDuration: "8s",
    cameraTrajectory: "High-altitude gyro-stabilized cinema helicopter sweep banking majestically over skyline or terrain while tracking the distant subject/vehicle below.",
    physicsSpec: "Monumental atmospheric aerial parallax, long telephoto compression, wind-swept realism.",
    audioCue: "Deep distant atmospheric wind rush and grand cinematic outdoor soundscape."
  }
];

export const CAMERA_BODIES = [
  { id: "auto", label: "Auto Camera", text: "" },
  { id: "modern", label: "Modern Digital", text: "Shot on large-format modern digital cinema camera with clean shadow detail." },
  { id: "35mm-film", label: "35mm Film", text: "Shot on 35mm motion picture film stock with organic silver-halide grain and halation." },
  { id: "8mm-film", label: "8mm Film", text: "Shot on Super 8mm film with nostalgic texture, organic gate weave, and warm roll-off." },
  { id: "dv-cam", label: "DV Camcorder", text: "Shot on retro MiniDV camcorder aesthetic with authentic early-2000s sensor texture." }
];

export const LENS_TYPES = [
  { id: "auto", label: "Auto Lens", text: "" },
  { id: "clean-sharp", label: "Clean Sharp", text: "Clean sharp modern cinema prime optics." },
  { id: "anamorphic", label: "Anamorphic", text: "Widescreen anamorphic cinema lens with oval bokeh and subtle horizontal flare." },
  { id: "vintage-anamorphic", label: "Vintage Anamorphic", text: "Classic 1970s vintage anamorphic optics with soft edge falloff and amber flare." },
  { id: "warm-vintage", label: "Warm Vintage", text: "Warm vintage prime lens with gentle contrast and golden highlight bloom." },
  { id: "halation-vintage", label: "Halation Vintage", text: "Uncoated vintage glass with glowing red-orange halation around specular highlights." }
];

export const APERTURE_OPTIONS = [
  { id: "auto", label: "Auto Aperture", text: "" },
  { id: "f1.4", label: "f/1.4 Wide Open", text: "Aperture wide open at f/1.4 for razor-thin shallow depth of field." },
  { id: "f4", label: "f/4 Moderate", text: "Balanced f/4 cinema aperture keeping subject crisp with contextual background separation." },
  { id: "f11", label: "f/11 Deep Focus", text: "Deep-focus f/11 aperture keeping foreground and distant environment sharply resolved." }
];

export const FILM_GENRES = [
  { id: "auto", label: "Auto Genre", text: "" },
  { id: "general", label: "General Cinema", text: "prestige cinema drama aesthetic" },
  { id: "action", label: "Action", text: "kinetic blockbuster action cinematography" },
  { id: "epic", label: "Epic", text: "grand monumental epic scale cinematography" },
  { id: "noir", label: "Neo-Noir Thriller", text: "brooding neo-noir thriller atmosphere" },
  { id: "commercial", label: "Luxury Commercial", text: "high-gloss commercial campaign polish" }
];

export const FILM_ERAS = [
  { id: "auto", label: "Auto Era", text: "" },
  { id: "1960s", label: "1960s", text: "1960s classic New Wave film tone" },
  { id: "1980s", label: "1980s", text: "1980s nocturnal analog cinema vibe" },
  { id: "1990s", label: "1990s", text: "1990s tactile independent film color" },
  { id: "2000s", label: "2000s", text: "2000s crisp high-contrast cinema look" },
  { id: "2020s", label: "2020s", text: "2020s contemporary theatrical look" }
];

// All 20 Higgsfield Cinema Studio 4.0 Color Palettes
export const COLOR_PALETTES = [
  { id: "match-ref", label: "Match Reference", swatches: [], text: "" },
  { id: "lime-jam", label: "Lime Jam", swatches: ["#d4ff00", "#1c1f14", "#f4f4f6"], text: "Color palette (Lime Jam): bold contemporary fashion contrast with electric chartreuse-lime accents against deep charcoal." },
  { id: "film-colors", label: "Film Colors", swatches: ["#d99b66", "#2c353d", "#f0e3d0"], text: "Color palette (Film Colors): rich Kodak motion picture film colors with natural skin warmth and balanced shadows." },
  { id: "black-gloss", label: "Black Gloss", swatches: ["#08080a", "#3a3a42", "#e5e7eb"], text: "Color palette (Black Gloss): deep obsidian black gloss, monochrome contrast, and crisp silver speculars." },
  { id: "nostalgic-blue", label: "Nostalgic Blue", swatches: ["#3b607a", "#172533", "#e8d2bc"], text: "Color palette (Nostalgic Blue): cool nostalgic slate blue shadows paired with delicate warm skin highlights." },
  { id: "soft-palette", label: "Soft Palette", swatches: ["#e8dcd0", "#b8a89d", "#6d655f"], text: "Color palette (Soft Palette): gentle low-contrast pastel neutrals, airy highlights, and creamy tonal transition." },
  { id: "candy-pink", label: "Candy Pink", swatches: ["#ff6ec7", "#3b173c", "#ffd6ef"], text: "Color palette (Candy Pink): dreamlike pastel rose, neon magenta reflections, and soft violet shadows." },
  { id: "static-noon", label: "Static Noon", swatches: ["#e6c88a", "#5c6670", "#f5f2ea"], text: "Color palette (Static Noon): sun-bleached high-noon ochre concrete, crisp daylight shadows, desaturated sky." },
  { id: "twilight-fable", label: "Twilight Fable", swatches: ["#3f4c85", "#1c1f3d", "#f2a65a"], text: "Color palette (Twilight Fable): twilight indigo dusk balanced with soft amber practical glows." },
  { id: "back-row-kissing-seats", label: "Back Row Kissing Seats", swatches: ["#9e2a45", "#1b1021", "#f4c2a1"], text: "Color palette (Back Row Kissing Seats): velvet crimson cinema-hall glow, deep plum shadows, warm intimate skin tones." },
  { id: "other-side-porthole", label: "Other Side of Porthole", swatches: ["#2b7a78", "#0e242b", "#d9c2a3"], text: "Color palette (On the Other Side of the Porthole): deep oceanic teal shadows with weathered brass highlights." },
  { id: "emerald-ambush", label: "The Emerald Ambush", swatches: ["#196f52", "#0c221b", "#e3a84f"], text: "Color palette (The Emerald Ambush): moody deep emerald greens with dramatic amber key highlights." },
  { id: "highway-standoff", label: "Highway Standoff", swatches: ["#c96d38", "#2d2420", "#8fb3c9"], text: "Color palette (Highway Standoff): dusty desert rust, burnt asphalt shadow, faded cyan horizon." },
  { id: "faded-fresco", label: "The Faded Fresco", swatches: ["#c7a98b", "#59483b", "#8a9b8e"], text: "Color palette (The Faded Fresco): aged Renaissance plaster tones, sage earth pigments, muted warm highlights." },
  { id: "oil-ochre", label: "Oil & Ochre", swatches: ["#b87a2e", "#2b1d12", "#6e7346"], text: "Color palette (Oil & Ochre): painterly warm ochre, burnt umber, and muted olive tones." },
  { id: "mountain-convent", label: "The Mountain Convent", swatches: ["#6e7f80", "#22292b", "#d6cfc2"], text: "Color palette (The Mountain Convent): austere alpine stone gray, crisp ivory daylight, deep slate shadows." },
  { id: "ghost-in-the-code", label: "Ghost in the Code", swatches: ["#00e5a3", "#0b141a", "#38bdf8"], text: "Color palette (Ghost in the Code): cybernetic phosphor cyan-emerald highlights against deep digital midnight." },
  { id: "pink-velvet", label: "Pink Velvet", swatches: ["#d95380", "#240f19", "#f7cadb"], text: "Color palette (Pink Velvet): lush dusty rose highlights, deep wine-velvet shadows, rich theatrical warmth." },
  { id: "two-days-horizon", label: "Two Days to Horizon", swatches: ["#e09f5a", "#3d2f4a", "#f5dec4"], text: "Color palette (Two Days to the Horizon): sweeping sunset apricot blending into violet dusk haze." },
  { id: "industrial-fog", label: "Industrial Fog", swatches: ["#7c848c", "#1d2024", "#d6a360"], text: "Color palette (Industrial Fog): desaturated steel gray, cold concrete mist, and muted sodium-vapor accents." },
  { id: "stairs-go-up", label: "Stairs Go Up", swatches: ["#4b5563", "#111827", "#f59e0b"], text: "Color palette (Stairs Go Up): architectural charcoal stairwells lit by stark amber practicals." }
];

export const LIGHTING_MOODS = [
  { id: "match-ref", label: "Match Reference", text: "Preserve exact lighting continuity and color grading from the reference keyframe." },
  { id: "auto", label: "Auto Balanced", text: "Natural cinematic exposure with balanced highlight roll-off." },
  { id: "silhouette", label: "Silhouette", text: "Dramatic high-contrast silhouette lighting carving subject rim against bright background." },
  { id: "practicals", label: "Practicals", text: "Motivated practical light sources (lamps, neon signs, screens) within the scene." },
  { id: "window", label: "Window Light", text: "Directional soft natural window light sculpting one side of the face." },
  { id: "overhead-fall", label: "Overhead Fall", text: "Top-down moody overhead spotlight casting atmospheric downward shadows." },
  { id: "contre-jour", label: "Contre Jour", text: "Strong cinematic backlighting with glowing hair rim and subtle lens atmosphere." },
  { id: "soft-cross", label: "Soft Cross", text: "Soft cross-key editorial lighting with smooth shadow wrap." },
  { id: "golden-warm", label: "Golden Hour", text: "Warm low-angle golden sunlight with subtle atmospheric rim glow." },
  { id: "cyber-neon", label: "Moody Neon", text: "Atmospheric nighttime practical neon spill with glossy reflections." },
  { id: "studio-clean", label: "Clean Commercial", text: "Polished commercial softbox lighting with neutral balanced white point." }
];

export const INTENSITY_MODIFIERS = {
  subtle: "restrained, graceful camera velocity with gentle micro-acceleration",
  cinematic: "balanced Hollywood cinema pacing with purposeful ease-in and ease-out curves",
  aggressive: "high-octane, visceral camera momentum with punchy speed-ramping and kinetic energy"
};

export const LIPSYNC_EMOTIONS = [
  { id: "calm", label: "Calm & Intimate", text: "relaxed conversational facial cadence, natural eye contact, subtle micro-expressions" },
  { id: "intense", label: "Intense Drama", text: "focused emotional intensity, taut jaw articulation, expressive eyebrow dynamics" },
  { id: "confident", label: "Confident Presenter", text: "poised authoritative delivery, crisp lip articulation, subtle head emphasis" },
  { id: "whisper", label: "Soft Whisper", text: "intimate close-mic breathy delivery, soft blinking, delicate lip motion" },
  { id: "energetic", label: "High-Energy Creator", text: "animated lively vocal pacing, expressive hands and upbeat facial energy" }
];

export const LIPSYNC_FRAMINGS = [
  { id: "closeup", label: "Tight Talking Head", text: "Medium close-up portrait framed cleanly on head and shoulders for maximum lip-sync accuracy" },
  { id: "medium", label: "Medium Waist-Up", text: "Waist-up cinematic framing allowing natural hand gestures while keeping face sharply resolved" },
  { id: "walk-talk", label: "Walk & Talk Track", text: "Smooth backward steadicam tracking shot as subject speaks directly to lens while walking" }
];

export const LIPSYNC_VOICES = [
  { id: "natural-id", label: "Natural Indonesian", text: "natural Indonesian spoken accent, crisp vocal clarity, close studio mic presence" },
  { id: "natural-en", label: "Natural English", text: "natural English spoken delivery, warm vocal timbre, balanced room acoustics" },
  { id: "cinema-baritone", label: "Cinema Baritone", text: "deep resonant baritone voice with rich chest warmth and theatrical room tone" },
  { id: "crisp-female", label: "Crisp Editorial Voice", text: "clear articulate female vocal presence with clean foreground studio intimacy" }
];

export const MOTION_CONTROL_MODES = [
  { id: "video-bg", label: "Follow Video Scene", text: "Preserve choreography, body cadence, timing, and environmental perspective from the motion reference video." },
  { id: "image-bg", label: "Keep Character Scene", text: "Transfer strictly the subject's skeletal motion and camera rhythm while preserving the background and lighting of the target character image." }
];
