// HiggsFold Studio v2.0 — 2-Stage Director Presets
// Grounded in Higgsfield Cinema Studio 4.0 & Soul Studio architecture:
// Stage 1: Nano Banana 2.1 / Soul Lock (Keyframe, Optics, Aesthetic & Identity Lock)
// Stage 2: Gemini Omni 1.2 Flash (Multi-Move Camera Trajectory + Physics + Native Audio)

export const STAGE1_CATEGORIES = [
  "All",
  "Cinema",
  "Editorial",
  "Retro",
  "Commercial",
  "Night"
];

export const STAGE1_PRESETS = [
  {
    id: "soul-editorial-35mm",
    name: "Editorial 35mm",
    badge: "SOUL LOCK",
    category: "Editorial",
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
    category: "Night",
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
    category: "Commercial",
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
    category: "Editorial",
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
    category: "Editorial",
    tag: "Minimal / Architectural",
    motionPreview: "preview-subtle-breath",
    lensSpec: "50mm medium-format portrait lens at f/2.8, refined micro-contrast, creamy tonal transitions, clean architectural geometry.",
    lightingSpec: "Diffused north-facing window daylight bouncing off travertine and warm linen surfaces.",
    compositionRule: "Balanced editorial full-or-three-quarter framing with generous negative space and poised posture.",
    soulLockDirective: "Preserve exact facial proportions, understated fabric textures, and natural complexion from reference."
  },
  {
    id: "90s-film-grain",
    name: "90s Editorial",
    badge: "RETRO",
    category: "Retro",
    tag: "35mm Analog / Magazine",
    motionPreview: "preview-pan",
    lensSpec: "Contax-style 45mm planar prime on 35mm Kodak Vision3 stock, tactile silver-halide grain, gentle halation on highlights.",
    lightingSpec: "Warm tungsten interior mixed with cool twilight spill, organic contrast curve with lifted matte blacks.",
    compositionRule: "Intimate candid portrait framing with nostalgic 90s fashion editorial attitude.",
    soulLockDirective: "Maintain authentic facial structure, hairstyle, and wardrobe details from reference without modern digital oversharpening."
  },
  {
    id: "2000s-digicam",
    name: "2000s DigiCam",
    badge: "Y2K",
    category: "Retro",
    tag: "CCD Sensor / Night Flash",
    motionPreview: "preview-flash",
    lensSpec: "Early-2000s compact CCD sensor look, 28mm zoom lens, crisp digital sharpness with slight highlight bloom and chromatic edge.",
    lightingSpec: "On-axis pocket flash illuminating foreground subject with moody ambient tungsten background falloff.",
    compositionRule: "Casual waist-up snapshot framing, authentic late-night party or street energy.",
    soulLockDirective: "Lock subject face, expression, and styling from reference with realistic early-digital flash reflectance."
  },
  {
    id: "fisheye-street",
    name: "Fisheye Street",
    badge: "OPTIC",
    category: "Retro",
    tag: "Ultra-Wide / Skate",
    motionPreview: "preview-crash-zoom",
    lensSpec: "8mm–12mm extreme fisheye lens close to subject, pronounced barrel perspective curvature pulling background architecture inward.",
    lightingSpec: "Crisp late-afternoon street sun or harsh urban sodium/LED mix with high dynamic snap.",
    compositionRule: "Dynamic low-angle close-proximity wide shot exaggerating foreground limbs/accessories.",
    soulLockDirective: "Keep subject identity and outfit faithful to reference while applying physically believable ultra-wide lens perspective."
  },
  {
    id: "cyber-2049",
    name: "2049 Dystopian",
    badge: "SCI-FI",
    category: "Night",
    tag: "Atmospheric / Teal-Orange",
    motionPreview: "preview-neon-pulse",
    lensSpec: "40mm Master Anamorphic lens at f/2.0, tall oval bokeh, subtle atmospheric diffusion filter.",
    lightingSpec: "Dense amber fog and cyan volumetric light shafts cutting across brutalist wet concrete.",
    compositionRule: "Monumental architectural scale framing the lone subject cleanly against misty silhouettes.",
    soulLockDirective: "Preserve exact subject identity and silhouette while integrating atmospheric haze and directional rim light."
  },
  {
    id: "green-editorial",
    name: "Green Editorial",
    badge: "FASHION",
    category: "Editorial",
    tag: "Cinema / Emerald Cast",
    motionPreview: "preview-shimmer",
    lensSpec: "65mm cinema prime at f/2.2, crisp textile resolution, subtle halation around practical lamps.",
    lightingSpec: "Wong Kar-wai inspired emerald fluorescent key balanced with warm amber shadow fill.",
    compositionRule: "Off-center tight medium shot framed through foreground glass or doorway geometry.",
    soulLockDirective: "Retain subject facial likeness and skin realism accurately beneath stylized green/amber cinema grading."
  },
  {
    id: "cctv-found-footage",
    name: "CCTV Angle",
    badge: "FOUND",
    category: "Night",
    tag: "High-Angle / Surveillance",
    motionPreview: "preview-handheld",
    lensSpec: "Elevated security wide-angle lens, subtle digital compression texture, slight edge barrel distortion.",
    lightingSpec: "Overhead fluorescent or sodium streetlamp pools casting realistic downward shadows.",
    compositionRule: "High-corner 35-degree downward surveillance angle capturing subject within full spatial context.",
    soulLockDirective: "Keep subject recognizable identity, posture, and wardrobe consistent with reference from the elevated camera angle."
  },
  {
    id: "high-key-beauty",
    name: "Clean Beauty",
    badge: "BEAUTY",
    category: "Commercial",
    tag: "Studio / Skincare",
    motionPreview: "preview-shimmer",
    lensSpec: "100mm macro portrait lens at f/5.6, pristine optical clarity, luminous skin micro-texture without plastic smoothing.",
    lightingSpec: "Wraparound clamshell beauty dish with crisp catchlights in eyes and soft seamless studio backdrop.",
    compositionRule: "Tight symmetrical beauty framing focused cleanly on face, collarbones, and product interaction.",
    soulLockDirective: "Preserve natural pores, freckles, exact eye shape, and product label details from reference."
  }
];

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

export const STAGE2_PRESETS = [
  {
    id: "crash-zoom-in",
    name: "Crash Zoom In",
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
    name: "Bullet Time Orbit",
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
    name: "Dolly Zoom (Vertigo)",
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
    id: "low-angle-tracking",
    name: "Low-Angle Track",
    badge: "TRACKING",
    category: "Tracking",
    motionPreview: "preview-track",
    defaultDuration: "8s",
    cameraTrajectory: "Low-to-the-ground gimbal tracking shot moving backward at matching pace as the subject strides confidently toward camera.",
    physicsSpec: "Realistic cloth dynamics, natural footstep weight transfer, subtle lens flare shifts as overhead lights pass across frame.",
    audioCue: "Crisp rhythmic footsteps on ground surface, subtle fabric rustle, and wide atmospheric street/room ambience."
  },
  {
    id: "handheld-docu-follow",
    name: "Handheld Intimate",
    badge: "RAW",
    category: "Handheld",
    motionPreview: "preview-handheld",
    defaultDuration: "8s",
    cameraTrajectory: "Organic shoulder-rig handheld movement with gentle human breathing sway, subtle micro-adjustments reframing as the subject turns naturally toward the lens.",
    physicsSpec: "Natural optical focus-pull micro-adjustment, authentic candid eye movement and micro-expressions, zero robotic interpolation.",
    audioCue: "Intimate close-mic natural environmental soundscape, subtle breathing and authentic real-world acoustics."
  },
  {
    id: "crane-jib-rise",
    name: "Crane Up",
    badge: "EPIC",
    category: "Aerial",
    motionPreview: "preview-crane",
    defaultDuration: "8s",
    cameraTrajectory: "Begins tight at eye level on the subject, then smoothly ascends upward and backward on a sweeping cinema crane jib to reveal the grand surrounding landscape.",
    physicsSpec: "Graceful vertical parallax expansion, consistent environmental wind physics on hair/foliage, stable golden/ambient light continuity.",
    audioCue: "Expanding wide-stereo environmental soundscape opening up as camera rises into the wider vista."
  },
  {
    id: "crane-down-drop",
    name: "Crane Down",
    badge: "DESCEND",
    category: "Aerial",
    motionPreview: "preview-track",
    defaultDuration: "5s",
    cameraTrajectory: "Starts elevated above the scene looking down at architectural lines, then glides downward smoothly on a cinema crane arm to settle at eye level with the hero subject.",
    physicsSpec: "Balanced vertical horizon leveling, seamless depth transition from wide establishing to intimate eye-level portrait.",
    audioCue: "Soft atmospheric air descent fading into clear foreground environmental ambience."
  },
  {
    id: "macro-product-glider",
    name: "Slider Lateral",
    badge: "COMMERCIAL",
    category: "Classic",
    motionPreview: "preview-slider",
    defaultDuration: "5s",
    cameraTrajectory: "Precision motorized macro slider glide moving laterally across the subject or product surface with a subtle 15-degree rotational arc to catch specular light highlights.",
    physicsSpec: "Crisp metallic/glass light reflections sweeping smoothly across surface textures, ultra-shallow macro depth-of-field plane glide.",
    audioCue: "Clean minimalist luxury sound design with subtle crystalline shimmer and quiet studio resonance."
  },
  {
    id: "snorricam-chest",
    name: "Snorricam Rig",
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
    name: "Robot Arm Bolt",
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
    id: "arc-around-subject",
    name: "Arc Left / Right",
    badge: "ARC",
    category: "Orbit",
    motionPreview: "preview-orbit",
    defaultDuration: "5s",
    cameraTrajectory: "Steadicam 90-degree lateral arc sweeping smoothly around the side of the subject from profile to three-quarter front hero angle.",
    physicsSpec: "Natural light wrap shifting smoothly across facial planes, subtle parallax of background bokeh lights.",
    audioCue: "Smooth spatial room tone shifting subtly across stereo field with the camera arc."
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
    id: "static-cinema-lock",
    name: "Static Locked",
    badge: "LOCKED",
    category: "Classic",
    motionPreview: "preview-subtle-breath",
    defaultDuration: "5s",
    cameraTrajectory: "Rock-solid tripod-locked cinema frame with zero camera translation, letting natural subject micro-acting, wind, lighting, and environmental motion command the shot.",
    physicsSpec: "Zero camera jitter or unintended drift; realistic subtle cloth movement, natural eye blinks, and light shimmer.",
    audioCue: "Clean high-fidelity ambient soundscape anchored naturally to the static visual perspective."
  }
];

export const CAMERA_BODIES = [
  { id: "auto", label: "Auto Camera", text: "" },
  { id: "modern", label: "Modern Digital", text: "Shot on large-format modern digital cinema camera with clean shadow detail." },
  { id: "35mm-film", label: "35mm Film", text: "Shot on 35mm motion picture film stock with organic silver-halide grain and halation." },
  { id: "8mm-film", label: "8mm Vintage", text: "Shot on Super 8mm film with nostalgic texture, organic gate weave, and warm roll-off." },
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
  { id: "general", label: "Cinema Drama", text: "prestige cinema drama aesthetic" },
  { id: "action", label: "High-Octane Action", text: "kinetic blockbuster action cinematography" },
  { id: "epic", label: "Monumental Epic", text: "grand monumental epic scale cinematography" },
  { id: "noir", label: "Neo-Noir Thriller", text: "brooding neo-noir thriller atmosphere" },
  { id: "commercial", label: "Luxury Commercial", text: "high-gloss commercial campaign polish" }
];

export const FILM_ERAS = [
  { id: "auto", label: "Auto Era", text: "" },
  { id: "1960s", label: "1960s Classic", text: "1960s classic New Wave film tone" },
  { id: "1980s", label: "1980s Analog", text: "1980s nocturnal analog cinema vibe" },
  { id: "1990s", label: "1990s Indie", text: "1990s tactile independent film color" },
  { id: "2000s", label: "2000s Digital", text: "2000s crisp high-contrast cinema look" },
  { id: "2020s", label: "2020s Contemporary", text: "2020s contemporary theatrical look" }
];

export const COLOR_PALETTES = [
  { id: "match-ref", label: "Match Reference", text: "" },
  { id: "film-colors", label: "Film Colors", text: "Color palette: rich Kodak motion picture film colors with natural skin warmth." },
  { id: "black-gloss", label: "Black Gloss", text: "Color palette: deep obsidian black gloss, monochrome contrast, and crisp silver highlights." },
  { id: "nostalgic-blue", label: "Nostalgic Blue", text: "Color palette: nostalgic cool slate blue shadows paired with delicate warm skin highlights." },
  { id: "twilight-fable", label: "Twilight Fable", text: "Color palette: twilight indigo dusk balanced with soft amber practical glows." },
  { id: "oil-ochre", label: "Oil & Ochre", text: "Color palette: painterly warm ochre, burnt umber, and muted olive tones." },
  { id: "industrial-fog", label: "Industrial Fog", text: "Color palette: desaturated steel gray, cold concrete mist, and muted tungsten accents." },
  { id: "lime-jam", label: "Lime Jam", text: "Color palette: bold contemporary fashion contrast with electric chartreuse-lime accents against dark charcoal." },
  { id: "candy-pink", label: "Candy Pink", text: "Color palette: dreamlike pastel rose, neon magenta reflections, and soft violet shadows." },
  { id: "emerald-ambush", label: "Emerald Ambush", text: "Color palette: moody deep emerald greens with dramatic amber key highlights." }
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
