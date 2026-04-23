var avatarConfig = {x: 35, y: 35, w: 0, h: 0, scale: 0.85, initialized: false, dragging: false, dragOffX: 0, dragOffY: 0};
var logoConfig = {x: 1620, y: 920, w: 0, h: 0, scale: 0.54, initialized: false, dragging: false, dragOffX: 0, dragOffY: 0};

// Try to load saved positions
try {
  let savedAv = localStorage.getItem('anjaliAvatarPos');
  if (savedAv) {
      let j = JSON.parse(savedAv);
      avatarConfig.x = j.x; avatarConfig.y = j.y; avatarConfig.scale = j.scale || 0.8; 
      avatarConfig.initialized = true; // DO NOT OVERWRITE
  }
  let savedLogo = localStorage.getItem('logoSpritePos');
  if (savedLogo) {
      let j = JSON.parse(savedLogo);
      logoConfig.x = j.x; logoConfig.y = j.y; logoConfig.scale = j.scale || 0.54;
      logoConfig.initialized = true; // DO NOT OVERWRITE
  }
} catch (e) {}

const lessonInput = document.getElementById("lessonInput");
const mathsSourceInput = document.getElementById("mathsSourceInput");
const translateMathsBtn = document.getElementById("translateMathsBtn");
const clearMathsSourceBtn = document.getElementById("clearMathsSourceBtn");
const mathsAutoTranslateToggle = document.getElementById("mathsAutoTranslateToggle");
const mathsTranslateProgress = document.getElementById("mathsTranslateProgress");
const mathsTranslateProgressBar = document.getElementById("mathsTranslateProgressBar");
const mathsTranslateProgressLabel = document.getElementById("mathsTranslateProgressLabel");
const mathsTranslationPreview = document.getElementById("mathsTranslationPreview");
const mathsTranslatorStatus = document.getElementById("mathsTranslatorStatus");
const placeValueNumberInput = document.getElementById("placeValueNumberInput");
const placeValueSystemSelect = document.getElementById("placeValueSystemSelect");
const applyPlaceValueTableBtn = document.getElementById("applyPlaceValueTableBtn");
const showPlaceValueTableBtn = document.getElementById("showPlaceValueTableBtn");
const placeValueToolStatus = document.getElementById("placeValueToolStatus");
const workflowStepButtons = Array.from(document.querySelectorAll("[data-workflow-target]"));
const presentationTemplateInputs = Array.from(document.querySelectorAll('input[name="presentationTemplate"]'));
const presentationTemplateStatus = document.getElementById("presentationTemplateStatus");
const outcomesTitleInput = document.getElementById("outcomesTitleInput");
const saveOutcomesTitleBtn = document.getElementById("saveOutcomesTitleBtn");
const outcomesTitleStatus = document.getElementById("outcomesTitleStatus");
const inputPanel = document.getElementById("inputPanel");
const stagePanel = document.getElementById("stagePanel");
const themeSelect = document.getElementById("themeSelect");
const themeToggle = document.getElementById("themeToggle");
const themeModeLabel = document.getElementById("themeModeLabel");
const textColorSelect = document.getElementById("textColorSelect");
const boldToggleBtn = document.getElementById("boldToggleBtn");
const italicToggleBtn = document.getElementById("italicToggleBtn");
const underlineToggleBtn = document.getElementById("underlineToggleBtn");
const caseOriginalBtn = document.getElementById("caseOriginalBtn");
const caseLowerBtn = document.getElementById("caseLowerBtn");
const caseTitleBtn = document.getElementById("caseTitleBtn");
const caseUpperBtn = document.getElementById("caseUpperBtn");
const insertSpaceBtn = document.getElementById("insertSpaceBtn");
const insertNewLineBtn = document.getElementById("insertNewLineBtn");
const insertTabBtn = document.getElementById("insertTabBtn");
const insertBulletBtn = document.getElementById("insertBulletBtn");
const insertArrowBtn = document.getElementById("insertArrowBtn");
const insertMultiplyBtn = document.getElementById("insertMultiplyBtn");
const insertDivideBtn = document.getElementById("insertDivideBtn");
const insertLessEqualBtn = document.getElementById("insertLessEqualBtn");
const insertGreaterEqualBtn = document.getElementById("insertGreaterEqualBtn");
const insertRupeeBtn = document.getElementById("insertRupeeBtn");
const spacingToolsStatus = document.getElementById("spacingToolsStatus");
const selectionStyleCard = document.getElementById("selectionStyleCard");
const selectedKeywordLabel = document.getElementById("selectedKeywordLabel");
const selectedTextColorSelect = document.getElementById("selectedTextColorSelect");
const selectedBoldToggleBtn = document.getElementById("selectedBoldToggleBtn");
const selectedItalicToggleBtn = document.getElementById("selectedItalicToggleBtn");
const selectedUnderlineToggleBtn = document.getElementById("selectedUnderlineToggleBtn");
const applySelectedStyleBtn = document.getElementById("applySelectedStyleBtn");
const clearSelectedStyleBtn = document.getElementById("clearSelectedStyleBtn");
const selectionStyleStatus = document.getElementById("selectionStyleStatus");
const scenePromptInput = document.getElementById("scenePromptInput");
const sceneVfxSelect = document.getElementById("sceneVfxSelect");
const sceneMusicModeSelect = document.getElementById("sceneMusicModeSelect");
const exportQualitySelect = document.getElementById("exportQualitySelect");
const sceneImageInput = document.getElementById("sceneImageInput");
const sceneImagePreviewList = document.getElementById("sceneImagePreviewList");
const sceneMusicInput = document.getElementById("sceneMusicInput");
const sceneMusicPreview = document.getElementById("sceneMusicPreview");
const sceneMusicStatus = document.getElementById("sceneMusicStatus");
const generateSceneBtn = document.getElementById("generateSceneBtn");
const generateSceneShowBtn = document.getElementById("generateSceneShowBtn");
const clearSceneBtn = document.getElementById("clearSceneBtn");
const sceneGenerationProgress = document.getElementById("sceneGenerationProgress");
const sceneGenerationProgressBar = document.getElementById("sceneGenerationProgressBar");
const sceneGenerationProgressLabel = document.getElementById("sceneGenerationProgressLabel");
const sceneGeneratorStatus = document.getElementById("sceneGeneratorStatus");
const scenePreviewStage = document.getElementById("scenePreviewStage");
const scenePreviewLabel = document.getElementById("scenePreviewLabel");
const sceneThemeChip = document.getElementById("sceneThemeChip");
const sceneVfxChip = document.getElementById("sceneVfxChip");
const sceneMusicChip = document.getElementById("sceneMusicChip");
const sceneExportChip = document.getElementById("sceneExportChip");
const scenePreviewImage = document.getElementById("scenePreviewImage");
const scenePreviewHint = document.getElementById("scenePreviewHint");
const showScreenBtn = document.getElementById("showScreenBtn");
const editBtn = document.getElementById("editBtn");
const playBtn = document.getElementById("playBtn");
const playbackPercentIndicator = document.getElementById("playbackPercentIndicator");
const taskPercentIndicator = document.getElementById("taskPercentIndicator");
const pauseStageBtn = document.getElementById("pauseStageBtn");
const stopStageBtn = document.getElementById("stopStageBtn");
const stageImageUploadBtn = document.getElementById("stageImageUploadBtn");
const stageVideoUploadBtn = document.getElementById("stageVideoUploadBtn");
const stageImageCutoutBtn = document.getElementById("stageImageCutoutBtn");
const stageImageRestoreBtn = document.getElementById("stageImageRestoreBtn");
const stageVideoCutoutBtn = document.getElementById("stageVideoCutoutBtn");
const stageVideoRestoreBtn = document.getElementById("stageVideoRestoreBtn");
const stageAutoTeachBtn = document.getElementById("stageAutoTeachBtn");
const stageAutoBRollBtn = document.getElementById("stageAutoBRollBtn");
const stageRemoveImageBtn = document.getElementById("stageRemoveImageBtn");
const stageClearImagesBtn = document.getElementById("stageClearImagesBtn");
const stageRemoveVideoBtn = document.getElementById("stageRemoveVideoBtn");
const stageMediaStatus = document.getElementById("stageMediaStatus");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomValue = document.getElementById("zoomValue");
const fontDecreaseBtn = document.getElementById("fontDecreaseBtn");
const fontIncreaseBtn = document.getElementById("fontIncreaseBtn");
const fontValue = document.getElementById("fontValue");
const downloadBtn = document.getElementById("downloadBtn");
const downloadPdfContextBtn = document.getElementById("downloadPdfContextBtn");
const stageBoldBtn = document.getElementById("stageBoldBtn");
const stageItalicBtn = document.getElementById("stageItalicBtn");
const stageUnderlineBtn = document.getElementById("stageUnderlineBtn");
const stageTimelineCard = document.getElementById("stageTimelineCard");
const stageTimelineMeta = document.getElementById("stageTimelineMeta");
const stageModeBadge = document.getElementById("stageModeBadge");
const stageTimelineInput = document.getElementById("stageTimelineInput");
const stageCurrentTime = document.getElementById("stageCurrentTime");
const stageDuration = document.getElementById("stageDuration");
const seekBackwardBtn = document.getElementById("seekBackwardBtn");
const seekForwardBtn = document.getElementById("seekForwardBtn");
const playbackSpeedSelect = document.getElementById("playbackSpeedSelect");
const stagePlaybackSpeedSelect = document.getElementById("stagePlaybackSpeedSelect");
const stageToolbarGroups = Array.from(document.querySelectorAll(".stage-actions .stage-toolbar-group"));
const statusText = document.getElementById("statusText");
const imageInput = document.getElementById("imageInput");
const imageCutoutStatus = document.getElementById("imageCutoutStatus");
const cutoutToleranceInput = document.getElementById("cutoutToleranceInput");
const cutoutToleranceValue = document.getElementById("cutoutToleranceValue");
const cutoutFeatherInput = document.getElementById("cutoutFeatherInput");
const cutoutFeatherValue = document.getElementById("cutoutFeatherValue");
const cutoutSpillInput = document.getElementById("cutoutSpillInput");
const cutoutSpillValue = document.getElementById("cutoutSpillValue");
const cutoutScreenBlendInput = document.getElementById("cutoutScreenBlendInput");
const cutoutScreenBlendValue = document.getElementById("cutoutScreenBlendValue");
const cutoutControlsStatus = document.getElementById("cutoutControlsStatus");
const imagePreviewList = document.getElementById("imagePreviewList");
const introClipEnabled = document.getElementById("introClipEnabled");
const introClipStatus = document.getElementById("introClipStatus");

const proCaptionsEnabled = document.getElementById("proCaptionsEnabled");
const proAnimationsEnabled = document.getElementById("proAnimationsEnabled");
const proQuizEnabled = document.getElementById("proQuizEnabled");
const proDuckingEnabled = document.getElementById("proDuckingEnabled");

const videoInput = document.getElementById("videoInput");
const clearVideoBtn = document.getElementById("clearVideoBtn");
const videoPreview = document.getElementById("videoPreview");
const videoPreviewList = document.getElementById("videoPreviewList");
const videoStatus = document.getElementById("videoStatus");
const startServersBtn = document.getElementById("startServersBtn");
const copyStartAllBtn = document.getElementById("copyStartAllBtn");
const checkServersBtn = document.getElementById("checkServersBtn");
const serverControlsStatus = document.getElementById("serverControlsStatus");
const narrationHealthStatus = document.getElementById("narrationHealthStatus");
const anjaliCloneHealthStatus = document.getElementById("anjaliCloneHealthStatus");
const transcribeHealthStatus = document.getElementById("transcribeHealthStatus");
const videoExportHealthStatus = document.getElementById("videoExportHealthStatus");
const dictateBtn = document.getElementById("dictateBtn");
const stopDictateBtn = document.getElementById("stopDictateBtn");
const previewTextBtn = document.getElementById("previewTextBtn");
const stopPreviewBtn = document.getElementById("stopPreviewBtn");
const previewVoiceChooser = document.getElementById("previewVoiceChooser");
const previewMaleBtn = document.getElementById("previewMaleBtn");
const previewFemaleBtn = document.getElementById("previewFemaleBtn");
const previewIndianFemaleBtn = document.getElementById("previewIndianFemaleBtn");
const previewFreshBtn = document.getElementById("previewFreshBtn");
const previewAnjaliBtn = document.getElementById("previewAnjaliBtn");
const slideVoiceSelect = document.getElementById("slideVoiceSelect");
const speechToolsStatus = document.getElementById("speechToolsStatus");
const loadMathsNumbersBtn = document.getElementById("loadMathsNumbersBtn");
const loadMathsOperationsBtn = document.getElementById("loadMathsOperationsBtn");
const loadMathsTablesBtn = document.getElementById("loadMathsTablesBtn");
const loadMathsSumsBtn = document.getElementById("loadMathsSumsBtn");
const loadMathsPronunciationBtn = document.getElementById("loadMathsPronunciationBtn");
const loadTable2Btn = document.getElementById("loadTable2Btn");
const loadTable3Btn = document.getElementById("loadTable3Btn");
const loadTable4Btn = document.getElementById("loadTable4Btn");
const loadTable5Btn = document.getElementById("loadTable5Btn");
const loadTable10Btn = document.getElementById("loadTable10Btn");
const loadTableComboBtn = document.getElementById("loadTableComboBtn");
const anjaliSampleAudio = document.getElementById("anjaliSampleAudio");
const useAnjaliSampleBtn = document.getElementById("useAnjaliSampleBtn");
const mathsHelperStatus = document.getElementById("mathsHelperStatus");
const pdfInput = document.getElementById("pdfInput");
const pdfShowBtn = document.getElementById("pdfShowBtn");
const pdfPresentBtn = document.getElementById("pdfPresentBtn");
const pdfSelectAllBtn = document.getElementById("pdfSelectAllBtn");
const pdfClearSelectionBtn = document.getElementById("pdfClearSelectionBtn");
const clearPdfBtn = document.getElementById("clearPdfBtn");
const pdfProgress = document.getElementById("pdfProgress");
const pdfProgressBar = document.getElementById("pdfProgressBar");
const pdfProgressLabel = document.getElementById("pdfProgressLabel");
const pdfStatus = document.getElementById("pdfStatus");
const pdfMeta = document.getElementById("pdfMeta");
const pdfPageSelectionSummary = document.getElementById("pdfPageSelectionSummary");
const pdfPageList = document.getElementById("pdfPageList");
const pdfPreviewList = document.getElementById("pdfPreviewList");
const transcribeAudioInput = document.getElementById("transcribeAudioInput");
const submitTranscribeBtn = document.getElementById("submitTranscribeBtn");
const transcribeProgress = document.getElementById("transcribeProgress");
const transcribeProgressBar = document.getElementById("transcribeProgressBar");
const transcribeProgressLabel = document.getElementById("transcribeProgressLabel");
const transcribeStatus = document.getElementById("transcribeStatus");
const audioInput = document.getElementById("audioInput");
const audioStatus = document.getElementById("audioStatus");
const audioPreview = document.getElementById("audioPreview");
const recordBtn = document.getElementById("recordBtn");
const stopRecordBtn = document.getElementById("stopRecordBtn");
const clearAudioBtn = document.getElementById("clearAudioBtn");
const loadAnjaliNarrationBtn = document.getElementById("loadAnjaliNarrationBtn");
const downloadAnjaliBtn = document.getElementById("downloadAnjaliBtn");
const downloadMaleBtn = document.getElementById("downloadMaleBtn");
const downloadFemaleBtn = document.getElementById("downloadFemaleBtn");
const downloadIndianFemaleBtn = document.getElementById("downloadIndianFemaleBtn");
const downloadFreshBtn = document.getElementById("downloadFreshBtn");
const narrationGenStatus = document.getElementById("narrationGenStatus");
const narrationLiveIndicator = document.getElementById("narrationLiveIndicator");
const narrationLiveProgressFill = document.getElementById("narrationLiveProgressFill");
const narrationLiveProgressLabel = document.getElementById("narrationLiveProgressLabel");
const previewCanvas = document.getElementById("previewCanvas");
let canvas = previewCanvas;
let ctx = canvas.getContext("2d");
applyHighQualityImageRendering(ctx);
const stageLogoImage = document.getElementById("stageLogoImage");
const THEME_STORAGE_KEY = "learning-outcomes-theme";
const PRESENTATION_TEMPLATE_STORAGE_KEY = "learning-outcomes-presentation-template";
const OUTCOMES_TITLE_STORAGE_KEY = "learning-outcomes-template-title";
const VIDEO_EXPORT_HEALTH_TIMEOUT_MS = 12000;
const VIDEO_EXPORT_HEALTH_GRACE_MS = 45000;
const MAX_IMAGE_UPLOADS = 12;
const SLIDE_IMAGES_PER_PAGE = 4;
const LOGO_SOURCE_BOUNDS = {
  x: 36,
  y: 19,
  width: 656,
  height: 208
};
const LOGO_WIDTH_COMPRESSION = 0.94;
const PREVIEW_ZOOM_MIN = 0.8;
const PREVIEW_ZOOM_MAX = 1.6;
const PREVIEW_ZOOM_STEP = 0.1;
const FONT_SCALE_MIN = 0.8;
const FONT_SCALE_MAX = 1.6;
const FONT_SCALE_STEP = 0.1;
const PDF_JS_FILE = "pdf.min.js";
const PDF_JS_WORKER_FILE = "pdf.worker.min.js";
const PDF_RENDER_SCALE_MIN = 1.6;
const PDF_RENDER_SCALE_MAX = 3.2;
const PDF_RENDER_TARGET_MAX_WIDTH_PX = 2200;
const PDF_RENDER_TARGET_MAX_HEIGHT_PX = 2800;
const PDF_STAGE_SEEK_STEP_MS = 5000;
const PDF_FACE_MASK_PADDING_X = 1.2;
const PDF_FACE_MASK_PADDING_TOP = 1.4;
const PDF_FACE_MASK_PADDING_BOTTOM = 3.4;
const PDF_FACE_MASK_MIN_SIZE = 28;
const PDF_EXAMPLE_IMAGE_MAX_PER_PAGE = 4;
const PDF_EXAMPLE_IMAGE_MIN_WIDTH_PX = 180;
const PDF_EXAMPLE_IMAGE_MIN_HEIGHT_PX = 110;
const PDF_CLIPBOARD_MARKER_ATTRIBUTE = "data-maths-teacher-pdf-copy";
const MUX_PACKAGE_MAGIC = "LOMUX1";
const STAGE_VIDEO_MAX_DIMENSION = 1280;
const STAGE_VIDEO_CUTOUT_TOLERANCE = 66;
const STAGE_VIDEO_EDGE_FEATHER = 22;
const DEFAULT_INTRO_VIDEO_FILE = "default-intro.mp4";
const ANJALI_SAMPLE_AUDIO_FILE = "voice-preview-anjali.mp3";
const EXPORT_NARRATION_VOICE = "anjali";
const PRESENTATION_TEMPLATE_CLASSIC = "classic";
const PRESENTATION_TEMPLATE_OUTCOMES = "learning-outcomes";
// Central classroom-voice tuning keeps pronunciation behavior easy to adjust later.
const NARRATION_STYLE_PROMPT = "Speak in a natural Indian female teacher voice with clear Indian English pronunciation. Pronounce every word, number, unit, and maths symbol carefully. Keep the accent Indian, warm, and classroom-ready. Use a calm teaching pace, clear pauses, and highly intelligible school pronunciation. Avoid foreign accent drift, rushed speech, swallowed syllables, and casual delivery.";
const NARRATION_STYLE_CONFIG = Object.freeze({
  locale: "en-IN",
  accent: "indian-female-english",
  pacing: "calm-slower-classroom",
  pronunciationMode: "strict-maths-teacher",
  stylePrompt: NARRATION_STYLE_PROMPT
});
const ANJALI_TTS_PROFILE = Object.freeze({
  voiceId: "anjali",
  gender: "female",
  locale: "en-IN",
  accent: "indian",
  style: "soft-natural-classroom",
  pronunciationMode: NARRATION_STYLE_CONFIG.pronunciationMode,
  stylePrompt: NARRATION_STYLE_CONFIG.stylePrompt
});
const ANJALI_GENERATION_OPTIONS = Object.freeze({
  repetitionPenalty: 1.12,
  topP: 0.88,
  temperature: 0.58,
  topK: 64,
  cfgWeight: 0,
  exaggeration: 0,
  minP: 0,
  normLoudness: true
});
const STAGE_LEFT_CONTENT_GAP_PX = 132;
const STAGE_RIGHT_CLEAR_GAP_PX = 380;
const STAGE_TEXT_SIDE_MARGIN_PX = 64;
const STAGE_TEXT_TOP_MARGIN_PX = 32;
const STAGE_TEXT_BOTTOM_MARGIN_PX = 42;
const STAGE_IMAGE_WORKSPACE_PADDING_PX = 34;
const STAGE_IMAGE_WORKSPACE_TOP_PX = 18;
const STAGE_IMAGE_WORKSPACE_BOTTOM_PX = 20;
const STAGE_PDF_IMAGE_STRIP_WIDTH_PX = 320;
const STAGE_PDF_IMAGE_STRIP_GAP_PX = 18;
const STAGE_IMAGE_MIN_WIDTH_PX = 72;
const STAGE_IMAGE_MIN_HEIGHT_PX = 72;
const STAGE_IMAGE_HANDLE_SIZE_PX = 16;
const NARRATION_CHUNK_MAX_LENGTH = 560;
const NARRATION_CHUNK_THRESHOLD = 1800;
const ANJALI_NARRATION_CHUNK_MAX_LENGTH = 220;
const ANJALI_NARRATION_CHUNK_THRESHOLD = 260;
const DEFAULT_STAGE_PLAYBACK_RATE = 1;
const EXPORT_RENDER_SPEED_MULTIPLIER = 1;
const MAX_EXPORT_CAPTURE_FPS = 72;
const LONG_EXPORT_THRESHOLD_MS = 5 * 60 * 1000;
const VERY_LONG_EXPORT_THRESHOLD_MS = 15 * 60 * 1000;
const MUX_CHUNK_UPLOAD_THRESHOLD_BYTES = 96 * 1024 * 1024;
const MUX_CHUNK_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const STRICT_INTER_WORD_PAUSE_MS = 400;
const STRICT_SENTENCE_PAUSE_MS = 800;
const STRICT_SOFT_SENTENCE_PAUSE_MS = 520;
const STRICT_HEADING_PAUSE_MS = 1100;
const STRICT_SCENE_END_BUFFER_MS = 1500;
const STRICT_AUTOPLAY_RECOVERY_MS = 1000;
const STRICT_VOICE_VOLUME = 0.85;
const STRICT_BACKGROUND_MUSIC_VOLUME = 0.2;
const LIVE_SCENE_RENDER_FPS = 24;
const EXPORT_SCENE_RENDER_FPS = 12;
const SCENE_RENDER_MOUTH_DELTA = 0.035;
const NARRATION_CHUNK_JOIN_GAP_MS = 0;
const NARRATION_CHUNK_FADE_MS = 32;
const SPEECH_SYNC_REVEAL_START = 0.0;
const SPEECH_SYNC_REVEAL_END = 1.0;
const SPEECH_SYNC_WORD_COMMIT_MIN = 0.0;
const SPEECH_SYNC_WORD_COMMIT_MAX = 1.0;
const SPEECH_SYNC_VISUAL_PROGRESS_LAG = 0.0;
const MATHS_NUMBERS_TEMPLATE = `# Numbers
1 is one.
2 is two.
3 is three.
4 is four.
5 is five.

# Count Together
Count the stars.
Count the circles.
Count the apples.

# Speak Clearly
Say the numbers slowly and clearly.`;
const MATHS_OPERATIONS_TEMPLATE = `# Operations
Addition means putting numbers together.
2 plus 3 equals 5.
4 plus 1 equals 5.

Subtraction means taking away.
5 minus 2 equals 3.
7 minus 4 equals 3.

# Shapes
A triangle has 3 sides.
A rectangle has 4 sides.`;
const MATHS_PRONUNCIATION_TEMPLATE = `# Maths Pronunciation Practice
Zero
One
Two
Three
Four
Five
Plus
Minus
Equals
Triangle
Rectangle
Circle
Division
Multiplication`;
const MATHS_TABLES_TEMPLATE = buildTimesTablesLesson([2, 3, 4, 5, 6, 7, 8, 9, 10]);
const MATHS_SUMS_TEMPLATE = `# Mixed Maths Sums
2 + 2 = 4.
3 + 5 = 8.
6 + 4 = 10.
9 - 3 = 6.
12 - 5 = 7.
15 - 6 = 9.

# Multiply
2 × 2 = 4.
2 × 5 = 10.
3 × 4 = 12.
4 × 6 = 24.
5 × 3 = 15.

# Divide
8 ÷ 2 = 4.
12 ÷ 3 = 4.
18 ÷ 6 = 3.
20 ÷ 5 = 4.

# Word Problems
Ria has 2 bags with 4 apples each.
2 × 4 = 8 apples.

There are 10 sweets and 5 children.
10 ÷ 5 = 2 sweets each.`;

function buildSingleTimesTable(multiplier, maxFactor = 10) {
  const lines = [`# Table Of ${multiplier}`];
  for (let factor = 1; factor <= maxFactor; factor += 1) {
    lines.push(`${multiplier} × ${factor} = ${multiplier * factor}.`);
  }
  return lines.join("\n");
}

function buildTimesTablesLesson(multipliers = [], maxFactor = 10) {
  return multipliers
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => buildSingleTimesTable(value, maxFactor))
    .join("\n\n");
}
const NUMBER_WORD_VALUES = Object.freeze({
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
});
const SMALL_NUMBER_WORDS = Object.freeze([
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen"
]);
const TENS_NUMBER_WORDS = Object.freeze([
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety"
]);
const SPOKEN_MEASUREMENT_UNITS = Object.freeze([
  Object.freeze({ short: "cm", singular: "centimeter", plural: "centimeters" }),
  Object.freeze({ short: "km", singular: "kilometer", plural: "kilometers" }),
  Object.freeze({ short: "hm", singular: "hectometer", plural: "hectometers" }),
  Object.freeze({ short: "dam", singular: "decameter", plural: "decameters" }),
  Object.freeze({ short: "m", singular: "meter", plural: "meters" }),
  Object.freeze({ short: "dm", singular: "decimeter", plural: "decimeters" }),
  Object.freeze({ short: "mm", singular: "millimeter", plural: "millimeters" }),
  Object.freeze({ short: "kg", singular: "kilogram", plural: "kilograms" }),
  Object.freeze({ short: "gm", singular: "gram", plural: "grams" }),
  Object.freeze({ short: "ml", singular: "milliliter", plural: "milliliters" }),
  Object.freeze({ short: "hr", singular: "hour", plural: "hours" }),
  Object.freeze({ short: "hrs", singular: "hour", plural: "hours" }),
  Object.freeze({ short: "min", singular: "minute", plural: "minutes" }),
  Object.freeze({ short: "mins", singular: "minute", plural: "minutes" })
]);
const SPOKEN_TERM_REPLACEMENTS = Object.freeze([
  Object.freeze({ pattern: /\bAnjali\b/gi, replacement: "Ahn-ja-lee" }),
  Object.freeze({ pattern: /\bIndia\b/gi, replacement: "In-dee-uh" }),
  Object.freeze({ pattern: /\bIndian\b/gi, replacement: "In-dee-uhn" }),
  Object.freeze({ pattern: /\bfemale\b/gi, replacement: "fee-mayl" }),
  Object.freeze({ pattern: /\bdecimal point\b/gi, replacement: "decimal point" }),
  Object.freeze({ pattern: /\bplace value\b/gi, replacement: "place value" }),
  Object.freeze({ pattern: /\bexpanded form\b/gi, replacement: "expanded form" }),
  Object.freeze({ pattern: /\blearning outcomes\b/gi, replacement: "learning outcomes" }),
  Object.freeze({ pattern: /\blearning time\b/gi, replacement: "learning time" }),
  Object.freeze({ pattern: /\bmaths\b/gi, replacement: "maths" }),
  Object.freeze({ pattern: /\bcm\b/gi, replacement: "centimetre" }),
  Object.freeze({ pattern: /\bkm\b/gi, replacement: "kilometre" }),
  Object.freeze({ pattern: /\bmm\b/gi, replacement: "millimetre" }),
  Object.freeze({ pattern: /\bkg\b/gi, replacement: "kilogram" }),
  Object.freeze({ pattern: /\bgm\b/gi, replacement: "gram" }),
  Object.freeze({ pattern: /\bml\b/gi, replacement: "millilitre" }),
  Object.freeze({ pattern: /\bmm2\b/gi, replacement: "square millimetres" }),
  Object.freeze({ pattern: /\bcm2\b/gi, replacement: "square centimetres" }),
  Object.freeze({ pattern: /\bm2\b/gi, replacement: "square metres" }),
  Object.freeze({ pattern: /\bkm2\b/gi, replacement: "square kilometres" }),
  Object.freeze({ pattern: /\bmrp\b/gi, replacement: "M R P" }),
  Object.freeze({ pattern: /\bq\.\s*(\d+)/gi, replacement: "question $1" }),
  Object.freeze({ pattern: /\bans\.\b/gi, replacement: "answer" }),
  Object.freeze({ pattern: /\bex\.\b/gi, replacement: "exercise" }),
  Object.freeze({ pattern: /\bst\.\b/gi, replacement: "standard" }),
  Object.freeze({ pattern: /\bnos?\.\b/gi, replacement: "numbers" }),
  Object.freeze({ pattern: /\bno\.\s*(\d+)/gi, replacement: "number $1" }),
  Object.freeze({ pattern: /\bpg\.\s*(\d+)/gi, replacement: "page $1" }),
  Object.freeze({ pattern: /\bqns?\.\b/gi, replacement: "questions" }),
  Object.freeze({ pattern: /\bstd\.\b/gi, replacement: "standard" }),
  Object.freeze({ pattern: /\blike\s*&\s*unlike\b/gi, replacement: "like and unlike" }),
  Object.freeze({ pattern: /&/g, replacement: " and " }),
  Object.freeze({ pattern: /\u2192/g, replacement: " to " }),
  Object.freeze({ pattern: /_{2,}/g, replacement: " blank " }),
  Object.freeze({ pattern: /₹/g, replacement: " rupees " })
]);
const ORDINAL_WORD_MAP = Object.freeze({
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  6: "sixth",
  7: "seventh",
  8: "eighth",
  9: "ninth",
  10: "tenth",
  11: "eleventh",
  12: "twelfth",
  13: "thirteenth",
  14: "fourteenth",
  15: "fifteenth",
  16: "sixteenth",
  17: "seventeenth",
  18: "eighteenth",
  19: "nineteenth",
  20: "twentieth"
});
const NUMBER_SCALE_VALUES = Object.freeze({
  hundred: 100,
  thousand: 1000
});

function createEmptyStageVideoState() {
  return {
    id: "",
    url: "",
    fileName: "",
    blob: null,
    element: null,
    durationMs: 0,
    width: 0,
    height: 0,
    posterDataUrl: "",
    cutoutApplied: false,
    cutoutConfidence: 0,
    cutoutKey: null,
    cutoutSurface: null,
    aspectRatio: 16 / 9,
    frameX: 0,
    frameY: 0,
    frameWidth: 0,
    frameHeight: 0
  };
}

let pdfLibraryPromise = null;
let pdfFaceDetector = null;
let pdfFaceFilteringUnavailable = false;

const state = {
  narrationServerUrl: "http://127.0.0.1:8424",
  narrationServerReady: false,
  anjaliCloneServerUrl: "http://127.0.0.1:8426",
  anjaliCloneServerReady: false,
  transcribeServerUrl: "http://127.0.0.1:8428",
  transcribeServerReady: false,
  videoExportServerUrl: "http://127.0.0.1:8430",
  videoExportServerReady: false,
  text: "",
  presentationTemplate: PRESENTATION_TEMPLATE_CLASSIC,
  outcomesTitle: "",
  lines: [],
  words: [],
  tokens: [],
  displayedText: "",
  speaking: false,
  mouthOpen: 0.12,
  lessonPlaybackRate: DEFAULT_STAGE_PLAYBACK_RATE,
  animationFrame: null,
  typingInterval: null,
  speechUtterance: null,
  images: [],
  stageVideo: createEmptyStageVideoState(),
  stageVideos: [],
  activeStageVideoId: "",
  introPlayback: {
    enabled: false,
    active: false,
    previewVisible: false,
    available: null,
    fileName: "INTRO.mp4",
    url: DEFAULT_INTRO_VIDEO_FILE,
    element: null,
    durationMs: 0
  },
  narration: {
    url: "",
    fileName: "",
    durationMs: 0,
    source: "",
    blob: null,
    textSource: "",
    voice: "",
    syncProfile: null
  },
  recording: {
    recorder: null,
    chunks: [],
    stream: null
  },
  pdfSelectedFile: null,
  pdfLoading: false,
  presentationMode: "lesson",
  pdf: {
    fileName: "",
    fileSignature: "",
    extractedText: "",
    pageTexts: [],
    pageCount: 0,
    pages: [],
    contextPages: [],
    contextPagesKey: "",
    autoImageSyncKey: "",
    lessonAutoImageSyncKey: "",
    selectedPageIndexes: [],
    renderMode: "context",
    currentTimeMs: 0,
    totalDurationMs: 0,
    playbackRate: DEFAULT_STAGE_PLAYBACK_RATE,
    requestId: 0,
    pageSchedule: [],
    paused: false,
    audioDriven: false,
    timelineStartedAt: 0,
    timelineStartOffsetMs: 0,
    narration: {
      url: "",
      fileName: "",
      durationMs: 0,
      blob: null,
      textSource: "",
      voice: "",
      source: "",
      syncProfile: null
    }
  },
  dictation: {
    recognition: null,
    active: false,
    baseText: "",
    finalTranscript: ""
  },
  transcribeSelectedFile: null,
  transcribing: false,
  generatingNarration: false,
  inputPreviewing: false,
  previewAudio: null,
  previewAudioUrl: "",
  preferredNarrationVoice: "anjali",
  mathsTranslator: {
    auto: true,
    lastSource: "",
    lastTranslated: "",
    translating: false,
    requestId: 0,
    timerId: 0,
    previewTimerId: 0
  },
  narrationWarmup: {
    timerId: 0,
    requestId: 0,
    active: false,
    text: "",
    voice: ""
  },
  narrationLiveProgress: {
    timerId: 0,
    startedAt: 0,
    label: "",
    detail: "",
    progress: 0
  },
  localServerStartup: {
    active: false,
    startedAt: 0
  },
  anjaliMonitor: {
    timerId: 0,
    lastKnownReady: null,
    lastHealthyAt: 0,
    warming: false,
    lastError: "",
    modelLoaded: false,
    transientFailureCount: 0,
    generationActiveCount: 0
  },
  videoExportMonitor: {
    lastHealthyAt: 0,
    transientFailureCount: 0
  },
  lessonInputTimerId: 0,
  contentScrollOffset: 0,
  previewPageIndex: 0,
  renderedPageCount: 1,
  previewZoom: 1,
  fontScale: 1,
  sceneUploads: [],
  sceneGenerationActive: false,
  scene: {
    prompt: "",
    theme: "Classroom",
    vfx: "sparkles",
    musicMood: "bright",
    exportQuality: "2k",
    palette: ["#0e84ad", "#4eb6de", "#ffb548"],
    description: "Bright classroom style with gentle sparkles."
  },
  music: {
    url: "",
    fileName: "",
    blob: null,
    source: "",
    mood: "",
    durationMs: 0,
    volume: 0.2,
    enabled: false
  },
  exportVideoTrack: null,
  exportingVideo: false,
  selectedPhrase: "",
  keywordStyles: [],
  selectionStyle: {
    color: "#ffffff",
    bold: false,
    italic: false,
    underline: false
  },
  cutoutControls: {
    tolerance: STAGE_VIDEO_CUTOUT_TOLERANCE,
    feather: STAGE_VIDEO_EDGE_FEATHER,
    spill: 35,
    screenBlend: 28,
    refreshRevision: 0,
    refreshTimerId: 0
  },
  imageEditor: {
    activeIndex: -1,
    hoverIndex: -1,
    hoverMode: "",
    activeHandle: "",
    mode: "",
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startAspectRatio: 4 / 3
  },
  whiteboard: {
    enabled: false,
    drawing: false,
    color: "#ff0000",
    lineWidth: 4,
    currentStroke: [],
    strokes: []
  },
  imageRenderBoxes: [],
  stageVideoEditor: {
    activeId: "",
    hoverMode: "",
    mode: "",
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  },
  stageVideoRenderBox: null,
  activeAudio: null,
  activeMusic: null,
  exportCapture: {
    minFrameIntervalMs: 0,
    lastFrameAt: 0
  },
  actionLocks: {
    showScreen: false,
    pdfShow: false,
    pdfPresent: false,
    play: false,
    export: false,
    preview: false,
    narrationDownload: false
  },
  taskProgress: {
    revision: 0,
    progress: 0,
    hideTimeoutId: 0,
    label: "",
    startedAt: 0
  },
  audioContext: null,
  audioGraph: null,
  exportFallbackMode: false,
  mediaFrame: null,
  runtimeErrorMessage: "",
  displayStyle: {
    color: "#ffffff",
    bold: false,
    italic: false,
    underline: false,
    caseMode: "original"
  }
};

function getDisplayErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error?.reason === "string" && error.reason.trim()) {
    return error.reason.trim();
  }

  if (typeof error?.reason?.message === "string" && error.reason.message.trim()) {
    return error.reason.message.trim();
  }

  return fallback;
}

function isLikelyErrorMessage(message = "") {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return false;
  }

  return /(error|failed|failure|cannot|can't|could not|unable|unavailable|not available|timed out|timeout|denied|refused|invalid|missing|unsupported|not supported|unexpected|offline|crash|stopped working)/i.test(safeMessage);
}

function applyStatusMessage(element, message, options = {}) {
  const text = String(message || "").trim();
  const isError = typeof options.error === "boolean"
    ? options.error
    : isLikelyErrorMessage(text);

  if (element) {
    element.textContent = text;
    element.classList.toggle("is-error", isError);
  }

  return { text, isError };
}

function clearRuntimeDisplayError(options = {}) {
  const hadError = Boolean(state.runtimeErrorMessage);
  state.runtimeErrorMessage = "";
  if (hadError && options.redraw !== false && !stagePanel.classList.contains("hidden")) {
    try {
      drawScene(state.mouthOpen);
    } catch (error) {
      console.error(error);
    }
  }
}

function showRuntimeDisplayError(message, options = {}) {
  const cleanMessage = getDisplayErrorMessage(message).replace(/^error:\s*/i, "").trim();
  if (!cleanMessage) {
    return;
  }

  state.runtimeErrorMessage = cleanMessage;
  if (options.updateStatus !== false) {
    applyStatusMessage(statusText, `Error: ${cleanMessage}`, { error: true });
  }
  if (options.redraw !== false && !stagePanel.classList.contains("hidden")) {
    try {
      drawScene(state.mouthOpen);
    } catch (error) {
      console.error(error);
    }
  }
}

function setStatus(message, options = {}) {
  const result = applyStatusMessage(statusText, message, { error: options.error });
  if (result.isError) {
    state.runtimeErrorMessage = result.text.replace(/^error:\s*/i, "").trim();
    if (options.redraw !== false && !stagePanel.classList.contains("hidden")) {
      try {
        drawScene(state.mouthOpen);
      } catch (error) {
        console.error(error);
      }
    }
    return;
  }

  if (!options.keepRuntimeError) {
    clearRuntimeDisplayError({ redraw: options.redraw });
  }
}

function setStageMediaStatus(message) {
  const result = applyStatusMessage(stageMediaStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setAudioStatus(message) {
  const result = applyStatusMessage(audioStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setSpeechToolsStatus(message) {
  const result = applyStatusMessage(speechToolsStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setTranscribeStatus(message) {
  const result = applyStatusMessage(transcribeStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setNarrationGenStatus(message) {
  const result = applyStatusMessage(narrationGenStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function clearNarrationLiveProgressTimer() {
  if (state.narrationLiveProgress.timerId) {
    window.clearInterval(state.narrationLiveProgress.timerId);
    state.narrationLiveProgress.timerId = 0;
  }
}

function renderNarrationLiveProgress(options = {}) {
  if (!narrationLiveIndicator || !narrationLiveProgressLabel || !narrationLiveProgressFill) {
    return;
  }

  const safeProgress = clamp(
    Number.isFinite(options.progress) ? options.progress : state.narrationLiveProgress.progress,
    0,
    1
  );
  const elapsedMs = Math.max(0, Date.now() - (state.narrationLiveProgress.startedAt || Date.now()));
  const label = options.label || state.narrationLiveProgress.label || "Generating anjali narration...";
  const detail = options.detail || state.narrationLiveProgress.detail || `${formatDurationMs(elapsedMs)} elapsed`;

  state.narrationLiveProgress.progress = safeProgress;
  state.narrationLiveProgress.label = label;
  state.narrationLiveProgress.detail = detail;

  narrationLiveProgressLabel.textContent = `${label} ${detail}`.trim();
  narrationLiveIndicator.classList.remove("hidden");
  narrationLiveIndicator.classList.toggle("is-active", options.active !== false);
  narrationLiveIndicator.classList.toggle("is-complete", Boolean(options.complete));
  narrationLiveIndicator.classList.toggle("is-error", Boolean(options.error));

  if (options.complete || options.error) {
    narrationLiveProgressFill.style.width = "100%";
  } else {
    narrationLiveProgressFill.style.width = `${Math.max(12, Math.round(safeProgress * 100))}%`;
  }
}

function startNarrationLiveProgress(label) {
  clearNarrationLiveProgressTimer();
  state.narrationLiveProgress.startedAt = Date.now();
  state.narrationLiveProgress.label = String(label || "Generating anjali narration...");
  state.narrationLiveProgress.detail = "0s elapsed";
  state.narrationLiveProgress.progress = 0.08;
  renderNarrationLiveProgress({
    label: state.narrationLiveProgress.label,
    detail: state.narrationLiveProgress.detail,
    progress: state.narrationLiveProgress.progress,
    active: true
  });
  state.narrationLiveProgress.timerId = window.setInterval(() => {
    const elapsedMs = Math.max(0, Date.now() - state.narrationLiveProgress.startedAt);
    renderNarrationLiveProgress({
      label: state.narrationLiveProgress.label,
      detail: `${formatDurationMs(elapsedMs)} elapsed`,
      progress: state.narrationLiveProgress.progress,
      active: true
    });
  }, 1000);
}

function updateNarrationLiveProgress(label, progress) {
  if (!state.generatingNarration && !state.narrationLiveProgress.startedAt) {
    return;
  }

  const safeLabel = String(label || state.narrationLiveProgress.label || "Generating anjali narration...");
  const safeProgress = clamp(Number.isFinite(progress) ? progress : state.narrationLiveProgress.progress, 0, 0.96);
  const elapsedMs = Math.max(0, Date.now() - (state.narrationLiveProgress.startedAt || Date.now()));
  renderNarrationLiveProgress({
    label: safeLabel,
    detail: `${formatDurationMs(elapsedMs)} elapsed`,
    progress: safeProgress,
    active: true
  });
}

function finishNarrationLiveProgress(message, options = {}) {
  if (!narrationLiveIndicator) {
    return;
  }

  clearNarrationLiveProgressTimer();
  const safeMessage = String(message || (options.error ? "Narration generation failed." : "Narration ready."));
  renderNarrationLiveProgress({
    label: safeMessage,
    detail: options.error ? "Please try again." : "Completed",
    progress: 1,
    active: false,
    complete: !options.error,
    error: Boolean(options.error)
  });
  window.setTimeout(() => {
    narrationLiveIndicator.classList.add("hidden");
    narrationLiveIndicator.classList.remove("is-active", "is-complete", "is-error");
    narrationLiveProgressFill.style.width = "0%";
    narrationLiveProgressLabel.textContent = "Anjali narration is preparing...";
  }, options.error ? 2800 : 1800);
  state.narrationLiveProgress.startedAt = 0;
  state.narrationLiveProgress.label = "";
  state.narrationLiveProgress.detail = "";
  state.narrationLiveProgress.progress = 0;
}

function setMathsHelperStatus(message) {
  const result = applyStatusMessage(mathsHelperStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setImageCutoutStatus(message) {
  const result = applyStatusMessage(imageCutoutStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setCutoutControlsStatus(message) {
  const result = applyStatusMessage(cutoutControlsStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setVideoStatus(message) {
  const result = applyStatusMessage(videoStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setIntroClipStatus(message) {
  const result = applyStatusMessage(introClipStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setServerControlsStatus(message) {
  const result = applyStatusMessage(serverControlsStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setSelectionStyleStatus(message) {
  const result = applyStatusMessage(selectionStyleStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setIconButtonState(button, iconHtml, label) {
  if (!button) {
    return;
  }

  button.innerHTML = `<span aria-hidden="true">${iconHtml}</span>`;
  button.setAttribute("aria-label", label);
  button.title = label;
}

async function runLockedAction(lockName, buttons, task) {
  if (state.actionLocks?.[lockName]) {
    if (lockName === "export") {
      updateTaskProgressUi(Math.max(0.01, state.taskProgress.progress || 0.01), true, {
        label: state.exportingVideo
          ? (isPdfPresentationMode() ? "PDF export is already running..." : "Video export is already running...")
          : (isPdfPresentationMode() ? "PDF export is still preparing..." : "Video export is still preparing...")
      });
      setStatus(
        state.exportingVideo
          ? (isPdfPresentationMode() ? "PDF export is already running. Please wait for it to finish." : "Video export is already running. Please wait for it to finish.")
          : (isPdfPresentationMode() ? "PDF export is still preparing. Please wait..." : "Video export is still preparing. Please wait...")
      );
      updateStageModeUi();
    }
    return;
  }

  const buttonList = (Array.isArray(buttons) ? buttons : [buttons]).filter(Boolean);
  const previousStates = buttonList.map((button) => Boolean(button.disabled));
  clearRuntimeDisplayError();
  state.actionLocks[lockName] = true;
  buttonList.forEach((button) => {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  });
  if (lockName === "export") {
    updateTaskProgressUi(0.01, true, {
      label: isPdfPresentationMode() ? "Starting PDF export..." : "Starting video export..."
    });
  }

  try {
    return await task();
  } catch (error) {
    const fallbackMessage = lockName === "export"
      ? (isPdfPresentationMode() ? "PDF export could not finish." : "Video export could not finish.")
      : "That action could not finish.";
    console.error(error);
    showRuntimeDisplayError(getDisplayErrorMessage(error, fallbackMessage));
    return undefined;
  } finally {
    state.actionLocks[lockName] = false;
    buttonList.forEach((button, index) => {
      button.disabled = previousStates[index];
      button.removeAttribute("aria-busy");
    });
    if (lockName === "export" && !state.exportingVideo) {
      resetTaskProgressUi();
    }
    updatePdfUi();
    updateSpeechToolsUi();
    updateStageModeUi();
    updateStageMediaToolUi();
  }
}

function beginExportFromUi(task) {
  const startingLabel = isPdfPresentationMode() ? "Starting PDF export..." : "Starting video export...";
  setStatus(startingLabel);
  updateTaskProgressUi(0.01, true, { label: startingLabel });
  updateStageModeUi();
  return runLockedAction("export", [downloadBtn, downloadPdfContextBtn, playBtn], task);
}

function buildHumanTaskLabel(label = "") {
  const cleanLabel = (label || "").replace(/\s+/g, " ").trim();
  if (!cleanLabel) {
    if (state.exportingVideo) {
      return {
        title: isPdfPresentationMode() ? "Exporting PDF" : "Exporting Video",
        detail: isPdfPresentationMode()
          ? "Rendering pages and preparing the final MP4..."
          : "Rendering the lesson and preparing the final MP4..."
      };
    }

    return {
      title: "Working",
      detail: "Preparing the next step..."
    };
  }

  if (/ffmpeg|combining|mux/i.test(cleanLabel)) {
    return {
      title: "Exporting Video",
      detail: cleanLabel
    };
  }

  if (/render/i.test(cleanLabel)) {
    return {
      title: "Rendering",
      detail: cleanLabel
    };
  }

  if (/pdf/i.test(cleanLabel)) {
    return {
      title: "Preparing PDF",
      detail: cleanLabel
    };
  }

  if (state.exportingVideo) {
    return {
      title: isPdfPresentationMode() ? "Exporting PDF" : "Exporting Video",
      detail: cleanLabel
    };
  }

  return {
    title: "Working",
    detail: cleanLabel
  };
}

function normalizeExportQuality(value) {
  return value === "4k"
    ? "4k"
    : value === "2k"
      ? "2k"
      : "hd";
}

function getSelectedExportQuality() {
  return normalizeExportQuality(exportQualitySelect?.value || state.scene.exportQuality || "2k");
}

function resolveProjectAssetUrl(path) {
  try {
    return new URL(path, window.location.href).href;
  } catch (error) {
    console.error(error);
    return path;
  }
}

function getCutoutTolerance(force = false) {
  const baseTolerance = clamp(
    Number(state.cutoutControls?.tolerance) || STAGE_VIDEO_CUTOUT_TOLERANCE,
    20,
    110
  );
  return Math.round(baseTolerance + (force ? 10 : 0));
}

function getCutoutFeather() {
  return clamp(
    Number(state.cutoutControls?.feather) || STAGE_VIDEO_EDGE_FEATHER,
    4,
    48
  );
}

function getCutoutSpillStrength() {
  return clamp((Number(state.cutoutControls?.spill) || 0) / 100, 0, 1);
}

function getCutoutScreenBlendStrength() {
  return clamp((Number(state.cutoutControls?.screenBlend) || 0) / 100, 0, 1);
}

function getCutoutKeyTolerance(key) {
  if (!key) {
    return getCutoutTolerance(false);
  }

  const boost = Number.isFinite(key.toleranceBoost) ? key.toleranceBoost : 0;
  if (Number.isFinite(key.tolerance)) {
    return clamp(key.tolerance, 20, 140);
  }

  return getCutoutTolerance(false) + boost;
}

function updateCutoutControlsUi() {
  if (cutoutToleranceInput) {
    cutoutToleranceInput.value = `${Math.round(getCutoutTolerance(false))}`;
  }
  if (cutoutToleranceValue) {
    cutoutToleranceValue.textContent = `${Math.round(getCutoutTolerance(false))}`;
  }

  if (cutoutFeatherInput) {
    cutoutFeatherInput.value = `${Math.round(getCutoutFeather())}`;
  }
  if (cutoutFeatherValue) {
    cutoutFeatherValue.textContent = `${Math.round(getCutoutFeather())}`;
  }

  const spillPercent = Math.round(getCutoutSpillStrength() * 100);
  if (cutoutSpillInput) {
    cutoutSpillInput.value = `${spillPercent}`;
  }
  if (cutoutSpillValue) {
    cutoutSpillValue.textContent = `${spillPercent}%`;
  }

  const blendPercent = Math.round(getCutoutScreenBlendStrength() * 100);
  if (cutoutScreenBlendInput) {
    cutoutScreenBlendInput.value = `${blendPercent}`;
  }
  if (cutoutScreenBlendValue) {
    cutoutScreenBlendValue.textContent = `${blendPercent}%`;
  }
}

function applyScreenMatchOverlay(area, strength = getCutoutScreenBlendStrength()) {
  if (!area || strength <= 0) {
    return;
  }

  const safeStrength = clamp(strength, 0, 1);
  const tint = ctx.createLinearGradient(area.x, area.y, area.x, area.y + area.height);
  tint.addColorStop(0, `rgba(55, 129, 168, ${0.05 + (safeStrength * 0.22)})`);
  tint.addColorStop(0.55, `rgba(73, 153, 187, ${0.04 + (safeStrength * 0.12)})`);
  tint.addColorStop(1, `rgba(167, 212, 235, ${0.06 + (safeStrength * 0.24)})`);
  ctx.fillStyle = tint;
  ctx.fillRect(area.x, area.y, area.width, area.height);

  const highlight = ctx.createRadialGradient(
    area.x + (area.width * 0.72),
    area.y + (area.height * 0.24),
    20,
    area.x + (area.width * 0.72),
    area.y + (area.height * 0.24),
    area.width * 0.85
  );
  highlight.addColorStop(0, `rgba(255,255,255,${0.08 + (safeStrength * 0.2)})`);
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(area.x, area.y, area.width, area.height);
}

function softenForegroundSpill(data, offset, key, edgeFactor = 1) {
  const spillStrength = getCutoutSpillStrength();
  if (!key?.greenish || spillStrength <= 0 || edgeFactor <= 0) {
    return;
  }

  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const dominant = Math.max(r, b);
  const spillAmount = g - dominant;
  if (spillAmount <= 5 || g < 52) {
    return;
  }

  const influence = clamp(edgeFactor, 0, 1) * spillStrength;
  const greenReduction = Math.round(spillAmount * (0.38 + (influence * 0.38)));
  const blueBoost = Math.round(spillAmount * influence * 0.18);
  const redBoost = Math.round(spillAmount * influence * 0.08);
  data[offset] = clamp(r + redBoost, 0, 255);
  data[offset + 1] = clamp(g - greenReduction, 0, 255);
  data[offset + 2] = clamp(b + blueBoost, 0, 255);
}

function scheduleCutoutPreviewRefresh() {
  if (!state.cutoutControls) {
    return;
  }

  state.cutoutControls.refreshRevision += 1;
  const revision = state.cutoutControls.refreshRevision;
  if (state.cutoutControls.refreshTimerId) {
    window.clearTimeout(state.cutoutControls.refreshTimerId);
  }

  state.cutoutControls.refreshTimerId = window.setTimeout(async () => {
    if (revision !== state.cutoutControls.refreshRevision) {
      return;
    }

    const selectedImageIndex = getSelectedImageIndex();
    const selectedImage = selectedImageIndex >= 0 ? state.images[selectedImageIndex] : null;
    if (selectedImage?.cutoutApplied) {
      try {
        await applySmartCutoutToImageAt(selectedImageIndex, true);
        selectImageAt(selectedImageIndex, { moveToPage: false });
        setCutoutControlsStatus("Smart cutout tuning updated. The selected image was refreshed with the new edge settings.");
      } catch (error) {
        console.error(error);
        setCutoutControlsStatus("Smart cutout tuning changed, but the selected image could not be refreshed automatically.");
      }
      return;
    }

    if (stagePanel && !stagePanel.classList.contains("hidden")) {
      drawScene(state.mouthOpen);
    }
  }, 220);
}

function handleCutoutControlChange() {
  state.cutoutControls.tolerance = clamp(Number(cutoutToleranceInput?.value) || STAGE_VIDEO_CUTOUT_TOLERANCE, 20, 110);
  state.cutoutControls.feather = clamp(Number(cutoutFeatherInput?.value) || STAGE_VIDEO_EDGE_FEATHER, 4, 48);
  state.cutoutControls.spill = clamp(Number(cutoutSpillInput?.value) || 0, 0, 100);
  state.cutoutControls.screenBlend = clamp(Number(cutoutScreenBlendInput?.value) || 0, 0, 100);
  updateCutoutControlsUi();
  setCutoutControlsStatus("Smart cutout controls updated. Active video updates live, and selected cutout images refresh automatically.");
  if (stagePanel && !stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
  scheduleCutoutPreviewRefresh();
}

function getRequestedExportQuality() {
  return normalizeExportQuality(state.scene.exportQuality);
}

function getEffectiveExportQuality() {
  const requestedQuality = getRequestedExportQuality();
  if (state.stageVideo.url && requestedQuality === "hd") {
    return "2k";
  }

  return requestedQuality;
}

function getExportQualityLabel(quality = getEffectiveExportQuality()) {
  return quality === "4k"
    ? "4K"
    : quality === "2k"
      ? "2K"
      : "HD";
}

function setSceneGeneratorStatus(message) {
  const result = applyStatusMessage(sceneGeneratorStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setSceneMusicStatus(message) {
  const result = applyStatusMessage(sceneMusicStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setSceneGenerationProgress(value, label = "") {
  const safeValue = clamp(Math.round(value), 0, 100);
  sceneGenerationProgress.classList.remove("hidden");
  sceneGenerationProgress.setAttribute("aria-valuenow", `${safeValue}`);
  sceneGenerationProgressBar.style.width = `${safeValue}%`;
  updateTaskProgressUi(safeValue / 100, true, {
    label: label || "Generating scene"
  });
  sceneGenerationProgressLabel.textContent = label
    ? `${safeValue}% - ${label}`
    : `${safeValue}% complete`;
}

function resetSceneGenerationProgress() {
  sceneGenerationProgress.classList.add("hidden");
  sceneGenerationProgress.setAttribute("aria-valuenow", "0");
  sceneGenerationProgressBar.style.width = "0%";
  sceneGenerationProgressLabel.textContent = "0% complete";
  resetTaskProgressUi();
}

function updateSceneGeneratorUi() {
  const isBusy = state.sceneGenerationActive;
  if (generateSceneBtn) generateSceneBtn.disabled = isBusy;
  if (generateSceneShowBtn) generateSceneShowBtn.disabled = isBusy;
  if (clearSceneBtn) clearSceneBtn.disabled = isBusy;
  if (scenePromptInput) scenePromptInput.disabled = isBusy;
  if (sceneVfxSelect) sceneVfxSelect.disabled = isBusy;
  if (sceneMusicModeSelect) sceneMusicModeSelect.disabled = isBusy;
  if (exportQualitySelect) exportQualitySelect.disabled = isBusy;
  if (sceneImageInput) sceneImageInput.disabled = isBusy;
  if (sceneMusicInput) sceneMusicInput.disabled = isBusy;
}

function updateStagePageUi(currentPageIndex = 0, totalPageCount = 1) {
  const safeTotal = Math.max(1, totalPageCount);
  const safeIndex = clamp(currentPageIndex, 0, safeTotal - 1);
  const lockNavigation = state.speaking || downloadBtn.disabled;
  const currentPdfPage = isPdfPresentationMode()
    ? getPdfPresentationPages()[safeIndex]
    : null;

  if (pageIndicator) {
    pageIndicator.textContent = currentPdfPage
      ? `Selected ${safeIndex + 1} / ${safeTotal} | PDF ${currentPdfPage.sourcePageNumber || currentPdfPage.pageNumber}${currentPdfPage.totalParts > 1 ? ` • Part ${currentPdfPage.partIndex + 1}/${currentPdfPage.totalParts}` : ""}`
      : `Page ${safeIndex + 1} / ${safeTotal}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = lockNavigation || safeIndex <= 0;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = lockNavigation || safeIndex >= safeTotal - 1;
  }
}

function formatControlPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function setIndicatorProgress(indicator, progress = 0) {
  if (!indicator) {
    return;
  }

  const safeProgress = clamp(progress, 0, 1);
  indicator.style.setProperty("--indicator-progress", `${Math.round(safeProgress * 100)}%`);
}

function clearTaskProgressHideTimer() {
  if (state.taskProgress.hideTimeoutId) {
    window.clearTimeout(state.taskProgress.hideTimeoutId);
    state.taskProgress.hideTimeoutId = 0;
  }
}

function scheduleTaskProgressHide(delayMs = 240, expectedRevision = state.taskProgress.revision) {
  if (!taskPercentIndicator) {
    return;
  }

  clearTaskProgressHideTimer();
  const safeDelay = Math.max(0, Math.round(delayMs));
  state.taskProgress.hideTimeoutId = window.setTimeout(() => {
    if (expectedRevision !== state.taskProgress.revision) {
      return;
    }

    taskPercentIndicator.textContent = "0%";
    taskPercentIndicator.title = "";
    taskPercentIndicator.removeAttribute("aria-label");
    taskPercentIndicator.classList.remove("is-active", "is-complete");
    taskPercentIndicator.classList.add("hidden");
    setIndicatorProgress(taskPercentIndicator, 0);
    state.taskProgress.progress = 0;
    state.taskProgress.label = "";
    state.taskProgress.startedAt = 0;
    state.taskProgress.hideTimeoutId = 0;
  }, safeDelay);
}

function updatePlaybackProgressUi(progress = 0, active = false) {
  if (!playbackPercentIndicator) {
    return;
  }

  const safeProgress = clamp(progress, 0, 1);
  playbackPercentIndicator.textContent = formatControlPercent(safeProgress);
  playbackPercentIndicator.classList.toggle("is-active", active);
  playbackPercentIndicator.classList.toggle("is-complete", safeProgress >= 0.999 && active);
  setIndicatorProgress(playbackPercentIndicator, safeProgress);
}

function syncLessonPlaybackProgressUi(progress = 0, active = state.speaking) {
  updatePlaybackProgressUi(progress, active);
}

function updateTaskProgressUi(progress = 0, active = false, options = {}) {
  if (!taskPercentIndicator) {
    if (options.mirrorStage) {
      updatePlaybackProgressUi(progress, active);
    }
    return;
  }

  const safeProgress = clamp(progress, 0, 1);

  if (!active) {
    scheduleTaskProgressHide(
      Number.isFinite(options.delayMs) ? options.delayMs : (state.taskProgress.progress >= 0.999 ? 900 : 240),
      Number.isFinite(options.expectedRevision) ? options.expectedRevision : state.taskProgress.revision
    );

    if (options.mirrorStage) {
      updatePlaybackProgressUi(safeProgress, false);
    }
    return state.taskProgress.revision;
  }

  clearTaskProgressHideTimer();
  state.taskProgress.revision += 1;
  if (!state.taskProgress.startedAt || safeProgress < state.taskProgress.progress || safeProgress <= 0.001) {
    state.taskProgress.startedAt = performance.now();
  }
  state.taskProgress.progress = safeProgress;
  state.taskProgress.label = typeof options.label === "string" && options.label.trim()
    ? options.label.trim()
    : (statusText?.textContent?.trim() || "");

  const humanLabel = buildHumanTaskLabel(state.taskProgress.label);
  let detailText = humanLabel.detail;
  if (state.exportingVideo) {
    if (safeProgress > 0.01 && safeProgress < 0.999 && state.taskProgress.startedAt) {
      const elapsedMs = Math.max(0, performance.now() - state.taskProgress.startedAt);
      const estimatedTotalMs = elapsedMs / safeProgress;
      const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
      detailText = `${humanLabel.detail} | ${formatDurationMs(elapsedMs)} elapsed | ${formatDurationMs(remainingMs)} left`;
    } else if (safeProgress <= 0.01) {
      detailText = `${humanLabel.detail} | estimating time...`;
    }
  }
  taskPercentIndicator.innerHTML = `<span class="task-progress-title">${humanLabel.title}</span><strong class="task-progress-percent">${formatControlPercent(safeProgress)}</strong><span class="task-progress-detail">${detailText}</span>`;
  taskPercentIndicator.title = state.taskProgress.label
    ? `${formatControlPercent(safeProgress)} - ${state.taskProgress.label}`
    : formatControlPercent(safeProgress);
  taskPercentIndicator.setAttribute(
    "aria-label",
    state.taskProgress.label
      ? `${formatControlPercent(safeProgress)} ${state.taskProgress.label}`
      : `${formatControlPercent(safeProgress)} loading`
  );
  taskPercentIndicator.classList.add("is-active");
  taskPercentIndicator.classList.toggle("is-complete", safeProgress >= 0.999);
  taskPercentIndicator.classList.remove("hidden");
  setIndicatorProgress(taskPercentIndicator, safeProgress);

  if (options.mirrorStage) {
    updatePlaybackProgressUi(safeProgress, active);
  }

  return state.taskProgress.revision;
}

function resetTaskProgressUi(options = {}) {
  updateTaskProgressUi(0, false, options);
}

function normalizeControlValue(value) {
  return Math.round(value * 10) / 10;
}

function applyPreviewZoom() {
  previewCanvas.style.transform = `scale(${state.previewZoom})`;
}

function updateStageViewUi() {
  const pdfMode = isPdfPresentationMode();

  if (zoomValue) {
    zoomValue.textContent = formatControlPercent(state.previewZoom);
  }

  if (fontValue) {
    fontValue.textContent = pdfMode ? "PDF" : formatControlPercent(state.fontScale);
  }

  if (zoomOutBtn) {
    zoomOutBtn.disabled = state.previewZoom <= PREVIEW_ZOOM_MIN;
  }

  if (zoomInBtn) {
    zoomInBtn.disabled = state.previewZoom >= PREVIEW_ZOOM_MAX;
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.disabled = pdfMode || state.fontScale <= FONT_SCALE_MIN;
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.disabled = pdfMode || state.fontScale >= FONT_SCALE_MAX;
  }
}

function setPreviewZoom(nextZoom) {
  state.previewZoom = clamp(normalizeControlValue(nextZoom), PREVIEW_ZOOM_MIN, PREVIEW_ZOOM_MAX);
  applyPreviewZoom();
  updateStageViewUi();
}

function setFontScale(nextScale) {
  state.fontScale = clamp(normalizeControlValue(nextScale), FONT_SCALE_MIN, FONT_SCALE_MAX);
  state.pdf.contextPagesKey = "";
  state.pdf.autoImageSyncKey = "";
  state.pdf.lessonAutoImageSyncKey = "";

  if (hasActivePdfSelection()) {
    rebuildPdfPresentationSchedule({ preserveTime: true });
  }
  syncExtractedPdfLessonImages({ skipDraw: true });
  updateStageViewUi();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function setPreviewPage(nextPageIndex) {
  const totalPageCount = Math.max(1, state.renderedPageCount || 1);
  const safePageIndex = clamp(nextPageIndex, 0, totalPageCount - 1);

  if (isPdfPresentationMode()) {
    void focusPdfSelectionPage(safePageIndex, {
      startPlayback: !stagePanel.classList.contains("hidden")
    });
    return;
  }

  state.previewPageIndex = safePageIndex;
  drawScene(state.mouthOpen);
}

function getStoredTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
  } catch (error) {
    console.error(error);
  }

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", nextTheme);
  if (themeSelect) {
    themeSelect.value = nextTheme;
  }
  if (themeToggle) {
    themeToggle.checked = nextTheme === "dark";
  }
  if (themeModeLabel) {
    themeModeLabel.textContent = nextTheme === "dark" ? "Dark Theme" : "Day Theme";
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    console.error(error);
  }
}

function initializeTheme() {
  applyTheme(getStoredTheme());
}

function normalizePresentationTemplate(value) {
  // Always query live React DOM to bypass stale vanilla JS state
  const liveDomValue = document.querySelector('input[name="presentationTemplate"]:checked')?.value;
  const effectiveValue = liveDomValue || value;
  
  return String(effectiveValue || "").trim().toLowerCase() === PRESENTATION_TEMPLATE_OUTCOMES
    ? PRESENTATION_TEMPLATE_OUTCOMES
    : PRESENTATION_TEMPLATE_CLASSIC;
}

function getPresentationTemplateLabel(template = state.presentationTemplate) {
  return normalizePresentationTemplate(template) === PRESENTATION_TEMPLATE_OUTCOMES
    ? "Learning Outcomes"
    : "Classic Stage";
}

function getStoredPresentationTemplate() {
  try {
    const savedTemplate = window.localStorage.getItem(PRESENTATION_TEMPLATE_STORAGE_KEY);
    return normalizePresentationTemplate(savedTemplate);
  } catch (error) {
    console.error(error);
  }

  return PRESENTATION_TEMPLATE_CLASSIC;
}

function normalizeOutcomesTitle(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 72);
}

function getStoredOutcomesTitle() {
  try {
    return normalizeOutcomesTitle(window.localStorage.getItem(OUTCOMES_TITLE_STORAGE_KEY) || "");
  } catch (error) {
    console.error(error);
    return "";
  }
}

function updateOutcomesTitleUi() {
  const titleValue = normalizeOutcomesTitle(state.outcomesTitle);
  if (outcomesTitleInput && outcomesTitleInput.value !== titleValue) {
    outcomesTitleInput.value = titleValue;
  }

  const isOutcomesTemplate = normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES;
  if (outcomesTitleInput) {
    outcomesTitleInput.disabled = !isOutcomesTemplate;
  }
  if (saveOutcomesTitleBtn) {
    saveOutcomesTitleBtn.disabled = !isOutcomesTemplate;
  }
  if (outcomesTitleStatus) {
    outcomesTitleStatus.textContent = isOutcomesTemplate
      ? (titleValue
        ? `Saved title: ${titleValue}`
        : "The second template uses LEARNING OUTCOMES by default. Save a custom title to show it on screen and in export.")
      : "Switch to Learning Outcomes if you want to save a custom title for that template.";
  }
}

function updatePresentationTemplateUi() {
  const activeTemplate = normalizePresentationTemplate(state.presentationTemplate);
  presentationTemplateInputs.forEach((input) => {
    input.checked = normalizePresentationTemplate(input.value) === activeTemplate;
  });

  if (presentationTemplateStatus) {
    presentationTemplateStatus.textContent = activeTemplate === PRESENTATION_TEMPLATE_OUTCOMES
      ? "Learning Outcomes template is active. Classic is still available any time."
      : "Classic stage is active by default.";
  }
  updateOutcomesTitleUi();
}

function setPresentationTemplate(template, options = {}) {
  const nextTemplate = normalizePresentationTemplate(template);
  const hasChanged = nextTemplate !== normalizePresentationTemplate(state.presentationTemplate);
  state.presentationTemplate = nextTemplate;
  updatePresentationTemplateUi();

  try {
    window.localStorage.setItem(PRESENTATION_TEMPLATE_STORAGE_KEY, nextTemplate);
  } catch (error) {
    console.error(error);
  }

  if (options.announce !== false) {
    setStatus(nextTemplate === PRESENTATION_TEMPLATE_OUTCOMES
      ? "Learning Outcomes template is ready for the presentation screen."
      : "Classic stage template is active.");
  }

  if (!stagePanel.classList.contains("hidden") && options.redraw !== false) {
    drawScene(state.mouthOpen);
  }

  return hasChanged;
}

function initializePresentationTemplate() {
  state.presentationTemplate = getStoredPresentationTemplate();
  state.outcomesTitle = getStoredOutcomesTitle();
  updatePresentationTemplateUi();
}

function setOutcomesTitle(title, options = {}) {
  const normalizedTitle = normalizeOutcomesTitle(title);
  state.outcomesTitle = normalizedTitle;
  try {
    if (normalizedTitle) {
      window.localStorage.setItem(OUTCOMES_TITLE_STORAGE_KEY, normalizedTitle);
    } else {
      window.localStorage.removeItem(OUTCOMES_TITLE_STORAGE_KEY);
    }
  } catch (error) {
    console.error(error);
  }

  updateOutcomesTitleUi();
  drawScene(state.mouthOpen);

  if (!options.silent) {
    setStatus(normalizedTitle
      ? `Learning Outcomes title saved as ${normalizedTitle}.`
      : "Learning Outcomes title cleared. The default title will be used.");
  }
}

function setSpacingToolsStatus(message) {
  if (spacingToolsStatus) {
    spacingToolsStatus.textContent = String(message || "");
  }
}

function getActiveTextInsertionTarget() {
  const activeElement = document.activeElement;
  const candidates = [
    lessonInput,
    mathsSourceInput,
    outcomesTitleInput,
    placeValueNumberInput
  ].filter(Boolean);

  if (
    activeElement
    && candidates.includes(activeElement)
    && typeof activeElement.selectionStart === "number"
    && typeof activeElement.selectionEnd === "number"
  ) {
    return activeElement;
  }

  return lessonInput || candidates[0] || null;
}

function insertTextIntoActiveField(textToInsert = "", label = "Text") {
  const target = getActiveTextInsertionTarget();
  if (!target) {
    setSpacingToolsStatus("No text field is ready for insertion.");
    return;
  }

  const safeInsertText = String(textToInsert || "");
  const start = typeof target.selectionStart === "number" ? target.selectionStart : target.value.length;
  const end = typeof target.selectionEnd === "number" ? target.selectionEnd : target.value.length;
  const nextValue = `${target.value.slice(0, start)}${safeInsertText}${target.value.slice(end)}`;
  target.value = nextValue;
  const nextCursor = start + safeInsertText.length;
  target.focus();
  if (typeof target.setSelectionRange === "function") {
    target.setSelectionRange(nextCursor, nextCursor);
  }
  target.dispatchEvent(new Event("input", { bubbles: true }));
  setSpacingToolsStatus(`${label} inserted into ${target === lessonInput ? "the lesson box" : "the active text field"}.`);
}

function openWorkflowTarget(targetId = "") {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  if (target.tagName === "DETAILS") {
    target.open = true;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: targetId === "showScreenBtn" ? "center" : "start"
  });

  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

function canExportVideo() {
  return typeof canvas.captureStream === "function" && typeof MediaRecorder !== "undefined";
}

function getSupportedVideoMimeType(includeAudioCodecs = false) {
  const videoOnlyMimeTypes = [
    "video/webm;codecs=vp8",
    "video/webm;codecs=vp9",
    "video/webm"
  ];
  const audioCapableMimeTypes = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm"
  ];
  const mimeTypes = includeAudioCodecs
    ? [...videoOnlyMimeTypes, ...audioCapableMimeTypes]
    : videoOnlyMimeTypes;

  return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";
}

function createExportMediaRecorder(stream, videoBitsPerSecond) {
  const hasAudioTrack = Boolean(stream?.getAudioTracks?.().length);
  const candidateMimeTypes = hasAudioTrack
    ? [
      getSupportedVideoMimeType(true),
      getSupportedVideoMimeType(false),
      "video/webm"
    ]
    : [
      getSupportedVideoMimeType(false),
      "video/webm"
    ];

  let lastError = null;
  for (const mimeType of candidateMimeTypes.filter(Boolean)) {
    // ULTRA MAXIMUM QUALITY BITRATE (120 Mbps) to ensure pixel-perfect export of Anjali
    videoBitsPerSecond = Math.max(videoBitsPerSecond, 120000000); 

    const options = {
      mimeType,
      videoBitsPerSecond
    };
    if (hasAudioTrack) {
      options.audioBitsPerSecond = 192000;
    }

    try {
      return new MediaRecorder(stream, options);
    } catch (error) {
      lastError = error;
      console.error(error);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return new MediaRecorder(stream, { videoBitsPerSecond });
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getFinalExportHoldMs() {
  return STRICT_SCENE_END_BUFFER_MS;
}

function getExportCompletionTailMs() {
  return getFinalExportHoldMs() + Math.max(0, Math.round((Number(SPEECH_SYNC_VISUAL_PROGRESS_LAG) || 0) * 1000));
}

function getLessonExportCaptureRate() {
  return state.stageVideo.element ? 24 : 20;
}

function getPdfExportCaptureRate(renderMode = "context") {
  return renderMode === "exact" ? 7 : 8;
}

function getExportRenderSpeedMultiplier() {
  return 1.0; // STRICTLY 1.0x Real-time to prevent CPU dropping frames and destroying smooth flow
}

function getEffectiveExportRenderSpeedMultiplier(baseRate, targetDurationMs = 0, desiredMultiplier = getExportRenderSpeedMultiplier()) {
  return 1.0; // STRICTLY 1.0x Real-time to prevent CPU dropping frames and destroying smooth flow
}

function getAcceleratedExportCaptureRate(baseRate, renderSpeedMultiplier = getExportRenderSpeedMultiplier()) {
  const safeBaseRate = Number.isFinite(Number(baseRate)) ? Math.max(1, Number(baseRate)) : 1;
  const safeMultiplier = Number.isFinite(Number(renderSpeedMultiplier)) ? Math.max(1, Number(renderSpeedMultiplier)) : 1;
  return Math.min(
    MAX_EXPORT_CAPTURE_FPS,
    Math.max(safeBaseRate, Math.round(safeBaseRate * safeMultiplier))
  );
}

function setExportCaptureRate(fps) {
  const safeFps = Number.isFinite(Number(fps)) ? Math.max(1, Number(fps)) : 0;
  state.exportCapture.minFrameIntervalMs = safeFps ? (1000 / safeFps) : 0;
  state.exportCapture.lastFrameAt = 0;
}

function clearExportCaptureRate() {
  state.exportCapture.minFrameIntervalMs = 0;
  state.exportCapture.lastFrameAt = 0;
}

function getLessonExportBitrate(quality = getEffectiveExportQuality()) {
  return 12000000;
}

function getPdfExportBitrate(quality = getEffectiveExportQuality(), renderMode = "context") {
  return 12000000;
}

async function fetchWithTimeout(resource, options = {}, timeoutMs = 2500) {
  if (!Number.isFinite(Number(timeoutMs)) || Number(timeoutMs) <= 0) {
    return fetch(resource, options);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function applyHighQualityImageRendering(targetContext) {
  if (!targetContext) {
    return;
  }

  targetContext.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in targetContext) {
    targetContext.imageSmoothingQuality = "high";
  }
}

function resetCanvasSurface() {
  const width = canvas.width;
  const height = canvas.height;
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext("2d");
  applyHighQualityImageRendering(ctx);
}

function useCanvasSurface(nextCanvas) {
  canvas = nextCanvas;
  ctx = canvas.getContext("2d");
  applyHighQualityImageRendering(ctx);
}

function isSafeImageSource(source = "") {
  return typeof source === "string" && (source.startsWith("data:image/") || source.startsWith("blob:"));
}

function isCanvasOriginClean() {
  try {
    ctx.getImageData(0, 0, 1, 1);
    return true;
  } catch (error) {
    return false;
  }
}

function loadImageElementSource(element, source) {
  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
      resolve(element);
    };
    const handleError = () => {
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
      reject(new Error("The logo image could not be loaded safely for export."));
    };

    element.addEventListener("load", handleLoad, { once: true });
    element.addEventListener("error", handleError, { once: true });
    element.src = source;
  });
}

function triggerFileDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 1500);
}

async function requestVideoSaveHandle(suggestedName = "learning-outcomes-video.mp4") {
  // Direct browser download is more reliable than the picker path here.
  // The picker can make a completed render look like a failed export if the
  // browser blocks or cancels the save dialog after recording has finished.
  return null;
}

async function streamResponseToFileHandle(response, fileHandle) {
  if (!response?.ok) {
    throw new Error("The video export response was not ready to save.");
  }

  const writable = await fileHandle.createWritable();

  try {
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        if (value?.length) {
          await writable.write(value);
        }
      }
    } else {
      await writable.write(await response.blob());
    }

    await writable.close();
  } catch (error) {
    try {
      await writable.abort();
    } catch (abortError) {
      console.error(abortError);
    }

    throw error;
  }
}

async function saveBlobWithHandle(fileHandle, blob) {
  const writable = await fileHandle.createWritable();

  try {
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    try {
      await writable.abort();
    } catch (abortError) {
      console.error(abortError);
    }

    throw error;
  }
}

function splitIntoLines(text) {
  const normalizedText = String(text || "").replace(/\r\n|\r/g, "\n");
  const smartText = normalizedText
    .replace(/(?<!\n)\n(?!\n)/g, (match, offset, string) => {
      const nextSegment = string.substring(offset + 1).trimStart();
      if (/^[•*-]\s|^#+|^[0-9]+\./.test(nextSegment)) {
        return "\n";
      }
      return " ";
    });

  return smartText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitIntoWords(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function splitIntoTokens(text) {
  return Array.from(text || "");
}

function convertTwoDigitNumberToWords(value) {
  const safeValue = Math.max(0, Math.floor(Number(value) || 0));
  if (safeValue < 20) {
    return SMALL_NUMBER_WORDS[safeValue] || "";
  }

  const tensPart = Math.floor(safeValue / 10);
  const onesPart = safeValue % 10;
  return onesPart
    ? `${TENS_NUMBER_WORDS[tensPart]} ${SMALL_NUMBER_WORDS[onesPart]}`
    : TENS_NUMBER_WORDS[tensPart];
}

function convertThreeDigitNumberToWords(value) {
  const safeValue = Math.max(0, Math.floor(Number(value) || 0));
  if (safeValue < 100) {
    return convertTwoDigitNumberToWords(safeValue);
  }

  const hundredsPart = Math.floor(safeValue / 100);
  const remainder = safeValue % 100;
  const prefix = `${SMALL_NUMBER_WORDS[hundredsPart]} hundred`;
  return remainder ? `${prefix} and ${convertTwoDigitNumberToWords(remainder)}` : prefix;
}

function convertIntegerToIndianWords(value) {
  const numericValue = Number(String(value || "").replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return String(value || "");
  }

  const safeValue = Math.trunc(numericValue);
  if (safeValue === 0) {
    return "zero";
  }

  const signPrefix = safeValue < 0 ? "minus " : "";
  let remainder = Math.abs(safeValue);
  const parts = [];
  const placeValues = [
    { size: 10000000, label: "crore" },
    { size: 100000, label: "lakh" },
    { size: 1000, label: "thousand" }
  ];

  placeValues.forEach(({ size, label }) => {
    if (remainder >= size) {
      const chunk = Math.floor(remainder / size);
      parts.push(`${convertIntegerToIndianWords(chunk)} ${label}`);
      remainder %= size;
    }
  });

  if (remainder >= 100) {
    const hundredsPart = Math.floor(remainder / 100);
    parts.push(`${SMALL_NUMBER_WORDS[hundredsPart]} hundred`);
    remainder %= 100;
  }

  if (remainder > 0) {
    if (parts.length && Math.abs(safeValue) >= 100) {
      parts.push(`and ${convertTwoDigitNumberToWords(remainder)}`);
    } else {
      parts.push(convertTwoDigitNumberToWords(remainder));
    }
  }

  return `${signPrefix}${parts.join(" ").replace(/\s+/g, " ").trim()}`.trim();
}

function convertIntegerToInternationalWords(value) {
  const numericValue = Number(String(value || "").replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return String(value || "");
  }

  const safeValue = Math.trunc(numericValue);
  if (safeValue === 0) {
    return "zero";
  }

  const signPrefix = safeValue < 0 ? "minus " : "";
  let remainder = Math.abs(safeValue);
  const parts = [];
  const placeValues = [
    { size: 1000000000, label: "billion" },
    { size: 1000000, label: "million" },
    { size: 1000, label: "thousand" }
  ];

  placeValues.forEach(({ size, label }) => {
    if (remainder >= size) {
      const chunk = Math.floor(remainder / size);
      parts.push(`${convertThreeDigitNumberToWords(chunk)} ${label}`);
      remainder %= size;
    }
  });

  if (remainder >= 100) {
    parts.push(convertThreeDigitNumberToWords(remainder));
    remainder = 0;
  }

  if (remainder > 0) {
    parts.push(convertTwoDigitNumberToWords(remainder));
  }

  return `${signPrefix}${parts.join(" ").replace(/\s+/g, " ").trim()}`.trim();
}

function convertDecimalNumberToWords(value) {
  const rawValue = String(value || "").replace(/,/g, "").trim();
  if (!rawValue || !/^-?\d+(?:\.\d+)?$/.test(rawValue)) {
    return rawValue;
  }

  if (!rawValue.includes(".")) {
    return convertIntegerToIndianWords(rawValue);
  }

  const [wholePart, decimalPart] = rawValue.split(".");
  const wholeWords = convertIntegerToIndianWords(wholePart);
  const decimalWords = decimalPart
    .split("")
    .map((digit) => SMALL_NUMBER_WORDS[Number(digit)] || digit)
    .join(" ");
  return `${wholeWords} point ${decimalWords}`.trim();
}

function verbalizeFractionToken(match, numerator, denominator) {
  const top = convertDecimalNumberToWords(numerator);
  const bottom = convertDecimalNumberToWords(denominator);
  if (!top || !bottom) {
    return match;
  }

  return `${top} by ${bottom}`;
}

function expandMeasuredUnitsForSpeech(text = "") {
  let spokenText = String(text || "");

  SPOKEN_MEASUREMENT_UNITS.forEach(({ short, singular, plural }) => {
    const quantityPattern = new RegExp(`(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s*${short}\\b`, "gi");
    spokenText = spokenText.replace(quantityPattern, (match, valueText) => {
      const numericValue = Number(String(valueText || "").replace(/,/g, ""));
      const unitLabel = Number.isFinite(numericValue) && Math.abs(numericValue) === 1 ? singular : plural;
      return `${valueText} ${unitLabel}`;
    });
  });

  return spokenText;
}

function expandMetricUnitTokensForSpeech(text = "") {
  let spokenText = String(text || "");
  const metricTokenMatches = spokenText.match(/\b(?:km|hm|dam|m|dm|cm|mm)\b/gi) || [];
  const shouldExpandStandaloneUnits = (
    metricTokenMatches.length >= 2
    || /\b(metric|convert|unit|ladder|step)\b/i.test(spokenText)
    || /[\u2192=<>]/.test(spokenText)
  );

  if (!shouldExpandStandaloneUnits) {
    return spokenText;
  }

  SPOKEN_MEASUREMENT_UNITS
    .filter(({ short }) => /^(km|hm|dam|m|dm|cm|mm)$/i.test(short))
    .forEach(({ short, singular }) => {
      const unitPattern = new RegExp(`\\b${short}\\b`, "gi");
      spokenText = spokenText.replace(unitPattern, singular);
    });

  return spokenText;
}

function convertOrdinalSuffixToWords(valueText = "", suffix = "") {
  const numericValue = Number(String(valueText || "").replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return `${valueText}${suffix}`;
  }

  if (ORDINAL_WORD_MAP[numericValue]) {
    return ORDINAL_WORD_MAP[numericValue];
  }

  const baseWords = convertDecimalNumberToWords(valueText);
  if (/y$/i.test(baseWords)) {
    return baseWords.replace(/y$/i, "ieth");
  }

  return `${baseWords}th`;
}

function normalizeNarrationSourceText(text = "") {
  return String(text || "")
    .replace(/\bRs\.?\s*(?=\d)/gi, "rupees ")
    .replace(/\bINR\s*(?=\d)/gi, "rupees ")
    .replace(/₹\s*/g, "rupees ")
    .replace(/\bNo\.?\s*(\d+)/gi, "number $1")
    .replace(/\bQ(?:uestion)?\.?\s*(\d+)/gi, "question $1")
    .replace(/\bAns\.?\b/gi, "answer")
    .replace(/\bEx\.?\b/gi, "exercise")
    .replace(/\bStd\.?\b/gi, "standard")
    .replace(/\bPg(?:age)?\.?\s*(\d+)/gi, "page $1")
    .replace(/\bQ\.?\s*No\.?\b/gi, "question number ")
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, (match, valueText, suffix) => convertOrdinalSuffixToWords(valueText, suffix))
    .replace(/(?<=\d)\s*[xX*]\s*(?=\d)/g, " multiplied by ")
    .replace(/(?<=\d)\s*\/\s*(?=\d)/g, " / ")
    .replace(/(?<=\d)\s*-\s*(?=\d)/g, " minus ")
    .replace(/(?<=\d)\s*\+\s*(?=\d)/g, " plus ")
    .replace(/(?<=\d)\s*=\s*(?=\d)/g, " equals ")
    .replace(/\btable of\s+(\d+)/gi, (match, valueText) => `table of ${valueText}`)
    .replace(/\s+/g, " ")
    .trim();
}

function expandTeachingTermsForSpeech(text = "") {
  let spokenText = normalizeNarrationSourceText(text);
  spokenText = expandMetricUnitTokensForSpeech(expandMeasuredUnitsForSpeech(spokenText));

  SPOKEN_TERM_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    spokenText = spokenText.replace(pattern, replacement);
  });

  return spokenText
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function verbalizeMathForSpeech(text) {
  return expandTeachingTermsForSpeech(text)
    .replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, verbalizeFractionToken)
    .replace(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/g, "$1 ratio $2")
    .replace(/\*/g, " multiplied by ")
    .replace(/(\d+(?:,\d+)*(?:\.\d+)?)/g, (match) => convertDecimalNumberToWords(match))
    .replace(/×/g, " multiplied by ")
    .replace(/÷/g, " divided by ")
    .replace(/\//g, " divided by ")
    .replace(/\+/g, " plus ")
    .replace(/(?<!\d)-(?=\d)/g, " minus ")
    .replace(/(?<=\d)\s*-\s*(?=\d)/g, " minus ")
    .replace(/\s+-\s+/g, " minus ")
    .replace(/=/g, " equals ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/≠/g, " not equal to ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/\^/g, " to the power of ")
    .replace(/%/g, " percent ")
    .replace(/\s+/g, " ")
    .trim();
}

function translateStandaloneMathText(text) {
  const compact = String(text || "").trim();
  if (!compact) {
    return "";
  }

  const fractionMatch = compact.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    return verbalizeFractionToken(compact, fractionMatch[1], fractionMatch[2]);
  }

  if (/^-?\d+(?:,\d+)*(?:\.\d+)?$/.test(compact)) {
    return convertDecimalNumberToWords(compact);
  }

  return compact;
}

function buildDisplayedLines(text) {
  return splitIntoLines(text);
}

function buildNarrationText(text) {
  return splitIntoLines(text)
    .map((line) => {
      const trimmed = line.replace(/^\s*#{1,3}\s+/, "").replace(/\s+/g, " ").trim();
      if (!trimmed) {
        return "";
      }

      const spokenLine = verbalizeMathForSpeech(trimmed);
      return /[.!?]$/.test(spokenLine) ? spokenLine : `${spokenLine}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function buildNarrationRequestPayload(text) {
  return buildNarrationRequestPayloadFromNarrationText(buildNarrationText(text));
}

function buildNarrationRequestPayloadFromNarrationText(narrationText = "") {
  return {
    text: String(narrationText || "").trim(),
    voiceProfile: {
      ...ANJALI_TTS_PROFILE,
      ...NARRATION_STYLE_CONFIG
    },
    generationOptions: ANJALI_GENERATION_OPTIONS,
    narrationStylePrompt: NARRATION_STYLE_PROMPT
  };
}

function splitNarrationTextIntoChunks(narrationText, maxChunkLength = NARRATION_CHUNK_MAX_LENGTH) {
  const safeNarrationText = String(narrationText || "").trim();
  if (!safeNarrationText) {
    return [];
  }

  if (safeNarrationText.length <= maxChunkLength) {
    return [safeNarrationText];
  }

  const sentenceParts = safeNarrationText.split(/(?<=[.!?;:])\s+/).filter(Boolean);
  const chunks = [];
  let currentChunk = "";

  const pushCurrentChunk = () => {
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    currentChunk = "";
  };

  sentenceParts.forEach((sentence) => {
    const safeSentence = sentence.trim();
    if (!safeSentence) {
      return;
    }

    if (safeSentence.length > maxChunkLength) {
      pushCurrentChunk();
      const words = safeSentence.split(/\s+/).filter(Boolean);
      let segment = "";

      words.forEach((word) => {
        const candidate = segment ? `${segment} ${word}` : word;
        if (candidate.length > maxChunkLength && segment) {
          chunks.push(`${segment.trim()},`);
          segment = word;
        } else {
          segment = candidate;
        }
      });

      if (segment.trim()) {
        chunks.push(segment.trim());
      }
      return;
    }

    const candidate = currentChunk ? `${currentChunk} ${safeSentence}` : safeSentence;
    if (candidate.length > maxChunkLength && currentChunk) {
      pushCurrentChunk();
      currentChunk = safeSentence;
    } else {
      currentChunk = candidate;
    }
  });

  pushCurrentChunk();
  return chunks.length ? chunks : [safeNarrationText];
}

function splitNarrationIntoChunks(text, maxChunkLength = NARRATION_CHUNK_MAX_LENGTH) {
  return splitNarrationTextIntoChunks(buildNarrationText(text), maxChunkLength);
}

function getNarrationChunkConfig(voice) {
  if (voice === "anjali") {
    return {
      maxChunkLength: ANJALI_NARRATION_CHUNK_MAX_LENGTH,
      threshold: ANJALI_NARRATION_CHUNK_THRESHOLD
    };
  }

  return {
    maxChunkLength: NARRATION_CHUNK_MAX_LENGTH,
    threshold: NARRATION_CHUNK_THRESHOLD
  };
}

const DEFAULT_NARRATION_REQUEST_TIMEOUT_MS = 45000;
const LONG_NARRATION_REQUEST_BASE_TIMEOUT_MS = 60000;
const LONG_NARRATION_REQUEST_PER_WORD_TIMEOUT_MS = 35;
const LONG_NARRATION_REQUEST_MAX_TIMEOUT_MS = 600000;
const ANJALI_CLONE_HEALTH_TIMEOUT_MS = 15000;
const ANJALI_CLONE_HEALTH_GRACE_MS = 45000;
const revealWeightCache = new Map();
const speechSyncProfileCache = new Map();

function getLongNarrationRequestTimeoutMs(text) {
  const narrationText = buildNarrationText(text);
  const wordCount = splitIntoWords(narrationText).length;
  return clamp(
    LONG_NARRATION_REQUEST_BASE_TIMEOUT_MS + (wordCount * LONG_NARRATION_REQUEST_PER_WORD_TIMEOUT_MS),
    LONG_NARRATION_REQUEST_BASE_TIMEOUT_MS,
    LONG_NARRATION_REQUEST_MAX_TIMEOUT_MS
  );
}

function getExpectedNarrationDurationMsForText(text = "") {
  const narrationText = buildNarrationText(text);
  if (!narrationText) {
    return 0;
  }

  return Math.max(0, Math.round(getSpeechSyncProfile(narrationText).totalDurationMs || 0));
}

function isNarrationDurationTooShortForText(text = "", durationMs = 0, voice = "anjali") {
  if (voice !== "anjali") {
    return false;
  }

  const narrationText = String(text || "").trim();
  const safeDurationMs = Math.max(0, Math.round(Number(durationMs) || 0));
  const wordCount = splitIntoWords(narrationText).length;
  if (!narrationText || wordCount < 14 || safeDurationMs <= 0) {
    return false;
  }

  const expectedDurationMs = Math.max(0, Math.round(getSpeechSyncProfile(narrationText).totalDurationMs || 0));
  if (expectedDurationMs <= 0) {
    return false;
  }

  return safeDurationMs < Math.max(3200, Math.round(expectedDurationMs * 0.55));
}

function splitNarrationChunkForRetry(narrationText = "") {
  const safeText = String(narrationText || "").trim();
  if (!safeText) {
    return [];
  }

  const retryChunks = splitNarrationTextIntoChunks(
    safeText,
    Math.max(90, Math.min(160, Math.floor(safeText.length * 0.5)))
  );
  if (retryChunks.length > 1) {
    return retryChunks;
  }

  const words = safeText.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return [safeText];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" ")
  ].filter(Boolean);
}

function estimatePauseMsFromText(text = "") {
  const safeText = String(text || "");
  const commaCount = (safeText.match(/,/g) || []).length;
  const softPauseCount = (safeText.match(/[;:]/g) || []).length;
  const sentencePauseCount = (safeText.match(/[.!?]/g) || []).length;
  const lineBreakCount = (safeText.match(/\n+/g) || []).length;
  return (
    (commaCount * STRICT_INTER_WORD_PAUSE_MS)
    + (softPauseCount * STRICT_INTER_WORD_PAUSE_MS)
    + (sentencePauseCount * STRICT_SENTENCE_PAUSE_MS)
    + (lineBreakCount * STRICT_SENTENCE_PAUSE_MS)
  );
}

function getRevealTokenWeight(token, previousToken = "", nextToken = "") {
  if (token === "\n") {
    return 3.4;
  }

  if (/\s/.test(token)) {
    return 0.18;
  }

  if (token === "," ) {
    return 2.1;
  }

  if (token === ";" || token === ":") {
    return 2.5;
  }

  if (token === "." || token === "!" || token === "?") {
    if (nextToken === token) {
      return 1.2;
    }
    return 3.2;
  }

  if (token === "-" || token === "–" || token === "—") {
    return 1.3;
  }

  if ((token === "\"" || token === "'") && /[.!?,;:]/.test(previousToken || "")) {
    return 0.45;
  }

  return 1;
}

function getRevealWeightProfile(text = "") {
  const cacheKey = String(text || "");
  const cachedProfile = revealWeightCache.get(cacheKey);
  if (cachedProfile) {
    return cachedProfile;
  }

  const tokens = splitIntoTokens(cacheKey);
  const cumulativeWeights = [];
  let totalWeight = 0;

  tokens.forEach((token, index) => {
    const previousToken = index > 0 ? tokens[index - 1] : "";
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : "";
    totalWeight += getRevealTokenWeight(token, previousToken, nextToken);
    cumulativeWeights.push(totalWeight);
  });

  const profile = {
    tokens,
    cumulativeWeights,
    totalWeight
  };

  revealWeightCache.set(cacheKey, profile);
  if (revealWeightCache.size > 80) {
    const oldestKey = revealWeightCache.keys().next().value;
    revealWeightCache.delete(oldestKey);
  }

  return profile;
}

function getVisibleTokenCountForProgress(text = "", progress = 0) {
  const safeProgress = clamp(progress, 0, 1);
  const profile = getRevealWeightProfile(text);
  if (!profile.tokens.length || safeProgress <= 0) {
    return 0;
  }

  if (safeProgress >= 1 || profile.totalWeight <= 0) {
    return profile.tokens.length;
  }

  const targetWeight = profile.totalWeight * safeProgress;
  let low = 0;
  let high = profile.cumulativeWeights.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (profile.cumulativeWeights[middle] >= targetWeight) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return clamp(low + 1, 0, profile.tokens.length);
}

function getVisibleTextForProgress(text = "", progress = 0, options = {}) {
  const safeText = String(text || "");
  if (!safeText) {
    return "";
  }

  const linear = options.linear === true;
  const profile = getRevealWeightProfile(safeText);
  const visibleCount = linear
    ? clamp(Math.round(profile.tokens.length * clamp(progress, 0, 1)), 0, profile.tokens.length)
    : getVisibleTokenCountForProgress(safeText, progress);
  return profile.tokens.slice(0, visibleCount).join("");
}

function getVisibleChunkText(chunkText = "", speechProgress = 0) {
  const safeChunkText = String(chunkText || "");
  if (!safeChunkText) {
    return "";
  }

  if (/^\r?\n+$/.test(safeChunkText) || /^[ \t]+$/.test(safeChunkText) || /^[,.;:!?()[\]{}]+$/.test(safeChunkText)) {
    return safeChunkText;
  }

  const delayedProgress = clamp(
    (clamp(speechProgress, 0, 1) - SPEECH_SYNC_REVEAL_START)
      / Math.max(0.01, SPEECH_SYNC_REVEAL_END - SPEECH_SYNC_REVEAL_START),
    0,
    1
  );

  return getVisibleTextForProgress(safeChunkText, delayedProgress);
}

function getSpeechSyncTokenSpeechMs(chunkText = "") {
  const safeChunk = String(chunkText || "");
  const spokenCore = verbalizeMathForSpeech(safeChunk)
    .trim()
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[^A-Za-z0-9]+$/, "");
  if (!spokenCore) {
    return STRICT_INTER_WORD_PAUSE_MS;
  }

  const headingBoost = /^\s*#{1,3}\s+/i.test(safeChunk) || /^[A-Z][A-Za-z0-9 ,()/-]{0,48}:?\s*$/.test(spokenCore)
    ? 1.18
    : 1;
  const mathsBoost = /[=+\-xX*/÷×<>√^%]/.test(safeChunk) ? 1.12 : 1;
  const numberBoost = /\d/.test(safeChunk) ? 1.08 : 1;
  const emphasisBoost = /(squared|cubed|root|equals|centimeter|kilometer|meter|decimal|fraction)/i.test(spokenCore)
    ? 1.1
    : 1;
  const totalBoost = headingBoost * mathsBoost * numberBoost * emphasisBoost;

  return Math.max(360, Math.round(spokenCore.length * 145 * totalBoost));
}

function getSpeechSyncTokenPauseMs(chunkText = "") {
  const safeChunk = String(chunkText || "");
  if (!safeChunk.trim()) {
    return 0;
  }

  if (/^\s*#{1,3}\s+/i.test(safeChunk)) {
    return STRICT_HEADING_PAUSE_MS;
  }

  if (/\n\s*\n/.test(safeChunk)) {
    return STRICT_HEADING_PAUSE_MS;
  }

  if (/\n/.test(safeChunk) || /[.!?]["')\]]*\s*$/i.test(safeChunk)) {
    return STRICT_SENTENCE_PAUSE_MS;
  }

  if (/[,:;]["')\]]*\s*$/i.test(safeChunk)) {
    return STRICT_SOFT_SENTENCE_PAUSE_MS;
  }

  return STRICT_INTER_WORD_PAUSE_MS;
}

function getSpeechSyncCommitThreshold(chunkText = "") {
  const safeChunk = String(chunkText || "");
  const spokenCore = verbalizeMathForSpeech(safeChunk)
    .trim()
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[^A-Za-z0-9]+$/, "");
  if (!spokenCore) {
    return SPEECH_SYNC_WORD_COMMIT_MAX;
  }

  const characterCount = spokenCore.replace(/\s+/g, "").length;
  const punctuationBoost = /[,:;.!?]["')\]]*\s*$/i.test(safeChunk) ? 0.08 : 0;
  const mathsBoost = /[=+\-xX*/÷×<>√^%]/.test(safeChunk) ? 0.05 : 0;
  const lengthBoost = clamp((characterCount - 6) * 0.018, 0, 0.16);
  return clamp(
    SPEECH_SYNC_WORD_COMMIT_MIN + punctuationBoost + mathsBoost + lengthBoost,
    SPEECH_SYNC_WORD_COMMIT_MIN,
    SPEECH_SYNC_WORD_COMMIT_MAX
  );
}

function tokenizeSpeechSyncDisplayText(text = "") {
  const safeText = String(text || "");
  const tokenPattern = /(\r?\n+|[ \t]+|\d+(?:,\d+)*(?:\.\d+)?(?:\/\d+(?:,\d+)*(?:\.\d+)?)?|[A-Za-z]+(?:['’-][A-Za-z]+)*|<=|>=|==|!=|[=+\-×÷*/<>≤≥≠^%:;,.!?()[\]{}]|.)/g;
  const tokens = [];
  let match = tokenPattern.exec(safeText);

  while (match) {
    tokens.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
    match = tokenPattern.exec(safeText);
  }

  return tokens;
}

function getSpeechSyncLineContext(lineText = "") {
  const safeLine = String(lineText || "");
  const trimmed = safeLine.trim();
  if (!trimmed) {
    return {
      isHeading: false,
      isTeachingCue: false,
      isMathHeavy: false,
      isBlank: true
    };
  }

  return {
    isHeading: /^\s*#{1,3}\s+/.test(safeLine)
      || (
        trimmed.length <= 58
        && /^[A-Z][A-Za-z0-9 ,&()/-]*:?$/.test(trimmed)
        && !/[=+\-×÷*/<>≤≥≠^%]/.test(trimmed)
      ),
    isTeachingCue: /^(example|step|answer|rule|quiz|question|exercise|practice|solve|convert|compare)\b/i.test(trimmed),
    isMathHeavy: /[=+\-×÷*/<>≤≥≠^%]/.test(safeLine)
      || (/\d/.test(safeLine) && /\b(cm|mm|km|hm|dam|m|dm|kg|gm|ml|decimal|fraction|table|percent)\b/i.test(safeLine)),
    isBlank: false
  };
}

function getSpeechSyncUnitSpokenText(displayText = "") {
  const safeText = String(displayText || "");
  if (!safeText.trim() || /^[,.;:!?()[\]{}]+$/.test(safeText)) {
    return "";
  }

  return verbalizeMathForSpeech(safeText)
    .replace(/\s+/g, " ")
    .trim();
}

function estimateSyllableWeight(word) {
  const safeWord = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!safeWord) return 1;
  const syllableWord = safeWord.replace(/(?:[^laeiouy]|ed|e)$/, '').replace(/^y/, '');
  const syllables = syllableWord.match(/[aeiouy]{1,2}/g);
  return syllables ? Math.max(1, syllables.length) : 1;
}

function getSpeechSyncUnitSpeechMs(unit) {
  if (!unit?.spokenText) {
    return 0;
  }

  const words = splitIntoWords(unit.spokenText);
  const wordCount = words.length;
  const syllableCount = words.reduce((sum, word) => sum + estimateSyllableWeight(word), 0);
  const characterCount = unit.spokenText.replace(/\s+/g, "").length;
  const contextBoost = [
    unit.lineContext?.isHeading ? 1.18 : 1,
    unit.lineContext?.isTeachingCue ? 1.1 : 1,
    unit.lineContext?.isMathHeavy ? 1.08 : 1,
    /\d/.test(unit.displayText) ? 1.06 : 1,
    /[=+\-×÷*/<>≤≥≠^%]/.test(unit.displayText) ? 1.12 : 1
  ].reduce((product, value) => product * value, 1);

  const baseSpeechMs = (wordCount * 80) + (syllableCount * 120) + (characterCount * 15);
  return Math.max(180, Math.round(baseSpeechMs * contextBoost));
}

function getSpeechSyncUnitPauseMs(unit, nextUnit = null) {
  const displayText = String(unit?.displayText || "");
  if (!displayText) {
    return 0;
  }

  if (/^\r?\n+$/.test(displayText)) {
    if ((unit?.lineContext?.isHeading || unit?.lineContext?.isTeachingCue) || displayText.length > 1) {
      return STRICT_HEADING_PAUSE_MS;
    }
    return STRICT_SENTENCE_PAUSE_MS;
  }

  if (/^[ \t]+$/.test(displayText)) {
    return Math.round(STRICT_INTER_WORD_PAUSE_MS * 0.3);
  }

  if (/^[.!?]+$/.test(displayText)) {
    return STRICT_SENTENCE_PAUSE_MS;
  }

  if (/^[:;]+$/.test(displayText)) {
    return STRICT_SOFT_SENTENCE_PAUSE_MS;
  }

  if (/^,+$/.test(displayText)) {
    return Math.round(STRICT_INTER_WORD_PAUSE_MS * 0.9);
  }

  if (!nextUnit || /^\r?\n+$/.test(nextUnit.displayText || "")) {
    return unit?.lineContext?.isHeading ? STRICT_HEADING_PAUSE_MS : Math.round(STRICT_INTER_WORD_PAUSE_MS * 0.4);
  }

  return 0;
}

function analyzeSpeechSyncUnits(text = "") {
  const safeText = String(text || "");
  const lineContexts = safeText.split(/\r?\n/).map((line) => getSpeechSyncLineContext(line));
  let lineIndex = 0;

  return tokenizeSpeechSyncDisplayText(safeText).map((token) => {
    const lineContext = lineContexts[Math.min(lineIndex, Math.max(0, lineContexts.length - 1))] || getSpeechSyncLineContext("");
    const unit = {
      displayText: token.text,
      startIndex: token.startIndex,
      endIndex: token.endIndex,
      lineContext,
      spokenText: getSpeechSyncUnitSpokenText(token.text)
    };

    if (/^\r?\n+$/.test(token.text)) {
      lineIndex += (token.text.match(/\n/g) || []).length;
    }

    return unit;
  });
}

function getSpeechSyncProfile(text = "", targetDurationMs = 0) {
  const safeText = String(text || "");
  const safeTargetDurationMs = Math.max(0, Math.round(Number(targetDurationMs) || 0));
  const cacheKey = `${safeText}::${safeTargetDurationMs}`;
  const cachedProfile = speechSyncProfileCache.get(cacheKey);
  if (cachedProfile) {
    return cachedProfile;
  }

  const units = analyzeSpeechSyncUnits(safeText);

  if (!units.length) {
    const emptyProfile = {
      units: [],
      totalDurationMs: Math.max(6000, safeTargetDurationMs || 6000)
    };
    speechSyncProfileCache.set(cacheKey, emptyProfile);
    return emptyProfile;
  }

  const estimatedUnits = units.map((unit, index) => ({
    ...unit,
    speechMs: getSpeechSyncUnitSpeechMs(unit),
    pauseMs: 0
  }));

  estimatedUnits.forEach((unit, index) => {
    unit.pauseMs = getSpeechSyncUnitPauseMs(unit, estimatedUnits[index + 1] || null);
  });

  const baseDurationMs = estimatedUnits.reduce((sum, unit) => sum + unit.speechMs + unit.pauseMs, 0);
  const scaledDurationMs = safeTargetDurationMs > 0 ? safeTargetDurationMs : baseDurationMs;
  const scale = baseDurationMs > 0 ? (scaledDurationMs / baseDurationMs) : 1;
  let cursorMs = 0;

  let normalizedUnits = estimatedUnits.map((unit, index) => {
    const scaledSpeechMs = unit.spokenText
      ? Math.max(140, Math.round(unit.speechMs * scale))
      : 0;
    const scaledPauseMs = Math.max(
      index === estimatedUnits.length - 1 ? 0 : 0,
      Math.round(unit.pauseMs * scale)
    );
    const nextUnit = {
      ...unit,
      speechStartMs: cursorMs,
      speechEndMs: cursorMs + scaledSpeechMs,
      pauseEndMs: cursorMs + scaledSpeechMs + scaledPauseMs
    };
    cursorMs = nextUnit.pauseEndMs;
    return nextUnit;
  });

  const normalizedTotalDurationMs = normalizedUnits[normalizedUnits.length - 1]?.pauseEndMs || scaledDurationMs;
  if (safeTargetDurationMs > 0 && normalizedUnits.length && normalizedTotalDurationMs > 0) {
    let lastPauseEndMs = 0;
    normalizedUnits = normalizedUnits.map((unit, index) => {
      const scaledSpeechStartMs = Math.round((unit.speechStartMs / normalizedTotalDurationMs) * safeTargetDurationMs);
      const scaledSpeechEndMs = Math.round((unit.speechEndMs / normalizedTotalDurationMs) * safeTargetDurationMs);
      const scaledPauseEndMs = index === normalizedUnits.length - 1
        ? safeTargetDurationMs
        : Math.round((unit.pauseEndMs / normalizedTotalDurationMs) * safeTargetDurationMs);

      const speechStartMs = clamp(scaledSpeechStartMs, lastPauseEndMs, safeTargetDurationMs);
      const speechEndMs = clamp(Math.max(speechStartMs, scaledSpeechEndMs), speechStartMs, safeTargetDurationMs);
      const pauseEndMs = clamp(Math.max(speechEndMs, scaledPauseEndMs), speechEndMs, safeTargetDurationMs);
      lastPauseEndMs = pauseEndMs;

      return {
        ...unit,
        speechStartMs,
        speechEndMs,
        pauseEndMs
      };
    });
  }

  const profile = {
    units: normalizedUnits,
    totalDurationMs: safeTargetDurationMs > 0
      ? safeTargetDurationMs
      : Math.max(scaledDurationMs, normalizedUnits[normalizedUnits.length - 1]?.pauseEndMs || scaledDurationMs)
  };

  speechSyncProfileCache.set(cacheKey, profile);
  if (speechSyncProfileCache.size > 80) {
    const oldestKey = speechSyncProfileCache.keys().next().value;
    speechSyncProfileCache.delete(oldestKey);
  }

  return profile;
}

function scaleSpeechSyncProfile(profile, targetDurationMs = 0) {
  const safeTargetDurationMs = Math.max(0, Math.round(Number(targetDurationMs) || 0));
  if (!profile || !Array.isArray(profile.units) || !profile.units.length || !safeTargetDurationMs || safeTargetDurationMs === profile.totalDurationMs) {
    return profile;
  }

  const baseDurationMs = Math.max(1, Math.round(Number(profile.totalDurationMs) || 1));
  let lastPauseEndMs = 0;
  const scaledUnits = profile.units.map((unit, index) => {
    const scaledSpeechStartMs = Math.round((unit.speechStartMs / baseDurationMs) * safeTargetDurationMs);
    const scaledSpeechEndMs = Math.round((unit.speechEndMs / baseDurationMs) * safeTargetDurationMs);
    const scaledPauseEndMs = index === profile.units.length - 1
      ? safeTargetDurationMs
      : Math.round((unit.pauseEndMs / baseDurationMs) * safeTargetDurationMs);
    const speechStartMs = clamp(scaledSpeechStartMs, lastPauseEndMs, safeTargetDurationMs);
    const speechEndMs = clamp(Math.max(speechStartMs, scaledSpeechEndMs), speechStartMs, safeTargetDurationMs);
    const pauseEndMs = clamp(Math.max(speechEndMs, scaledPauseEndMs), speechEndMs, safeTargetDurationMs);
    lastPauseEndMs = pauseEndMs;
    return {
      ...unit,
      speechStartMs,
      speechEndMs,
      pauseEndMs
    };
  });

  return {
    ...profile,
    units: scaledUnits,
    totalDurationMs: safeTargetDurationMs
  };
}

function buildSpeechSyncProfileFromChunkDurations(text = "", narrationChunks = [], chunkDurationsMs = []) {
  const safeText = String(text || "");
  const safeChunks = Array.isArray(narrationChunks)
    ? narrationChunks.map((chunk) => String(chunk || "").trim()).filter(Boolean)
    : [];
  const joinGapMs = Math.max(0, Math.round(Number(NARRATION_CHUNK_JOIN_GAP_MS) || 0));
  const safeDurations = Array.isArray(chunkDurationsMs)
    ? chunkDurationsMs.map((value, index, source) => {
      const baseDurationMs = Math.max(1, Math.round(Number(value) || 0));
      return baseDurationMs + (index < (source.length - 1) ? joinGapMs : 0);
    }).filter((value) => value > 0)
    : [];

  if (!safeText || !safeChunks.length || safeChunks.length !== safeDurations.length) {
    return null;
  }

  const estimatedProfile = getSpeechSyncProfile(safeText, 0);
  const estimatedUnits = Array.isArray(estimatedProfile.units) ? estimatedProfile.units : [];
  if (!estimatedUnits.length) {
    return null;
  }

  const chunkCharacterTargets = safeChunks.map((chunk) => Math.max(1, chunk.replace(/\s+/g, "").length));
  const cumulativeTargets = [];
  chunkCharacterTargets.reduce((sum, value, index) => {
    const total = sum + value;
    cumulativeTargets[index] = total;
    return total;
  }, 0);

  let spokenCharacterCursor = 0;
  let activeChunkIndex = 0;
  const unitsByChunk = safeDurations.map(() => []);

  estimatedUnits.forEach((unit) => {
    const spokenLength = unit.spokenText ? Math.max(1, unit.spokenText.replace(/\s+/g, "").length) : 0;
    const midpoint = spokenCharacterCursor + (spokenLength * 0.5);
    while (
      activeChunkIndex < (cumulativeTargets.length - 1)
      && midpoint > cumulativeTargets[activeChunkIndex]
    ) {
      activeChunkIndex += 1;
    }

    unitsByChunk[activeChunkIndex].push(unit);
    spokenCharacterCursor += spokenLength;
  });

  let globalCursorMs = 0;
  const normalizedUnits = [];

  safeDurations.forEach((chunkDurationMs, chunkIndex) => {
    const chunkUnits = unitsByChunk[chunkIndex] || [];
    if (!chunkUnits.length) {
      globalCursorMs += chunkDurationMs;
      return;
    }

    const baseChunkDurationMs = chunkUnits.reduce((sum, unit) => {
      const speechMs = Math.max(0, Number(unit.speechMs) || 0);
      const pauseMs = Math.max(0, Number(unit.pauseMs) || 0);
      return sum + speechMs + pauseMs;
    }, 0);
    const scale = baseChunkDurationMs > 0 ? (chunkDurationMs / baseChunkDurationMs) : 1;
    let localCursorMs = 0;

    const localUnits = chunkUnits.map((unit) => {
      const speechMs = unit.spokenText
        ? Math.max(40, Math.round((Number(unit.speechMs) || 0) * scale))
        : 0;
      const pauseMs = Math.max(0, Math.round((Number(unit.pauseMs) || 0) * scale));
      const nextUnit = {
        ...unit,
        speechStartMs: localCursorMs,
        speechEndMs: localCursorMs + speechMs,
        pauseEndMs: localCursorMs + speechMs + pauseMs
      };
      localCursorMs = nextUnit.pauseEndMs;
      return nextUnit;
    });

    const normalizedChunkUnits = scaleSpeechSyncProfile({
      units: localUnits,
      totalDurationMs: localUnits[localUnits.length - 1]?.pauseEndMs || chunkDurationMs
    }, chunkDurationMs)?.units || localUnits;

    normalizedChunkUnits.forEach((unit) => {
      normalizedUnits.push({
        ...unit,
        speechStartMs: globalCursorMs + unit.speechStartMs,
        speechEndMs: globalCursorMs + unit.speechEndMs,
        pauseEndMs: globalCursorMs + unit.pauseEndMs
      });
    });

    globalCursorMs += chunkDurationMs;
  });

  if (!normalizedUnits.length) {
    return null;
  }

  return {
    units: normalizedUnits,
    totalDurationMs: Math.max(1, globalCursorMs)
  };
}

function getResolvedSpeechSyncProfile(text = "", targetDurationMs = 0, options = {}) {
  const safeText = String(text || "");
  const safeTargetDurationMs = Math.max(0, Math.round(Number(targetDurationMs) || 0));
  const narrationProfile = options.syncProfileData || state.narration?.syncProfile;
  if (
    narrationProfile
    && narrationProfile.text === safeText
    && narrationProfile.profile
    && Array.isArray(narrationProfile.profile.units)
    && narrationProfile.profile.units.length
  ) {
    return safeTargetDurationMs > 0
      ? scaleSpeechSyncProfile(narrationProfile.profile, safeTargetDurationMs)
      : narrationProfile.profile;
  }

  return getSpeechSyncProfile(safeText, safeTargetDurationMs);
}

function getSpeechSyncFrame(text = "", elapsedMs = 0, targetDurationMs = 0, options = {}) {
  const safeText = String(text || "");
  if (!safeText) {
    return {
      displayedText: "",
      mouthActive: false,
      speechElapsedMs: 0
    };
  }

  const profile = getResolvedSpeechSyncProfile(safeText, targetDurationMs, options);
  const safeElapsedMs = clamp(Number(elapsedMs) || 0, 0, profile.totalDurationMs);
  let displayedText = "";
  let mouthActive = false;
  let speechElapsedMs = 0;

  for (const unit of profile.units) {
    if (safeElapsedMs >= unit.pauseEndMs) {
      displayedText = safeText.slice(0, unit.endIndex);
      continue;
    }

    if (!unit.spokenText) {
      displayedText = safeText.slice(0, unit.endIndex);
      mouthActive = false;
      speechElapsedMs = 0;
      break;
    }

    if (safeElapsedMs >= unit.speechStartMs && safeElapsedMs <= unit.speechEndMs) {
      const speechProgress = clamp(
        (safeElapsedMs - unit.speechStartMs) / Math.max(1, unit.speechEndMs - unit.speechStartMs),
        0,
        1
      );
      const visibleUnitText = getVisibleChunkText(unit.displayText, speechProgress);
      displayedText = `${safeText.slice(0, unit.startIndex)}${visibleUnitText}`;
      mouthActive = true;
      speechElapsedMs = safeElapsedMs - unit.speechStartMs;
      break;
    }

    if (safeElapsedMs >= unit.speechEndMs && safeElapsedMs < unit.pauseEndMs) {
      displayedText = safeText.slice(0, unit.endIndex);
      break;
    }

    if (safeElapsedMs < unit.speechStartMs) {
      break;
    }
  }

  if (safeElapsedMs >= profile.totalDurationMs) {
    displayedText = safeText;
    mouthActive = false;
    speechElapsedMs = 0;
  }

  return {
    displayedText,
    mouthActive,
    speechElapsedMs
  };
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function canUseSpeechToText() {
  return Boolean(getSpeechRecognitionConstructor());
}

function canUseTextToSpeech() {
  return "speechSynthesis" in window;
}

function mergeSpeechText(baseText, spokenText) {
  const cleanBase = baseText.trimEnd();
  const cleanSpoken = spokenText.trim();

  if (!cleanBase) {
    return cleanSpoken;
  }

  if (!cleanSpoken) {
    return cleanBase;
  }

  const separator = /[\n.!?]$/.test(cleanBase) ? "\n" : " ";
  return `${cleanBase}${separator}${cleanSpoken}`;
}

function setMathsTranslatorStatus(message) {
  const result = applyStatusMessage(mathsTranslatorStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setPlaceValueToolStatus(message) {
  const result = applyStatusMessage(placeValueToolStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function setMathsTranslateLoading(isLoading, message = "Translating into pure maths...") {
  state.mathsTranslator.translating = Boolean(isLoading);

  if (mathsTranslateProgress) {
    mathsTranslateProgress.classList.toggle("hidden", !isLoading);
  }

  if (mathsTranslateProgressBar) {
    mathsTranslateProgressBar.style.width = isLoading ? "100%" : "0%";
  }

  if (mathsTranslateProgressLabel) {
    mathsTranslateProgressLabel.textContent = message;
  }
}

function updateMathsTranslationPreview(text) {
  if (mathsTranslationPreview) {
    mathsTranslationPreview.textContent = text?.trim() || "Pure maths translation will appear here.";
  }
}

function normalizeMathSpacing(text) {
  return String(text || "")
    .replace(/\s*([=+\-×÷<>≤≥≠^():/])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function parseNumberWordPhrase(phrase) {
  const rawTokens = String(phrase || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!rawTokens.length) {
    return null;
  }

  if (rawTokens.includes("and") && !rawTokens.includes("hundred") && !rawTokens.includes("thousand")) {
    return null;
  }

  const tokens = rawTokens.filter((token) => token !== "and");
  if (!tokens.length) {
    return null;
  }

  let total = 0;
  let current = 0;
  let matched = false;

  for (const token of tokens) {
    if (Object.prototype.hasOwnProperty.call(NUMBER_WORD_VALUES, token)) {
      current += NUMBER_WORD_VALUES[token];
      matched = true;
      continue;
    }

    if (token === "hundred") {
      current = Math.max(1, current) * 100;
      matched = true;
      continue;
    }

    if (token === "thousand") {
      total += Math.max(1, current) * 1000;
      current = 0;
      matched = true;
      continue;
    }

    return null;
  }

  if (!matched) {
    return null;
  }

  return String(total + current);
}

function replaceNumberWords(text) {
  const pattern = /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:[\s-]+(?:and[\s-]+)?(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand))*\b/gi;

  return String(text || "").replace(pattern, (match) => {
    const parsed = parseNumberWordPhrase(match);
    return parsed ?? match;
  });
}

function translateMathStatement(text) {
  const standaloneTranslation = translateStandaloneMathText(text);
  if (standaloneTranslation !== String(text || "").trim()) {
    return standaloneTranslation;
  }

  let result = replaceNumberWords(text)
    .replace(/[?]/g, "")
    .replace(/\bwhat is\b/gi, "")
    .replace(/\bcalculate\b/gi, "")
    .replace(/\bsolve\b/gi, "")
    .replace(/\bwork out\b/gi, "")
    .replace(/\bshow me\b/gi, "")
    .replace(/\bplease\b/gi, "")
    .replace(/\bthe answer to\b/gi, "")
    .replace(/\bthe\b/gi, " ");

  const pairTransforms = [
    { pattern: /\bsum of\s+(.+?)\s+and\s+(.+)$/i, build: (left, right) => `${left} + ${right}` },
    { pattern: /\bdifference between\s+(.+?)\s+and\s+(.+)$/i, build: (left, right) => `${left} - ${right}` },
    { pattern: /\bproduct of\s+(.+?)\s+and\s+(.+)$/i, build: (left, right) => `${left} × ${right}` },
    { pattern: /\bquotient of\s+(.+?)\s+and\s+(.+)$/i, build: (left, right) => `${left} ÷ ${right}` },
    { pattern: /\bratio of\s+(.+?)\s+to\s+(.+)$/i, build: (left, right) => `${left} : ${right}` }
  ];

  for (const transform of pairTransforms) {
    const match = result.trim().match(transform.pattern);
    if (match) {
      result = transform.build(
        normalizeMathSpacing(replaceNumberWords(match[1])),
        normalizeMathSpacing(replaceNumberWords(match[2]))
      );
      return normalizeMathSpacing(result);
    }
  }

  result = result
    .replace(/\badded to\b/gi, " + ")
    .replace(/\bplus\b/gi, " + ")
    .replace(/\bincreased by\b/gi, " + ")
    .replace(/\bmore than\b/gi, " + ")
    .replace(/\bsubtract\b/gi, " - ")
    .replace(/\bsubtracted from\b/gi, " - ")
    .replace(/\bminus\b/gi, " - ")
    .replace(/\btake away\b/gi, " - ")
    .replace(/\bdecreased by\b/gi, " - ")
    .replace(/\bmultiply(?:ing|ied)? by\b/gi, " × ")
    .replace(/\btimes\b/gi, " × ")
    .replace(/\binto\b/gi, " × ")
    .replace(/\bdouble of\b/gi, "2 × ")
    .replace(/\btriple of\b/gi, "3 × ")
    .replace(/\bdivided by\b/gi, " ÷ ")
    .replace(/\bover\b/gi, " ÷ ")
    .replace(/\bquotient\b/gi, " ÷ ")
    .replace(/\bgreater than or equal to\b/gi, " ≥ ")
    .replace(/\bless than or equal to\b/gi, " ≤ ")
    .replace(/\bnot equal to\b/gi, " ≠ ")
    .replace(/\bgreater than\b/gi, " > ")
    .replace(/\bless than\b/gi, " < ")
    .replace(/\bis equal to\b/gi, " = ")
    .replace(/\bequals\b/gi, " = ")
    .replace(/\bequal to\b/gi, " = ")
    .replace(/\bpercent\b/gi, "%")
    .replace(/\bto the power of\b/gi, " ^ ")
    .replace(/\bsquared\b/gi, "^2")
    .replace(/\bcubed\b/gi, "^3");

  result = result
    .replace(/\bhalf of\s+(.+)$/i, "$1 ÷ 2")
    .replace(/\bdouble\s+(.+)$/i, "2 × $1")
    .replace(/\btriple\s+(.+)$/i, "3 × $1")
    .replace(/\b([A-Za-z]+)\s+has\s+(\d+)\s+sides\b/gi, "$1 = $2 sides")
    .replace(/\b([A-Za-z]+)\s+has\s+(\d+)\s+corners\b/gi, "$1 = $2 corners")
    .replace(/\b([A-Za-z0-9]+)\s+is\s+([<>≤≥≠])\s+([A-Za-z0-9]+)\b/gi, "$1 $2 $3")
    .replace(/\b([A-Za-z0-9]+)\s+is\s+greater than\s+([A-Za-z0-9]+)\b/gi, "$1 > $2")
    .replace(/\b([A-Za-z0-9]+)\s+is\s+less than\s+([A-Za-z0-9]+)\b/gi, "$1 < $2")
    .replace(/\b([A-Za-z0-9]+)\s+is\s+([A-Za-z0-9]+)\b/gi, "$1 = $2");

  return normalizeMathSpacing(result);
}

function translateMathLine(line) {
  const rawLine = String(line || "");
  const headingMatch = rawLine.match(/^(\s*#{1,3}\s+)(.*)$/);
  const prefix = headingMatch ? headingMatch[1] : "";
  const body = (headingMatch ? headingMatch[2] : rawLine).trim();
  if (!body) {
    return "";
  }

  return `${prefix}${translateMathStatement(body)}`.trimEnd();
}

function translateToPureMaths(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => translateMathLine(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function syncMathsTranslation(options = {}) {
  const sourceText = mathsSourceInput?.value.trim() || (options.useLessonInputSource ? lessonInput.value.trim() : "") || "";
  const applyToLesson = options.applyToLesson !== false;
  const shouldTranslate = options.force === true || Boolean(state.mathsTranslator.auto);

  if (!sourceText) {
    state.mathsTranslator.lastSource = "";
    state.mathsTranslator.lastTranslated = "";
    setMathsTranslateLoading(false, "Translation complete.");
    updateMathsTranslationPreview("");
    if (options.fromUserAction) {
      setMathsTranslatorStatus("Maths translator is ready. Paste plain text and the lesson box will receive the translated maths version.");
    }
    return "";
  }

  const translated = shouldTranslate ? translateToPureMaths(sourceText) : sourceText;
  state.mathsTranslator.lastSource = sourceText;
  state.mathsTranslator.lastTranslated = translated;
  setMathsTranslateLoading(false, "Translation complete.");
  updateMathsTranslationPreview(translated);

  if (applyToLesson && translated && lessonInput.value !== translated) {
    lessonInput.value = translated;
    handleLessonInputChange();
  }

  setMathsTranslatorStatus(shouldTranslate
    ? "Source text translated into pure maths and synced to the lesson box."
    : "Auto translate is off. Use Translate To Pure Maths when you want to sync the result.");

  return translated;
}

function scheduleMathsTranslation(options = {}) {
  if (state.mathsTranslator.timerId) {
    window.clearTimeout(state.mathsTranslator.timerId);
  }

  const sourceText = mathsSourceInput?.value.trim() || lessonInput.value.trim() || "";
  if (!sourceText) {
    syncMathsTranslation(options);
    return;
  }

  const requestId = state.mathsTranslator.requestId + 1;
  state.mathsTranslator.requestId = requestId;
  setMathsTranslateLoading(true, "Translating into pure maths...");
  setMathsTranslatorStatus("Translating your content into pure maths...");

  state.mathsTranslator.timerId = window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      if (requestId !== state.mathsTranslator.requestId) {
        return;
      }

      state.mathsTranslator.timerId = 0;
      syncMathsTranslation(options);
    });
  }, options.delayMs ?? 180);
}

function scheduleMathsPreviewOnly(sourceText, options = {}) {
  if (state.mathsTranslator.previewTimerId) {
    window.clearTimeout(state.mathsTranslator.previewTimerId);
  }

  const safeText = String(sourceText || "").trim();
  if (!safeText) {
    updateMathsTranslationPreview("");
    setMathsTranslateLoading(false, "Preview ready.");
    return;
  }

  setMathsTranslateLoading(true, options.loadingLabel || "Preparing maths preview...");
  state.mathsTranslator.previewTimerId = window.setTimeout(() => {
    state.mathsTranslator.previewTimerId = 0;
    window.requestAnimationFrame(() => {
      const previewText = translateToPureMaths(safeText);
      setMathsTranslateLoading(false, "Preview ready.");
      updateMathsTranslationPreview(previewText);
      if (options.statusMessage) {
        setMathsTranslatorStatus(options.statusMessage);
      }
    });
  }, options.delayMs ?? 160);
}

function scheduleLessonInputChange(delayMs = 140) {
  if (state.lessonInputTimerId) {
    window.clearTimeout(state.lessonInputTimerId);
  }

  state.lessonInputTimerId = window.setTimeout(() => {
    state.lessonInputTimerId = 0;
    window.requestAnimationFrame(() => {
      handleLessonInputChange();
    });
  }, delayMs);
}

function clearNarrationWarmupTimer() {
  if (state.narrationWarmup.timerId) {
    window.clearTimeout(state.narrationWarmup.timerId);
    state.narrationWarmup.timerId = 0;
  }
}

function shouldWarmupNarration(text, voice) {
  return false;
}

function scheduleNarrationWarmup(delayMs = 700) {
  clearNarrationWarmupTimer();

  const text = state.text.trim();
  const voice = state.preferredNarrationVoice || "anjali";
  if (!shouldWarmupNarration(text, voice)) {
    return;
  }

  if (
    state.narration.url
    && state.narration.textSource === text
    && state.narration.voice === voice
    && state.narration.blob
  ) {
    return;
  }

  const requestId = state.narrationWarmup.requestId + 1;
  state.narrationWarmup.requestId = requestId;
  state.narrationWarmup.text = text;
  state.narrationWarmup.voice = voice;
  state.narrationWarmup.timerId = window.setTimeout(async () => {
    state.narrationWarmup.timerId = 0;
    if (requestId !== state.narrationWarmup.requestId || !shouldWarmupNarration(text, voice)) {
      return;
    }

    state.narrationWarmup.active = true;
    try {
      let syncProfile = null;
      const blob = await requestNarrationBlob(text, voice, {
        timeoutMs: getLongNarrationRequestTimeoutMs(text),
        onSyncProfile: (profile) => {
          syncProfile = profile;
        }
      });
      if (
        requestId !== state.narrationWarmup.requestId
        || state.text.trim() !== text
        || state.preferredNarrationVoice !== voice
      ) {
        return;
      }

      const fileName = `generated-${voice}-narration.wav`;
      const label = `Generated ${getNarrationVoiceLabel(voice).toLowerCase()} narration`;
      await setNarrationFromBlob(blob, fileName, label, text, voice, { silent: true, syncProfile });
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === state.narrationWarmup.requestId) {
        state.narrationWarmup.active = false;
      }
    }
  }, delayMs);
}

function getEffectiveLessonText() {
  return lessonInput.value.trim();
}

const INTERNAL_HELPER_TEXT_SIGNATURES = [
  {
    key: "presentation-template-helper",
    label: "the Presentation Template helper copy",
    fragments: [
      "presentation template",
      "classic stage stays as the default until you choose another template",
      "pick a screen look before you open the presentation",
      "current classic blue teaching board remains active"
    ]
  }
];

function normalizeLessonValidationText(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function detectInternalHelperLessonText(text = "") {
  const normalizedText = normalizeLessonValidationText(text);
  if (!normalizedText) {
    return null;
  }

  return INTERNAL_HELPER_TEXT_SIGNATURES.find((signature) => {
    const matchCount = signature.fragments.reduce((count, fragment) => {
      return count + (normalizedText.includes(fragment) ? 1 : 0);
    }, 0);
    return matchCount >= 2;
  }) || null;
}

function getLessonTextIssue(text = "") {
  const safeText = String(text || "").trim();
  if (!safeText) {
    return {
      kind: "empty",
      message: "Please enter content first."
    };
  }

  const helperMatch = detectInternalHelperLessonText(safeText);
  if (helperMatch) {
    return {
      kind: helperMatch.key,
      message: `The lesson box contains ${helperMatch.label}, not your lesson. Clear that helper text and paste only the real lesson before you continue.`
    };
  }

  return null;
}

function ensureLessonTextIsReady(text = "", options = {}) {
  const issue = getLessonTextIssue(text);
  if (!issue) {
    return true;
  }

  if (options.focusInput !== false && lessonInput) {
    lessonInput.focus();
  }
  setStatus(issue.message, { error: issue.kind !== "empty" });
  return false;
}

function commitLatestLessonText() {
  if (state.lessonInputTimerId) {
    window.clearTimeout(state.lessonInputTimerId);
    state.lessonInputTimerId = 0;
  }

  if (isPdfPresentationMode()) {
    return state.text.trim();
  }

  const text = getEffectiveLessonText();
  applyLessonRenderStateFromText(text, {
    displayedText: state.speaking ? state.displayedText : text,
    previewPageIndex: stagePanel.classList.contains("hidden") ? 0 : state.previewPageIndex,
    renderedPageCount: state.renderedPageCount
  });

  return text;
}

function cloneTextStyle(style) {
  return {
    color: style?.color || "#ffffff",
    bold: Boolean(style?.bold),
    italic: Boolean(style?.italic),
    underline: Boolean(style?.underline),
    caseMode: style?.caseMode || "original"
  };
}

function getBaseTextStyle() {
  const style = cloneTextStyle(state.displayStyle);
  if (normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES) {
    if (String(style.color).toLowerCase() === "#ffffff") {
        style.color = "#050709";
    }
  }
  return style;
}

function looksLikeAutoHeadingLine(line = "", index = 0, totalLines = 0) {
  const safeLine = String(line || "").trim();
  if (!safeLine) {
    return false;
  }

  if (/^#{1,3}\s+/.test(safeLine)) {
    return true;
  }

  if (/^\s*(?:[-*]|\u2022)\s+/.test(safeLine)) {
    return false;
  }

  if (safeLine.length > 72) {
    return false;
  }

  const words = safeLine.split(/\s+/).filter(Boolean);
  if (words.length > 8) {
    return false;
  }

  if (/:\s*$/.test(safeLine)) {
    return true;
  }

  if (/[.!?]\s*$/.test(safeLine)) {
    return false;
  }

  const plainText = safeLine.replace(/[^A-Za-z\s]/g, " ").trim();
  const plainWords = plainText.split(/\s+/).filter(Boolean);
  const isAllCaps = plainWords.length > 0 && plainWords.every((word) => word === word.toUpperCase());
  const isTitleCase = plainWords.length > 0 && plainWords.every((word) => /^[A-Z][a-z]+$/.test(word));

  if (isAllCaps || isTitleCase) {
    return true;
  }

  return index === 0 && totalLines > 1 && plainWords.length > 0 && plainWords.length <= 7;
}

function getResolvedTextStyle(style, baseStyle = getBaseTextStyle()) {
  return {
    ...baseStyle,
    ...(style || {})
  };
}

function textStyleMatches(leftStyle, rightStyle) {
  return leftStyle.color === rightStyle.color
    && leftStyle.bold === rightStyle.bold
    && leftStyle.italic === rightStyle.italic
    && leftStyle.underline === rightStyle.underline;
}

function updateToggleButtons(toggleMap) {
  toggleMap.forEach(({ button, active }) => {
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function findKeywordStyleRule(phrase) {
  return state.keywordStyles.find((rule) => rule.phrase === phrase) || null;
}

function getSelectedPhraseLabel(phrase) {
  if (!phrase) {
    return "None";
  }

  return phrase.length > 72 ? `${phrase.slice(0, 69)}...` : phrase;
}

function updateSelectedTextStyleUi() {
  const hasSelection = Boolean(state.selectedPhrase);
  selectionStyleCard.classList.remove("hidden");

  if (!hasSelection) {
    selectedKeywordLabel.textContent = "None";
    selectedTextColorSelect.value = state.selectionStyle.color;
    selectedTextColorSelect.disabled = true;
    selectedBoldToggleBtn.disabled = true;
    selectedItalicToggleBtn.disabled = true;
    selectedUnderlineToggleBtn.disabled = true;
    applySelectedStyleBtn.disabled = true;
    clearSelectedStyleBtn.disabled = true;
    updateToggleButtons([
      { button: selectedBoldToggleBtn, active: state.selectionStyle.bold },
      { button: selectedItalicToggleBtn, active: state.selectionStyle.italic },
      { button: selectedUnderlineToggleBtn, active: state.selectionStyle.underline }
    ]);
    setSelectionStyleStatus("Select a word or phrase in the lesson text, or use # at the start of a line to make that line a heading.");
    return;
  }

  const activeStyle = cloneTextStyle(state.selectionStyle);
  const existingRule = findKeywordStyleRule(state.selectedPhrase);

  selectedKeywordLabel.textContent = getSelectedPhraseLabel(state.selectedPhrase);
  selectedTextColorSelect.value = activeStyle.color;
  selectedTextColorSelect.disabled = false;
  selectedBoldToggleBtn.disabled = false;
  selectedItalicToggleBtn.disabled = false;
  selectedUnderlineToggleBtn.disabled = false;
  applySelectedStyleBtn.disabled = false;
  clearSelectedStyleBtn.disabled = !existingRule;

  updateToggleButtons([
    { button: selectedBoldToggleBtn, active: activeStyle.bold },
    { button: selectedItalicToggleBtn, active: activeStyle.italic },
    { button: selectedUnderlineToggleBtn, active: activeStyle.underline }
  ]);

  if (existingRule) {
    setSelectionStyleStatus(`A special style is saved for "${getSelectedPhraseLabel(state.selectedPhrase)}".`);
  } else {
    setSelectionStyleStatus("Choose the look for the selected text, then click Apply To Selected Text.");
  }
}

function updateTextStyleUi() {
  updateToggleButtons([
    { button: boldToggleBtn, active: state.displayStyle.bold },
    { button: italicToggleBtn, active: state.displayStyle.italic },
    { button: underlineToggleBtn, active: state.displayStyle.underline },
    { button: stageBoldBtn, active: state.displayStyle.bold },
    { button: stageItalicBtn, active: state.displayStyle.italic },
    { button: stageUnderlineBtn, active: state.displayStyle.underline }
  ]);

  updateToggleButtons([
    { button: caseOriginalBtn, active: state.displayStyle.caseMode === "original" },
    { button: caseLowerBtn, active: state.displayStyle.caseMode === "lower" },
    { button: caseTitleBtn, active: state.displayStyle.caseMode === "title" },
    { button: caseUpperBtn, active: state.displayStyle.caseMode === "upper" }
  ]);

  textColorSelect.value = state.displayStyle.color;
  updateSelectedTextStyleUi();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function updateDisplayStyle(nextStyle) {
  state.displayStyle = {
    ...state.displayStyle,
    ...nextStyle
  };

  if (state.selectedPhrase && !findKeywordStyleRule(state.selectedPhrase)) {
    state.selectionStyle = getBaseTextStyle();
  }

  updateTextStyleUi();
}

function updateSelectionStyle(nextStyle) {
  state.selectionStyle = {
    ...state.selectionStyle,
    ...nextStyle
  };

  if (state.selectedPhrase) {
    const existingRuleIndex = state.keywordStyles.findIndex((rule) => rule.phrase === state.selectedPhrase);
    const nextRule = {
      phrase: state.selectedPhrase,
      style: cloneTextStyle(state.selectionStyle)
    };

    if (existingRuleIndex >= 0) {
      state.keywordStyles[existingRuleIndex] = nextRule;
    } else {
      state.keywordStyles.push(nextRule);
    }
  }

  updateSelectedTextStyleUi();

  if (!stagePanel.classList.contains("hidden")) {
    if (typeof scheduleLessonInputChange === "function") {
        scheduleLessonInputChange(0);
    } else {
        drawScene(state.mouthOpen);
    }
  }
}

function getContentFont(size, style = state.displayStyle) {
  const resolvedStyle = getResolvedTextStyle(style);
  const fontStyle = resolvedStyle.italic ? "italic" : "normal";
  const fontWeight = resolvedStyle.bold ? "800" : "600";
  return `${fontStyle} ${fontWeight} ${size}px "Baloo 2", "Comic Sans MS", "Nunito"`;
}

function toTitleCase(text) {
  return text.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function applyDisplayCase(text, caseMode = state.displayStyle.caseMode) {
  if (!text) {
    return text;
  }

  switch (caseMode) {
    case "lower":
      return text.toLowerCase();
    case "title":
      return toTitleCase(text);
    case "upper":
      return text.toUpperCase();
    default:
      return text;
  }
}

function normalizeSelectedText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function refreshSelectedPhraseFromInput() {
  const start = lessonInput.selectionStart ?? 0;
  const end = lessonInput.selectionEnd ?? 0;
  const selectedText = normalizeSelectedText(lessonInput.value.slice(start, end));

  if (selectedText === state.selectedPhrase) {
    updateSelectedTextStyleUi();
    return;
  }

  state.selectedPhrase = selectedText;
  state.selectionStyle = selectedText && findKeywordStyleRule(selectedText)
    ? cloneTextStyle(findKeywordStyleRule(selectedText).style)
    : getBaseTextStyle();

  updateSelectedTextStyleUi();
}

function applySelectedTextStyle() {
  if (!state.selectedPhrase) {
    setSelectionStyleStatus("Select a word or phrase first.");
    return;
  }

  const nextRule = {
    phrase: state.selectedPhrase,
    style: cloneTextStyle(state.selectionStyle)
  };

  const existingRuleIndex = state.keywordStyles.findIndex((rule) => rule.phrase === state.selectedPhrase);
  if (existingRuleIndex >= 0) {
    state.keywordStyles[existingRuleIndex] = nextRule;
  } else {
    state.keywordStyles.push(nextRule);
  }

  updateSelectedTextStyleUi();
  setSelectionStyleStatus(`Style applied to "${getSelectedPhraseLabel(state.selectedPhrase)}". Matching text on the slide will use this look.`);

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function clearSelectedTextStyle() {
  if (!state.selectedPhrase) {
    setSelectionStyleStatus("Select a word or phrase first.");
    return;
  }

  state.keywordStyles = state.keywordStyles.filter((rule) => rule.phrase !== state.selectedPhrase);
  state.selectionStyle = getBaseTextStyle();
  updateSelectedTextStyleUi();
  setSelectionStyleStatus(`Special styling cleared for "${getSelectedPhraseLabel(state.selectedPhrase)}".`);

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function handleLessonInputChange() {
  const nextText = lessonInput.value.trim();
  const lessonIssue = getLessonTextIssue(nextText);

  if (!isPdfPresentationMode()) {
    applyLessonRenderStateFromText(nextText, {
      displayedText: state.speaking ? state.displayedText : nextText,
      previewPageIndex: stagePanel.classList.contains("hidden") ? 0 : state.previewPageIndex,
      renderedPageCount: state.renderedPageCount
    });
  }

  if (!state.speaking && !state.exportingVideo && !isPdfPresentationMode()) {
    updatePlaybackProgressUi(0, false);
  }

  syncExtractedPdfLessonImages({ skipDraw: true });

  updateSpeechToolsUi();
  refreshSelectedPhraseFromInput();

  if (lessonIssue && lessonIssue.kind !== "empty" && !state.speaking && !state.exportingVideo) {
    setStatus(lessonIssue.message, { error: true });
  }

  if (scenePromptInput && !scenePromptInput.value.trim()) {
    const previewScene = analyzeScenePrompt(nextText);
    state.scene = {
      ...state.scene,
      ...previewScene,
      vfx: sceneVfxSelect && sceneVfxSelect.value === "auto" ? previewScene.vfx : (sceneVfxSelect ? sceneVfxSelect.value : previewScene.vfx),
      exportQuality: getSelectedExportQuality()
    };
    updateScenePreview();
  }

  if (!stagePanel.classList.contains("hidden") && !isPdfPresentationMode() && !state.speaking) {
    drawScene(state.mouthOpen);
    setStatus(nextText
      ? "Screen updated automatically. Click Play Slide when you want narration to start."
      : "Type maths content and the screen will update automatically.");
  }

  if (nextText) {
    scheduleNarrationWarmup();
  } else {
    clearNarrationWarmupTimer();
  }
}

function applyMathsLessonTemplate(text, helperMessage) {
  const content = String(text || "").trim();
  if (!content) {
    return;
  }

  stopDictation(false);
  stopInputPreview(false);
  if (mathsSourceInput) {
    mathsSourceInput.value = content;
  }
  syncMathsTranslation({ applyToLesson: true, force: true, fromUserAction: true });
  lessonInput.focus();
  lessonInput.setSelectionRange(lessonInput.value.length, lessonInput.value.length);
  setMathsHelperStatus(helperMessage);
  setSpeechToolsStatus("Maths starter content was loaded into the lesson box.");
  setStatus("Maths Teacher content is ready to preview, present, or export.");
}

function initializeMathsTeacherAssets() {
  if (anjaliSampleAudio) {
    anjaliSampleAudio.src = resolveProjectAssetUrl(ANJALI_SAMPLE_AUDIO_FILE);
  }

  if (mathsAutoTranslateToggle) {
    mathsAutoTranslateToggle.checked = true;
  }
  state.mathsTranslator.auto = true;
  setMathsTranslateLoading(false, "Translation complete.");
  updateMathsTranslationPreview("");
  setMathsTranslatorStatus("Maths translator is ready. Paste plain text and the lesson box will receive the translated maths version.");
  setMathsHelperStatus("Maths practice is ready. Load starter lessons, boxed tables, mixed sums, listen to the sample, or use the sample as short narration.");
}

async function useBundledAnjaliSampleAsNarration() {
  const assetUrl = resolveProjectAssetUrl(ANJALI_SAMPLE_AUDIO_FILE);

  try {
    const audioElement = await createLoadedAudio(assetUrl);
    const durationMs = Number.isFinite(audioElement.duration)
      ? Math.max(1000, Math.ceil(audioElement.duration * 1000))
      : getDefaultNarrationDurationMs();

    resetNarrationState();
    state.narration = {
      url: assetUrl,
      fileName: ANJALI_SAMPLE_AUDIO_FILE,
      durationMs,
      source: "Anjali narration",
      blob: null,
      textSource: state.text || lessonInput.value.trim(),
      voice: "anjali"
    };

    updateNarrationUi();
    setRecordingUi(false);
    setAudioStatus(`Anjali narration: ${ANJALI_SAMPLE_AUDIO_FILE}`);
    state.preferredNarrationVoice = "anjali";
    updatePreferredVoiceUi();
    setMathsHelperStatus("Anjali's narration is now loaded in the narration area. This works best for short intros or short teaching clips.");
    setNarrationGenStatus("Anjali narration is loaded into the app.");
    setStatus("Anjali narration is ready. Play uses this audio, and download will include it.");
  } catch (error) {
    console.error(error);
    setMathsHelperStatus("The sample player is ready, but automatic loading failed here. If needed, use the narration upload and choose voice-preview-anjali.mp3 manually.");
    setStatus(error.message || "The Anjali sample could not be loaded automatically.");
  }
}

function updatePreferredVoiceUi() {
  state.preferredNarrationVoice = "anjali";
  if (slideVoiceSelect) {
    slideVoiceSelect.value = "anjali";
    slideVoiceSelect.disabled = true;
  }
}

function getNarrationVoiceLabel(voice) {
  return voice === "anjali" ? "Anjali" : "Anjali";
}

function setPreviewVoiceChooserVisible(isVisible) {
  previewVoiceChooser.classList.toggle("hidden", !isVisible);
}

function updateSpeechToolsUi() {
  const canPreviewText = Boolean(lessonInput.value.trim()) && !state.inputPreviewing && !state.dictation.active;
  dictateBtn.disabled = state.dictation.active || !canUseSpeechToText();
  stopDictateBtn.disabled = !state.dictation.active;
  previewTextBtn.disabled = !canPreviewText;
  stopPreviewBtn.disabled = !state.inputPreviewing;
  if (previewAnjaliBtn) {
    previewAnjaliBtn.disabled = !canPreviewText;
  }
  if (loadAnjaliNarrationBtn) {
    loadAnjaliNarrationBtn.disabled = !lessonInput.value.trim() || state.generatingNarration;
    loadAnjaliNarrationBtn.textContent = state.generatingNarration
      ? "Generating Anjali..."
      : "Generate Anjali Narration";
    loadAnjaliNarrationBtn.setAttribute("aria-busy", state.generatingNarration ? "true" : "false");
  }
  if (downloadAnjaliBtn) {
    downloadAnjaliBtn.disabled = !lessonInput.value.trim() || state.generatingNarration;
    downloadAnjaliBtn.textContent = state.generatingNarration
      ? "Preparing Download..."
      : "Download Anjali Narration";
    downloadAnjaliBtn.setAttribute("aria-busy", state.generatingNarration ? "true" : "false");
  }
  transcribeAudioInput.disabled = state.transcribing;
  submitTranscribeBtn.disabled = !state.transcribeSelectedFile || state.transcribing;

  if (!canPreviewText) {
    setPreviewVoiceChooserVisible(false);
  }
}

function resetTranscribeProgress() {
  transcribeProgress.classList.add("hidden");
  transcribeProgress.setAttribute("aria-valuenow", "0");
  transcribeProgressBar.style.width = "0%";
  transcribeProgressLabel.textContent = "0% complete";
  resetTaskProgressUi();
}

function setTranscribeProgress(percent, message = "") {
  const safePercent = clamp(Math.round(percent), 0, 100);
  transcribeProgress.classList.remove("hidden");
  transcribeProgress.setAttribute("aria-valuenow", String(safePercent));
  transcribeProgressBar.style.width = `${safePercent}%`;
  updateTaskProgressUi(safePercent / 100, true, {
    label: message || "Transcribing audio"
  });
  transcribeProgressLabel.textContent = message
    ? `${safePercent}% - ${message}`
    : `${safePercent}% complete`;
}

function setPdfStatus(message) {
  const result = applyStatusMessage(pdfStatus, message);
  if (result.isError) {
    showRuntimeDisplayError(result.text);
  }
}

function resetPdfProgress() {
  pdfProgress.classList.add("hidden");
  pdfProgress.setAttribute("aria-valuenow", "0");
  pdfProgressBar.style.width = "0%";
  pdfProgressLabel.textContent = "0% complete";
  resetTaskProgressUi();
}

function setPdfProgress(percent, message = "") {
  const safePercent = clamp(Math.round(percent), 0, 100);
  pdfProgress.classList.remove("hidden");
  pdfProgress.setAttribute("aria-valuenow", String(safePercent));
  pdfProgressBar.style.width = `${safePercent}%`;
  updateTaskProgressUi(safePercent / 100, true, {
    label: message || "Loading PDF"
  });
  pdfProgressLabel.textContent = message
    ? `${safePercent}% - ${message}`
    : `${safePercent}% complete`;
}

function getPdfFileSignature(file) {
  if (!file) {
    return "";
  }

  return `${file.name}::${file.size}::${file.lastModified}`;
}

function formatDurationMs(durationMs = 0) {
  const safeValue = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPdfSelectedPageIndexes() {
  if (!state.pdf.pages.length) {
    return [];
  }

  return Array.from(new Set(state.pdf.selectedPageIndexes))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < state.pdf.pages.length)
    .sort((left, right) => left - right);
}

function getPdfSelectedPages() {
  return getPdfSelectedPageIndexes()
    .map((index) => state.pdf.pages[index])
    .filter(Boolean);
}

function getPdfContextLayoutArea(hasImages = false) {
  const metrics = getPresentationTemplateMetrics();
  const leftInset = Number.isFinite(metrics.contentLeftInset) ? metrics.contentLeftInset : metrics.contentSideInset;
  const topInset = metrics.contentTopInset;
  const pinnedStripArea = hasImages ? getPinnedPdfImageStripArea() : null;
  const rightInset = hasImages && pinnedStripArea
    ? Math.max(Number.isFinite(metrics.contentRightInset) ? metrics.contentRightInset : metrics.contentSideInset, pinnedStripArea.width + STAGE_IMAGE_WORKSPACE_PADDING_PX + STAGE_PDF_IMAGE_STRIP_GAP_PX)
    : (Number.isFinite(metrics.contentRightInset) ? metrics.contentRightInset : metrics.contentSideInset);
  const bottomInset = metrics.contentBottomInset;

  return {
    x: leftInset,
    y: topInset,
    width: Math.max(360, canvas.width - leftInset - rightInset),
    height: Math.max(320, canvas.height - topInset - bottomInset)
  };
}

function getPdfContextPagesKey() {
  const selectedIndexes = getPdfSelectedPageIndexes().join(",");
  const manualPdfSourceSignature = Array.from(new Set(
    state.images
      .filter((item) => item?.sourceTag === "pdf-clipboard" && Number.isFinite(Number(item?.sourcePageNumber)))
      .map((item) => Math.max(0, Math.round(Number(item.sourcePageNumber) || 0)))
      .filter(Boolean)
  ))
    .sort((left, right) => left - right)
    .join(",");

  return [
    selectedIndexes,
    canvas.width,
    canvas.height,
    state.fontScale,
    normalizePresentationTemplate(state.presentationTemplate),
    manualPdfSourceSignature
  ].join("|");
}

function getLayoutPageText(rows = []) {
  return rows
    .filter((row) => !row?.spacer)
    .map((row) => (row.segments || []).map((segment) => segment.text).join(""))
    .join("\n")
    .trim();
}

function buildPdfContextPages() {
  const selectedPages = getPdfSelectedPages();
  const contextPages = [];
  const manualPdfSourcePages = new Set(
    state.images
      .filter((item) => item?.sourceTag === "pdf-clipboard" && Number.isFinite(Number(item?.sourcePageNumber)))
      .map((item) => Math.max(0, Math.round(Number(item.sourcePageNumber) || 0)))
      .filter(Boolean)
  );
  let textCursor = 0;

  selectedPages.forEach((page, selectionIndex) => {
    const pageText = `${page?.text || ""}`.trim();
    const sourcePageNumber = Math.max(0, Math.round(Number(page?.pageNumber) || (selectionIndex + 1)));
    const exampleImages = Array.isArray(page?.exampleImages) ? page.exampleImages : [];
    const hasImages = Boolean(exampleImages.length || manualPdfSourcePages.has(sourcePageNumber));
    const contentArea = getPdfContextLayoutArea(hasImages);
    const layout = getContentLayoutWithMetrics(
      buildDisplayedLines(pageText),
      contentArea.width,
      contentArea.height,
      !pageText,
      {
        wordCount: page?.wordCount || splitIntoWords(pageText).length,
        hasImages
      }
    );
    const parts = paginateLayout(layout, contentArea.height);
    const totalParts = Math.max(1, parts.length);

    parts.forEach((part, partIndex) => {
      const partText = getLayoutPageText(part.rows);
      contextPages.push({
        id: `pdf-context-${sourcePageNumber}-${partIndex + 1}`,
        pageNumber: sourcePageNumber,
        sourcePageNumber,
        originalPageIndex: Number.isInteger(page?.index) ? page.index : selectionIndex,
        selectionIndex,
        partIndex,
        totalParts,
        isContinuation: partIndex > 0,
        text: partText,
        sourcePageText: pageText,
        pageTextStartIndex: textCursor,
        pageTextEndIndex: textCursor + pageText.length,
        wordCount: splitIntoWords(partText).length,
        hasImages: hasImages && partIndex === 0,
        exampleImages,
        rows: part.rows || [],
        fontSize: part.fontSize || layout.fontSize,
        rowHeight: part.rowHeight || layout.rowHeight,
        totalHeight: part.totalHeight || 0,
        page
      });
    });

    textCursor += pageText.length;
    if (selectionIndex < selectedPages.length - 1) {
      textCursor += 2;
    }
  });

  state.pdf.contextPages = contextPages;
  state.pdf.contextPagesKey = getPdfContextPagesKey();
  return contextPages;
}

function getPdfContextPages() {
  if (!getPdfSelectedPageCount()) {
    state.pdf.contextPages = [];
    state.pdf.contextPagesKey = "";
    return [];
  }

  const nextKey = getPdfContextPagesKey();
  if (state.pdf.contextPagesKey !== nextKey || !Array.isArray(state.pdf.contextPages) || !state.pdf.contextPages.length) {
    return buildPdfContextPages();
  }

  return state.pdf.contextPages;
}

function getPdfPresentationPages(renderMode = getPdfRenderMode()) {
  return renderMode === "exact" ? getPdfSelectedPages() : getPdfContextPages();
}

function getPdfPresentationPageIndexForSourcePageNumber(sourcePageNumber = 0) {
  const safePageNumber = Math.max(0, Math.round(Number(sourcePageNumber) || 0));
  if (!safePageNumber) {
    return -1;
  }

  return getPdfPresentationPages().findIndex((page) => Number(page?.sourcePageNumber || page?.pageNumber) === safePageNumber);
}

function getPdfSelectionIndexForSourcePageNumber(sourcePageNumber = 0) {
  const safePageNumber = Math.max(0, Math.round(Number(sourcePageNumber) || 0));
  if (!safePageNumber) {
    return -1;
  }

  return getPdfSelectedPages().findIndex((page) => Number(page?.pageNumber) === safePageNumber);
}

function getPdfAutoExampleImagesForPage(pageIndex = state.previewPageIndex) {
  if (!isPdfPresentationMode() || getPdfRenderMode() !== "context") {
    return [];
  }

  const contextPages = getPdfContextPages();
  const safePageIndex = clamp(pageIndex, 0, Math.max(0, contextPages.length - 1));
  const page = contextPages[safePageIndex] || null;
  if (!page || !Array.isArray(page.exampleImages) || !page.exampleImages.length) {
    return [];
  }

  const hasManualPdfImages = getImageEntriesForPage(safePageIndex).some(({ item }) => isPinnedPdfExampleImage(item));
  if (hasManualPdfImages) {
    return [];
  }

  return page.exampleImages.filter((image) => image?.image);
}

function getPdfSelectedPageCount() {
  return getPdfSelectedPages().length;
}

function getPdfPresentationPageCount(renderMode = getPdfRenderMode()) {
  return getPdfPresentationPages(renderMode).length;
}

function hasActivePdfSelection() {
  return Boolean(state.pdf.pages.length && getPdfSelectedPageCount());
}

function shouldPreferPdfScreenFromInput() {
  return false;
}

function getPdfPresentationText() {
  return getPdfSelectedPages()
    .map((page) => page.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

function getPdfRenderMode() {
  return state.pdf?.renderMode === "exact" ? "exact" : "context";
}

function setPdfRenderMode(renderMode = "context") {
  state.pdf.renderMode = renderMode === "exact" ? "exact" : "context";
  state.pdf.autoImageSyncKey = "";
}

function invalidatePdfPresentationRequest() {
  state.pdf.requestId = Math.max(0, Math.round(Number(state.pdf.requestId) || 0)) + 1;
  return state.pdf.requestId;
}

function createLessonRenderStateSnapshot() {
  return {
    presentationMode: state.presentationMode,
    text: state.text,
    lines: [...state.lines],
    words: [...state.words],
    tokens: [...state.tokens],
    displayedText: state.displayedText,
    previewPageIndex: state.previewPageIndex,
    renderedPageCount: state.renderedPageCount,
    contentScrollOffset: state.contentScrollOffset
  };
}

function applyLessonRenderStateFromText(text, options = {}) {
  const safeText = typeof text === "string" ? text : "";
  state.presentationMode = "lesson";
  state.text = safeText;
  state.lines = splitIntoLines(safeText);
  state.words = splitIntoWords(safeText);
  state.tokens = splitIntoTokens(safeText);
  state.displayedText = typeof options.displayedText === "string" ? options.displayedText : safeText;
  state.previewPageIndex = Math.max(0, Math.round(Number(options.previewPageIndex) || 0));
  state.renderedPageCount = Math.max(1, Math.round(Number(options.renderedPageCount) || 1));
  state.contentScrollOffset = 0;
  // Invalidate layout cache whenever the source text changes
  invalidateDrawSceneLayoutCache();
}

function restoreLessonRenderStateSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  state.presentationMode = snapshot.presentationMode;
  state.text = snapshot.text;
  state.lines = [...snapshot.lines];
  state.words = [...snapshot.words];
  state.tokens = [...snapshot.tokens];
  state.displayedText = snapshot.displayedText;
  state.previewPageIndex = snapshot.previewPageIndex;
  state.renderedPageCount = snapshot.renderedPageCount;
  state.contentScrollOffset = snapshot.contentScrollOffset;
}

function getPdfPlaybackRate() {
  const parsedRate = Number(state.pdf.playbackRate);
  return Number.isFinite(parsedRate) && parsedRate > 0
    ? clamp(parsedRate, 0.5, 2.5)
    : DEFAULT_STAGE_PLAYBACK_RATE;
}

function getLessonPlaybackRate() {
  const parsedRate = Number(state.lessonPlaybackRate);
  return Number.isFinite(parsedRate) && parsedRate > 0
    ? clamp(parsedRate, 0.5, 2.5)
    : DEFAULT_STAGE_PLAYBACK_RATE;
}

function getStagePlaybackRate() {
  return isPdfPresentationMode() ? getPdfPlaybackRate() : getLessonPlaybackRate();
}

function applyNaturalVoicePlayback(audioElement, playbackRate = getStagePlaybackRate()) {
  if (!audioElement) {
    return;
  }

  audioElement.playbackRate = playbackRate;
  audioElement.preservesPitch = true;
  audioElement.mozPreservesPitch = true;
  audioElement.webkitPreservesPitch = true;
}

function getSpeechSynthesisPlaybackRate(playbackRate = getStagePlaybackRate()) {
  return clamp(
    Math.round(clamp(Number(playbackRate) || DEFAULT_STAGE_PLAYBACK_RATE, 0.5, 2) * 100) / 100,
    0.5,
    1
  );
}

function getVoiceSpecificPreviewRate(voicePreference, playbackRate = getLessonPlaybackRate()) {
  const baseRate = getSpeechSynthesisPlaybackRate(playbackRate);
  if (voicePreference === "anjali") {
    return clamp(baseRate - 0.08, 0.5, 1.04);
  }

  if (voicePreference === "indian-female") {
    return clamp(baseRate - 0.2, 0.5, 1.16);
  }

  if (voicePreference === "female") {
    return clamp(baseRate - 0.14, 0.52, 1.2);
  }

  if (voicePreference === "fresh") {
    return clamp(baseRate - 0.06, 0.56, 1.24);
  }

  return baseRate;
}

function getSceneRenderIntervalMs() {
  const targetFps = state.exportingVideo ? EXPORT_SCENE_RENDER_FPS : LIVE_SCENE_RENDER_FPS;
  return 1000 / Math.max(1, targetFps);
}

function shouldRenderAnimatedSceneFrame(nowMs, options = {}) {
  if (!Number.isFinite(nowMs)) {
    return true;
  }

  if (options.force) {
    return true;
  }

  const elapsedMs = nowMs - (Number.isFinite(options.lastRenderAt) ? options.lastRenderAt : 0);
  if (elapsedMs >= getSceneRenderIntervalMs()) {
    return true;
  }

  return Math.abs(Number(options.mouthDelta) || 0) >= SCENE_RENDER_MOUTH_DELTA;
}

function estimatePdfPageDurationMs(page) {
  if (page?.wordCount) {
    return clamp((page.wordCount * 430) + estimatePauseMsFromText(page?.text || ""), 3200, 24000);
  }

  return clamp(5000 + estimatePauseMsFromText(page?.text || ""), 5000, 24000);
}

function buildPdfPresentationSchedule(totalDurationMs = 0) {
  const presentationPages = getPdfPresentationPages();
  if (!presentationPages.length) {
    return [];
  }

  const baseDurations = presentationPages.map((page) => estimatePdfPageDurationMs(page));
  const baseTotal = baseDurations.reduce((sum, value) => sum + value, 0);
  const targetTotal = totalDurationMs > 0 ? totalDurationMs : baseTotal;
  const scale = baseTotal > 0 ? targetTotal / baseTotal : 1;
  let currentStartMs = 0;

  return presentationPages.map((page, presentationIndex) => {
    const durationMs = Math.max(1500, Math.round(baseDurations[presentationIndex] * scale));
    const scheduleItem = {
      selectionIndex: presentationIndex,
      originalPageIndex: Number.isInteger(page?.originalPageIndex) ? page.originalPageIndex : page?.index,
      startMs: currentStartMs,
      endMs: currentStartMs + durationMs,
      durationMs,
      page
    };
    currentStartMs += durationMs;
    return scheduleItem;
  });
}

function getPdfScheduleTotalDuration(schedule = state.pdf.pageSchedule) {
  if (!schedule.length) {
    return 0;
  }

  return schedule[schedule.length - 1].endMs;
}

function getPdfSelectionIndexForTime(timeMs = state.pdf.currentTimeMs) {
  const schedule = state.pdf.pageSchedule.length
    ? state.pdf.pageSchedule
    : buildPdfPresentationSchedule(state.pdf.narration.durationMs || state.pdf.totalDurationMs);

  if (!schedule.length) {
    return 0;
  }

  const safeTime = clamp(timeMs, 0, getPdfScheduleTotalDuration(schedule));
  const activeItem = schedule.find((item) => safeTime < item.endMs) || schedule[schedule.length - 1];
  return activeItem?.selectionIndex || 0;
}

function syncPdfPreviewPageFromTime(timeMs = state.pdf.currentTimeMs) {
  const presentationPageCount = getPdfPresentationPageCount();
  if (!presentationPageCount) {
    state.previewPageIndex = 0;
    return;
  }

  state.previewPageIndex = clamp(getPdfSelectionIndexForTime(timeMs), 0, presentationPageCount - 1);
}

function rebuildPdfPresentationSchedule(options = {}) {
  const preserveTime = options.preserveTime !== false;
  state.pdf.pageSchedule = buildPdfPresentationSchedule(state.pdf.narration.durationMs || 0);
  state.pdf.totalDurationMs = getPdfScheduleTotalDuration(state.pdf.pageSchedule);
  state.pdf.currentTimeMs = preserveTime
    ? clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0)
    : 0;
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
}

function getPdfScheduleItemForSelectionIndex(selectionIndex) {
  rebuildPdfPresentationSchedule({ preserveTime: true });
  const safeSelectionIndex = clamp(
    Math.round(Number(selectionIndex) || 0),
    0,
    Math.max(0, state.pdf.pageSchedule.length - 1)
  );
  return state.pdf.pageSchedule[safeSelectionIndex] || null;
}

async function focusPdfSelectionPage(selectionIndex, options = {}) {
  const scheduleItem = getPdfScheduleItemForSelectionIndex(selectionIndex);
  if (!scheduleItem) {
    return;
  }

  const safeSelectionIndex = clamp(scheduleItem.selectionIndex, 0, Math.max(0, getPdfPresentationPageCount() - 1));
  state.previewPageIndex = safeSelectionIndex;

  if (isPdfPresentationMode()) {
    seekPdfPresentation(scheduleItem.startMs);

    if (options.startPlayback) {
      if (state.speaking) {
        return;
      }

      await playPdfPresentation();
      return;
    }

    state.pdf.paused = false;
    updateStageTimelineUi();
    updateStageModeUi();
    drawScene(state.mouthOpen);
    return;
  }

  state.pdf.currentTimeMs = scheduleItem.startMs;
}

function getPdfCurrentTimelinePosition(now = performance.now()) {
  if (state.pdf.audioDriven && state.activeAudio) {
    return clamp(Math.round((state.activeAudio.currentTime || 0) * 1000), 0, state.pdf.totalDurationMs || 0);
  }

  if (state.speaking && state.pdf.timelineStartedAt) {
    const elapsedMs = Math.max(0, now - state.pdf.timelineStartedAt);
    return clamp(
      Math.round(state.pdf.timelineStartOffsetMs + (elapsedMs * getPdfPlaybackRate())),
      0,
      state.pdf.totalDurationMs || 0
    );
  }

  return clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0);
}

function syncPdfPlaybackPosition(now = performance.now()) {
  state.pdf.currentTimeMs = getPdfCurrentTimelinePosition(now);
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
  return state.pdf.currentTimeMs;
}

function resetPdfNarrationState() {
  if (state.pdf.narration.url) {
    URL.revokeObjectURL(state.pdf.narration.url);
  }

  state.pdf.narration = {
    url: "",
    fileName: "",
    durationMs: 0,
    blob: null,
    textSource: "",
    voice: "",
    source: "",
    syncProfile: null
  };
}

function resetPdfPlaybackState(resetTime = true) {
  state.pdf.paused = false;
  state.pdf.audioDriven = false;
  state.pdf.timelineStartedAt = 0;
  state.pdf.timelineStartOffsetMs = 0;

  if (resetTime) {
    state.pdf.currentTimeMs = 0;
  }

  rebuildPdfPresentationSchedule({ preserveTime: true });
}

function getPdfPageSnippet(text) {
  const compactText = (text || "").replace(/\s+/g, " ").trim();
  if (!compactText) {
    return "No readable text was found on this page. The original PDF page image can still be presented.";
  }

  return compactText.length > 140
    ? `${compactText.slice(0, 137)}...`
    : compactText;
}

function updatePdfPageSelectionSummary() {
  if (!pdfPageSelectionSummary) {
    return;
  }

  if (!state.pdf.pages.length) {
    pdfPageSelectionSummary.textContent = "Select a PDF to choose which pages should appear on the screen.";
    return;
  }

  const selectedCount = getPdfSelectedPageCount();
  const estimatedSchedule = buildPdfPresentationSchedule(state.pdf.narration.durationMs || 0);
  const estimatedDuration = getPdfScheduleTotalDuration(estimatedSchedule);
  pdfPageSelectionSummary.textContent = selectedCount
    ? `${selectedCount} of ${state.pdf.pageCount} PDF page${state.pdf.pageCount === 1 ? "" : "s"} selected | estimated presentation length ${formatDurationMs(estimatedDuration)}. Use the stage speed control to play faster or slower.`
    : "No PDF pages selected yet. Tick at least one page to show or present it.";
}

function getCopyIconSvg() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <rect x="9" y="9" width="10" height="10" rx="2"></rect>
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;
}

async function copyTextToClipboard(text) {
  const content = `${text || ""}`.trim();
  if (!content) {
    throw new Error("There is no readable text to copy for this PDF page.");
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const helperField = document.createElement("textarea");
  helperField.value = content;
  helperField.setAttribute("readonly", "readonly");
  helperField.style.position = "fixed";
  helperField.style.left = "-9999px";
  helperField.style.top = "0";
  document.body.appendChild(helperField);
  helperField.focus();
  helperField.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(helperField);

  if (!copied) {
    throw new Error("Copy failed in this browser.");
  }
}

function buildPdfClipboardHtml(text, exampleImages = []) {
  const safeText = escapeHtml(text || "");
  const imageMarkup = exampleImages.map((image, index) => `
      <figure style="margin:0 0 12px 0;">
        <img
          src="${image.dataUrl}"
          alt="${escapeHtml(image.label || `Example image ${index + 1}`)}"
          data-maths-teacher-example-image="1"
          data-file-name="${escapeHtml(image.fileName || `pdf-page-example-${index + 1}.png`)}"
          data-anchor-text="${escapeHtml(image.anchorText || "")}"
          data-anchor-order="${Number.isFinite(Number(image.anchorOrder)) ? Number(image.anchorOrder) : index}"
          data-source-page-number="${Number.isFinite(Number(image.pageNumber)) ? Number(image.pageNumber) : 0}"
          style="display:block;max-width:100%;height:auto;border-radius:10px;border:1px solid #d7e4ee;"
        />
      </figure>
    `).join("");

  return `
    <div ${PDF_CLIPBOARD_MARKER_ATTRIBUTE}="1" style="font-family:Arial,sans-serif;color:#1f2933;">
      <pre data-maths-teacher-pdf-text="1" style="white-space:pre-wrap;margin:0 0 12px 0;font:inherit;">${safeText}</pre>
      ${imageMarkup}
    </div>
  `;
}

async function copyPdfPageContent(page, pageIndex) {
  const text = `${page?.text || ""}`.trim();
  const exampleImages = Array.isArray(page?.exampleImages) ? page.exampleImages : [];

  if (!text && !exampleImages.length) {
    throw new Error("There is no readable text or example image to copy for this PDF page.");
  }

  if (navigator.clipboard?.write && typeof window.ClipboardItem === "function") {
    try {
      const html = buildPdfClipboardHtml(text, exampleImages);
      const clipboardItem = new window.ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" })
      });
      await navigator.clipboard.write([clipboardItem]);
      return {
        imageCount: exampleImages.length,
        pageNumber: pageIndex + 1
      };
    } catch (error) {
      console.error(error);
    }
  }

  await copyTextToClipboard(text);
  return {
    imageCount: 0,
    pageNumber: pageIndex + 1
  };
}

function renderPdfPreview() {
  pdfPreviewList.innerHTML = "";

  if (!state.pdf.pageTexts.length && !state.pdf.pages.length) {
    pdfPreviewList.classList.add("hidden");
    pdfMeta.textContent = "Upload a PDF to preview the extracted text before showing it on the slide.";
    return;
  }

  const wordCount = splitIntoWords(state.pdf.extractedText).length;
  const textSummary = wordCount
    ? `${wordCount} word${wordCount === 1 ? "" : "s"} loaded into the lesson box.`
    : "No readable PDF text was found, but the rendered page images are ready to present.";
  pdfMeta.textContent = `${state.pdf.fileName} | ${state.pdf.pageCount} PDF page${state.pdf.pageCount === 1 ? "" : "s"} | ${textSummary}`;

  state.pdf.pageTexts.forEach((pageText, index) => {
    const page = state.pdf.pages[index] || {};
    const exampleImages = Array.isArray(page.exampleImages) ? page.exampleImages : [];
    const card = document.createElement("article");
    card.className = "pdf-preview-item";

    const previewHead = document.createElement("div");
    previewHead.className = "pdf-preview-head";

    const pageLabel = document.createElement("p");
    pageLabel.className = "pdf-preview-page";
    pageLabel.textContent = `Page ${index + 1}`;

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "ghost-btn pdf-preview-copy-btn";
    copyBtn.title = `Copy PDF page ${index + 1} text${exampleImages.length ? " and example images" : ""}`;
    copyBtn.setAttribute("aria-label", `Copy PDF page ${index + 1} text${exampleImages.length ? " and example images" : ""}`);
    copyBtn.innerHTML = getCopyIconSvg();
    copyBtn.disabled = !pageText.trim() && !exampleImages.length;
    copyBtn.addEventListener("click", async () => {
      try {
        const copyResult = await copyPdfPageContent(page, index);
        setPdfStatus(
          copyResult.imageCount
            ? `Copied PDF page ${index + 1} text and ${copyResult.imageCount} maths/example image${copyResult.imageCount === 1 ? "" : "s"} only. Paste into the lesson box to place those images on the presentation screen.`
            : `Copied extracted text from PDF page ${index + 1}.`
        );
      } catch (error) {
        console.error(error);
        setPdfStatus(error.message || `Could not copy PDF page ${index + 1}.`);
      }
    });

    const previewText = document.createElement("p");
    previewText.className = "pdf-preview-text";
    previewText.textContent = pageText || "No readable text was found on this page.";

    previewHead.appendChild(pageLabel);
    previewHead.appendChild(copyBtn);
    card.appendChild(previewHead);
    card.appendChild(previewText);

    if (exampleImages.length) {
      const imageTitle = document.createElement("p");
      imageTitle.className = "pdf-preview-images-title";
      imageTitle.textContent = `Detected maths/example images only (${exampleImages.length})`;
      card.appendChild(imageTitle);

      const imageGrid = document.createElement("div");
      imageGrid.className = "pdf-preview-image-grid";

      exampleImages.forEach((image, imageIndex) => {
        const figure = document.createElement("figure");
        figure.className = "pdf-preview-image-card";

        const img = document.createElement("img");
        img.className = "pdf-preview-image";
        img.src = image.dataUrl;
        img.alt = image.label || `Example image ${imageIndex + 1} from PDF page ${index + 1}`;
        img.loading = "lazy";

        const caption = document.createElement("figcaption");
        caption.className = "pdf-preview-image-caption";
        caption.textContent = image.label || `Example image ${imageIndex + 1}`;

        figure.appendChild(img);
        figure.appendChild(caption);
        imageGrid.appendChild(figure);
      });

      card.appendChild(imageGrid);
    }

    pdfPreviewList.appendChild(card);
  });

  pdfPreviewList.classList.remove("hidden");
}

function renderPdfPageList() {
  pdfPageList.innerHTML = "";

  if (!state.pdf.pages.length) {
    pdfPageList.classList.add("hidden");
    updatePdfPageSelectionSummary();
    return;
  }

  const selectedIndexes = new Set(getPdfSelectedPageIndexes());

  state.pdf.pages.forEach((page) => {
    const card = document.createElement("article");
    card.className = `pdf-page-card${selectedIndexes.has(page.index) ? " is-selected" : ""}`;

    const togglePageSelection = (shouldSelect) => {
      const nextSelection = new Set(getPdfSelectedPageIndexes());
      if (shouldSelect) {
        nextSelection.add(page.index);
      } else {
        nextSelection.delete(page.index);
      }

      applyPdfPageSelection(Array.from(nextSelection));

      if (isPdfPresentationMode() && !getPdfSelectedPageCount()) {
        setStatus("No PDF pages are selected. Choose at least one page to keep presenting.");
      }
    };

    const focusPageSelection = async () => {
      const selectionIndex = getPdfSelectedPageIndexes().indexOf(page.index);
      if (selectionIndex >= 0) {
        await focusPdfSelectionPage(selectionIndex, {
          startPlayback: isPdfPresentationMode() && !stagePanel.classList.contains("hidden")
        });
      }
    };

    const setPageSelection = async (shouldSelect, options = {}) => {
      togglePageSelection(shouldSelect);
      if (shouldSelect && options.focusPage !== false) {
        await focusPageSelection();
      }
    };

    const checkboxLabel = document.createElement("label");
    checkboxLabel.className = "pdf-page-check";
    checkboxLabel.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (state.pdfLoading) {
        return;
      }

      const shouldSelect = !getPdfSelectedPageIndexes().includes(page.index);
      await setPageSelection(shouldSelect);
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedIndexes.has(page.index);
    checkbox.disabled = state.pdfLoading;
    checkbox.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (state.pdfLoading) {
        return;
      }

      const shouldSelect = !getPdfSelectedPageIndexes().includes(page.index);
      await setPageSelection(shouldSelect);
    });

    const checkboxText = document.createElement("span");
    checkboxText.textContent = `Present PDF page ${page.pageNumber}`;

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkboxText);

    const thumb = document.createElement("img");
    thumb.className = "pdf-page-thumb";
    thumb.src = page.thumbnailUrl;
    thumb.alt = `Preview of PDF page ${page.pageNumber}`;
    thumb.loading = "lazy";
    thumb.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!getPdfSelectedPageIndexes().includes(page.index)) {
        await setPageSelection(true, { focusPage: true });
        return;
      }

      await focusPageSelection();
    });

    const meta = document.createElement("div");
    meta.className = "pdf-page-meta";

    const title = document.createElement("p");
    title.className = "pdf-page-title";
    title.textContent = `PDF page ${page.pageNumber}`;

    const stats = document.createElement("p");
    stats.className = "pdf-page-stats";
    stats.textContent = `${page.wordCount || 0} word${page.wordCount === 1 ? "" : "s"} | ${formatDurationMs(estimatePdfPageDurationMs(page))} estimated${page.humanContentMasked ? " | human photos hidden" : ""}`;

    const snippet = document.createElement("p");
    snippet.className = "pdf-page-snippet";
    snippet.textContent = getPdfPageSnippet(page.text);

    meta.appendChild(title);
    meta.appendChild(stats);
    meta.appendChild(snippet);

    card.appendChild(checkboxLabel);
    card.appendChild(thumb);
    card.appendChild(meta);
    card.addEventListener("click", async () => {
      if (state.pdfLoading) {
        return;
      }

      const shouldSelect = !getPdfSelectedPageIndexes().includes(page.index);
      await setPageSelection(shouldSelect);
    });
    pdfPageList.appendChild(card);
  });

  pdfPageList.classList.remove("hidden");
  updatePdfPageSelectionSummary();
}

function updatePdfUi() {
  const hasSelectedFile = Boolean(state.pdfSelectedFile);
  const hasLoadedPdf = Boolean(state.pdf.pages.length);
  const hasSelection = Boolean(getPdfSelectedPageCount());
  const allSelected = hasLoadedPdf && getPdfSelectedPageCount() === state.pdf.pages.length;
  const isBusy = state.pdfLoading;

  pdfInput.disabled = isBusy;
  pdfShowBtn.disabled = isBusy || !hasLoadedPdf || !hasSelection;
  pdfPresentBtn.disabled = isBusy || !hasLoadedPdf || !hasSelection;
  pdfSelectAllBtn.disabled = isBusy || !hasLoadedPdf || allSelected;
  pdfClearSelectionBtn.disabled = isBusy || !hasLoadedPdf || !hasSelection;
  clearPdfBtn.disabled = isBusy || (!hasSelectedFile && !hasLoadedPdf);

  if (pdfShowBtn) {
    pdfShowBtn.textContent = "Show Screen";
  }

  if (pdfPresentBtn) {
    pdfPresentBtn.textContent = "Read And Present Context";
  }

  if (showScreenBtn) {
    showScreenBtn.textContent = "Show Screen";
  }
}

function clearPdfSelection(options = {}) {
  const keepLessonText = options.keepLessonText !== false;

  stopPlayback(false);
  invalidatePdfPresentationRequest();
  state.pdfSelectedFile = null;
  state.pdfLoading = false;
  state.presentationMode = "lesson";
  state.images = state.images.filter((item) => !isManagedAutoPdfImage(item));
  resetPdfNarrationState();
  state.pdf = {
    fileName: "",
    fileSignature: "",
    extractedText: "",
    pageTexts: [],
    pageCount: 0,
    pages: [],
    contextPages: [],
    contextPagesKey: "",
    autoImageSyncKey: "",
    lessonAutoImageSyncKey: "",
    selectedPageIndexes: [],
    renderMode: "context",
    currentTimeMs: 0,
    totalDurationMs: 0,
    playbackRate: Number(playbackSpeedSelect?.value || DEFAULT_STAGE_PLAYBACK_RATE),
    requestId: 0,
    pageSchedule: [],
    paused: false,
    audioDriven: false,
    timelineStartedAt: 0,
    timelineStartOffsetMs: 0,
    narration: {
      url: "",
      fileName: "",
      durationMs: 0,
      blob: null,
      textSource: "",
      voice: "",
      source: "",
      syncProfile: null
    }
  };

  pdfInput.value = "";
  resetPdfProgress();
  renderPdfPreview();
  renderPdfPageList();
  renderImagePreviews();
  setPdfStatus(
    keepLessonText
      ? "PDF cleared. The extracted lesson text stays in the content box until you change it."
      : "PDF cleared."
  );
  updatePdfUi();
}

function normalizePdfLine(text) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .trim();
}

function buildPdfPageText(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  const lines = [];
  let currentLine = [];
  let lastY = null;
  let lastX = null;
  let lastHeight = 0;

  const flushLine = () => {
    const nextLine = normalizePdfLine(currentLine.join(""));
    if (nextLine) {
      lines.push(nextLine);
    }
    currentLine = [];
    lastX = null;
  };

  items.forEach((item) => {
    if (!item || typeof item.str !== "string") {
      return;
    }

    const rawText = item.str;
    const x = Number(item.transform?.[4] ?? 0);
    const y = Number(item.transform?.[5] ?? 0);
    const itemHeight = Math.max(
      12,
      Math.abs(Number(item.height || 0)),
      Math.abs(Number(item.transform?.[3] || 0)),
      lastHeight || 0
    );

    if (lastY !== null) {
      const lineJump = Math.abs(y - lastY);
      const newLineThreshold = Math.max(4, itemHeight * 0.55);

      if (lineJump > newLineThreshold) {
        const needsParagraphGap = lineJump > itemHeight * 1.7;
        flushLine();

        if (needsParagraphGap && lines.length && lines[lines.length - 1] !== "") {
          lines.push("");
        }
      } else if (currentLine.length && lastX !== null) {
        const gap = x - lastX;
        const needsSpace = gap > Math.max(5, itemHeight * 0.2)
          && !/\s$/.test(currentLine[currentLine.length - 1])
          && rawText
          && !/^[,.;:!?%)\]]/.test(rawText);

        if (needsSpace) {
          currentLine.push(" ");
        }
      }
    }

    if (rawText) {
      currentLine.push(rawText);
    }

    lastY = y;
    lastHeight = itemHeight;
    lastX = x + Number(item.width || 0);

    if (item.hasEOL) {
      flushLine();
    }
  });

  flushLine();
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPdfLineObjects(items = [], sourcePageHeight = 0, renderScale = 1) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  const lines = [];
  let currentLine = [];
  let lastY = null;
  let lastX = null;
  let lastHeight = 0;

  const flushLine = () => {
    const text = normalizePdfLine(currentLine.map((item) => item.text).join(""));
    const visibleTokens = currentLine.filter((item) => item.width > 0 && item.height > 0);
    if (!text || !visibleTokens.length) {
      currentLine = [];
      lastX = null;
      return;
    }

    const left = Math.min(...visibleTokens.map((item) => item.x));
    const top = Math.min(...visibleTokens.map((item) => item.y));
    const right = Math.max(...visibleTokens.map((item) => item.x + item.width));
    const bottom = Math.max(...visibleTokens.map((item) => item.y + item.height));

    lines.push({
      text,
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    });

    currentLine = [];
    lastX = null;
  };

  items.forEach((item) => {
    if (!item || typeof item.str !== "string") {
      return;
    }

    const rawText = item.str;
    const sourceX = Number(item.transform?.[4] ?? 0);
    const sourceY = Number(item.transform?.[5] ?? 0);
    const sourceHeight = Math.max(
      12,
      Math.abs(Number(item.height || 0)),
      Math.abs(Number(item.transform?.[3] || 0)),
      lastHeight || 0
    );
    const scaledHeight = sourceHeight * renderScale;
    const scaledY = Math.max(0, sourcePageHeight - sourceY - sourceHeight) * renderScale;
    const scaledX = sourceX * renderScale;
    const scaledWidth = Math.max(1, Number(item.width || 0) * renderScale);

    if (lastY !== null) {
      const lineJump = Math.abs(sourceY - lastY);
      const newLineThreshold = Math.max(4, sourceHeight * 0.55);

      if (lineJump > newLineThreshold) {
        flushLine();
      } else if (currentLine.length && lastX !== null) {
        const gap = sourceX - lastX;
        const needsSpace = gap > Math.max(5, sourceHeight * 0.2)
          && !/\s$/.test(currentLine[currentLine.length - 1].text)
          && rawText
          && !/^[,.;:!?%)\]]/.test(rawText);

        if (needsSpace) {
          currentLine.push({
            text: " ",
            x: scaledX,
            y: scaledY,
            width: 0,
            height: 0
          });
        }
      }
    }

    currentLine.push({
      text: rawText,
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight
    });

    lastY = sourceY;
    lastHeight = sourceHeight;
    lastX = sourceX + Number(item.width || 0);

    if (item.hasEOL) {
      flushLine();
    }
  });

  flushLine();
  return lines;
}

function isLikelyPdfExampleLine(text = "") {
  const line = normalizePdfLine(text).toLowerCase();
  if (!line) {
    return false;
  }

  if (/\b(example|exercise|question|quiz|solve|find|compare|convert|add|subtract|multiply|division|divide|table|sum|answer|expanded form|place value|fraction|decimal|metric)\b/.test(line)) {
    return true;
  }

  const digitCount = (line.match(/\d/g) || []).length;
  const operatorCount = (line.match(/[=+\-×÷*/<>%]/g) || []).length;
  const hasUnits = /\b(cm|mm|km|hm|dam|m|dm|kg|gm|ml|rupees|rs\.?)\b/.test(line);

  return (digitCount >= 2 && (operatorCount >= 1 || hasUnits))
    || (digitCount >= 3 && /\b(blank|ladder|step|steps)\b/.test(line));
}

function isLikelyPdfSectionHeading(text = "") {
  const line = normalizePdfLine(text);
  if (!line) {
    return false;
  }

  return line.length < 72
    && !/[=+\-×÷*/<>%]/.test(line)
    && /^(#|\b(chapter|lesson|topic|concept|summary|quick facts|practice|example)\b)/i.test(line);
}

function getRectIntersectionArea(left, right) {
  const overlapWidth = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const overlapHeight = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return overlapWidth * overlapHeight;
}

function expandPdfExampleBounds(bounds, pageWidth, pageHeight) {
  const minWidth = Math.min(pageWidth, PDF_EXAMPLE_IMAGE_MIN_WIDTH_PX);
  const minHeight = Math.min(pageHeight, PDF_EXAMPLE_IMAGE_MIN_HEIGHT_PX);
  const paddedWidth = Math.max(minWidth, bounds.width + 44);
  const paddedHeight = Math.max(minHeight, bounds.height + 36);
  const centerX = bounds.x + (bounds.width / 2);
  const centerY = bounds.y + (bounds.height / 2);

  const width = Math.min(pageWidth, paddedWidth);
  const height = Math.min(pageHeight, paddedHeight);
  const x = clamp(Math.round(centerX - (width / 2)), 0, Math.max(0, pageWidth - width));
  const y = clamp(Math.round(centerY - (height / 2)), 0, Math.max(0, pageHeight - height));

  return { x, y, width, height };
}

function extractPdfExampleImageAssets(items = [], presentationCanvas, sourcePageHeight = 0, renderScale = 1, maskRects = [], pageNumber = 1) {
  if (!presentationCanvas || !items.length) {
    return [];
  }

  const lines = buildPdfLineObjects(items, sourcePageHeight, renderScale);
  if (!lines.length) {
    return [];
  }

  const candidateBounds = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!isLikelyPdfExampleLine(line.text)) {
      continue;
    }

    let bounds = {
      x: line.x,
      y: line.y,
      width: line.width,
      height: line.height
    };
    let endIndex = index;

    while (endIndex + 1 < lines.length && (endIndex - index) < 4) {
      const nextLine = lines[endIndex + 1];
      const previousLine = lines[endIndex];
      const gap = nextLine.y - (previousLine.y + previousLine.height);

      if (gap > Math.max(56, previousLine.height * 2.6)) {
        break;
      }

      if ((endIndex > index) && isLikelyPdfSectionHeading(nextLine.text)) {
        break;
      }

      const left = Math.min(bounds.x, nextLine.x);
      const top = Math.min(bounds.y, nextLine.y);
      const right = Math.max(bounds.x + bounds.width, nextLine.x + nextLine.width);
      const bottom = Math.max(bounds.y + bounds.height, nextLine.y + nextLine.height);
      bounds = {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
      };
      endIndex += 1;
    }

    const expandedBounds = expandPdfExampleBounds(
      bounds,
      presentationCanvas.width,
      presentationCanvas.height
    );

    const maskedOverlapRatio = maskRects.reduce((highestRatio, maskRect) => {
      const overlapArea = getRectIntersectionArea(expandedBounds, maskRect);
      return Math.max(highestRatio, overlapArea / Math.max(1, expandedBounds.width * expandedBounds.height));
    }, 0);

    if (maskedOverlapRatio > 0.16) {
      continue;
    }

    if ((expandedBounds.width / presentationCanvas.width) > 0.96 && (expandedBounds.height / presentationCanvas.height) > 0.88) {
      continue;
    }

    const overlapsExisting = candidateBounds.some((existingBounds) => {
      const overlapArea = getRectIntersectionArea(existingBounds, expandedBounds);
      const smallestArea = Math.min(
        existingBounds.width * existingBounds.height,
        expandedBounds.width * expandedBounds.height
      );
      return overlapArea / Math.max(1, smallestArea) > 0.56;
    });

    if (!overlapsExisting) {
      candidateBounds.push(expandedBounds);
    }

    if (candidateBounds.length >= PDF_EXAMPLE_IMAGE_MAX_PER_PAGE) {
      break;
    }
  }

  return candidateBounds.map((bounds, index) => {
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = Math.max(1, Math.round(bounds.width));
    cropCanvas.height = Math.max(1, Math.round(bounds.height));
    const cropContext = cropCanvas.getContext("2d", { alpha: false });
    applyHighQualityImageRendering(cropContext);
    cropContext.fillStyle = "#ffffff";
    cropContext.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropContext.drawImage(
      presentationCanvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    const anchorLines = lines
      .filter((line) => {
        const verticallyClose = (line.y + line.height) >= (bounds.y - 18)
          && line.y <= (bounds.y + bounds.height + 18);
        const horizontalOverlap = getRectIntersectionArea(bounds, {
          x: line.x,
          y: line.y,
          width: line.width,
          height: line.height
        });
        return verticallyClose && horizontalOverlap > 0;
      })
      .slice(0, 3);
    const anchorText = anchorLines
      .map((line) => normalizePdfLine(line.text))
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      id: `pdf-example-${pageNumber}-${index + 1}`,
      label: `Maths example image ${index + 1}`,
      fileName: `pdf-page-${pageNumber}-example-${index + 1}.png`,
      pageNumber,
      anchorText,
      anchorOrder: index,
      width: cropCanvas.width,
      height: cropCanvas.height,
      bounds,
      dataUrl: cropCanvas.toDataURL("image/png")
    };
  });
}

function preparePdfLibrary() {
  if (!window.pdfjsLib || !window.pdfjsWorker?.WorkerMessageHandler) {
    return null;
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER_FILE;

  if (!window.pdfjsLib.PDFWorker.prototype.__localFakeWorkerPatched) {
    // Force the main-thread fallback worker so PDF parsing also works from local file pages.
    window.pdfjsLib.PDFWorker.prototype._initialize = function patchedPdfWorkerInitialize() {
      this._setupFakeWorker();
    };
    window.pdfjsLib.PDFWorker.prototype.__localFakeWorkerPatched = true;
  }

  return window.pdfjsLib;
}

function ensurePdfLibraryLoaded() {
  const readyLibrary = preparePdfLibrary();
  if (readyLibrary) {
    return Promise.resolve(readyLibrary);
  }

  if (pdfLibraryPromise) {
    return pdfLibraryPromise;
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((item) => item.src && item.src.endsWith(src));
    if (existing) {
      if ((src === PDF_JS_FILE && window.pdfjsLib) || (src === PDF_JS_WORKER_FILE && window.pdfjsWorker?.WorkerMessageHandler)) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`The PDF helper file ${src} could not be loaded.`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`The PDF helper file ${src} could not be loaded.`));
    document.body.appendChild(script);
  });

  pdfLibraryPromise = loadScript(PDF_JS_FILE)
    .then(() => {
      if (!window.pdfjsLib) {
        throw new Error("The PDF reader loaded, but it is not available in the page yet.");
      }

      return loadScript(PDF_JS_WORKER_FILE);
    })
    .then(() => {
      const preparedLibrary = preparePdfLibrary();
      if (!preparedLibrary) {
        throw new Error("The PDF worker loaded, but it is not available in the page yet.");
      }

      return preparedLibrary;
    })
    .catch((error) => {
    pdfLibraryPromise = null;
    throw error;
  });

  return pdfLibraryPromise;
}

function getPdfFaceDetector() {
  if (pdfFaceFilteringUnavailable || typeof window.FaceDetector !== "function") {
    return null;
  }

  if (pdfFaceDetector) {
    return pdfFaceDetector;
  }

  try {
    pdfFaceDetector = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 12
    });
    return pdfFaceDetector;
  } catch (error) {
    console.error(error);
    pdfFaceFilteringUnavailable = true;
    return null;
  }
}

function getPdfFaceMaskRect(faceBounds, canvasWidth, canvasHeight) {
  const bounds = faceBounds || {};
  const width = Math.max(PDF_FACE_MASK_MIN_SIZE, Number(bounds.width) || 0);
  const height = Math.max(PDF_FACE_MASK_MIN_SIZE, Number(bounds.height) || 0);
  const originX = Number(bounds.x) || 0;
  const originY = Number(bounds.y) || 0;
  const left = clamp(Math.floor(originX - (width * PDF_FACE_MASK_PADDING_X)), 0, canvasWidth);
  const top = clamp(Math.floor(originY - (height * PDF_FACE_MASK_PADDING_TOP)), 0, canvasHeight);
  const right = clamp(Math.ceil(originX + width + (width * PDF_FACE_MASK_PADDING_X)), left, canvasWidth);
  const bottom = clamp(Math.ceil(originY + height + (height * PDF_FACE_MASK_PADDING_BOTTOM)), top, canvasHeight);

  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  };
}

async function createFilteredPdfPageCanvas(sourceCanvas) {
  const detector = getPdfFaceDetector();
  if (!detector) {
    return {
      canvas: sourceCanvas,
      humanContentMasked: false,
      maskedFaceCount: 0,
      maskRects: []
    };
  }

  try {
    const faces = await detector.detect(sourceCanvas);
    if (!Array.isArray(faces) || !faces.length) {
      return {
        canvas: sourceCanvas,
        humanContentMasked: false,
        maskedFaceCount: 0,
        maskRects: []
      };
    }

    const filteredCanvas = document.createElement("canvas");
    filteredCanvas.width = sourceCanvas.width;
    filteredCanvas.height = sourceCanvas.height;
    const filteredContext = filteredCanvas.getContext("2d", { alpha: false });
    applyHighQualityImageRendering(filteredContext);
    filteredContext.fillStyle = "#ffffff";
    filteredContext.fillRect(0, 0, filteredCanvas.width, filteredCanvas.height);
    filteredContext.drawImage(sourceCanvas, 0, 0);

    const maskRects = [];

    faces.forEach((face) => {
      const maskRect = getPdfFaceMaskRect(face?.boundingBox, filteredCanvas.width, filteredCanvas.height);
      if (!maskRect.width || !maskRect.height) {
        return;
      }

      maskRects.push(maskRect);
      filteredContext.fillStyle = "#ffffff";
      filteredContext.fillRect(maskRect.x, maskRect.y, maskRect.width, maskRect.height);
    });

    return {
      canvas: filteredCanvas,
      humanContentMasked: true,
      maskedFaceCount: faces.length,
      maskRects
    };
  } catch (error) {
    console.error(error);
    pdfFaceFilteringUnavailable = true;
    return {
      canvas: sourceCanvas,
      humanContentMasked: false,
      maskedFaceCount: 0,
      maskRects: []
    };
  }
}

async function renderPdfPageAssets(pdfPage, pageNumber, textContent) {
  const sourceViewport = pdfPage.getViewport({ scale: 1 });
  const renderScale = Math.max(
    PDF_RENDER_SCALE_MIN,
    Math.min(
      PDF_RENDER_SCALE_MAX,
      Math.min(
        PDF_RENDER_TARGET_MAX_WIDTH_PX / sourceViewport.width,
        PDF_RENDER_TARGET_MAX_HEIGHT_PX / sourceViewport.height
      )
    )
  );
  const renderViewport = pdfPage.getViewport({ scale: renderScale });
  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = Math.ceil(renderViewport.width);
  renderCanvas.height = Math.ceil(renderViewport.height);

  const renderContext = renderCanvas.getContext("2d", { alpha: false });
  applyHighQualityImageRendering(renderContext);
  renderContext.fillStyle = "#ffffff";
  renderContext.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

  await pdfPage.render({
    canvasContext: renderContext,
    viewport: renderViewport,
    background: "rgba(255,255,255,1)"
  }).promise;

  const filteredPage = await createFilteredPdfPageCanvas(renderCanvas);
  const presentationCanvas = filteredPage.canvas || renderCanvas;

  const thumbCanvas = document.createElement("canvas");
  const thumbWidth = 220;
  const thumbHeight = Math.max(280, Math.round((presentationCanvas.height / presentationCanvas.width) * thumbWidth));
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbContext = thumbCanvas.getContext("2d", { alpha: false });
  applyHighQualityImageRendering(thumbContext);
  thumbContext.fillStyle = "#eef6fb";
  thumbContext.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  thumbContext.drawImage(presentationCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

  const pageText = buildPdfPageText(textContent.items);
  const wordCount = splitIntoWords(pageText).length;
  const exampleImages = extractPdfExampleImageAssets(
    textContent.items,
    presentationCanvas,
    sourceViewport.height,
    renderScale,
    filteredPage.maskRects || [],
    pageNumber
  );

  return {
    index: pageNumber - 1,
    pageNumber,
    text: pageText,
    wordCount,
    exampleImages,
    renderCanvas: presentationCanvas,
    thumbnailUrl: thumbCanvas.toDataURL("image/png"),
    width: presentationCanvas.width,
    height: presentationCanvas.height,
    humanContentMasked: filteredPage.humanContentMasked,
    maskedFaceCount: filteredPage.maskedFaceCount
  };
}

async function extractPdfContent(file) {
  const pdfjsLib = await ensurePdfLibraryLoaded();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true
  });
  const pdfDocument = await loadingTask.promise;
  const pageTexts = [];
  const pages = [];
  const totalPages = Math.max(1, pdfDocument.numPages || 1);

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const renderedPage = await renderPdfPageAssets(page, pageNumber, textContent);
    const pageText = renderedPage.text;
    pageTexts.push(pageText);
    pages.push(renderedPage);
    setPdfProgress(18 + Math.round((pageNumber / totalPages) * 72), `Reading page ${pageNumber} of ${totalPages}`);
  }

  const extractedText = pageTexts
    .map((pageText) => pageText.trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    extractedText,
    pageTexts,
    pageCount: totalPages,
    pages
  };
}

async function loadSelectedPdf(forceReload = false) {
  const file = state.pdfSelectedFile;
  if (!file) {
    setPdfStatus("Select a PDF file first.");
    updatePdfUi();
    return false;
  }

  const fileSignature = getPdfFileSignature(file);
  if (!forceReload && state.pdf.fileSignature === fileSignature && state.pdf.pages.length) {
    return true;
  }

  state.pdfLoading = true;
  setPdfProgress(6, "Preparing PDF");
  setPdfStatus(`Reading ${file.name}...`);
  updatePdfUi();

  try {
    const previousPdfText = state.pdf.extractedText.trim();
    const existingLessonText = lessonInput.value.trim();
    setPdfProgress(12, "Loading PDF reader");
    const payload = await extractPdfContent(file);
    resetPdfNarrationState();
  state.pdf = {
    fileName: file.name,
      fileSignature,
      extractedText: payload.extractedText,
      pageTexts: payload.pageTexts,
      pageCount: payload.pageCount,
      pages: payload.pages,
      contextPages: [],
      contextPagesKey: "",
      autoImageSyncKey: "",
      lessonAutoImageSyncKey: "",
      selectedPageIndexes: [],
      renderMode: "context",
      currentTimeMs: 0,
      totalDurationMs: 0,
      playbackRate: Number(playbackSpeedSelect?.value || DEFAULT_STAGE_PLAYBACK_RATE),
      requestId: 0,
      pageSchedule: [],
      paused: false,
      audioDriven: false,
      timelineStartedAt: 0,
      timelineStartOffsetMs: 0,
      narration: {
        url: "",
        fileName: "",
        durationMs: 0,
        blob: null,
        textSource: "",
        voice: "",
        source: "",
        syncProfile: null
      }
  };
  const shouldLoadExtractedTextIntoLesson = Boolean(payload.extractedText.trim()) && (
    !existingLessonText
    || normalizePdfSearchFragment(existingLessonText) === normalizePdfSearchFragment(previousPdfText)
  );
  if (shouldLoadExtractedTextIntoLesson && lessonInput.value !== payload.extractedText) {
    lessonInput.value = payload.extractedText;
    handleLessonInputChange();
  }
  state.images = state.images.filter((item) => !isManagedAutoPdfImage(item));
  state.pdf.pageSchedule = buildPdfPresentationSchedule();
    state.pdf.totalDurationMs = getPdfScheduleTotalDuration(state.pdf.pageSchedule);
    rebuildPdfPresentationSchedule({ preserveTime: false });

    renderPdfPreview();
    renderPdfPageList();
    preloadPdfExampleImages(payload.pages);
    syncExtractedPdfLessonImages({ skipDraw: true });
    setPdfProgress(100, "Ready");
    const maskedPageCount = payload.pages.filter((page) => page.humanContentMasked).length;
    const maskSummary = maskedPageCount
      ? ` Human photos were hidden on ${maskedPageCount} PDF page${maskedPageCount === 1 ? "" : "s"} when the browser could detect them, while maths and diagram visuals stay visible.`
      : "";
    setPdfStatus(
      payload.extractedText
        ? `Loaded ${file.name}. No pages are selected yet. Tick the pages you want, then show or present them.${maskSummary}`
        : `Loaded ${file.name}. No pages are selected yet, but the exact PDF page images are ready when you choose pages to show on screen.${maskSummary}`
      );
    setSpeechToolsStatus(
      payload.extractedText
        ? (shouldLoadExtractedTextIntoLesson
          ? "PDF text is in the lesson box now. Tick the PDF pages you want, and their example images will follow onto the matching lesson pages."
          : "PDF text is ready in the extracted PDF section. Copy a page into the content box only where you want it.")
        : "The PDF page images are ready. This file may be image-based, so reading may need OCR text from another source."
    );
    return true;
  } catch (error) {
    console.error(error);
    setPdfProgress(0, "Failed");
    setPdfStatus(error.message || "PDF extraction failed.");
    return false;
  } finally {
    state.pdfLoading = false;
    updatePdfUi();
    window.setTimeout(() => {
      if (!state.pdfLoading) {
        resetTaskProgressUi();
      }
    }, 900);
  }
}

async function handlePdfSelection(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) {
    if (!state.pdf.extractedText) {
      setPdfStatus("No PDF selected.");
    }
    updatePdfUi();
    return;
  }

  if (!(file.type || "").includes("pdf") && !/\.pdf$/i.test(file.name)) {
    state.pdfSelectedFile = null;
    pdfInput.value = "";
    setPdfStatus("Please choose a PDF file.");
    updatePdfUi();
    return;
  }

  state.pdfSelectedFile = file;
  invalidatePdfPresentationRequest();
  state.pdf = {
    fileName: "",
    fileSignature: "",
    extractedText: "",
    pageTexts: [],
    pageCount: 0,
    pages: [],
    contextPages: [],
    contextPagesKey: "",
    autoImageSyncKey: "",
    lessonAutoImageSyncKey: "",
    selectedPageIndexes: [],
    renderMode: "context",
    currentTimeMs: 0,
    totalDurationMs: 0,
    playbackRate: Number(playbackSpeedSelect?.value || DEFAULT_STAGE_PLAYBACK_RATE),
    requestId: 0,
    pageSchedule: [],
    paused: false,
    audioDriven: false,
    timelineStartedAt: 0,
    timelineStartOffsetMs: 0,
    narration: {
      url: "",
      fileName: "",
      durationMs: 0,
      blob: null,
      textSource: "",
      voice: "",
      source: "",
      syncProfile: null
    }
  };
  state.images = state.images.filter((item) => !isManagedAutoPdfImage(item));
  renderPdfPreview();
  renderPdfPageList();
  renderImagePreviews();
  resetPdfProgress();
  setPdfStatus(`Selected PDF: ${file.name}. Extracting text now...`);
  updatePdfUi();
  await loadSelectedPdf(true);
}

async function showPdfOnScreen() {
  invalidatePdfPresentationRequest();
  const ready = await loadSelectedPdf();
  if (!ready) {
    return;
  }

  showPdfScreen("context");
}

async function presentPdf() {
  const ready = await loadSelectedPdf();
  if (!ready) {
    return;
  }

  showPdfScreen("context");
  await playSlide();
}

function isPdfPresentationMode() {
  return state.presentationMode === "pdf" && state.pdf.pages.length > 0;
}

function getPdfCurrentStagePage() {
  const presentationPages = getPdfPresentationPages();
  if (!presentationPages.length) {
    return null;
  }

  return presentationPages[clamp(state.previewPageIndex, 0, presentationPages.length - 1)] || null;
}

function getContentLayoutWithMetrics(lines, maxWidth, maxHeight, usePlaceholder = true, options = {}) {
  const safeLines = lines.length ? lines : (usePlaceholder ? ["Your content will appear here."] : []);
  const wordCount = Math.max(0, Math.round(Number(options.wordCount) || 0));
  const hasImages = Boolean(options.hasImages);
  let fontSize = hasImages ? 26 : 30;

  if (wordCount > 520) {
    fontSize = hasImages ? 22 : 24;
  } else if (wordCount > 360) {
    fontSize = hasImages ? 23 : 25;
  } else if (wordCount > 220) {
    fontSize = hasImages ? 24 : 26;
  } else if (wordCount > 120) {
    fontSize = hasImages ? 25 : 28;
  }

  fontSize = clamp(Math.round(fontSize * state.fontScale), 16, 54);

  const buildLayout = (size) => {
    const rows = [];
    const rowHeight = Math.max(size + 4, Math.round(size * 1.2));
    const groupGap = Math.max(6, Math.round(size * 0.24));

    safeLines.forEach((line, index) => {
      const headingMatch = line.match(/^\s*#{1,3}\s+(.*)$/);
      const autoHeading = looksLikeAutoHeadingLine(line, index, safeLines.length);
      const sourceLine = headingMatch ? headingMatch[1] : line;
      const bulletMatch = sourceLine.match(/^\s*(?:[-*]|\u2022)\s+(.*)$/);
      const baseLineStyle = (headingMatch || autoHeading)
        ? {
          ...getBaseTextStyle(),
          bold: true,
          underline: true
        }
        : getBaseTextStyle();
      const lineText = (bulletMatch ? bulletMatch[1] : sourceLine).replace(/\s+/g, " ").trim() || sourceLine.trim();
      const styledRuns = getStyledTextRuns(lineText, baseLineStyle).map((run) => ({
        ...run,
        text: applyDisplayCase(run.text)
      }));
      const wrapped = wrapStyledRuns(ctx, styledRuns, maxWidth - (bulletMatch ? 28 : 0), size);

      wrapped.forEach((row, rowIndex) => {
        rows.push({ segments: row, bullet: Boolean(bulletMatch) && rowIndex === 0 });
      });

      if (index < safeLines.length - 1) {
        rows.push({ spacer: true, height: groupGap });
      }
    });

    const totalHeight = rows.reduce((sum, row) => sum + (row.spacer ? row.height : rowHeight), 0);
    return { rows, fontSize: size, rowHeight, totalHeight };
  };

  let layout = buildLayout(fontSize);
  while (layout.totalHeight > maxHeight && fontSize > 16) {
    fontSize = Math.max(16, fontSize - 2);
    layout = buildLayout(fontSize);
  }

  return layout;
}

function getPdfContextVisibleText(page, selectionIndex) {
  const fullText = page?.text || "";
  if (!fullText) {
    return {
      fullText: "",
      partText: "",
      layoutPage: null,
      mouthActive: false,
      speechElapsedMs: 0
    };
  }

  if (!state.speaking && !state.pdf.paused) {
    return fullText;
  }

  const syncProfileData = state.pdf?.narration?.syncProfile;
  const combinedPdfText = getPdfPresentationText();
  if (combinedPdfText && syncProfileData?.profile && syncProfileData?.text === combinedPdfText) {
    const visualLagMs = Math.max(0, Math.round((Number(SPEECH_SYNC_VISUAL_PROGRESS_LAG) || 0) * 1000));
    const syncFrame = getSpeechSyncFrame(
      combinedPdfText,
      Math.max(0, state.pdf.currentTimeMs - visualLagMs),
      state.pdf.narration.durationMs || state.pdf.totalDurationMs,
      { syncProfileData }
    );
    const pageTextStartIndex = Math.max(0, Math.round(Number(page?.pageTextStartIndex) || 0));
    const sourcePageText = String(page?.sourcePageText || "");
    const visiblePageText = syncFrame.displayedText.length <= pageTextStartIndex
      ? ""
      : syncFrame.displayedText.slice(pageTextStartIndex, pageTextStartIndex + sourcePageText.length);

    const contentArea = getStageContentArea(state.previewPageIndex, Boolean(page?.hasImages || getStageHasVisibleImagesForPage(state.previewPageIndex)));
    const visibleLayout = getContentLayoutWithMetrics(
      buildDisplayedLines(visiblePageText),
      contentArea.width,
      contentArea.height,
      !sourcePageText,
      {
        wordCount: splitIntoWords(visiblePageText).length || page?.wordCount || splitIntoWords(sourcePageText).length,
        hasImages: Boolean(page?.hasImages)
      }
    );
    const visibleParts = paginateLayout(visibleLayout, contentArea.height);
    const visiblePart = visibleParts[page?.partIndex || 0] || null;
    return {
      fullText: visiblePageText,
      partText: getLayoutPageText(visiblePart?.rows || []),
      layoutPage: visiblePart,
      mouthActive: syncFrame.mouthActive,
      speechElapsedMs: syncFrame.speechElapsedMs
    };
  }

  const scheduleItem = state.pdf.pageSchedule[selectionIndex] || null;
  if (!scheduleItem || scheduleItem.durationMs <= 0) {
    return {
      fullText,
      partText: fullText,
      layoutPage: null,
      mouthActive: false,
      speechElapsedMs: 0
    };
  }

  const pageProgress = clamp(
    (state.pdf.currentTimeMs - scheduleItem.startMs) / Math.max(1, scheduleItem.durationMs),
    0,
    1
  );

  const visibleText = getVisibleTextForProgress(fullText, pageProgress);
  return {
    fullText: visibleText,
    partText: visibleText,
    layoutPage: null,
    mouthActive: pageProgress > 0 && pageProgress < 1,
    speechElapsedMs: Math.max(0, state.pdf.currentTimeMs - scheduleItem.startMs)
  };
}

function getPdfPresentationFallbackLabel() {
  return getPdfRenderMode() === "exact"
    ? "the exact rendered PDF pages"
    : "the PDF context slide";
}

function applyPdfPageSelection(nextIndexes) {
  if (state.speaking && isPdfPresentationMode()) {
    stopPlayback(false);
  }

  invalidatePdfPresentationRequest();
  state.pdf.selectedPageIndexes = Array.from(new Set(nextIndexes))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < state.pdf.pages.length)
    .sort((left, right) => left - right);
  state.pdf.contextPages = [];
  state.pdf.contextPagesKey = "";
  state.pdf.autoImageSyncKey = "";
  state.pdf.lessonAutoImageSyncKey = "";
  resetPdfNarrationState();
  resetPdfPlaybackState(true);
  renderPdfPageList();
  updatePdfUi();
  updateStageModeUi();

  syncExtractedPdfLessonImages({ skipDraw: true });

  if (getPdfRenderMode() === "context") {
    syncPdfContextStageImages({ skipDraw: true });
  }

  if (isPdfPresentationMode() && !stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function selectAllPdfPages() {
  applyPdfPageSelection(state.pdf.pages.map((page) => page.index));
}

function clearSelectedPdfPages() {
  applyPdfPageSelection([]);
}

function updateStageTimelineUi() {
  const pdfMode = isPdfPresentationMode();
  if (stageTimelineCard) {
    stageTimelineCard.classList.toggle("hidden", !pdfMode);
  }

  if (!pdfMode) {
    if (stageCurrentTime) {
      stageCurrentTime.textContent = "00:00";
    }
    if (stageDuration) {
      stageDuration.textContent = "00:00";
    }
    if (stageTimelineInput) {
      stageTimelineInput.value = "0";
      stageTimelineInput.max = "0";
      stageTimelineInput.disabled = true;
    }
    if (seekBackwardBtn) {
      seekBackwardBtn.disabled = true;
    }
    if (seekForwardBtn) {
      seekForwardBtn.disabled = true;
    }
    if (stageTimelineMeta) {
      stageTimelineMeta.textContent = "Timeline controls appear when a PDF presentation is on screen.";
    }
    return;
  }

  state.pdf.pageSchedule = buildPdfPresentationSchedule(state.pdf.narration.durationMs || state.pdf.totalDurationMs);
  state.pdf.totalDurationMs = getPdfScheduleTotalDuration(state.pdf.pageSchedule);
  state.pdf.currentTimeMs = clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0);
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);

  const usingGeneratedAudio = Boolean(state.pdf.narration.url);
  const presentationPageCount = getPdfPresentationPageCount();
  if (stageTimelineMeta) {
    stageTimelineMeta.textContent = `${getPdfSelectedPageCount()} selected PDF page${getPdfSelectedPageCount() === 1 ? "" : "s"} | ${presentationPageCount} narration page${presentationPageCount === 1 ? "" : "s"} | ${usingGeneratedAudio ? "Generated narration ready" : "Using timed page playback"} | Speed ${getPdfPlaybackRate()}x`;
  }

  if (stageCurrentTime) {
    stageCurrentTime.textContent = formatDurationMs(state.pdf.currentTimeMs);
  }

  if (stageDuration) {
    stageDuration.textContent = formatDurationMs(state.pdf.totalDurationMs);
  }

  if (stageTimelineInput) {
    stageTimelineInput.max = String(Math.max(0, state.pdf.totalDurationMs));
    stageTimelineInput.value = String(clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0));
    stageTimelineInput.disabled = !state.pdf.totalDurationMs;
  }

  if (seekBackwardBtn) {
    seekBackwardBtn.disabled = !state.pdf.totalDurationMs;
  }

  if (seekForwardBtn) {
    seekForwardBtn.disabled = !state.pdf.totalDurationMs;
  }

  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    state.speaking || state.pdf.paused || state.pdf.currentTimeMs > 0
  );
}

function updateStageModeUi() {
  const pdfMode = isPdfPresentationMode();

  if (stageModeBadge) {
    stageModeBadge.textContent = pdfMode ? "PDF" : "LESSON";
  }

  if (playBtn) {
    if (pdfMode) {
      const pdfPlayLabel = getPdfRenderMode() === "exact" ? "PDF" : "PDF Context";
      const playLabel = state.speaking
        ? `Playing ${pdfPlayLabel}`
        : (state.pdf.paused && state.pdf.currentTimeMs > 0 && state.pdf.currentTimeMs < state.pdf.totalDurationMs ? `Resume ${pdfPlayLabel}` : `Play ${pdfPlayLabel}`);
      setIconButtonState(playBtn, "&#9654;", playLabel);
    } else {
      setIconButtonState(playBtn, "&#9654;", "Play Slide");
    }
  }

  if (pauseStageBtn) {
    pauseStageBtn.classList.toggle("hidden", !pdfMode);
    pauseStageBtn.disabled = !pdfMode || !state.speaking;
    setIconButtonState(pauseStageBtn, "&#10074;&#10074;", pdfMode && state.speaking ? "Pause PDF presentation" : "Pause");
  }

  if (downloadBtn) {
    const downloadLabel = state.exportingVideo
      ? (pdfMode ? "Exporting PDF..." : "Exporting Video...")
      : (pdfMode ? (getPdfRenderMode() === "exact" ? "Export Exact PDF" : "Export PDF Context") : "Export Video");
    downloadBtn.textContent = downloadLabel;
    downloadBtn.setAttribute("aria-label", downloadLabel);
    downloadBtn.title = downloadLabel;
    downloadBtn.classList.toggle("is-exporting", state.exportingVideo || state.actionLocks?.export);
  }

  if (downloadPdfContextBtn) {
    downloadPdfContextBtn.classList.toggle("hidden", !pdfMode);
    downloadPdfContextBtn.textContent = getPdfRenderMode() === "exact"
      ? "Export PDF Context"
      : "Export Exact PDF";
    downloadPdfContextBtn.disabled = !pdfMode || !getPdfSelectedPageCount() || state.exportingVideo;
    downloadPdfContextBtn.classList.toggle("is-exporting", state.exportingVideo || state.actionLocks?.export);
  }

  updateStageMediaToolUi();

  if (stageImageUploadBtn) {
    stageImageUploadBtn.disabled = pdfMode;
  }

  if (stageBoldBtn) {
    stageBoldBtn.disabled = pdfMode;
  }

  if (stageItalicBtn) {
    stageItalicBtn.disabled = pdfMode;
  }

  if (stageUnderlineBtn) {
    stageUnderlineBtn.disabled = pdfMode;
  }

  if (playbackSpeedSelect && !Number.isNaN(Number(playbackSpeedSelect.value))) {
    playbackSpeedSelect.value = String(getStagePlaybackRate());
  }

  if (stagePlaybackSpeedSelect && !Number.isNaN(Number(stagePlaybackSpeedSelect.value))) {
    stagePlaybackSpeedSelect.value = String(getStagePlaybackRate());
  }

  updateStageTimelineUi();
}

function showPdfScreen(renderMode = "context") {
  if (!getPdfSelectedPageCount()) {
    setStatus("Select at least one PDF page before showing it on the screen.");
    updatePdfUi();
    return;
  }

  stopDictation(false);
  stopInputPreview(false);
  stopPlayback(false);
  invalidatePdfPresentationRequest();
  state.presentationMode = "pdf";
  setPdfRenderMode(renderMode);
  resetPdfPlaybackState(true);
  const presentationPageCount = getPdfPresentationPageCount();
  const preferredPreviewIndex = clamp(state.previewPageIndex, 0, Math.max(0, presentationPageCount - 1));
  state.previewPageIndex = preferredPreviewIndex;
  const previewSlot = state.pdf.pageSchedule[preferredPreviewIndex] || null;
  state.pdf.currentTimeMs = previewSlot ? previewSlot.startMs : 0;
  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    false
  );
  inputPanel.classList.add("hidden");
  stagePanel.classList.remove("hidden");
  updateStageModeUi();
  updateStageViewUi();
  drawScene(0.12);
  ensureStageMediaLoop();
  setStatus(
    getPdfRenderMode() === "exact"
      ? `PDF screen is ready. ${getPdfSelectedPageCount()} selected page${getPdfSelectedPageCount() === 1 ? "" : "s"} will be presented exactly as rendered from the PDF file.`
      : `PDF context screen is ready. ${getPdfSelectedPageCount()} selected page${getPdfSelectedPageCount() === 1 ? "" : "s"} will show the extracted context on the blue teaching screen.`
  );
}

async function setPdfNarrationFromBlob(blob, fileName, sourceLabel, textSource = "", voice = "", options = {}) {
  const nextUrl = URL.createObjectURL(blob);

  try {
    const audioElement = await createLoadedAudio(nextUrl);
    const durationMs = Number.isFinite(audioElement.duration)
      ? Math.max(1000, Math.ceil(audioElement.duration * 1000))
      : getPdfScheduleTotalDuration(buildPdfPresentationSchedule());

    resetPdfNarrationState();
    const syncProfile = options.syncProfile
      ? scaleSpeechSyncProfile(options.syncProfile, durationMs)
      : null;
    state.pdf.narration = {
      url: nextUrl,
      fileName,
      durationMs,
      source: sourceLabel,
      blob,
      textSource,
      voice,
      syncProfile: syncProfile
        ? {
          text: textSource,
          profile: syncProfile
        }
        : null
    };

    rebuildPdfPresentationSchedule({ preserveTime: true });
    updatePdfPageSelectionSummary();
    updateStageTimelineUi();
  } catch (error) {
    URL.revokeObjectURL(nextUrl);
    throw error;
  }
}

async function ensurePdfNarrationReadyForPresentation(options = {}) {
  const pdfText = getPdfPresentationText();
  if (!pdfText) {
    throw new Error("No readable PDF text was found in the selected pages.");
  }

  const voice = "anjali";
  if (
    state.pdf.narration.url
    && state.pdf.narration.textSource === pdfText
    && state.pdf.narration.voice === voice
  ) {
    return;
  }

  const label = `Generated ${getNarrationVoiceLabel(voice).toLowerCase()} PDF narration`;
  const fileName = `generated-${voice}-pdf-narration.wav`;
  let syncProfile = null;
  const blob = await requestNarrationBlob(pdfText, voice, {
    ...options,
    timeoutMs: options.timeoutMs || getLongNarrationRequestTimeoutMs(pdfText),
    onSyncProfile: (profile) => {
      syncProfile = profile;
      if (typeof options.onSyncProfile === "function") {
        options.onSyncProfile(profile);
      }
    }
  });
  await setPdfNarrationFromBlob(blob, fileName, label, pdfText, voice, { syncProfile });
}

function forceExportVoiceToAnjali() {
  state.preferredNarrationVoice = EXPORT_NARRATION_VOICE;
  if (slideVoiceSelect) {
    slideVoiceSelect.value = EXPORT_NARRATION_VOICE;
  }
  updatePreferredVoiceUi();
}

async function ensureAnjaliNarrationReadyForExport(options = {}) {
  forceExportVoiceToAnjali();
  const exportText = commitLatestLessonText();
  const hasMatchingNarration = Boolean(
    state.narration.blob
    && state.narration.voice === EXPORT_NARRATION_VOICE
    && state.narration.textSource === exportText
  );

  if (hasMatchingNarration) {
    return state.narration.blob;
  }

  let syncProfile = null;
  const blob = await requestNarrationBlob(exportText, EXPORT_NARRATION_VOICE, {
    ...options,
    onSyncProfile: (profile) => {
      syncProfile = profile;
      if (typeof options.onSyncProfile === "function") {
        options.onSyncProfile(profile);
      }
    }
  });
  await setNarrationFromBlob(
    blob,
    `generated-${EXPORT_NARRATION_VOICE}-narration.wav`,
    "Generated anjali narration",
    exportText,
    EXPORT_NARRATION_VOICE,
    { syncProfile }
  );
  return blob;
}

async function ensureAnjaliPdfNarrationReadyForExport(options = {}) {
  const pdfText = getPdfPresentationText();
  if (!pdfText) {
    throw new Error("No readable PDF text was found in the selected pages.");
  }

  forceExportVoiceToAnjali();

  const hasMatchingNarration = Boolean(
    state.pdf.narration.blob
    && state.pdf.narration.voice === EXPORT_NARRATION_VOICE
    && state.pdf.narration.textSource === pdfText
  );
  if (hasMatchingNarration) {
    return state.pdf.narration.blob;
  }

  let syncProfile = null;
  const blob = await requestNarrationBlob(pdfText, EXPORT_NARRATION_VOICE, {
    ...options,
    timeoutMs: options.timeoutMs || getLongNarrationRequestTimeoutMs(pdfText),
    onSyncProfile: (profile) => {
      syncProfile = profile;
      if (typeof options.onSyncProfile === "function") {
        options.onSyncProfile(profile);
      }
    }
  });
  await setPdfNarrationFromBlob(
    blob,
    `generated-${EXPORT_NARRATION_VOICE}-pdf-narration.wav`,
    "Generated anjali PDF narration",
    pdfText,
    EXPORT_NARRATION_VOICE,
    { syncProfile }
  );
  return blob;
}

function startPdfPlaybackLoop(options = {}) {
  const audioElement = options.audioElement || null;
  const onComplete = typeof options.onComplete === "function" ? options.onComplete : null;
  const onError = typeof options.onError === "function" ? options.onError : null;
  let settled = false;
  let lastRenderedSelectionIndex = -1;
  let lastVisibleText = "";
  let lastRenderAt = 0;
  let lastRenderedMouth = state.mouthOpen;

  const handleComplete = () => {
    if (settled) {
      return;
    }

    settled = true;
    if (onComplete) {
      onComplete();
      return;
    }

    finishPlayback("PDF presentation complete.");
  };

  const handleError = (error) => {
    if (settled) {
      return;
    }

    settled = true;
    if (onError) {
      onError(error);
      return;
    }

    finishPlayback(error?.message || "PDF presentation playback failed.");
  };

  if (audioElement) {
    audioElement.addEventListener("error", () => {
      handleError(new Error("The PDF narration audio could not be played."));
    }, { once: true });
  }

  const tick = () => {
    if (settled || !state.speaking) {
      return;
    }

    const nowMs = performance.now();
    const currentTimeMs = syncPdfPlaybackPosition();
    const pdfProgress = state.pdf.totalDurationMs ? (currentTimeMs / state.pdf.totalDurationMs) : 0;
    updatePlaybackProgressUi(pdfProgress, true);

    if (state.exportingVideo) {
      updateTaskProgressUi(0.26 + (pdfProgress * 0.54), true, { mirrorStage: true });
    }

    const activeSelectionIndex = getPdfSelectionIndexForTime(currentTimeMs);
    const activePage = getPdfPresentationPages()[activeSelectionIndex] || null;
    const visibleState = getPdfRenderMode() === "context"
      ? getPdfContextVisibleText(activePage, activeSelectionIndex)
      : null;
    const visibleText = visibleState?.partText || "";
    const shouldRedrawContext = getPdfRenderMode() === "context"
      ? (visibleText !== lastVisibleText || activeSelectionIndex !== lastRenderedSelectionIndex)
      : activeSelectionIndex !== lastRenderedSelectionIndex;
    const nextMouth = visibleState?.mouthActive
      ? getFallbackMouth(visibleState.speechElapsedMs)
      : 0.12;
    const shouldDrawFrame = shouldRenderAnimatedSceneFrame(nowMs, {
      force: shouldRedrawContext,
      lastRenderAt,
      mouthDelta: nextMouth - lastRenderedMouth
    });
    state.mouthOpen = nextMouth;
    if (shouldDrawFrame) {
      lastRenderedSelectionIndex = activeSelectionIndex;
      lastVisibleText = visibleText;
      drawScene(state.mouthOpen);
      lastRenderAt = nowMs;
      lastRenderedMouth = state.mouthOpen;
    }

    if (currentTimeMs >= Math.max(0, state.pdf.totalDurationMs - 60) || audioElement?.ended) {
      state.pdf.currentTimeMs = state.pdf.totalDurationMs;
      syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
      drawScene(0.12);
      handleComplete();
      return;
    }

    state.animationFrame = requestAnimationFrame(tick);
  };

  state.animationFrame = requestAnimationFrame(tick);
}

async function startPdfNarrationPlayback(statusMessage) {
  const resumeTimeMs = clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0);
  stopPlayback(false);
  resetTaskProgressUi();
  state.pdf.currentTimeMs = resumeTimeMs;
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    true
  );

  const audioElement = await createLoadedAudio(state.pdf.narration.url);
  audioElement.currentTime = resumeTimeMs / 1000;
  applyNaturalVoicePlayback(audioElement, getPdfPlaybackRate());
  audioElement.muted = false;
  audioElement.volume = 1;
  state.activeAudio = audioElement;
  teardownAudioGraph();

  state.pdf.audioDriven = true;
  state.pdf.paused = false;
  state.pdf.timelineStartedAt = 0;
  state.pdf.timelineStartOffsetMs = resumeTimeMs;
  state.speaking = true;
  state.mouthOpen = 0.12;
  setStatus(statusMessage);
  updateStageModeUi();
  drawScene(0.12);

  await startBackgroundMusicPlayback().catch((error) => {
    console.error(error);
    return null;
  });
  await audioElement.play();

  const completionPromise = new Promise((resolve, reject) => {
    startPdfPlaybackLoop({
      audioElement,
      onComplete: resolve,
      onError: reject
    });
  });

  completionPromise
    .then(() => {
      finishPlayback("PDF presentation complete.");
    })
    .catch((error) => {
      console.error(error);
      finishPlayback(error?.message || "PDF narration playback failed.");
    });
}

function startTimedPdfPresentation(statusMessage) {
  const resumeTimeMs = clamp(state.pdf.currentTimeMs, 0, state.pdf.totalDurationMs || 0);
  stopPlayback(false);
  resetTaskProgressUi();
  state.pdf.currentTimeMs = resumeTimeMs;
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    true
  );
  state.pdf.audioDriven = false;
  state.pdf.paused = false;
  state.pdf.timelineStartedAt = performance.now();
  state.pdf.timelineStartOffsetMs = resumeTimeMs;
  state.speaking = true;
  state.mouthOpen = 0.12;
  setStatus(statusMessage);
  updateStageModeUi();
  drawScene(0.12);
  startBackgroundMusicPlayback().catch((error) => console.error(error));
  startPdfPlaybackLoop();
}

async function playPdfPresentation() {
  if (!getPdfSelectedPageCount()) {
    setStatus("Select at least one PDF page before playing the PDF presentation.");
    updatePdfUi();
    return;
  }

  if (state.speaking) {
    setStatus("The PDF presentation is already playing.");
    return;
  }

  if (stagePanel.classList.contains("hidden") || !isPdfPresentationMode()) {
    showPdfScreen(getPdfRenderMode());
    if (stagePanel.classList.contains("hidden")) {
      return;
    }
  }

  const requestId = invalidatePdfPresentationRequest();
  rebuildPdfPresentationSchedule({ preserveTime: true });

  if (state.pdf.currentTimeMs >= state.pdf.totalDurationMs && state.pdf.totalDurationMs) {
    state.pdf.currentTimeMs = 0;
    syncPdfPreviewPageFromTime(0);
  }

  if (state.pdf.paused && state.pdf.currentTimeMs > 0 && !state.pdf.narration.url) {
    startTimedPdfPresentation("PDF presentation resumed with the timeline controls.");
    return;
  }

  if (state.pdf.narration.url) {
    await startPdfNarrationPlayback("PDF presentation is playing with generated narration.");
    return;
  }

  const pdfText = getPdfPresentationText();
  if (!pdfText) {
    startTimedPdfPresentation(`No readable text was found in the selected PDF pages, so the app is presenting ${getPdfPresentationFallbackLabel()} with the timeline controls.`);
    return;
  }

  const narrationServerReady = await ensureAnjaliCloneServer();
  if (!narrationServerReady) {
    startTimedPdfPresentation(`The local Anjali voice server is offline, so the app is presenting ${getPdfPresentationFallbackLabel()} with the timeline controls.`);
    return;
  }

  try {
    setStatus("Preparing PDF narration...");
    updateTaskProgressUi(0.2, true, { mirrorStage: true });
    await ensurePdfNarrationReadyForPresentation();
    if (requestId !== state.pdf.requestId) {
      resetTaskProgressUi();
      return;
    }
    updateTaskProgressUi(0.88, true, { mirrorStage: true });
    resetTaskProgressUi();
    await startPdfNarrationPlayback("PDF presentation is playing with generated narration.");
  } catch (error) {
    console.error(error);
    resetTaskProgressUi();
    if (getPdfRenderMode() === "context" && pdfText) {
      setStatus(`PDF context narration could not be prepared: ${error.message || "unknown error"}.`);
      return;
    }

    startTimedPdfPresentation(`Generated PDF narration is unavailable right now, so the app is presenting ${getPdfPresentationFallbackLabel()} with the timeline controls.`);
  }
}

function pausePdfPresentation() {
  if (!isPdfPresentationMode()) {
    return;
  }

  if (!state.speaking) {
    if (state.pdf.paused) {
      setStatus(`PDF presentation is paused at ${formatDurationMs(state.pdf.currentTimeMs)}.`);
    }
    return;
  }

  syncPdfPlaybackPosition();
  cancelVisualLoop();
  stopActiveAudio();
  state.speechUtterance = null;
  state.speaking = false;
  state.mouthOpen = 0.12;
  state.pdf.paused = state.pdf.currentTimeMs < state.pdf.totalDurationMs;
  state.pdf.audioDriven = false;
  state.pdf.timelineStartedAt = 0;
  state.pdf.timelineStartOffsetMs = state.pdf.currentTimeMs;
  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    true
  );
  updateStageTimelineUi();
  updateStageModeUi();
  drawScene(0.12);
  setStatus(`PDF presentation paused at ${formatDurationMs(state.pdf.currentTimeMs)}.`);
}

function seekPdfPresentation(nextTimeMs) {
  if (!isPdfPresentationMode()) {
    return;
  }

  rebuildPdfPresentationSchedule({ preserveTime: true });
  const safeTimeMs = clamp(Math.round(Number(nextTimeMs) || 0), 0, state.pdf.totalDurationMs || 0);
  state.pdf.currentTimeMs = safeTimeMs;
  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
  updatePlaybackProgressUi(
    state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
    state.speaking || state.pdf.paused || state.pdf.currentTimeMs > 0
  );

  if (state.speaking) {
    if (state.activeAudio) {
      try {
        state.activeAudio.currentTime = safeTimeMs / 1000;
      } catch (error) {
        console.error(error);
      }
    } else {
      state.pdf.timelineStartedAt = performance.now();
      state.pdf.timelineStartOffsetMs = safeTimeMs;
    }
  } else {
    state.pdf.timelineStartedAt = 0;
    state.pdf.timelineStartOffsetMs = safeTimeMs;
  }

  updateStageTimelineUi();
  updateStageModeUi();
  drawScene(state.mouthOpen);

  if (state.speaking && safeTimeMs >= state.pdf.totalDurationMs && state.pdf.totalDurationMs) {
    finishPlayback("PDF presentation complete.");
  }
}

function jumpPdfPresentation(deltaMs) {
  if (!isPdfPresentationMode()) {
    return;
  }

  const anchorTimeMs = state.speaking ? syncPdfPlaybackPosition() : state.pdf.currentTimeMs;
  seekPdfPresentation(anchorTimeMs + deltaMs);
}

function handleStagePlaybackRateChange(nextRate) {
  const parsedRate = Number(nextRate);
  if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
    return;
  }

  const safeRate = clamp(parsedRate, 0.5, 2);
  state.lessonPlaybackRate = safeRate;
  const currentTimeMs = isPdfPresentationMode() ? getPdfCurrentTimelinePosition() : state.pdf.currentTimeMs;
  state.pdf.playbackRate = safeRate;
  state.pdf.currentTimeMs = currentTimeMs;

  if (state.activeAudio) {
    applyNaturalVoicePlayback(state.activeAudio, getStagePlaybackRate());
  } else if (state.speaking) {
    state.pdf.timelineStartedAt = performance.now();
    state.pdf.timelineStartOffsetMs = currentTimeMs;
  }

  if (playbackSpeedSelect) {
    playbackSpeedSelect.value = String(safeRate);
  }

  if (stagePlaybackSpeedSelect) {
    stagePlaybackSpeedSelect.value = String(safeRate);
  }

  syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
  updatePdfPageSelectionSummary();
  updateStageTimelineUi();
  updateStageModeUi();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }

  if (isPdfPresentationMode()) {
    setStatus(`PDF playback speed set to ${getPdfPlaybackRate()}x. Voice pitch stays natural.`);
  } else {
    setStatus(`Playback speed set to ${getLessonPlaybackRate()}x. Voice pitch stays natural.`);
  }
}

function initializeDefaultPlaybackRate() {
  state.lessonPlaybackRate = DEFAULT_STAGE_PLAYBACK_RATE;
  state.pdf.playbackRate = DEFAULT_STAGE_PLAYBACK_RATE;

  if (playbackSpeedSelect) {
    playbackSpeedSelect.value = String(DEFAULT_STAGE_PLAYBACK_RATE);
  }

  if (stagePlaybackSpeedSelect) {
    stagePlaybackSpeedSelect.value = String(DEFAULT_STAGE_PLAYBACK_RATE);
  }
}

async function getPdfNarrationExportBlob() {
  if (state.pdf.narration.blob) {
    return state.pdf.narration.blob;
  }

  if (!state.pdf.narration.url) {
    throw new Error("No PDF narration audio is ready for export.");
  }

  const response = await fetch(state.pdf.narration.url);
  if (!response.ok) {
    throw new Error("The PDF narration audio could not be read for export.");
  }

  return response.blob();
}

function getProjectFolderPath() {
  if (window.location.protocol === "file:") {
    const decodedPath = decodeURIComponent(window.location.pathname);
    return decodedPath
      .replace(/^\/([A-Za-z]:\/)/, "$1")
      .replace(/\//g, "\\")
      .replace(/\\index\.html$/i, "");
  }

  return "C:\\Users\\patan\\Documents\\New project";
}

function getStartAllCommand() {
  const projectPath = getProjectFolderPath();
  return `cd "${projectPath}"; powershell -ExecutionPolicy Bypass -File ".\\start-all.ps1"`;
}

function areAllLocalServersReady() {
  return Boolean(
    state.narrationServerReady
    && state.anjaliCloneServerReady
    && state.transcribeServerReady
    && state.videoExportServerReady
  );
}

function getMissingLocalServerLabels() {
  const missing = [];

  if (!state.narrationServerReady) {
    missing.push("Narration 8424");
  }

  if (!state.anjaliCloneServerReady) {
    missing.push("Anjali 8426");
  }

  if (!state.transcribeServerReady) {
    missing.push("Transcription 8428");
  }

  if (!state.videoExportServerReady) {
    missing.push("Video export 8430");
  }

  return missing;
}

function getAnjaliCloneStoppedMessage() {
  return "Anjali clone server stopped. Click Start Servers or Check Servers, then wait for port 8426 to come back.";
}

function isAnjaliCloneStartupPending() {
  return Boolean(!state.anjaliCloneServerReady && (state.anjaliMonitor.warming || state.localServerStartup.active));
}

function isAnjaliGenerationActive() {
  return Number(state.anjaliMonitor.generationActiveCount || 0) > 0;
}

function beginAnjaliGenerationActivity() {
  state.anjaliMonitor.generationActiveCount = Math.max(0, Number(state.anjaliMonitor.generationActiveCount || 0)) + 1;
}

function endAnjaliGenerationActivity() {
  state.anjaliMonitor.generationActiveCount = Math.max(0, Number(state.anjaliMonitor.generationActiveCount || 0) - 1);
}

function handleAnjaliCloneServerTransition(isReady) {
  const previousReady = state.anjaliMonitor.lastKnownReady;
  state.anjaliMonitor.lastKnownReady = isReady;

  if (previousReady === isReady) {
    return;
  }

  if (!isReady) {
    if (state.localServerStartup.active) {
      setServerControlsStatus("Anjali clone server is starting on port 8426. XTTS warm-up can take a few minutes on this laptop.");
      return;
    }
    const message = getAnjaliCloneStoppedMessage();
    setServerControlsStatus(message);
    showRuntimeDisplayError(message, { updateStatus: true });
    return;
  }

  if (previousReady === false) {
    setServerControlsStatus("Anjali clone server is running again on port 8426.");
    if (/Anjali clone server stopped/i.test(state.runtimeErrorMessage || "")) {
      clearRuntimeDisplayError();
    }
  }
}

async function refreshLocalServerHealth() {
  await Promise.all([ensureNarrationServer(), ensureAnjaliCloneServer(), ensureTranscribeServer(), ensureVideoExportServer()]);
  updateServerHealthUi();
  return areAllLocalServersReady();
}

async function waitForAllLocalServersReady(timeoutMs = 240000) {
  const startedAt = Date.now();

  while ((Date.now() - startedAt) < timeoutMs) {
    const allReady = await refreshLocalServerHealth();
    if (allReady) {
      return true;
    }

    const elapsedRatio = Math.min(1, (Date.now() - startedAt) / timeoutMs);
    const progress = 0.22 + (elapsedRatio * 0.7);
    const missing = getMissingLocalServerLabels();
    const waitingMessage = missing.length
      ? (missing.includes("Anjali 8426")
        ? `Starting local servers. XTTS can take 2-4 minutes to warm up. Waiting for ${missing.join(", ")}...`
        : `Starting local servers. Waiting for ${missing.join(", ")}...`)
      : "Starting local servers...";
    setServerControlsStatus(waitingMessage);
    updateTaskProgressUi(progress, true, { label: waitingMessage });
    await delay(1600);
  }

  return false;
}

function triggerStartServersProtocol() {
  const launcherUrl = "learningoutcomes://start-servers";

  try {
    const launcherFrame = document.createElement("iframe");
    launcherFrame.style.display = "none";
    launcherFrame.setAttribute("aria-hidden", "true");
    launcherFrame.src = launcherUrl;
    document.body.appendChild(launcherFrame);
    window.setTimeout(() => launcherFrame.remove(), 2500);
  } catch (error) {
    console.error(error);
  }

  const launcherLink = document.createElement("a");
  launcherLink.href = launcherUrl;
  launcherLink.style.display = "none";
  document.body.appendChild(launcherLink);
  launcherLink.click();
  launcherLink.remove();

  window.setTimeout(() => {
    try {
      window.location.href = launcherUrl;
    } catch (error) {
      console.error(error);
    }
  }, 120);
}

async function startServersFromPage() {
  setServerControlsStatus("Starting local servers. If Windows asks, allow Learning Outcomes Launcher to open.");
  updateTaskProgressUi(0.12, true);
  state.localServerStartup.active = true;
  state.localServerStartup.startedAt = Date.now();
  updateServerHealthUi();

  try {
    triggerStartServersProtocol();
  } catch (error) {
    console.error(error);
    state.localServerStartup.active = false;
    updateServerHealthUi();
    setServerControlsStatus("The click launcher could not be opened. Use Copy Start Command once if needed.");
    resetTaskProgressUi();
    return;
  }

  const allReady = await waitForAllLocalServersReady();
  state.localServerStartup.active = false;
  updateTaskProgressUi(1, true);

  if (allReady) {
    setServerControlsStatus("All local servers started from the page button.");
  } else {
    const missing = getMissingLocalServerLabels();
    const suffix = missing.length ? ` Still waiting for ${missing.join(", ")}.` : "";
    setServerControlsStatus(`The launcher started, but not every server became ready within 4 minutes.${suffix} If Anjali is still warming, wait a little longer and press Check Servers.`);
  }

  updateServerHealthUi();
  resetTaskProgressUi();
}

async function copyStartAllCommand() {
  const command = getStartAllCommand();

  try {
    await navigator.clipboard.writeText(command);
    setServerControlsStatus("Start command copied. Paste it into PowerShell to launch narration, Anjali clone, transcription, and video export.");
  } catch (error) {
    console.error(error);
    setServerControlsStatus(`Copy failed. Run this in PowerShell: ${command}`);
  }
}

function updateServerHealthUi() {
  narrationHealthStatus.textContent = state.narrationServerReady
    ? "Narration server: running on port 8424"
    : "Narration server: not running";

  if (anjaliCloneHealthStatus) {
    anjaliCloneHealthStatus.textContent = state.anjaliCloneServerReady
      ? "Anjali clone server: running on port 8426"
      : (isAnjaliCloneStartupPending()
        ? "Anjali clone server: starting on port 8426..."
        : "Anjali clone server: not running");
  }

  transcribeHealthStatus.textContent = state.transcribeServerReady
    ? "Transcription server: running on port 8428"
    : "Transcription server: not running";

  videoExportHealthStatus.textContent = state.videoExportServerReady
    ? "Video export server: running on port 8430"
    : "Video export server: not running";
}

async function checkServerHealth() {
  setServerControlsStatus("Checking local servers...");
  updateTaskProgressUi(0.18, true, { label: "Checking local servers..." });
  await Promise.all([ensureNarrationServer(), ensureAnjaliCloneServer(), ensureTranscribeServer(), ensureVideoExportServer()]);
  updateTaskProgressUi(0.82, true, { label: "Refreshing local server status..." });
  updateServerHealthUi();

  if (state.narrationServerReady && state.anjaliCloneServerReady && state.transcribeServerReady && state.videoExportServerReady) {
    setServerControlsStatus("All local servers are running.");
  } else if (state.narrationServerReady || state.anjaliCloneServerReady || state.transcribeServerReady || state.videoExportServerReady) {
    setServerControlsStatus("Some local servers are running. Start the missing one with Start Servers if needed.");
  } else {
    setServerControlsStatus("All local servers are down. Use Start Servers or the copied PowerShell command.");
  }

  updateTaskProgressUi(1, true);
  resetTaskProgressUi();
}

async function ensureNarrationServer() {
  try {
    const response = await fetchWithTimeout(`${state.narrationServerUrl}/health`, { method: "GET" }, 2000);
    state.narrationServerReady = response.ok;
  } catch (error) {
    state.narrationServerReady = false;
  }

  if (!state.narrationServerReady) {
    setNarrationGenStatus("Anjali narration needs the local narration server on port 8424.");
  }

  updateServerHealthUi();

  return state.narrationServerReady;
}

async function ensureAnjaliCloneServer() {
  const now = Date.now();
  const recentlyHealthy = state.anjaliMonitor.lastHealthyAt > 0
    && (now - state.anjaliMonitor.lastHealthyAt) <= ANJALI_CLONE_HEALTH_GRACE_MS;

  if (isAnjaliGenerationActive()) {
    const keepReady = Boolean(
      state.anjaliCloneServerReady
      || recentlyHealthy
      || state.anjaliMonitor.modelLoaded
    );
    state.anjaliCloneServerReady = keepReady;
    state.anjaliMonitor.warming = false;
    updateServerHealthUi();
    return keepReady;
  }

  try {
    const response = await fetchWithTimeout(`${state.anjaliCloneServerUrl}/health`, {
      method: "GET",
      cache: "no-store"
    }, ANJALI_CLONE_HEALTH_TIMEOUT_MS);
    const payload = response.ok ? await response.clone().json().catch(() => null) : null;
    state.anjaliMonitor.modelLoaded = Boolean(payload?.modelLoaded);
    state.anjaliMonitor.warming = Boolean(response.ok && payload && payload.modelLoaded === false);
    state.anjaliMonitor.lastError = String(payload?.error || "").trim();
    state.anjaliCloneServerReady = Boolean(response.ok && (payload?.modelLoaded ?? true));
    if (state.anjaliCloneServerReady) {
      state.anjaliMonitor.lastHealthyAt = now;
      state.anjaliMonitor.transientFailureCount = 0;
    } else if (recentlyHealthy && !state.anjaliMonitor.warming) {
      state.anjaliCloneServerReady = true;
      state.anjaliMonitor.transientFailureCount = Math.max(1, Number(state.anjaliMonitor.transientFailureCount || 0) + 1);
    }
  } catch (error) {
    state.anjaliMonitor.modelLoaded = recentlyHealthy ? state.anjaliMonitor.modelLoaded : false;
    state.anjaliMonitor.warming = false;
    state.anjaliMonitor.lastError = String(error?.message || "").trim();
    state.anjaliMonitor.transientFailureCount = Math.max(1, Number(state.anjaliMonitor.transientFailureCount || 0) + 1);
    state.anjaliCloneServerReady = recentlyHealthy;
  }

  if (!state.anjaliCloneServerReady) {
    if (isAnjaliCloneStartupPending()) {
      setNarrationGenStatus("Anjali voice is starting on port 8426. Please wait while the voice model warms up.");
      setServerControlsStatus("Anjali voice server is starting. Please wait while the voice model finishes loading.");
    } else {
      setNarrationGenStatus("Anjali cloned narration needs the local Anjali clone server on port 8426. If it just started, give it a little time to warm up.");
    }
  }

  handleAnjaliCloneServerTransition(state.anjaliCloneServerReady);
  updateServerHealthUi();

  return state.anjaliCloneServerReady;
}

function startAnjaliCloneMonitor() {
  if (state.anjaliMonitor.timerId) {
    window.clearInterval(state.anjaliMonitor.timerId);
  }

  state.anjaliMonitor.timerId = window.setInterval(() => {
    if (document.hidden) {
      return;
    }

    if (isAnjaliGenerationActive()) {
      return;
    }

    void ensureAnjaliCloneServer();
  }, 15000);
}

async function ensureTranscribeServer() {
  try {
    const response = await fetchWithTimeout(`${state.transcribeServerUrl}/health`, { method: "GET" }, 2000);
    state.transcribeServerReady = response.ok;
  } catch (error) {
    state.transcribeServerReady = false;
  }

  if (!state.transcribeServerReady) {
    setTranscribeStatus("Audio-to-text needs the local transcription server on port 8428.");
  }

  updateServerHealthUi();

  return state.transcribeServerReady;
}

async function ensureVideoExportServer() {
  const now = Date.now();
  const recentlyHealthy = state.videoExportMonitor.lastHealthyAt > 0
    && (now - state.videoExportMonitor.lastHealthyAt) <= VIDEO_EXPORT_HEALTH_GRACE_MS;
  try {
    const response = await fetchWithTimeout(
      `${state.videoExportServerUrl}/health`,
      { method: "GET" },
      VIDEO_EXPORT_HEALTH_TIMEOUT_MS
    );
    state.videoExportServerReady = response.ok;
    if (state.videoExportServerReady) {
      state.videoExportMonitor.lastHealthyAt = now;
      state.videoExportMonitor.transientFailureCount = 0;
    } else if (recentlyHealthy) {
      state.videoExportServerReady = true;
      state.videoExportMonitor.transientFailureCount = Math.max(1, Number(state.videoExportMonitor.transientFailureCount || 0) + 1);
    }
  } catch (error) {
    state.videoExportServerReady = true;
    state.videoExportMonitor.transientFailureCount = Math.max(1, Number(state.videoExportMonitor.transientFailureCount || 0) + 1);
  }

  return state.videoExportServerReady;
}

async function combineNarrationBlobs(blobs = []) {
  const safeBlobs = blobs.filter((blob) => blob && blob.size);
  if (!safeBlobs.length) {
    throw new Error("Narration generation returned no audio data.");
  }

  if (safeBlobs.length === 1) {
    return safeBlobs[0];
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const OfflineAudioContextConstructor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContextConstructor || !OfflineAudioContextConstructor) {
    throw new Error("Audio merging is not supported in this browser.");
  }

  const audioContext = new AudioContextConstructor();

  try {
    const decodedBuffers = [];
    for (const blob of safeBlobs) {
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      decodedBuffers.push(decoded);
    }

    const sampleRate = decodedBuffers.reduce((best, buffer) => Math.max(best, buffer.sampleRate || 24000), 24000);
    const channelCount = decodedBuffers.reduce((best, buffer) => Math.max(best, buffer.numberOfChannels || 1), 1);
    const joinGapSeconds = Math.max(0, NARRATION_CHUNK_JOIN_GAP_MS / 1000);
    const totalDuration = decodedBuffers.reduce((sum, buffer, index) => (
      sum + buffer.duration + (index < (decodedBuffers.length - 1) ? joinGapSeconds : 0)
    ), 0);
    const totalFrames = Math.max(1, Math.ceil(totalDuration * sampleRate) + 1);
    const offlineContext = new OfflineAudioContextConstructor(channelCount, totalFrames, sampleRate);
    let cursorTime = 0;
    const fadeSeconds = Math.max(0.008, NARRATION_CHUNK_FADE_MS / 1000);

    decodedBuffers.forEach((buffer, index) => {
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      const gainNode = offlineContext.createGain();
      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      const startTime = cursorTime;
      const endTime = startTime + buffer.duration;
      const effectiveFadeIn = Math.min(fadeSeconds, Math.max(0.004, buffer.duration * 0.18));
      const effectiveFadeOut = Math.min(fadeSeconds, Math.max(0.004, buffer.duration * 0.18));

      gainNode.gain.setValueAtTime(index === 0 ? 1 : 0.0001, startTime);
      if (index > 0) {
        gainNode.gain.linearRampToValueAtTime(1, Math.min(endTime, startTime + effectiveFadeIn));
      }

      gainNode.gain.setValueAtTime(1, Math.max(startTime, endTime - effectiveFadeOut));
      gainNode.gain.linearRampToValueAtTime(0.0001, endTime);

      source.start(cursorTime);
      cursorTime += buffer.duration + (index < (decodedBuffers.length - 1) ? joinGapSeconds : 0);
    });

    const renderedBuffer = await offlineContext.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  } finally {
    await audioContext.close();
  }
}

function audioBufferToWavBlob(audioBuffer) {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const channelData = [];

  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    channelData.push(audioBuffer.getChannelData(channel));
  }

  const blockAlign = numberOfChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let sample = 0; sample < audioBuffer.length; sample += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const value = clamp(channelData[channel][sample], -1, 1);
      view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

function base64ToBlob(base64, contentType = "application/octet-stream") {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
}

async function blobToBase64(blob) {
  return arrayBufferToBase64(await blob.arrayBuffer());
}

function shouldUseChunkedMuxUpload(videoBlob, audioBlob, musicBlob) {
  const totalSize = Number(videoBlob?.size || 0) + Number(audioBlob?.size || 0) + Number(musicBlob?.size || 0);
  return totalSize >= MUX_CHUNK_UPLOAD_THRESHOLD_BYTES;
}

async function uploadBlobToMuxSession(sessionId, target, blob, onProgress = null) {
  const safeTarget = target === "music" ? "music" : (target === "audio" ? "audio" : "video");
  const safeBlob = blob instanceof Blob ? blob : new Blob();
  const totalBytes = Number(safeBlob.size || 0);

  if (!totalBytes) {
    return;
  }

  let uploadedBytes = 0;
  while (uploadedBytes < totalBytes) {
    const nextChunk = safeBlob.slice(uploadedBytes, uploadedBytes + MUX_CHUNK_UPLOAD_SIZE_BYTES);
    const response = await fetch(`${state.videoExportServerUrl}/api/mux-upload-chunk?sessionId=${encodeURIComponent(sessionId)}&target=${encodeURIComponent(safeTarget)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: nextChunk
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || `Uploading the ${safeTarget} chunk failed.`);
    }

    uploadedBytes += nextChunk.size;
    if (typeof onProgress === "function") {
      onProgress(uploadedBytes, totalBytes);
    }
  }
}

async function muxVideoAndAudioChunked(videoBlob, audioBlob, musicBlob, options = {}) {
  const audioFileName = options.audioFileName || state.narration.fileName || "narration.wav";
  const audioSpeed = Number.isFinite(Number(options.audioSpeed)) ? Number(options.audioSpeed) : 1;
  const videoSpeed = Number.isFinite(Number(options.videoSpeed)) ? Number(options.videoSpeed) : 1;
  const explicitTargetDurationMs = Number(options.targetDurationMs) || 0;
  const musicVolume = state.music.enabled
    ? Math.min(STRICT_BACKGROUND_MUSIC_VOLUME, Number(state.music.volume) || STRICT_BACKGROUND_MUSIC_VOLUME)
    : 0;
  const exportQuality = getEffectiveExportQuality();
  const saveHandle = options.saveHandle || null;
  const measuredAudioDurationMs = audioBlob?.size
    ? await measureNarrationBlobDurationMs(audioBlob)
    : 0;
  const targetDurationMs = Math.max(
    explicitTargetDurationMs,
    measuredAudioDurationMs && audioSpeed > 0
      ? Math.round(measuredAudioDurationMs / audioSpeed)
      : 0
  );
  const uploadPlan = [
    { key: "video", blob: videoBlob },
    { key: "audio", blob: audioBlob }
  ];

  if (musicBlob?.size) {
    uploadPlan.push({ key: "music", blob: musicBlob });
  }

  const totalBytes = uploadPlan.reduce((sum, item) => sum + Number(item.blob?.size || 0), 0);
  const sessionResponse = await fetch(`${state.videoExportServerUrl}/api/mux-upload-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      videoFileName: "canvas-export.webm",
      audioFileName,
      musicFileName: musicBlob?.size ? (state.music.fileName || "background-music.wav") : "",
      audioSpeed,
      videoSpeed,
      musicVolume,
      exportQuality,
      targetDurationMs,
      audioDuckingEnabled: Boolean(proDuckingEnabled && proDuckingEnabled.checked)
    })
  });

  if (!sessionResponse.ok) {
    const errorPayload = await sessionResponse.json().catch(() => ({}));
    throw new Error(errorPayload.error || "The local video export server could not start a chunked export session.");
  }

  const sessionPayload = await sessionResponse.json().catch(() => ({}));
  const sessionId = String(sessionPayload.sessionId || "");
  if (!sessionId) {
    throw new Error("The local video export server did not return a chunked export session id.");
  }

  let uploadedBytes = 0;
  for (const item of uploadPlan) {
    await uploadBlobToMuxSession(sessionId, item.key, item.blob, (itemUploadedBytes, itemTotalBytes) => {
      const overallUploadedBytes = uploadedBytes + itemUploadedBytes;
      const progress = totalBytes > 0 ? clamp(overallUploadedBytes / totalBytes, 0, 1) : 1;
      updateTaskProgressUi(0.9 + (progress * 0.08), true, {
        mirrorStage: true,
        label: "Uploading the rendered video to FFmpeg in chunks. Please wait..."
      });
    });
    uploadedBytes += Number(item.blob?.size || 0);
  }

  const completeResponse = await fetch(`${state.videoExportServerUrl}/api/mux-upload-complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionId })
  });

  if (!completeResponse.ok) {
    const errorPayload = await completeResponse.json().catch(() => ({}));
    throw new Error(errorPayload.error || "The local video export server could not finish the chunked export.");
  }

  if (saveHandle) {
    await streamResponseToFileHandle(completeResponse, saveHandle);
    return null;
  }

  return completeResponse.blob();
}

function buildMuxBinaryRequestBlob(videoBlob, audioBlob, musicBlob, metadata) {
  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(JSON.stringify(metadata));
  const magicBytes = encoder.encode(MUX_PACKAGE_MAGIC);
  const headerBytes = new Uint8Array(magicBytes.length + 16);
  headerBytes.set(magicBytes, 0);

  const headerView = new DataView(headerBytes.buffer);
  let offset = magicBytes.length;
  headerView.setUint32(offset, metadataBytes.length, true);
  offset += 4;
  headerView.setUint32(offset, Number(videoBlob.size || 0), true);
  offset += 4;
  headerView.setUint32(offset, Number(audioBlob.size || 0), true);
  offset += 4;
  headerView.setUint32(offset, Number(musicBlob?.size || 0), true);

  return new Blob(
    [headerBytes, metadataBytes, videoBlob, audioBlob, musicBlob || new Blob()],
    { type: "application/octet-stream" }
  );
}

async function decodeAudioFileToWav(file) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error("Audio decoding is not supported in this browser.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContextConstructor();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return audioBufferToWavBlob(audioBuffer);
  } finally {
    await audioContext.close();
  }
}

function getScenePalette(theme) {
  switch (theme) {
    case "Ocean":
      return ["#0b7bb3", "#71d7ff", "#b5f0ff"];
    case "Space":
      return ["#2746b5", "#7a6cff", "#b8c2ff"];
    case "Nature":
      return ["#1e7d4f", "#76d88f", "#c8f5cb"];
    case "Festival":
      return ["#ff8a3d", "#ffcf5a", "#ff7ea7"];
    case "Technology":
      return ["#125c86", "#4dd2ff", "#b4f6ff"];
    case "Sports":
      return ["#ff7b2f", "#ffd25f", "#ff5d5d"];
    case "History":
      return ["#925834", "#d7ab6d", "#f3dfbe"];
    default:
      return ["#0e84ad", "#4eb6de", "#ffb548"];
  }
}

function analyzeScenePrompt(promptText) {
  const text = (promptText || "").toLowerCase();
  const has = (pattern) => pattern.test(text);

  let theme = "Classroom";
  let vfx = "sparkles";
  let musicMood = "bright";
  let description = "Bright classroom style with gentle sparkles.";

  if (has(/ocean|sea|water|river|rain|underwater|fish|beach/)) {
    theme = "Ocean";
    vfx = "bubbles";
    musicMood = "calm";
    description = "Fresh ocean learning style with floating bubbles.";
  } else if (has(/space|planet|solar|moon|star|galaxy|universe|rocket/)) {
    theme = "Space";
    vfx = "sparkles";
    musicMood = "dreamy";
    description = "Dreamy space scene with sparkles and glowing light.";
  } else if (has(/forest|tree|nature|garden|plant|flower|animal|earth/)) {
    theme = "Nature";
    vfx = "waves";
    musicMood = "calm";
    description = "Natural green classroom mood with soft flowing motion.";
  } else if (has(/festival|celebration|party|dance|fun|birthday|joy/)) {
    theme = "Festival";
    vfx = "confetti";
    musicMood = "energetic";
    description = "Festive colorful scene with confetti energy.";
  } else if (has(/technology|robot|computer|digital|coding|science|future/)) {
    theme = "Technology";
    vfx = "grid";
    musicMood = "bright";
    description = "Clean digital scene with a modern grid glow.";
  } else if (has(/sport|game|cricket|football|run|race|athlete|team/)) {
    theme = "Sports";
    vfx = "rays";
    musicMood = "energetic";
    description = "Action learning scene with motion rays and lift.";
  } else if (has(/history|ancient|freedom|war|king|queen|civilization/)) {
    theme = "History";
    vfx = "rays";
    musicMood = "dramatic";
    description = "Warm dramatic scene with heritage-style light rays.";
  }

  return {
    prompt: promptText.trim(),
    theme,
    vfx,
    musicMood,
    exportQuality: getSelectedExportQuality(),
    palette: getScenePalette(theme),
    description
  };
}

function getPromptArtLines(promptText) {
  const cleanText = (promptText || "").replace(/\s+/g, " ").trim();
  if (!cleanText) {
    return ["Learning", "Outcomes"];
  }

  const words = cleanText.split(" ").slice(0, 8);
  if (words.length <= 3) {
    return [words.join(" "), ""].filter(Boolean);
  }

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" ")
  ].filter(Boolean);
}

function drawPromptArtDecorations(ctxRef, theme, palette, width, height) {
  ctxRef.save();

  if (theme === "Ocean") {
    for (let index = 0; index < 7; index += 1) {
      ctxRef.beginPath();
      ctxRef.lineWidth = 10 + index * 2;
      ctxRef.strokeStyle = `rgba(255,255,255,${0.12 - index * 0.012})`;
      for (let x = -20; x <= width + 20; x += 14) {
        const y = height - 180 - index * 32 + Math.sin((x / 90) + index) * 18;
        if (x === -20) {
          ctxRef.moveTo(x, y);
        } else {
          ctxRef.lineTo(x, y);
        }
      }
      ctxRef.stroke();
    }
  } else if (theme === "Space") {
    for (let index = 0; index < 40; index += 1) {
      const x = (index * 87) % width;
      const y = (index * 113) % height;
      const r = 2 + (index % 3);
      ctxRef.fillStyle = `rgba(255,255,255,${0.35 - (index % 4) * 0.05})`;
      ctxRef.beginPath();
      ctxRef.arc(x, y, r, 0, Math.PI * 2);
      ctxRef.fill();
    }
  } else if (theme === "Nature") {
    for (let index = 0; index < 9; index += 1) {
      ctxRef.fillStyle = `rgba(255,255,255,${0.08 + index * 0.01})`;
      ctxRef.beginPath();
      ctxRef.ellipse((index * 120) + 40, height - 120 - (index % 2) * 24, 70, 110, 0, 0, Math.PI * 2);
      ctxRef.fill();
    }
  } else if (theme === "Technology") {
    ctxRef.strokeStyle = "rgba(255,255,255,0.12)";
    ctxRef.lineWidth = 2;
    for (let x = 30; x <= width; x += 80) {
      ctxRef.beginPath();
      ctxRef.moveTo(x, 0);
      ctxRef.lineTo(x, height);
      ctxRef.stroke();
    }
    for (let y = 30; y <= height; y += 80) {
      ctxRef.beginPath();
      ctxRef.moveTo(0, y);
      ctxRef.lineTo(width, y);
      ctxRef.stroke();
    }
  } else if (theme === "Festival") {
    const colors = [palette[2], "#ffffff", palette[1], palette[0]];
    for (let index = 0; index < 24; index += 1) {
      ctxRef.save();
      ctxRef.translate((index * 73) % width, 80 + ((index * 41) % (height - 120)));
      ctxRef.rotate(index * 0.5);
      ctxRef.fillStyle = colors[index % colors.length];
      ctxRef.globalAlpha = 0.35;
      ctxRef.fillRect(-10, -4, 20, 8);
      ctxRef.restore();
    }
  } else {
    for (let index = 0; index < 12; index += 1) {
      ctxRef.fillStyle = `rgba(255,255,255,${0.08 + (index % 3) * 0.03})`;
      ctxRef.beginPath();
      ctxRef.arc((index * 95) % width, 90 + ((index * 57) % (height - 120)), 24 + (index % 3) * 12, 0, Math.PI * 2);
      ctxRef.fill();
    }
  }

  ctxRef.restore();
}

async function createPromptSceneArt(sceneState, promptText) {
  const artCanvas = document.createElement("canvas");
  artCanvas.width = 1024;
  artCanvas.height = 1024;
  const artCtx = artCanvas.getContext("2d");
  const palette = Array.isArray(sceneState.palette) && sceneState.palette.length >= 3
    ? sceneState.palette
    : ["#0e84ad", "#4eb6de", "#ffb548"];
  const lines = getPromptArtLines(promptText);

  const background = artCtx.createLinearGradient(0, 0, artCanvas.width, artCanvas.height);
  background.addColorStop(0, palette[0]);
  background.addColorStop(0.5, palette[1]);
  background.addColorStop(1, palette[2]);
  artCtx.fillStyle = background;
  artCtx.fillRect(0, 0, artCanvas.width, artCanvas.height);

  artCtx.fillStyle = "rgba(255,255,255,0.12)";
  artCtx.beginPath();
  artCtx.arc(180, 160, 220, 0, Math.PI * 2);
  artCtx.arc(830, 860, 260, 0, Math.PI * 2);
  artCtx.fill();

  drawPromptArtDecorations(artCtx, sceneState.theme, palette, artCanvas.width, artCanvas.height);

  artCtx.fillStyle = "rgba(255,255,255,0.92)";
  artCtx.beginPath();
  artCtx.moveTo(108, 168);
  artCtx.arcTo(916, 168, 916, 856, 36);
  artCtx.arcTo(916, 856, 108, 856, 36);
  artCtx.arcTo(108, 856, 108, 168, 36);
  artCtx.arcTo(108, 168, 916, 168, 36);
  artCtx.closePath();
  artCtx.fill();

  artCtx.fillStyle = palette[0];
  artCtx.font = '900 42px "Nunito"';
  artCtx.fillText(sceneState.theme.toUpperCase(), 160, 240);

  artCtx.fillStyle = "#10243a";
  artCtx.font = '800 88px "League Spartan"';
  let currentY = 380;
  lines.forEach((line) => {
    artCtx.fillText(line, 160, currentY, 700);
    currentY += 100;
  });

  artCtx.fillStyle = "#365f7b";
  artCtx.font = '700 34px "Nunito"';
  artCtx.fillText(sceneState.description, 160, 700, 680);

  artCtx.fillStyle = palette[2];
  artCtx.font = '800 28px "Nunito"';
  artCtx.fillText("Prompt-based scene art", 160, 790);

  const dataUrl = artCanvas.toDataURL("image/png");
  const image = await loadImageFromDataUrl(dataUrl);
  return {
    fileName: `generated-${sceneState.theme.toLowerCase()}-scene.png`,
    dataUrl,
    image,
    generatedFromPrompt: true
  };
}

function getMusicMoodConfig(mood) {
  switch (mood) {
    case "calm":
      return {
        tempo: 76,
        progression: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
        bass: [36, 33, 29, 31],
        lead: [72, 74, 76, 79],
        padWave: "sine",
        leadWave: "triangle"
      };
    case "dreamy":
      return {
        tempo: 84,
        progression: [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]],
        bass: [38, 33, 35, 31],
        lead: [74, 78, 81, 83],
        padWave: "triangle",
        leadWave: "sine"
      };
    case "dramatic":
      return {
        tempo: 92,
        progression: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
        bass: [33, 29, 36, 31],
        lead: [69, 72, 76, 77],
        padWave: "sawtooth",
        leadWave: "triangle"
      };
    case "energetic":
      return {
        tempo: 118,
        progression: [[64, 68, 71], [59, 63, 66], [61, 64, 68], [57, 61, 64]],
        bass: [40, 35, 37, 33],
        lead: [76, 80, 83, 85],
        padWave: "square",
        leadWave: "triangle"
      };
    default:
      return {
        tempo: 98,
        progression: [[60, 64, 67], [67, 71, 74], [57, 60, 64], [65, 69, 72]],
        bass: [36, 43, 33, 41],
        lead: [72, 76, 79, 81],
        padWave: "triangle",
        leadWave: "sine"
      };
  }
}

function midiToFrequency(midiNote) {
  return 440 * (2 ** ((midiNote - 69) / 12));
}

function scheduleOfflineTone(contextRef, destinationNode, {
  startTime,
  duration,
  frequency,
  type = "sine",
  gain = 0.1,
  attack = 0.02,
  release = 0.12,
  detune = 0
}) {
  const oscillator = contextRef.createOscillator();
  const gainNode = contextRef.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (detune) {
    oscillator.detune.setValueAtTime(detune, startTime);
  }

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + attack);
  gainNode.gain.setValueAtTime(gain, Math.max(startTime + attack, startTime + duration - release));
  gainNode.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(destinationNode);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

async function generateProceduralMusicBlob(mood = "bright", durationSeconds = 12) {
  const OfflineAudioContextConstructor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineAudioContextConstructor) {
    throw new Error("Music generation is not supported in this browser.");
  }

  const sampleRate = 44100;
  const totalFrames = Math.max(sampleRate * 4, Math.floor(sampleRate * durationSeconds));
  const offlineContext = new OfflineAudioContextConstructor(2, totalFrames, sampleRate);
  const masterGain = offlineContext.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(offlineContext.destination);

  const config = getMusicMoodConfig(mood);
  const beat = 60 / config.tempo;
  const barLength = beat * 4;
  const bars = Math.max(2, Math.floor(durationSeconds / barLength));

  for (let barIndex = 0; barIndex < bars; barIndex += 1) {
    const startTime = barIndex * barLength;
    const chord = config.progression[barIndex % config.progression.length];
    const bassNote = config.bass[barIndex % config.bass.length];
    const leadNote = config.lead[barIndex % config.lead.length];

    chord.forEach((midiNote, noteIndex) => {
      scheduleOfflineTone(offlineContext, masterGain, {
        startTime,
        duration: Math.min(barLength, durationSeconds - startTime),
        frequency: midiToFrequency(midiNote),
        type: config.padWave,
        gain: 0.055,
        attack: 0.08,
        release: 0.3,
        detune: noteIndex === 1 ? -7 : noteIndex === 2 ? 7 : 0
      });
    });

    scheduleOfflineTone(offlineContext, masterGain, {
      startTime,
      duration: Math.min(barLength * 0.9, durationSeconds - startTime),
      frequency: midiToFrequency(bassNote),
      type: "sine",
      gain: 0.1,
      attack: 0.01,
      release: 0.18
    });

    for (let beatIndex = 0; beatIndex < 4; beatIndex += 1) {
      const pulseStart = startTime + (beat * beatIndex);
      if (pulseStart >= durationSeconds) {
        break;
      }

      scheduleOfflineTone(offlineContext, masterGain, {
        startTime: pulseStart,
        duration: Math.min(beat * 0.45, durationSeconds - pulseStart),
        frequency: midiToFrequency(leadNote + (beatIndex % 2 === 0 ? 0 : 2)),
        type: config.leadWave,
        gain: 0.05,
        attack: 0.01,
        release: 0.12
      });

      scheduleOfflineTone(offlineContext, masterGain, {
        startTime: pulseStart,
        duration: Math.min(0.12, durationSeconds - pulseStart),
        frequency: 95 - (beatIndex * 5),
        type: "triangle",
        gain: 0.025,
        attack: 0.001,
        release: 0.08
      });
    }
  }

  const renderedBuffer = await offlineContext.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

function resetBackgroundMusicState() {
  if (sceneMusicPreview) {
    sceneMusicPreview.pause();
  }

  if (state.music.url) {
    URL.revokeObjectURL(state.music.url);
  }

  state.music = {
    url: "",
    fileName: "",
    blob: null,
    source: "",
    mood: "",
    durationMs: 0,
    volume: 0.2,
    enabled: false
  };
}

function updateBackgroundMusicUi() {
  if (state.music.url) {
    sceneMusicPreview.src = state.music.url;
    sceneMusicPreview.classList.remove("hidden");
    setSceneMusicStatus(`${state.music.source}: ${state.music.fileName}`);
  } else {
    sceneMusicPreview.pause();
    sceneMusicPreview.removeAttribute("src");
    sceneMusicPreview.load();
    sceneMusicPreview.classList.add("hidden");
    setSceneMusicStatus("No background music selected.");
  }
}

async function setBackgroundMusicFromBlob(blob, fileName, sourceLabel, mood = "") {
  const nextUrl = URL.createObjectURL(blob);

  try {
    const audioElement = await createLoadedAudio(nextUrl);
    const durationMs = Number.isFinite(audioElement.duration)
      ? Math.max(1000, Math.ceil(audioElement.duration * 1000))
      : 12000;

    resetBackgroundMusicState();
    state.music = {
      url: nextUrl,
      fileName,
      blob,
      source: sourceLabel,
      mood,
      durationMs,
      volume: 0.18,
      enabled: true
    };

    updateBackgroundMusicUi();
  } catch (error) {
    URL.revokeObjectURL(nextUrl);
    throw error;
  }
}

async function getBackgroundMusicExportBlob() {
  if (state.music.blob) {
    return state.music.blob;
  }

  if (!state.music.url) {
    return null;
  }

  const response = await fetch(state.music.url);
  if (!response.ok) {
    throw new Error("The background music could not be read for export.");
  }

  return response.blob();
}

function removeSceneGeneratedImagesFromState() {
  state.images = state.images.filter((item) => item.sourceTag !== "scene-generator");
}

function renderSceneImagePreviews() {
  sceneImagePreviewList.innerHTML = "";

  if (!state.sceneUploads.length) {
    sceneImagePreviewList.classList.add("hidden");
    return;
  }

  state.sceneUploads.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "image-preview-card";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "image-remove-btn";
    removeBtn.setAttribute("aria-label", `Remove ${item.fileName}`);
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", () => {
      state.sceneUploads.splice(index, 1);
      renderSceneImagePreviews();
      updateScenePreview();
    });

    const img = document.createElement("img");
    img.src = item.dataUrl;
    img.alt = `Scene upload ${index + 1}`;

    const label = document.createElement("p");
    label.className = "image-preview-label";
    label.textContent = item.fileName;

    card.appendChild(removeBtn);
    card.appendChild(img);
    card.appendChild(label);
    sceneImagePreviewList.appendChild(card);
  });

  sceneImagePreviewList.classList.remove("hidden");
}

function applySceneUploadsToStage() {
  const manualImages = state.images.filter((item) => item.sourceTag !== "scene-generator");
  const remainingSlots = Math.max(0, MAX_IMAGE_UPLOADS - manualImages.length);
  const uploadsToApply = state.sceneUploads.slice(0, remainingSlots).map((item) => ({
    ...item,
    sourceTag: "scene-generator"
  }));

  const pageAssignedImages = assignPageIndexesToNewImages(manualImages, uploadsToApply, 0);
  state.images = applyDefaultImageLayouts([...manualImages, ...pageAssignedImages]);
  state.imageEditor.activeIndex = state.images.length ? state.images.length - 1 : -1;
  renderImagePreviews();
}

function getScenePreviewStyle(palette) {
  const safePalette = Array.isArray(palette) && palette.length >= 3
    ? palette
    : ["#0e84ad", "#4eb6de", "#ffb548"];

  return `linear-gradient(135deg, ${safePalette[0]}, ${safePalette[1]}, ${safePalette[2]})`;
}

function updateScenePreview() {
  const sceneState = state.scene;
  const musicIsActive = sceneMusicModeSelect.value !== "off" && state.music.enabled;
  scenePreviewStage.dataset.vfx = sceneState.vfx;
  scenePreviewStage.style.background = getScenePreviewStyle(sceneState.palette);
  scenePreviewLabel.textContent = sceneState.description;
  sceneThemeChip.textContent = `Theme: ${sceneState.theme}`;
  sceneVfxChip.textContent = `VFX: ${sceneState.vfx.charAt(0).toUpperCase()}${sceneState.vfx.slice(1)}`;
  sceneMusicChip.textContent = `Music: ${
    musicIsActive
      ? (state.music.mood || sceneState.musicMood || "Custom")
      : (sceneMusicModeSelect.value === "off"
        ? "Off"
        : (sceneState.musicMood.charAt(0).toUpperCase() + sceneState.musicMood.slice(1)))
  }`;
  sceneExportChip.textContent = `Export: ${getExportQualityLabel(normalizeExportQuality(sceneState.exportQuality))}`;

  if (state.sceneUploads.length) {
    scenePreviewImage.src = state.sceneUploads[0].dataUrl;
    scenePreviewImage.classList.remove("hidden");
    scenePreviewHint.textContent = `${state.sceneUploads.length} scene image${state.sceneUploads.length > 1 ? "s" : ""} ready to add to the slide gallery.`;
  } else {
    scenePreviewImage.classList.add("hidden");
    scenePreviewImage.removeAttribute("src");
    scenePreviewHint.textContent = musicIsActive
      ? "Background music is ready. Generate the scene to apply it to playback and export."
      : "This preview shows the style that will be applied to the blue screen before you open the slide.";
  }
}

async function handleSceneImageSelection(event) {
  const selectedFiles = Array.from(event.target.files || []);
  if (!selectedFiles.length) {
    return;
  }

  try {
    const loadedImages = await Promise.all(
      selectedFiles.map(async (file) => {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
          reader.readAsDataURL(file);
        });

        const image = await loadImageFromDataUrl(dataUrl);
        return { fileName: file.name, dataUrl, image };
      })
    );

    state.sceneUploads = loadedImages;
    renderSceneImagePreviews();
    updateScenePreview();
    setSceneGeneratorStatus(`${loadedImages.length} scene image${loadedImages.length > 1 ? "s are" : " is"} ready. Generate the scene to place them on the slide.`);
  } catch (error) {
    console.error(error);
    setSceneGeneratorStatus(error.message || "Scene image upload failed.");
  } finally {
    event.target.value = "";
  }
}

async function handleSceneMusicSelection(event) {
  const [file] = Array.from(event.target.files || []);

  if (!file) {
    resetBackgroundMusicState();
    updateBackgroundMusicUi();
    updateScenePreview();
    return;
  }

  try {
    await setBackgroundMusicFromBlob(file, file.name, "Uploaded music", state.scene.musicMood);
    updateScenePreview();
    setSceneGeneratorStatus("Uploaded background music is ready.");
  } catch (error) {
    console.error(error);
    resetBackgroundMusicState();
    updateBackgroundMusicUi();
    setSceneGeneratorStatus(error.message || "Background music upload failed.");
  }
}

async function ensureScenePromptArt(sceneState, promptText) {
  if (state.sceneUploads.length) {
    return;
  }

  const generatedArt = await createPromptSceneArt(sceneState, promptText);
  state.sceneUploads = [generatedArt];
  renderSceneImagePreviews();
}

async function generateSceneSetup(options = {}) {
  const showScreenAfter = Boolean(options.showScreenAfter);
  const promptText = (scenePromptInput.value.trim() || lessonInput.value.trim());
  if (!promptText) {
    setSceneGeneratorStatus("Write a scene prompt or lesson content first.");
    return;
  }

  state.sceneGenerationActive = true;
  updateSceneGeneratorUi();
  setSceneGenerationProgress(8, "Analyzing prompt");

  try {
    if (!lessonInput.value.trim()) {
      lessonInput.value = promptText;
      handleLessonInputChange();
    }

    const detectedScene = analyzeScenePrompt(promptText);
    const selectedVfx = sceneVfxSelect.value === "auto" ? detectedScene.vfx : sceneVfxSelect.value;
    state.scene = {
      ...detectedScene,
      vfx: selectedVfx,
      exportQuality: getSelectedExportQuality()
    };

    exportQualitySelect.value = state.scene.exportQuality;
    setSceneGenerationProgress(24, "Building scene style");

    await ensureScenePromptArt(state.scene, promptText);
    setSceneGenerationProgress(52, "Generating prompt scene image");

    removeSceneGeneratedImagesFromState();
    applySceneUploadsToStage();
    setSceneGenerationProgress(68, "Placing scene image");

    if (sceneMusicModeSelect.value === "off") {
      resetBackgroundMusicState();
      updateBackgroundMusicUi();
    } else if (sceneMusicModeSelect.value === "upload") {
      if (!state.music.url) {
        throw new Error("Upload a background music file, or switch music mode to Auto Generate.");
      }
    } else {
      const estimatedDurationSeconds = clamp(
        Math.ceil((state.narration.durationMs || getDefaultNarrationDurationMs()) / 1000),
        12,
        36
      );

      setSceneGenerationProgress(78, "Generating background music");
      const musicBlob = await generateProceduralMusicBlob(state.scene.musicMood, estimatedDurationSeconds);
      await setBackgroundMusicFromBlob(
        musicBlob,
        `scene-${state.scene.musicMood}-music.wav`,
        "Generated music",
        state.scene.musicMood
      );
    }

    updateScenePreview();
    setSceneGenerationProgress(92, "Preparing preview and export");

    if (!stagePanel.classList.contains("hidden")) {
      drawScene(state.mouthOpen);
    }

    if (showScreenAfter) {
      showScreen();
    }

    setSceneGenerationProgress(100, showScreenAfter ? "Scene ready on screen" : "Scene ready");
    setSceneGeneratorStatus(
      `Scene ready: ${state.scene.theme} style, ${state.scene.vfx} background effect, ${state.scene.exportQuality === "4k" ? "4K" : "HD"} export.${state.music.enabled ? " Music is ready too." : ""}${showScreenAfter ? " The screen is open and ready for download." : ""}`
    );
    setStatus(showScreenAfter
      ? "Prompt scene is ready on screen. Play it or download the video."
      : "Scene generator finished. Open the screen, play the slide, or download when ready.");
  } catch (error) {
    console.error(error);
    setSceneGenerationProgress(100, "Generation stopped");
    setSceneGeneratorStatus(error.message || "Scene generation failed.");
  } finally {
    state.sceneGenerationActive = false;
    updateSceneGeneratorUi();
    window.setTimeout(() => {
      if (!state.sceneGenerationActive) {
        resetSceneGenerationProgress();
      }
    }, 1200);
  }
}

function clearSceneSetup() {
  state.sceneGenerationActive = false;
  state.sceneUploads = [];
  scenePromptInput.value = "";
  sceneImageInput.value = "";
  sceneMusicInput.value = "";
  sceneVfxSelect.value = "auto";
  sceneMusicModeSelect.value = "auto";
  exportQualitySelect.value = "2k";
  state.scene = analyzeScenePrompt("");
  removeSceneGeneratedImagesFromState();
  resetBackgroundMusicState();
  renderSceneImagePreviews();
  renderImagePreviews();
  updateBackgroundMusicUi();
  updateScenePreview();
  resetSceneGenerationProgress();
  updateSceneGeneratorUi();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }

  setSceneGeneratorStatus("Scene setup cleared. Add a new prompt, image, or music and generate again.");
}

function clearTypingInterval() {
  if (state.typingInterval) {
    clearInterval(state.typingInterval);
    state.typingInterval = null;
  }
}

function cancelVisualLoop() {
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
  if (typeof cancelStageMediaLoop === "function") {
    cancelStageMediaLoop();
  }
}

function resetNarrationState() {
  audioPreview.pause();

  if (state.narration.url && state.narration.url.startsWith("blob:")) {
    URL.revokeObjectURL(state.narration.url);
  }

  state.narration = {
    url: "",
    fileName: "",
    durationMs: 0,
    source: "",
    blob: null,
    textSource: "",
    voice: "",
    syncProfile: null
  };
}

function updateNarrationUi() {
  if (state.narration.url) {
    audioPreview.src = state.narration.url;
    audioPreview.classList.remove("hidden");
    clearAudioBtn.disabled = false;
  } else {
    audioPreview.pause();
    audioPreview.removeAttribute("src");
    audioPreview.load();
    audioPreview.classList.add("hidden");
    clearAudioBtn.disabled = true;
  }
}

function setRecordingUi(isRecording) {
  recordBtn.disabled = isRecording;
  stopRecordBtn.disabled = !isRecording;
  audioInput.disabled = isRecording;
  clearAudioBtn.disabled = isRecording || !state.narration.url;
}

function stopDictation(updateStatus = true) {
  if (state.dictation.recognition && state.dictation.active) {
    state.dictation.recognition.stop();
  } else {
    state.dictation.active = false;
    state.dictation.recognition = null;
  }

  if (updateStatus) {
    setSpeechToolsStatus("Speech to text stopped.");
  }

  updateSpeechToolsUi();
}

function stopInputPreview(updateStatus = false) {
  setPreviewVoiceChooserVisible(false);

  if (!state.inputPreviewing && !updateStatus) {
    updateSpeechToolsUi();
    return;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (state.previewAudio) {
    state.previewAudio.pause();
    state.previewAudio.removeAttribute("src");
    state.previewAudio.load();
    if (state.previewAudio.dataset?.runtimeAudio === "true") {
      state.previewAudio.remove();
    }
    state.previewAudio = null;
  }

  if (state.previewAudioUrl) {
    URL.revokeObjectURL(state.previewAudioUrl);
    state.previewAudioUrl = "";
  }

  state.inputPreviewing = false;
  updateSpeechToolsUi();

  if (updateStatus) {
    setSpeechToolsStatus("Text to speech stopped.");
  }
}

async function playServerBackedTextPreview(text, voicePreference) {
  const voiceLabel = getNarrationVoiceLabel(voicePreference);
  const previewBlob = await requestNarrationBlob(text, voicePreference, {
    timeoutMs: getLongNarrationRequestTimeoutMs(text)
  });
  const previewUrl = URL.createObjectURL(previewBlob);

  try {
    const audioElement = await createLoadedAudio(previewUrl);
    applyNaturalVoicePlayback(audioElement, getLessonPlaybackRate());

    state.inputPreviewing = true;
    state.previewAudio = audioElement;
    state.previewAudioUrl = previewUrl;
    setSpeechToolsStatus(`${voiceLabel} voice is reading the content.`);
    updateSpeechToolsUi();

    audioElement.addEventListener("ended", () => {
      stopInputPreview(false);
      setSpeechToolsStatus(`${voiceLabel} voice finished reading the content.`);
      updateSpeechToolsUi();
    }, { once: true });

    audioElement.addEventListener("error", () => {
      stopInputPreview(false);
      setSpeechToolsStatus(`${voiceLabel} voice preview was interrupted.`);
      updateSpeechToolsUi();
    }, { once: true });

    await audioElement.play();
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

async function playDirectAudioPreview(audioUrl, voiceLabel) {
  const audioElement = await createLoadedAudio(audioUrl);
  applyNaturalVoicePlayback(audioElement, getLessonPlaybackRate());

  state.inputPreviewing = true;
  state.previewAudio = audioElement;
  setSpeechToolsStatus(`${voiceLabel} voice is reading the content.`);
  updateSpeechToolsUi();

  audioElement.addEventListener("ended", () => {
    stopInputPreview(false);
    setSpeechToolsStatus(`${voiceLabel} voice finished reading the content.`);
    updateSpeechToolsUi();
  }, { once: true });

  audioElement.addEventListener("error", () => {
    stopInputPreview(false);
    setSpeechToolsStatus(`${voiceLabel} voice preview was interrupted.`);
    updateSpeechToolsUi();
  }, { once: true });

  await audioElement.play();
}

function getPreferredPreviewVoice(voicePreference) {
  const voices = window.speechSynthesis.getVoices();
  const malePattern = /male|david|mark|guy|daniel|alex|james|matthew|george|ryan|aaron/i;
  const femalePattern = /hazel|jenny|aria|samantha|eva|zira|susan|sonia|heera|female/i;
  const indianFemalePattern = /heera|sonia|swara|veena|ananya|priya|india|indian|en-in|hi-in/i;
  const freshPattern = /jenny|hazel|aria|eva|samantha|zira|sonia|heera|google us english/i;
  const targetPattern = voicePreference === "male"
    ? malePattern
    : (voicePreference === "fresh"
      ? freshPattern
      : ((voicePreference === "indian-female" || voicePreference === "anjali") ? indianFemalePattern : femalePattern));

  return voices.find((voice) => targetPattern.test(`${voice.name} ${voice.voiceURI} ${voice.lang}`))
    || ((voicePreference === "indian-female" || voicePreference === "anjali")
      ? voices.find((voice) => femalePattern.test(`${voice.name} ${voice.voiceURI} ${voice.lang}`))
      : null)
    || voices.find((voice) => /english|en-/i.test(`${voice.name} ${voice.voiceURI} ${voice.lang}`))
    || voices[0]
    || null;
}

async function requestNarrationBlobSingle(text, voice = state.preferredNarrationVoice || "anjali", options = {}) {
  const isAnjaliClone = voice === "anjali";
  const requestTimeoutMs = isAnjaliClone
    ? 0
    : (Number.isFinite(Number(options.timeoutMs)) && Number(options.timeoutMs) > 0
      ? Number(options.timeoutMs)
      : DEFAULT_NARRATION_REQUEST_TIMEOUT_MS);
  if (typeof options.onProgress === "function") {
    options.onProgress({
      label: isAnjaliClone ? "Checking Anjali voice server..." : "Checking narration server...",
      progress: 0.12
    });
  }
  const serverReady = isAnjaliClone ? await ensureAnjaliCloneServer() : await ensureNarrationServer();
  if (!serverReady) {
    throw new Error(isAnjaliClone ? "The local Anjali voice server is not running." : "The local narration server is not running.");
  }

  const narrationText = typeof options.prebuiltNarrationText === "string"
    ? String(options.prebuiltNarrationText || "").trim()
    : buildNarrationText(text);
  if (!narrationText) {
    throw new Error("No narration text was available.");
  }
  const narrationPayload = buildNarrationRequestPayloadFromNarrationText(narrationText);

  if (typeof options.onProgress === "function") {
    options.onProgress({
      label: isAnjaliClone ? "Sending text to Anjali voice server..." : "Sending text to narration server...",
      progress: 0.22
    });
  }

  const response = await fetchWithTimeout(
    isAnjaliClone
      ? `${state.anjaliCloneServerUrl}/api/narrate`
      : `${state.narrationServerUrl}/api/narrate?voice=${encodeURIComponent(voice)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        isAnjaliClone
          ? narrationPayload
          : { text: narrationText }
      )
    },
    requestTimeoutMs
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error || "Narration generation failed.");
  }

  const contentType = response.headers.get("Content-Type") || "audio/wav";
  if (typeof options.onProgress === "function") {
    options.onProgress({
      label: "Receiving generated audio...",
      progress: 0.84
    });
  }
  if (/application\/json/i.test(contentType)) {
    const payload = await response.json().catch(() => null);
    if (!payload?.audioBase64) {
      throw new Error("Narration generation returned no audio data.");
    }

    return base64ToBlob(payload.audioBase64, payload.contentType || "audio/wav");
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("Narration generation returned an empty audio file.");
  }

  if (typeof options.onProgress === "function") {
    options.onProgress({
      label: "Finalizing narration audio...",
      progress: 0.94
    });
  }

  return blob.type === contentType ? blob : new Blob([blob], { type: contentType });
}

async function measureNarrationBlobDurationMs(blob) {
  if (!blob?.size) {
    return getDefaultNarrationDurationMs();
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const audioElement = await createLoadedAudio(objectUrl);
    return Number.isFinite(audioElement.duration)
      ? Math.max(1000, Math.ceil(audioElement.duration * 1000))
      : getDefaultNarrationDurationMs();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function generateNarrationChunkWithFallback(chunkText, voice, options = {}, depth = 0) {
  const safeChunkText = String(chunkText || "").trim();
  const blob = await requestNarrationBlobSingle(safeChunkText, voice, {
    ...options,
    prebuiltNarrationText: safeChunkText
  });
  const durationMs = await measureNarrationBlobDurationMs(blob);

  if (depth >= 4 || !isNarrationDurationTooShortForText(safeChunkText, durationMs, voice)) {
    return {
      chunks: [safeChunkText],
      blobs: [blob],
      durations: [durationMs]
    };
  }

  const retryChunks = splitNarrationChunkForRetry(safeChunkText);
  if (retryChunks.length <= 1) {
    return {
      chunks: [safeChunkText],
      blobs: [blob],
      durations: [durationMs]
    };
  }

  const results = [];
  for (const retryChunk of retryChunks) {
    results.push(await generateNarrationChunkWithFallback(retryChunk, voice, options, depth + 1));
  }

  return {
    chunks: results.flatMap((result) => result.chunks),
    blobs: results.flatMap((result) => result.blobs),
    durations: results.flatMap((result) => result.durations)
  };
}

async function requestNarrationBlob(text, voice = state.preferredNarrationVoice || "anjali", options = {}) {
  const narrationText = buildNarrationText(text);
  if (!narrationText) {
    throw new Error("No narration text was available.");
  }

  const chunkConfig = getNarrationChunkConfig(voice);
  const chunkedText = narrationText.length > chunkConfig.threshold
    ? splitNarrationTextIntoChunks(narrationText, chunkConfig.maxChunkLength)
    : [narrationText];

  const trackAnjaliGeneration = voice === "anjali";
  if (trackAnjaliGeneration) {
    beginAnjaliGenerationActivity();
  }

  try {
    if (chunkedText.length === 1) {
      const singleChunkResult = await generateNarrationChunkWithFallback(chunkedText[0], voice, options);
      const blob = await combineNarrationBlobs(singleChunkResult.blobs);
      const totalDurationMs = singleChunkResult.durations.reduce((sum, value) => sum + value, 0);
      const syncProfile = buildSpeechSyncProfileFromChunkDurations(text, singleChunkResult.chunks, singleChunkResult.durations);
      if (typeof options.onSyncProfile === "function" && syncProfile) {
        options.onSyncProfile(syncProfile);
      }
      return blob;
    }

    const totalChunks = chunkedText.length;
    const blobs = [];
    const chunkDurationsMs = [];
    const resolvedChunks = [];

    for (let index = 0; index < totalChunks; index += 1) {
      const chunk = chunkedText[index];
      const startedProgress = 0.18 + ((index / totalChunks) * 0.56);
      const completedProgress = 0.18 + (((index + 1) / totalChunks) * 0.56);
      if (typeof options.onProgress === "function") {
        options.onProgress({
          label: `Generating narration part ${index + 1} of ${totalChunks}...`,
          progress: startedProgress
        });
      }
      updateTaskProgressUi(
        startedProgress,
        true,
        {
          label: `Generating narration part ${index + 1} of ${totalChunks}`
        }
      );
      const chunkResult = await generateNarrationChunkWithFallback(chunk, voice, options);
      blobs.push(...chunkResult.blobs);
      chunkDurationsMs.push(...chunkResult.durations);
      resolvedChunks.push(...chunkResult.chunks);
      if (typeof options.onProgress === "function") {
        options.onProgress({
          label: `Finished narration part ${index + 1} of ${totalChunks}.`,
          progress: completedProgress
        });
      }
      updateTaskProgressUi(
        completedProgress,
        true,
        {
          label: `Finished narration part ${index + 1} of ${totalChunks}`
        }
      );
    }

    if (typeof options.onProgress === "function") {
      options.onProgress({
        label: "Joining narration parts together...",
        progress: 0.9
      });
    }

    const combinedBlob = await combineNarrationBlobs(blobs);
    const syncProfile = buildSpeechSyncProfileFromChunkDurations(text, resolvedChunks, chunkDurationsMs);
    if (typeof options.onSyncProfile === "function" && syncProfile) {
      options.onSyncProfile(syncProfile);
    }
    return combinedBlob;
  } finally {
    if (trackAnjaliGeneration) {
      endAnjaliGenerationActivity();
    }
  }
}

async function getNarrationExportBlob() {
  if (state.narration.blob) {
    return state.narration.blob;
  }

  if (!state.narration.url) {
    throw new Error("No narration audio is ready for export.");
  }

  const response = await fetch(state.narration.url);
  if (!response.ok) {
    throw new Error("The narration audio could not be read for export.");
  }

  return response.blob();
}

async function getIntroExportBlob() {
  const ready = await ensureDefaultIntroClip();
  if (!ready) {
    throw new Error("The intro clip is not ready for export.");
  }

  const response = await fetch(resolveProjectAssetUrl(state.introPlayback.url || DEFAULT_INTRO_VIDEO_FILE));
  if (!response.ok) {
    throw new Error("The intro clip audio could not be read for export.");
  }

  const introBlob = await response.blob();
  if (!introBlob.size) {
    throw new Error("The intro clip audio file was empty.");
  }

  if ((introBlob.type || "").toLowerCase().startsWith("audio/")) {
    return introBlob;
  }

  try {
    const introFile = new File(
      [introBlob],
      state.introPlayback.fileName || "intro-export-source.mp4",
      { type: introBlob.type || "video/mp4" }
    );
    return await decodeAudioFileToWav(introFile);
  } catch (error) {
    throw new Error(error?.message || "The intro clip audio could not be decoded for export.");
  }
}

async function renderPlaybackRateAdjustedAudioBlob(blob, playbackRate = 1) {
  const safeRate = Number.isFinite(Number(playbackRate)) && Number(playbackRate) > 0
    ? Number(playbackRate)
    : 1;
  if (!blob?.size || Math.abs(safeRate - 1) < 0.001) {
    return blob;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const OfflineAudioContextConstructor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContextConstructor || !OfflineAudioContextConstructor) {
    throw new Error("Audio speed adjustment is not supported in this browser.");
  }

  const audioContext = new AudioContextConstructor();

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const sampleRate = Math.max(24000, decodedBuffer.sampleRate || 24000);
    const channelCount = Math.max(1, decodedBuffer.numberOfChannels || 1);
    const adjustedDuration = decodedBuffer.duration / safeRate;
    const totalFrames = Math.max(1, Math.ceil(adjustedDuration * sampleRate) + 1);
    const offlineContext = new OfflineAudioContextConstructor(channelCount, totalFrames, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = decodedBuffer;
    source.playbackRate.value = safeRate;
    source.connect(offlineContext.destination);
    source.start(0);
    const renderedBuffer = await offlineContext.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  } finally {
    await audioContext.close();
  }
}

function createSilentWavBlob(durationMs, sampleRate = 24000) {
  const safeDurationMs = Math.max(1000, Math.round(durationMs || 1000));
  const channelCount = 1;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const frameCount = Math.max(1, Math.ceil((safeDurationMs / 1000) * sampleRate));
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAscii(36, "data");
  view.setUint32(40, dataSize, true);

  return new Blob([buffer], { type: "audio/wav" });
}

async function muxVideoAndAudio(videoBlob, audioBlob, options = {}) {
  const serverReady = await ensureVideoExportServer();
  if (!serverReady) {
    throw new Error("The local video export server is not running. Start it with start-all.ps1.");
  }

  const musicBlob = state.music.enabled ? await getBackgroundMusicExportBlob() : null;
  const audioFileName = options.audioFileName || state.narration.fileName || "narration.wav";
  const audioSpeed = Number.isFinite(Number(options.audioSpeed)) ? Number(options.audioSpeed) : 1;
  const videoSpeed = Number.isFinite(Number(options.videoSpeed)) ? Number(options.videoSpeed) : 1;
  const explicitTargetDurationMs = Number(options.targetDurationMs) || 0;
  const musicVolume = state.music.enabled
    ? Math.min(STRICT_BACKGROUND_MUSIC_VOLUME, Number(state.music.volume) || STRICT_BACKGROUND_MUSIC_VOLUME)
    : 0;
  const exportQuality = getEffectiveExportQuality();
  const saveHandle = options.saveHandle || null;
  const measuredAudioDurationMs = audioBlob?.size
    ? await measureNarrationBlobDurationMs(audioBlob)
    : 0;
  const targetDurationMs = Math.max(
    explicitTargetDurationMs,
    measuredAudioDurationMs && audioSpeed > 0
      ? Math.round(measuredAudioDurationMs / audioSpeed)
      : 0
  );
  if (shouldUseChunkedMuxUpload(videoBlob, audioBlob, musicBlob)) {
    return muxVideoAndAudioChunked(videoBlob, audioBlob, musicBlob, {
      audioFileName,
      audioSpeed,
      videoSpeed,
      targetDurationMs,
      saveHandle
    });
  }
  const requestBody = buildMuxBinaryRequestBlob(videoBlob, audioBlob, musicBlob, {
    videoFileName: "canvas-export.webm",
    audioFileName,
    musicFileName: musicBlob ? (state.music.fileName || "background-music.wav") : "",
    audioSpeed,
    videoSpeed,
    musicVolume,
    exportQuality,
    targetDurationMs,
    audioDuckingEnabled: Boolean(proDuckingEnabled && proDuckingEnabled.checked)
  });

  let response = null;
  let binaryError = null;
  try {
    response = await fetch(`${state.videoExportServerUrl}/api/mux-binary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream"
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || "The local video export server could not combine the video and audio.");
    }
  } catch (error) {
    binaryError = error;
    console.error(error);
    const jsonPayload = {
      videoBase64: await blobToBase64(videoBlob),
      audioBase64: await blobToBase64(audioBlob),
      videoFileName: "canvas-export.webm",
      audioFileName,
      musicFileName: musicBlob ? (state.music.fileName || "background-music.wav") : "",
      audioSpeed,
      videoSpeed,
      musicVolume,
      exportQuality,
      targetDurationMs,
      audioDuckingEnabled: Boolean(proDuckingEnabled && proDuckingEnabled.checked)
    };
    if (musicBlob?.size) {
      jsonPayload.musicBase64 = await blobToBase64(musicBlob);
    }

    response = await fetch(`${state.videoExportServerUrl}/api/mux`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonPayload)
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const fallbackMessage = errorPayload.error || "The local video export server could not combine the video and audio.";
      if (binaryError?.message) {
        throw new Error(`${fallbackMessage} Binary upload also failed earlier: ${binaryError.message}`);
      }
      throw new Error(fallbackMessage);
    }
  }

  if (saveHandle) {
    await streamResponseToFileHandle(response, saveHandle);
    return null;
  }

  return response.blob();
}

function getDefaultNarrationDurationMs() {
  if (!state.text) {
    return 6000;
  }

  const syncProfile = getSpeechSyncProfile(state.text);
  return Math.max(6000, Math.ceil(syncProfile.totalDurationMs || 6000));
}

function setDisplayedTokenCount(tokenCount) {
  const safeCount = clamp(tokenCount, 0, state.tokens.length);
  state.displayedText = state.tokens.slice(0, safeCount).join("");
}

function updateDisplayedTextFromProgress(progress, options = {}) {
  if (!state.tokens.length || !state.text) {
    state.displayedText = "";
    return;
  }

  if (progress <= 0) {
    state.displayedText = "";
    return;
  }

  if (progress >= 1) {
    state.displayedText = state.text;
    return;
  }

  state.displayedText = getVisibleTextForProgress(state.text, progress, options);
}

function getDisplayedTextProgress() {
  if (!state.text) {
    return 0;
  }

  if (!state.displayedText) {
    return 0;
  }

  return clamp(state.displayedText.length / Math.max(1, state.text.length), 0, 1);
}

function easeOutCubic(value) {
  const safeValue = clamp(value, 0, 1);
  return 1 - ((1 - safeValue) ** 3);
}

function fitText(ctxRef, text, maxWidth, fontSize, fontFamily, weight = "800") {
  let size = fontSize;
  while (size > 24) {
    ctxRef.font = `${weight} ${size}px ${fontFamily}`;
    if (ctxRef.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 2;
  }
  return size;
}

function isWordLikeCharacter(character) {
  return /[A-Za-z0-9_]/.test(character || "");
}

function matchesKeywordPhraseAt(text, index, phrase) {
  const safePhrase = String(phrase || "");
  if (!safePhrase) {
    return false;
  }

  const candidate = text.slice(index, index + safePhrase.length);
  if (candidate.length !== safePhrase.length || candidate.toLowerCase() !== safePhrase.toLowerCase()) {
    return false;
  }

  const previousCharacter = text[index - 1] || "";
  const nextCharacter = text[index + safePhrase.length] || "";
  const firstCharacter = safePhrase[0] || "";
  const lastCharacter = safePhrase[safePhrase.length - 1] || "";

  if (isWordLikeCharacter(firstCharacter) && isWordLikeCharacter(previousCharacter)) {
    return false;
  }

  if (isWordLikeCharacter(lastCharacter) && isWordLikeCharacter(nextCharacter)) {
    return false;
  }

  return true;
}

function findNextKeywordMatch(text, startIndex, rules) {
  let bestMatch = null;
  const lowerText = String(text || "").toLowerCase();

  rules.forEach((rule) => {
    const lowerPhrase = String(rule.phrase || "").toLowerCase();
    let matchIndex = lowerText.indexOf(lowerPhrase, startIndex);

    while (matchIndex !== -1) {
      if (matchesKeywordPhraseAt(text, matchIndex, rule.phrase)) {
        if (!bestMatch
          || matchIndex < bestMatch.index
          || (matchIndex === bestMatch.index && rule.phrase.length > bestMatch.rule.phrase.length)) {
          bestMatch = { index: matchIndex, rule };
        }
        break;
      }

      matchIndex = lowerText.indexOf(lowerPhrase, matchIndex + 1);
    }
  });

  return bestMatch;
}

function normalizeStyledRuns(runs, baseStyle = getBaseTextStyle()) {
  const normalizedRuns = [];

  runs.forEach((run) => {
    if (!run?.text) {
      return;
    }

    const resolvedStyle = getResolvedTextStyle(run.style, baseStyle);
    const previousRun = normalizedRuns[normalizedRuns.length - 1];

    if (previousRun && textStyleMatches(previousRun.style, resolvedStyle)) {
      previousRun.text += run.text;
      return;
    }

    normalizedRuns.push({
      text: run.text,
      style: resolvedStyle
    });
  });

  return normalizedRuns;
}

function getStyledTextRuns(text, defaultStyle = getBaseTextStyle()) {
  const rules = [...state.keywordStyles].sort((leftRule, rightRule) => rightRule.phrase.length - leftRule.phrase.length);

  if (!text) {
    return [];
  }

  if (!rules.length) {
    return [{ text, style: defaultStyle }];
  }

  const runs = [];
  let cursor = 0;

  while (cursor < text.length) {
    const directRule = rules.find((rule) => matchesKeywordPhraseAt(text, cursor, rule.phrase));

    if (directRule) {
      runs.push({
        text: directRule.phrase,
        style: getResolvedTextStyle(directRule.style, defaultStyle)
      });
      cursor += directRule.phrase.length;
      continue;
    }

    const nextMatch = findNextKeywordMatch(text, cursor + 1, rules);
    const nextStop = nextMatch ? nextMatch.index : text.length;

    runs.push({
      text: text.slice(cursor, nextStop),
      style: defaultStyle
    });
    cursor = nextStop;
  }

  return normalizeStyledRuns(runs, defaultStyle);
}

function tokenizeStyledRuns(runs) {
  const tokens = [];

  runs.forEach((run) => {
    const parts = run.text.match(/\S+\s*|\s+/g) || [];
    parts.forEach((part) => {
      if (part) {
        tokens.push({
          text: part,
          style: run.style
        });
      }
    });
  });

  return tokens;
}

function measureStyledRuns(ctxRef, runs, fontSize) {
  return runs.reduce((totalWidth, run) => {
    ctxRef.font = getContentFont(fontSize, run.style);
    return totalWidth + ctxRef.measureText(run.text).width;
  }, 0);
}

function trimStyledRowRuns(runs) {
  const trimmedRuns = runs.map((run) => ({
    text: run.text,
    style: run.style
  }));

  if (!trimmedRuns.length) {
    return [];
  }

  trimmedRuns[0].text = trimmedRuns[0].text.replace(/^\s+/, "");
  trimmedRuns[trimmedRuns.length - 1].text = trimmedRuns[trimmedRuns.length - 1].text.replace(/\s+$/, "");

  return normalizeStyledRuns(trimmedRuns.filter((run) => run.text));
}

function splitStyledToken(ctxRef, token, maxWidth, fontSize) {
  const parts = [];
  let current = "";

  Array.from(token.text).forEach((character) => {
    ctxRef.font = getContentFont(fontSize, token.style);
    const candidate = `${current}${character}`;

    if (!current || ctxRef.measureText(candidate).width <= maxWidth) {
      current = candidate;
      return;
    }

    parts.push({
      text: current,
      style: token.style
    });
    current = character;
  });

  if (current) {
    parts.push({
      text: current,
      style: token.style
    });
  }

  return parts;
}

function wrapStyledRuns(ctxRef, runs, maxWidth, fontSize) {
  const rows = [];
  const tokens = tokenizeStyledRuns(runs);
  let currentRow = [];

  const commitRow = () => {
    const normalizedRow = trimStyledRowRuns(currentRow);
    if (normalizedRow.length) {
      rows.push(normalizedRow);
    }
    currentRow = [];
  };

  tokens.forEach((token) => {
    const nextToken = currentRow.length
      ? token
      : {
        ...token,
        text: token.text.replace(/^\s+/, "")
      };

    if (!nextToken.text) {
      return;
    }

    if (!currentRow.length) {
      if (measureStyledRuns(ctxRef, [nextToken], fontSize) <= maxWidth) {
        currentRow.push(nextToken);
        return;
      }

      splitStyledToken(ctxRef, nextToken, maxWidth, fontSize).forEach((part) => {
        rows.push([{ text: part.text, style: part.style }]);
      });
      return;
    }

    const rowCandidate = trimStyledRowRuns([...currentRow, nextToken]);
    if (measureStyledRuns(ctxRef, rowCandidate, fontSize) <= maxWidth) {
      currentRow.push(nextToken);
      return;
    }

    commitRow();

    const trimmedToken = {
      ...token,
      text: token.text.replace(/^\s+/, "")
    };

    if (!trimmedToken.text) {
      return;
    }

    if (measureStyledRuns(ctxRef, [trimmedToken], fontSize) <= maxWidth) {
      currentRow.push(trimmedToken);
      return;
    }

    splitStyledToken(ctxRef, trimmedToken, maxWidth, fontSize).forEach((part) => {
      rows.push([{ text: part.text, style: part.style }]);
    });
  });

  commitRow();
  return rows;
}

function getContentLayout(lines, maxWidth, maxHeight, usePlaceholder = true, options = {}) {
  const safeLines = lines.length ? lines : (usePlaceholder ? ["Your content will appear here."] : []);
  const hasImages = options.hasImages === true || (options.hasImages !== false && state.images.length > 0);
  let fontSize = hasImages ? 26 : 30;

  if (state.words.length > 520) {
    fontSize = hasImages ? 22 : 24;
  } else if (state.words.length > 360) {
    fontSize = hasImages ? 23 : 25;
  } else if (state.words.length > 220) {
    fontSize = hasImages ? 24 : 26;
  } else if (state.words.length > 120) {
    fontSize = hasImages ? 25 : 28;
  }

  fontSize = clamp(Math.round(fontSize * state.fontScale), 16, 54);

  const buildLayout = (size) => {
    const rows = [];
    const rowHeight = Math.max(size + 4, Math.round(size * 1.2));
    const groupGap = Math.max(6, Math.round(size * 0.24));

    safeLines.forEach((line, index) => {
      const headingMatch = line.match(/^\s*#{1,3}\s+(.*)$/);
      const autoHeading = looksLikeAutoHeadingLine(line, index, safeLines.length);
      const sourceLine = headingMatch ? headingMatch[1] : line;
      const bulletMatch = sourceLine.match(/^\s*(?:[-*]|\u2022)\s+(.*)$/);
      const baseLineStyle = (headingMatch || autoHeading)
        ? {
          ...getBaseTextStyle(),
          bold: true,
          underline: true
        }
        : getBaseTextStyle();
      const lineText = (bulletMatch ? bulletMatch[1] : sourceLine).replace(/\s+/g, " ").trim() || sourceLine.trim();
      const styledRuns = getStyledTextRuns(lineText, baseLineStyle).map((run) => ({
        ...run,
        text: applyDisplayCase(run.text)
      }));
      const wrapped = wrapStyledRuns(ctx, styledRuns, maxWidth - (bulletMatch ? 28 : 0), size);

      wrapped.forEach((row, rowIndex) => {
        rows.push({ segments: row, bullet: Boolean(bulletMatch) && rowIndex === 0 });
      });

      if (index < safeLines.length - 1) {
        rows.push({ spacer: true, height: groupGap });
      }
    });

    const totalHeight = rows.reduce((sum, row) => sum + (row.spacer ? row.height : rowHeight), 0);
    return { rows, fontSize: size, rowHeight, totalHeight };
  };

  return buildLayout(fontSize);
}

function paginateLayout(layout, maxHeight) {
  const pages = [];
  let currentRows = [];
  let currentHeight = 0;

  const commitPage = () => {
    pages.push({
      rows: currentRows,
      totalHeight: currentHeight,
      fontSize: layout.fontSize,
      rowHeight: layout.rowHeight
    });
    currentRows = [];
    currentHeight = 0;
  };

  layout.rows.forEach((row) => {
    const rowHeight = row.spacer ? row.height : layout.rowHeight;

    if (!currentRows.length && row.spacer) {
      return;
    }

    if (currentRows.length && currentHeight + rowHeight > maxHeight) {
      commitPage();

      if (row.spacer) {
        return;
      }
    }

    currentRows.push(row);
    currentHeight += rowHeight;
  });

  if (currentRows.length || !pages.length) {
    commitPage();
  }

  return pages;
}

function getPresentationTemplateMetrics() {
  if (normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES) {
    return {
      contentTopInset: 150,
      contentLeftInset: 378,
      contentRightInset: 38,
      contentSideInset: 58,
      contentBottomInset: 40,
      imagePanelTopInset: 148,
      imagePanelBottomInset: 22,
      pdfStripTopInset: 156,
      videoTopInset: 138
    };
  }

  return {
    contentTopInset: STAGE_TEXT_TOP_MARGIN_PX,
    contentSideInset: STAGE_TEXT_SIDE_MARGIN_PX,
    contentLeftInset: STAGE_LEFT_CONTENT_GAP_PX,
    contentRightInset: STAGE_TEXT_SIDE_MARGIN_PX,
    contentBottomInset: STAGE_TEXT_BOTTOM_MARGIN_PX,
    imagePanelTopInset: STAGE_IMAGE_WORKSPACE_TOP_PX,
    imagePanelBottomInset: STAGE_IMAGE_WORKSPACE_BOTTOM_PX,
    pdfStripTopInset: STAGE_TEXT_TOP_MARGIN_PX,
    videoTopInset: STAGE_IMAGE_WORKSPACE_TOP_PX
  };
}

function getPresentationHeaderTitle() {
  if (normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES) {
    return normalizeOutcomesTitle(state.outcomesTitle) || "LEARNING OUTCOMES";
  }

  const heading = extractLessonHeading(state.text);
  const firstMeaningfulLine = String(state.text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find((line) => line && !/^[-*•]/.test(line));
  const baseTitle = heading || firstMeaningfulLine || "Maths Lesson";
  return baseTitle.replace(/\s+/g, " ").trim().slice(0, 72).toUpperCase();
}

function getStageContentArea(pageIndex = state.previewPageIndex, forceHasImages = null) {
  const metrics = getPresentationTemplateMetrics();
  const hasImages = forceHasImages === null
    ? Boolean(getVisibleSlideImages(pageIndex).length)
    : Boolean(forceHasImages);
  const leftInset = Number.isFinite(metrics.contentLeftInset) ? metrics.contentLeftInset : metrics.contentSideInset;
  const topInset = metrics.contentTopInset;
  const pinnedStripArea = hasImages ? getPinnedPdfImageStripArea() : null;
  const rightInset = hasImages && pinnedStripArea
    ? Math.max(Number.isFinite(metrics.contentRightInset) ? metrics.contentRightInset : metrics.contentSideInset, pinnedStripArea.width + STAGE_IMAGE_WORKSPACE_PADDING_PX + STAGE_PDF_IMAGE_STRIP_GAP_PX)
    : (Number.isFinite(metrics.contentRightInset) ? metrics.contentRightInset : metrics.contentSideInset);
  const bottomInset = metrics.contentBottomInset;

  return {
    x: leftInset,
    y: topInset,
    width: Math.max(360, canvas.width - leftInset - rightInset),
    height: Math.max(320, canvas.height - topInset - bottomInset)
  };
}

function getPaginatedSlideContent(textValue, usePlaceholder = true, pageIndex = state.previewPageIndex, forceHasImages = null) {
  const contentArea = getStageContentArea(pageIndex, forceHasImages);
  const lines = textValue ? buildDisplayedLines(textValue) : [];
  const layout = getContentLayout(lines, contentArea.width, contentArea.height, usePlaceholder, {
    hasImages: forceHasImages
  });
  let cumulativeTextLength = 0;
  const pages = paginateLayout(layout, contentArea.height).map((page) => {
    const pageText = (page.rows || [])
      .filter((row) => !row.spacer)
      .map((row) => (row.segments || []).map((segment) => segment.text).join(""))
      .join("\n");
    cumulativeTextLength += pageText.length;
    return {
      ...page,
      textEndIndex: cumulativeTextLength
    };
  });

  return {
    contentArea,
    layout,
    pages,
    pageCount: Math.max(1, pages.length)
  };
}

function getStableAnimatedPageIndex(fullContent, displayedText = "") {
  const pages = Array.isArray(fullContent?.pages) ? fullContent.pages : [];
  if (!pages.length) {
    return 0;
  }

  const visibleLength = Math.max(0, String(displayedText || "").length);
  const matchingIndex = pages.findIndex((page) => visibleLength <= Math.max(0, page?.textEndIndex || 0));
  if (matchingIndex >= 0) {
    return matchingIndex;
  }

  return Math.max(0, pages.length - 1);
}

function getContentScrollOffset(layout, viewportHeight) {
  const overflow = Math.max(0, layout.totalHeight - viewportHeight);
  if (!overflow) {
    state.contentScrollOffset = 0;
    return 0;
  }

  const isAnimatingContent = state.speaking || (state.displayedText && state.displayedText !== state.text);
  if (!isAnimatingContent || !state.text) {
    state.contentScrollOffset = 0;
    return 0;
  }

  const revealProgress = easeOutCubic(getDisplayedTextProgress());
  const followPadding = Math.max(12, Math.round(layout.rowHeight * 0.95));
  const targetOffset = Math.max(0, overflow + followPadding);
  const easedTarget = targetOffset * revealProgress;
  const smoothing = state.speaking ? 0.18 : 0.24;

  state.contentScrollOffset += (easedTarget - state.contentScrollOffset) * smoothing;
  return clamp(state.contentScrollOffset, 0, targetOffset);
}

function drawRoundedRect(x, y, width, height, radius, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawRoundedRectAtOrigin(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawContentHighlightPanel(contentArea, options = {}) {
  return;
}

function drawClassicTeachingStageBackdrop() {
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#083843");
  background.addColorStop(0.52, "#0d5561");
  background.addColorStop(1, "#072f38");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerGlow = ctx.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.44,
    40,
    canvas.width * 0.5,
    canvas.height * 0.44,
    canvas.width * 0.54
  );
  centerGlow.addColorStop(0, "rgba(64, 201, 218, 0.2)");
  centerGlow.addColorStop(0.45, "rgba(30, 149, 173, 0.12)");
  centerGlow.addColorStop(1, "rgba(5, 33, 41, 0)");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.lineWidth = 2;
  for (let index = 0; index < 7; index += 1) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(104, 223, 235, ${0.03 + (index * 0.01)})`;
    ctx.ellipse(
      canvas.width * 0.5,
      canvas.height * 0.48,
      220 + (index * 92),
      110 + (index * 54),
      -0.28,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawLearningOutcomesBackdrop(mouthOpen = 0) {
  const boardGradient = ctx.createLinearGradient(0, 118, 0, canvas.height);
  boardGradient.addColorStop(0, "#c7e4ef");
  boardGradient.addColorStop(0.56, "#b7ddea");
  boardGradient.addColorStop(1, "#b0d7e4");
  ctx.fillStyle = boardGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawHeaderBackdrop();

  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let index = 0; index < 16; index += 1) {
    const y = 150 + (index * 34);
    ctx.fillStyle = index % 2 === 0 ? "rgba(255, 255, 255, 0.42)" : "rgba(98, 151, 175, 0.18)";
    ctx.fillRect(0, y, canvas.width, 2);
  }
  ctx.restore();

  drawPresenterFigure(mouthOpen);
}

function drawTeachingStageBackdrop(mouthOpen = 0) {
  if (normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES) {
    drawLearningOutcomesBackdrop();
    return;
  }

  drawClassicTeachingStageBackdrop();
}

function isUsingDefaultStageStyle(style) {
  return textStyleMatches(getResolvedTextStyle(style), getBaseTextStyle());
}

function getAnimatedTeachingTextColor(segmentColor, rowText, rowIndex, segmentIndex, characterIndex = 0) {
  // If the user explicitly highlighted this exact sentence/word with a custom color, ALWAYS respect it!
  if (segmentColor && segmentColor !== "#ffffff") {
      return segmentColor;
  }
  
  return getBaseTextStyle().color || "#ffffff";
}

function drawAnimatedTeachingSegment(segment, x, y, rowText, rowIndex, segmentIndex, fontSize) {
  const text = segment.text || "";
  let cursorX = x;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const characterWidth = ctx.measureText(character).width;
    
    // Feed the segment's style color into the coloring engine to validate custom selections!
    ctx.fillStyle = getAnimatedTeachingTextColor(segment.style.color, rowText, rowIndex, segmentIndex, index);
    
    ctx.shadowColor = "rgba(8, 30, 39, 0.24)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillText(character, cursorX, y);

    cursorX += characterWidth;
  }

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  return cursorX - x;
}

function drawSceneVfx() {
  if (normalizePresentationTemplate(state.presentationTemplate) === PRESENTATION_TEMPLATE_OUTCOMES) {
    return;
  }

  const palette = Array.isArray(state.scene.palette) && state.scene.palette.length >= 3
    ? state.scene.palette
    : ["#0e84ad", "#4eb6de", "#ffb548"];
  const vfx = state.scene.vfx || "sparkles";
  const rawTime = (state.activeAudio?.currentTime || performance.now() / 1000);
  const exportMotionScale = state.exportingVideo ? 0.45 : 1;
  const time = rawTime * exportMotionScale;
  const boardTop = 118;
  const boardHeight = canvas.height - boardTop;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, boardTop, canvas.width, boardHeight);
  ctx.clip();

  if (vfx === "bubbles") {
    const bubbleCount = state.exportingVideo ? 12 : 16;
    for (let index = 0; index < bubbleCount; index += 1) {
      const radius = 16 + (index % 4) * 10;
      const x = ((index * 93) + (time * 28) + 70) % (canvas.width + 120) - 60;
      const y = boardTop + (((index * 71) - (time * 24)) % (boardHeight + 160)) + 30;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + (index % 3) * 0.02})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (vfx === "waves") {
    for (let waveIndex = 0; waveIndex < 4; waveIndex += 1) {
      ctx.beginPath();
      ctx.lineWidth = 10 + (waveIndex * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.07 - waveIndex * 0.01})`;
      for (let x = -40; x <= canvas.width + 40; x += 12) {
        const waveAmplitude = state.exportingVideo ? 10 : 22;
        const y = boardTop + 120 + (waveIndex * 80) + Math.sin((x / 110) + time + waveIndex) * waveAmplitude;
        if (x === -40) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  } else if (vfx === "rays") {
    for (let rayIndex = 0; rayIndex < 6; rayIndex += 1) {
      ctx.save();
      ctx.translate(canvas.width * 0.5, boardTop + 220);
      ctx.rotate((-0.8 + rayIndex * 0.28) + Math.sin(time * 0.22) * (state.exportingVideo ? 0.012 : 0.03));
      const gradient = ctx.createLinearGradient(0, -20, 0, 340);
      gradient.addColorStop(0, "rgba(255,255,255,0.18)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(-30, -20, 60, 340);
      ctx.restore();
    }
  } else if (vfx === "confetti") {
    const colors = [...palette, "#ffffff"];
    const confettiCount = state.exportingVideo ? 16 : 24;
    for (let index = 0; index < confettiCount; index += 1) {
      const x = ((index * 61) + time * 42) % (canvas.width + 60) - 30;
      const y = boardTop + ((index * 47) % (boardHeight - 40)) + 20;
      const size = 8 + (index % 3) * 3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((index * 0.7) + time * 0.3);
      ctx.fillStyle = colors[index % colors.length];
      ctx.globalAlpha = 0.22;
      ctx.fillRect(-size * 0.5, -size * 0.5, size, size * 0.62);
      ctx.restore();
    }
  } else if (vfx === "grid") {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let x = 24; x <= canvas.width; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, boardTop);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = boardTop + 12; y <= canvas.height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  } else {
    const sparkleCount = state.exportingVideo ? 14 : 18;
    for (let index = 0; index < sparkleCount; index += 1) {
      const baseX = 56 + ((index * 173) % Math.max(120, canvas.width - 112));
      const baseY = boardTop + 28 + ((index * 131) % Math.max(120, boardHeight - 56));
      const x = state.exportingVideo ? baseX : ((index * 79) + time * 24) % canvas.width;
      const y = state.exportingVideo
        ? baseY + Math.sin((time * 0.9) + index) * 4
        : boardTop + ((index * 59) % boardHeight);
      const radius = 3 + (index % 4);
      const alpha = state.exportingVideo
        ? 0.08 + ((Math.sin((time * 1.2) + index) + 1) * 0.04)
        : (0.16 - (index % 3) * 0.02);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillRect(x - 1, y - 10, 2, 20);
      ctx.fillRect(x - 10, y - 1, 20, 2);
    }
  }

  ctx.restore();
}

const PLACE_VALUE_BUILDER_MAX_DIGITS = 10;
const INDIAN_PLACE_VALUE_COLUMNS = [
  { group: "CRORES", label: "Hundred Crores", shortLabel: "HCr", value: 1000000000 },
  { group: "CRORES", label: "Ten Crores", shortLabel: "TCr", value: 100000000 },
  { group: "CRORES", label: "Crores", shortLabel: "Cr", value: 10000000 },
  { group: "LAKHS", label: "Ten Lakhs", shortLabel: "TL", value: 1000000 },
  { group: "LAKHS", label: "Lakhs", shortLabel: "L", value: 100000 },
  { group: "THOUSANDS", label: "Ten Thousands", shortLabel: "TTh", value: 10000 },
  { group: "THOUSANDS", label: "Thousands", shortLabel: "Th", value: 1000 },
  { group: "ONES", label: "Hundreds", shortLabel: "H", value: 100 },
  { group: "ONES", label: "Tens", shortLabel: "T", value: 10 },
  { group: "ONES", label: "Ones", shortLabel: "O", value: 1 }
];
const INTERNATIONAL_PLACE_VALUE_COLUMNS = [
  { group: "BILLIONS", label: "Billions", shortLabel: "B", value: 1000000000 },
  { group: "MILLIONS", label: "Hundred Millions", shortLabel: "HM", value: 100000000 },
  { group: "MILLIONS", label: "Ten Millions", shortLabel: "TM", value: 10000000 },
  { group: "MILLIONS", label: "Millions", shortLabel: "M", value: 1000000 },
  { group: "THOUSANDS", label: "Hundred Thousands", shortLabel: "HTh", value: 100000 },
  { group: "THOUSANDS", label: "Ten Thousands", shortLabel: "TTh", value: 10000 },
  { group: "THOUSANDS", label: "Thousands", shortLabel: "Th", value: 1000 },
  { group: "ONES", label: "Hundreds", shortLabel: "H", value: 100 },
  { group: "ONES", label: "Tens", shortLabel: "T", value: 10 },
  { group: "ONES", label: "Ones", shortLabel: "O", value: 1 }
];
const PLACE_VALUE_SYSTEMS = Object.freeze({
  indian: Object.freeze({
    key: "indian",
    label: "Indian",
    locale: "en-IN",
    columns: INDIAN_PLACE_VALUE_COLUMNS,
    toWords: convertIntegerToIndianWords
  }),
  international: Object.freeze({
    key: "international",
    label: "International",
    locale: "en-US",
    columns: INTERNATIONAL_PLACE_VALUE_COLUMNS,
    toWords: convertIntegerToInternationalWords
  })
});

function normalizePlaceValueSystem(value) {
  const safeValue = String(value || "").trim().toLowerCase();
  return safeValue.startsWith("inter") ? "international" : "indian";
}

function getPlaceValueSystemConfig(systemKey = "indian") {
  return PLACE_VALUE_SYSTEMS[normalizePlaceValueSystem(systemKey)] || PLACE_VALUE_SYSTEMS.indian;
}

function detectPlaceValueSystem(textValue = "") {
  const safeText = String(textValue || "");
  const explicitMatch = safeText.match(/(?:place\s+value\s+system|system)\s*:\s*(indian|international)/i);
  if (explicitMatch) {
    return normalizePlaceValueSystem(explicitMatch[1]);
  }

  if (/(international\s+place\s+value|million|billions?)/i.test(safeText) && !/(lakhs?|crores?)/i.test(safeText)) {
    return "international";
  }

  return "indian";
}

function sanitizePlaceValueNumber(value) {
  return String(value || "").replace(/[^\d]/g, "").slice(0, PLACE_VALUE_BUILDER_MAX_DIGITS);
}

function formatPlaceValueNumber(value, systemKey = "indian") {
  const config = getPlaceValueSystemConfig(systemKey);
  const rawValue = String(value ?? "").replace(/,/g, "").trim();
  if (!/^-?\d+$/.test(rawValue)) {
    return String(value ?? "");
  }

  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) {
    return String(value ?? "");
  }

  return Math.trunc(numericValue).toLocaleString(config.locale);
}

function formatIndianNumber(value) {
  return formatPlaceValueNumber(value, "indian");
}

function toTitleCaseWords(text) {
  return String(text || "").replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function wrapCanvasText(text, maxWidth, font) {
  const safeText = String(text || "").replace(/\s+/g, " ").trim();
  if (!safeText) {
    return [];
  }

  const words = safeText.split(" ");
  const lines = [];
  ctx.save();
  ctx.font = font;
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (!currentLine || ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }
  ctx.restore();
  return lines;
}

function drawRuntimeDisplayErrorOverlay() {
  const message = String(state.runtimeErrorMessage || "").trim();
  if (!message) {
    return;
  }

  const overlayWidth = Math.min(canvas.width - 120, 760);
  const titleFont = '800 14px "Nunito"';
  const bodyFont = '700 24px "Nunito"';
  const bodyLines = wrapCanvasText(message, overlayWidth - 48, bodyFont);
  const lineHeight = 30;
  const bodyHeight = Math.max(lineHeight, bodyLines.length * lineHeight);
  const overlayHeight = bodyHeight + 58;
  const x = Math.round((canvas.width - overlayWidth) / 2);
  const y = canvas.height - overlayHeight - 28;

  ctx.save();
  ctx.shadowColor = "rgba(31, 10, 14, 0.32)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(x, y, overlayWidth, overlayHeight, 24, "rgba(120, 24, 36, 0.94)");
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 231, 235, 0.22)";
  drawRoundedRect(x, y, overlayWidth, overlayHeight, 24);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 238, 170, 0.94)";
  ctx.font = titleFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("DISPLAY ERROR", x + 24, y + 16);
  ctx.fillStyle = "#ffffff";
  ctx.font = bodyFont;
  bodyLines.forEach((line, index) => {
    ctx.fillText(line, x + 24, y + 36 + (index * lineHeight));
  });
  ctx.restore();
}

function buildExpandedFormText(value, systemKey = "indian") {
  const config = getPlaceValueSystemConfig(systemKey);
  const digitsOnly = String(value || "").replace(/,/g, "").trim();
  if (!/^\d+$/.test(digitsOnly) || digitsOnly.length > config.columns.length) {
    return "";
  }

  const paddedDigits = digitsOnly.padStart(config.columns.length, "0");
  const terms = config.columns
    .map((column, index) => Number(paddedDigits[index]) * column.value)
    .filter((amount) => amount > 0)
    .map((amount) => formatPlaceValueNumber(amount, config.key));

  return terms.join(" + ");
}

function resolvePlaceValueBoardStartIndex(columns, columnIndex) {
  const safeIndex = clamp(columnIndex, 0, Math.max(0, columns.length - 1));
  const groupLabel = columns[safeIndex]?.group;
  let startIndex = safeIndex;

  while (startIndex > 0 && columns[startIndex - 1]?.group === groupLabel) {
    startIndex -= 1;
  }

  return startIndex;
}

function buildPlaceValueGroups(columns) {
  const groups = [];
  columns.forEach((column, index) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === column.group) {
      lastGroup.endIndex = index;
      return;
    }

    groups.push({
      label: column.group,
      startIndex: index,
      endIndex: index
    });
  });
  return groups;
}

function extractLessonHeading(textValue = "") {
  const headingLine = String(textValue || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#+\s+/.test(line));
  return headingLine ? headingLine.replace(/^#+\s+/, "").trim() : "";
}

function getMathPlaceValueBoardData(textValue) {
  const safeText = String(textValue || "").replace(/\u00a0/g, " ").trim();
  if (!safeText) {
    return null;
  }

  const hasPlaceValueKeywords = /(expanded\s+form|standard\s+form|place\s+value)/i.test(safeText);
  if (!hasPlaceValueKeywords) {
    return null;
  }

  const systemConfig = getPlaceValueSystemConfig(detectPlaceValueSystem(safeText));
  const minDigits = 1;
  const numberMatches = Array.from(safeText.matchAll(/\b\d[\d,]*\b/g))
    .map((match) => match[0])
    .map((value) => String(value || "").replace(/,/g, ""))
    .filter((value) => value.length >= minDigits && value.length <= PLACE_VALUE_BUILDER_MAX_DIGITS);

  if (!numberMatches.length) {
    return null;
  }

  const chosenNumber = numberMatches.sort((left, right) => right.replace(/,/g, "").length - left.replace(/,/g, "").length)[0];
  const digitsOnly = String(chosenNumber || "").replace(/,/g, "");
  if (!new RegExp(`^\\d{${minDigits},${PLACE_VALUE_BUILDER_MAX_DIGITS}}$`).test(digitsOnly)) {
    return null;
  }

  const paddedDigits = digitsOnly.padStart(systemConfig.columns.length, "0");
  const digits = paddedDigits.split("").map((digit) => Number(digit));
  const firstNonZeroIndex = digits.findIndex((digit) => digit !== 0);
  const startIndex = resolvePlaceValueBoardStartIndex(
    systemConfig.columns,
    firstNonZeroIndex === -1 ? digits.length - 1 : firstNonZeroIndex
  );
  const columns = systemConfig.columns.slice(startIndex).map((column, index) => ({
    ...column,
    digit: digits[startIndex + index]
  }));
  const groups = buildPlaceValueGroups(columns);
  const fallbackTitle = /expanded\s+form/i.test(safeText) && /standard\s+form/i.test(safeText)
    ? `${systemConfig.label} Expanded Form and Standard Form`
    : (/expanded\s+form/i.test(safeText)
      ? `${systemConfig.label} Expanded Form`
      : (/standard\s+form/i.test(safeText)
        ? `${systemConfig.label} Standard Form`
        : `${systemConfig.label} Place Value Chart`));
  const title = extractLessonHeading(safeText) || fallbackTitle;

  return {
    title,
    formattedNumber: formatPlaceValueNumber(digitsOnly, systemConfig.key),
    numberWords: toTitleCaseWords(systemConfig.toWords(digitsOnly)),
    expandedForm: buildExpandedFormText(digitsOnly, systemConfig.key),
    columns,
    groups
  };
}

function buildPlaceValuePresentationLines(rawNumber, systemKey = "indian") {
  const digitsOnly = sanitizePlaceValueNumber(rawNumber);
  if (!digitsOnly) {
    return [];
  }

  const systemConfig = getPlaceValueSystemConfig(systemKey);
  const paddedDigits = digitsOnly.padStart(systemConfig.columns.length, "0");
  const digits = paddedDigits.split("").map((digit) => Number(digit));
  const firstNonZeroIndex = digits.findIndex((digit) => digit !== 0);
  const startIndex = resolvePlaceValueBoardStartIndex(
    systemConfig.columns,
    firstNonZeroIndex === -1 ? digits.length - 1 : firstNonZeroIndex
  );
  const visibleColumns = systemConfig.columns.slice(startIndex).map((column, index) => ({
    ...column,
    digit: digits[startIndex + index]
  }));

  const lines = [
    `# ${systemConfig.label} Place Value Chart: ${formatPlaceValueNumber(digitsOnly, systemConfig.key)}`,
    `Place Value System: ${systemConfig.label}`,
    `Number: ${formatPlaceValueNumber(digitsOnly, systemConfig.key)}`,
    `Standard Form: ${formatPlaceValueNumber(digitsOnly, systemConfig.key)}`,
    `Expanded Form: ${buildExpandedFormText(digitsOnly, systemConfig.key) || formatPlaceValueNumber(digitsOnly, systemConfig.key)}`,
    `Number Name: ${toTitleCaseWords(systemConfig.toWords(digitsOnly))}`,
    "",
    "# Place Values"
  ];

  visibleColumns.forEach((column) => {
    lines.push(`${column.label} (${column.shortLabel}) = ${column.digit}`);
  });

  return lines;
}

function buildPlaceValueChartLessonText(rawNumber, systemKey = "indian") {
  const lines = buildPlaceValuePresentationLines(rawNumber, systemKey);
  if (!lines.length) {
    return "";
  }

  return lines.join("\n");
}

async function applyPlaceValueTableBuilder(options = {}) {
  const digitsOnly = sanitizePlaceValueNumber(placeValueNumberInput?.value || "");
  const systemKey = getPlaceValueSystemConfig(placeValueSystemSelect?.value || "indian").key;
  const showScreenAfter = Boolean(options.showScreenAfter);

  if (!digitsOnly) {
    setPlaceValueToolStatus("Enter a number first. You can use up to 10 digits.");
    if (placeValueNumberInput) {
      placeValueNumberInput.focus();
    }
    return;
  }

  const lessonText = buildPlaceValueChartLessonText(digitsOnly, systemKey);
  if (!lessonText) {
    setPlaceValueToolStatus("The place value table could not be created from that number.");
    return;
  }

  if (placeValueNumberInput) {
    placeValueNumberInput.value = formatPlaceValueNumber(digitsOnly, systemKey);
  }

  if (state.mathsTranslator.timerId) {
    window.clearTimeout(state.mathsTranslator.timerId);
    state.mathsTranslator.timerId = 0;
  }
  if (state.mathsTranslator.previewTimerId) {
    window.clearTimeout(state.mathsTranslator.previewTimerId);
    state.mathsTranslator.previewTimerId = 0;
  }
  if (mathsSourceInput) {
    mathsSourceInput.value = "";
  }
  state.mathsTranslator.lastSource = "";
  state.mathsTranslator.lastTranslated = "";
  setMathsTranslateLoading(false, "Translation complete.");
  updateMathsTranslationPreview("");

  lessonInput.value = lessonText;
  handleLessonInputChange();
  setPlaceValueToolStatus(`Ready: ${getPlaceValueSystemConfig(systemKey).label} table created for ${formatPlaceValueNumber(digitsOnly, systemKey)}.`);
  setMathsTranslatorStatus("Place value table loaded directly into the lesson box. The maths translator source was cleared so this table stays active.");
  setStatus(showScreenAfter
    ? "Place value table created and opened on the screen."
    : "Place value table created in the lesson box. Click Show Screen when you are ready.");

  if (showScreenAfter) {
    await showScreen();
  }
}

function drawPlaceValueSummaryCard(x, y, width, height, label, value, accentColor) {
  ctx.save();
  ctx.shadowColor = "rgba(5, 24, 31, 0.2)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(x, y, width, height, 24, "rgba(7, 48, 58, 0.56)");
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  drawRoundedRectAtOrigin(x, y, width, height, 24);
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = '800 16px "Nunito"';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label.toUpperCase(), x + 18, y + 14);

  const valueFont = '800 22px "Nunito"';
  const lines = wrapCanvasText(value, width - 36, valueFont).slice(0, 3);
  ctx.fillStyle = "#ffffff";
  ctx.font = valueFont;
  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, x + 18, y + 38 + (lineIndex * 26));
  });
  ctx.restore();
}

function drawMathPlaceValueBoard(contentArea, boardData, currentPageIndex = 0, totalPageCount = 1) {
  const panelX = contentArea.x + 6;
  const panelY = contentArea.y + 8;
  const panelWidth = contentArea.width - 12;
  const panelHeight = contentArea.height - 16;
  const topCardsY = panelY + 14;
  const topCardsHeight = 88;
  const numberCardWidth = Math.min(340, Math.max(220, panelWidth * 0.34));
  const chartCardWidth = panelWidth - numberCardWidth - 28;
  const gridTop = panelY + 118;
  const groupHeaderHeight = 52;
  const placeHeaderHeight = 92;
  const digitRowHeight = 82;
  const gridHeight = groupHeaderHeight + placeHeaderHeight + digitRowHeight;
  const gridX = panelX + 10;
  const gridWidth = panelWidth - 20;
  const columnWidth = gridWidth / Math.max(1, boardData.columns.length);
  const footerY = gridTop + gridHeight + 28;
  const footerGap = 16;
  const footerWidth = (panelWidth - footerGap) / 2;
  const digitColors = ["#ff69c7", "#f6973f", "#70f1ff", "#f36f92", "#b884ff", "#ffd05a"];

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.restore();

  drawPlaceValueSummaryCard(
    panelX + 8,
    topCardsY,
    numberCardWidth,
    topCardsHeight,
    "Number",
    boardData.formattedNumber,
    "#ff7b72"
  );
  drawPlaceValueSummaryCard(
    panelX + numberCardWidth + 20,
    topCardsY,
    chartCardWidth,
    topCardsHeight,
    "Chart",
    boardData.title,
    "#ffd167"
  );

  ctx.save();

  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 3;
  ctx.strokeRect(gridX, gridTop, gridWidth, gridHeight);

  ctx.beginPath();
  ctx.moveTo(gridX, gridTop + groupHeaderHeight);
  ctx.lineTo(gridX + gridWidth, gridTop + groupHeaderHeight);
  ctx.moveTo(gridX, gridTop + groupHeaderHeight + placeHeaderHeight);
  ctx.lineTo(gridX + gridWidth, gridTop + groupHeaderHeight + placeHeaderHeight);
  ctx.stroke();

  boardData.groups.forEach((group) => {
    const groupX = gridX + (group.startIndex * columnWidth);
    const groupWidth = (group.endIndex - group.startIndex + 1) * columnWidth;
    ctx.beginPath();
    ctx.moveTo(groupX, gridTop);
    ctx.lineTo(groupX, gridTop + gridHeight);
    ctx.stroke();

    ctx.fillStyle = "#ff9b42";
    ctx.font = '800 20px "Nunito"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(group.label, groupX + (groupWidth / 2), gridTop + (groupHeaderHeight / 2) + 1);
  });

  ctx.beginPath();
  ctx.moveTo(gridX + gridWidth, gridTop);
  ctx.lineTo(gridX + gridWidth, gridTop + gridHeight);
  ctx.stroke();

  boardData.columns.forEach((column, index) => {
    const cellX = gridX + (index * columnWidth);
    const dividerX = cellX + columnWidth;
    if (index < boardData.columns.length - 1) {
      ctx.beginPath();
      ctx.moveTo(dividerX, gridTop + groupHeaderHeight);
      ctx.lineTo(dividerX, gridTop + gridHeight);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.font = '800 17px "Nunito"';
    const labelLines = wrapCanvasText(column.label, columnWidth - 18, '800 17px "Nunito"').slice(0, 2);
    labelLines.forEach((line, lineIndex) => {
      ctx.fillText(
        line,
        cellX + (columnWidth / 2),
        gridTop + groupHeaderHeight + 22 + (lineIndex * 22)
      );
    });

    ctx.fillStyle = "#b8f36b";
    ctx.font = '800 17px "Nunito"';
    ctx.fillText(
      `(${column.shortLabel})`,
      cellX + (columnWidth / 2),
      gridTop + groupHeaderHeight + placeHeaderHeight - 22
    );

    ctx.save();
    ctx.shadowColor = "rgba(255, 105, 199, 0.28)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = digitColors[index % digitColors.length];
    ctx.font = '900 30px "Nunito"';
    ctx.fillText(String(column.digit), cellX + (columnWidth / 2), gridTop + groupHeaderHeight + placeHeaderHeight + (digitRowHeight / 2) + 2);
    ctx.restore();
  });

  drawPlaceValueSummaryCard(
    panelX + 4,
    footerY,
    footerWidth,
    106,
    "Standard Form",
    boardData.formattedNumber,
    "#7cf1ff"
  );
  drawPlaceValueSummaryCard(
    panelX + footerWidth + footerGap,
    footerY,
    footerWidth,
    106,
    "Number Name",
    boardData.numberWords,
    "#ffd167"
  );
  drawPlaceValueSummaryCard(
    panelX + 4,
    footerY + 122,
    panelWidth - 8,
    112,
    "Expanded Form",
    boardData.expandedForm || boardData.formattedNumber,
    "#ff8c66"
  );

  if (totalPageCount > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = '700 14px "Nunito"';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Page ${currentPageIndex + 1} / ${totalPageCount}`, panelX + panelWidth - 4, panelY + panelHeight - 4);
  }

  ctx.restore();
}

function getImagePageIndexForItem(item, fallbackIndex = 0) {
  if (Number.isInteger(item?.pageIndex) && item.pageIndex >= 0) {
    return item.pageIndex;
  }

  return Math.floor(Math.max(0, fallbackIndex) / SLIDE_IMAGES_PER_PAGE);
}

function getImageLayerOrder(item, fallbackIndex = 0) {
  return Number.isFinite(item?.zIndex) ? Number(item.zIndex) : fallbackIndex;
}

function getNextImageLayerOrder(images = state.images) {
  return images.reduce((highestLayer, item, index) => {
    return Math.max(highestLayer, getImageLayerOrder(item, index));
  }, -1) + 1;
}

function getImageEntriesForPage(pageIndex = 0, images = state.images) {
  return images
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => (
      getImagePageIndexForItem(item, index) === pageIndex
      && shouldRenderStageImage(item)
    ))
    .sort((left, right) => {
      const layerDifference = getImageLayerOrder(left.item, left.index) - getImageLayerOrder(right.item, right.index);
      return layerDifference || (left.index - right.index);
    });
}

function isAutoPdfExampleImage(item) {
  return item?.sourceTag === "pdf-auto";
}

function isAutoPdfLessonImage(item) {
  return item?.sourceTag === "pdf-lesson-auto";
}

function isManagedAutoPdfImage(item) {
  return isAutoPdfExampleImage(item) || isAutoPdfLessonImage(item);
}

function shouldRenderStageImage(item) {
  if (isAutoPdfLessonImage(item)) {
    return !isPdfPresentationMode();
  }

  return true;
}

function isPinnedPdfExampleImage(item) {
  return item?.sourceTag === "pdf-clipboard" || isAutoPdfExampleImage(item);
}

function getVisibleSlideImages(pageIndex = 0) {
  return getImageEntriesForPage(pageIndex).map(({ item }) => item);
}

function getStageHasVisibleImagesForPage(pageIndex = state.previewPageIndex) {
  return Boolean(getVisibleSlideImages(pageIndex).length);
}

function getDefaultSlideImagePanelArea() {
  const metrics = getPresentationTemplateMetrics();
  return {
    x: STAGE_IMAGE_WORKSPACE_PADDING_PX,
    y: metrics.imagePanelTopInset,
    width: Math.max(240, canvas.width - (STAGE_IMAGE_WORKSPACE_PADDING_PX * 2)),
    height: Math.max(220, canvas.height - metrics.imagePanelTopInset - metrics.imagePanelBottomInset),
    padding: 0,
    gap: 0,
    titleHeight: 0
  };
}

function getPinnedPdfImageStripArea() {
  const metrics = getPresentationTemplateMetrics();
  const width = Math.min(STAGE_PDF_IMAGE_STRIP_WIDTH_PX, Math.max(220, canvas.width * 0.3));
  return {
    x: Math.max(STAGE_IMAGE_WORKSPACE_PADDING_PX, canvas.width - width - STAGE_IMAGE_WORKSPACE_PADDING_PX),
    y: metrics.pdfStripTopInset,
    width,
    height: Math.max(220, canvas.height - metrics.pdfStripTopInset - metrics.contentBottomInset)
  };
}

function getSlideImagePanelArea(pageIndex = state.previewPageIndex) {
  if (!state.images.length || state.exportFallbackMode) {
    return null;
  }

  if (!getVisibleSlideImages(pageIndex).length) {
    return null;
  }

  return getDefaultSlideImagePanelArea();
}

function getImagePageCount() {
  if (!state.images.length) {
    return 1;
  }

  const highestPageIndex = state.images.reduce((bestIndex, item, index) => {
    return Math.max(bestIndex, getImagePageIndexForItem(item, index));
  }, 0);

  return Math.max(1, highestPageIndex + 1);
}

function getSlideImageWorkspace(pageIndex = state.previewPageIndex, allowEmptyPage = false) {
  const panel = allowEmptyPage ? getDefaultSlideImagePanelArea() : getSlideImagePanelArea(pageIndex);
  if (!panel) {
    return null;
  }

  return {
    x: panel.x,
    y: panel.y,
    width: panel.width,
    height: panel.height
  };
}

function normalizeImageFrame(item, fallbackIndex = 0) {
  const aspectRatio = item.aspectRatio || (item.image?.width && item.image?.height
    ? item.image.width / item.image.height
    : 4 / 3);
  const freeResize = Boolean(item.freeResize);
  const width = Math.max(STAGE_IMAGE_MIN_WIDTH_PX, Number.isFinite(item.width) ? item.width : 120);
  const height = freeResize
    ? Math.max(STAGE_IMAGE_MIN_HEIGHT_PX, Number.isFinite(item.height) ? item.height : (width / aspectRatio))
    : (width / aspectRatio);

  return {
    ...item,
    pageIndex: getImagePageIndexForItem(item, fallbackIndex),
    aspectRatio,
    zIndex: getImageLayerOrder(item, fallbackIndex),
    x: Number.isFinite(item.x) ? item.x : 0,
    y: Number.isFinite(item.y) ? item.y : 0,
    width,
    height,
    freeResize
  };
}

function hasExplicitImageFrame(item) {
  return Number.isFinite(item?.x)
    && Number.isFinite(item?.y)
    && Number.isFinite(item?.width)
    && Number.isFinite(item?.height);
}

function rectanglesOverlap(left, right, margin = 12) {
  return !(
    left.x + left.width + margin <= right.x
    || right.x + right.width + margin <= left.x
    || left.y + left.height + margin <= right.y
    || right.y + right.height + margin <= left.y
  );
}

function getDefaultImageSizeForWorkspace(workspace, aspectRatio, pageCount) {
  const baseWidth = pageCount <= 1
    ? workspace.width * 0.26
    : pageCount === 2
      ? workspace.width * 0.21
      : workspace.width * 0.18;
  const width = clamp(baseWidth, 140, 320);
  const maxWidth = Math.min(workspace.width - 24, workspace.height * aspectRatio);
  const safeWidth = clamp(width, 120, Math.max(120, maxWidth));

  return {
    width: safeWidth,
    height: safeWidth / aspectRatio
  };
}

function findOpenImagePosition(workspace, frame, occupiedFrames) {
  const safeFrame = {
    ...frame,
    x: clamp(frame.x, workspace.x, workspace.x + workspace.width - frame.width),
    y: clamp(frame.y, workspace.y, workspace.y + workspace.height - frame.height)
  };

  if (!occupiedFrames.some((occupied) => rectanglesOverlap(safeFrame, occupied))) {
    return safeFrame;
  }

  const maxX = Math.max(workspace.x, workspace.x + workspace.width - frame.width);
  const maxY = Math.max(workspace.y, workspace.y + workspace.height - frame.height);
  const xCandidates = [];
  const yCandidates = [];

  for (let x = maxX; x >= workspace.x; x -= 42) {
    xCandidates.push(x);
  }
  if (xCandidates[xCandidates.length - 1] !== workspace.x) {
    xCandidates.push(workspace.x);
  }

  for (let y = workspace.y; y <= maxY; y += 42) {
    yCandidates.push(y);
  }
  if (yCandidates[yCandidates.length - 1] !== maxY) {
    yCandidates.push(maxY);
  }

  for (const y of yCandidates) {
    for (const x of xCandidates) {
      const candidate = { ...frame, x, y };
      if (!occupiedFrames.some((occupied) => rectanglesOverlap(candidate, occupied))) {
        return candidate;
      }
    }
  }

  return safeFrame;
}

function applyDefaultImageLayouts(images) {
  if (!images.length) {
    return images.map((item, index) => normalizeImageFrame(item, index));
  }

  const positionedImages = new Array(images.length);
  const pageBuckets = new Map();

  images.forEach((item, index) => {
    const normalized = normalizeImageFrame(item, index);
    const pageIndex = getImagePageIndexForItem(normalized, index);

    if (!pageBuckets.has(pageIndex)) {
      pageBuckets.set(pageIndex, []);
    }

    pageBuckets.get(pageIndex).push({ original: item, normalized, index });
  });

  pageBuckets.forEach((entries, pageIndex) => {
    const workspace = getSlideImageWorkspace(pageIndex, true);
    if (!workspace) {
      entries.forEach((entry) => {
        positionedImages[entry.index] = entry.normalized;
      });
      return;
    }

    const preservedEntries = entries.filter(({ original }) => hasExplicitImageFrame(original));
    const newEntries = entries.filter(({ original }) => !hasExplicitImageFrame(original));
    const pinnedStripArea = getPinnedPdfImageStripArea();
    const pinnedEntries = newEntries.filter(({ normalized }) => isPinnedPdfExampleImage(normalized));
    const regularEntries = newEntries.filter(({ normalized }) => !isPinnedPdfExampleImage(normalized));
    const occupiedFrames = [];

    preservedEntries.forEach((entry) => {
      const clamped = clampImageFrame(entry.normalized, entry.index);
      positionedImages[entry.index] = clamped;
      occupiedFrames.push(clamped);
    });

    pinnedEntries.forEach((entry, pinnedIndex) => {
      const maxWidth = Math.min(
        pinnedStripArea.width,
        workspace.width,
        Math.max(STAGE_IMAGE_MIN_WIDTH_PX, pinnedStripArea.width - 8)
      );
      const preferredWidth = clamp(maxWidth, 232, Math.max(232, pinnedStripArea.width));
      const preferredHeight = entry.normalized.aspectRatio > 0
        ? Math.max(STAGE_IMAGE_MIN_HEIGHT_PX, preferredWidth / entry.normalized.aspectRatio)
        : preferredWidth;
      const maxHeight = Math.max(STAGE_IMAGE_MIN_HEIGHT_PX, (pinnedStripArea.height - ((Math.max(0, pinnedEntries.length - 1)) * 18)) / Math.max(1, pinnedEntries.length));
      const finalHeight = Math.min(preferredHeight, maxHeight);
      const finalWidth = entry.normalized.aspectRatio > 0
        ? Math.min(preferredWidth, finalHeight * entry.normalized.aspectRatio)
        : preferredWidth;
      const x = pinnedStripArea.x + Math.max(0, (pinnedStripArea.width - finalWidth));
      const y = pinnedStripArea.y + (pinnedIndex * (finalHeight + 18));
      const placed = clampImageFrame({
        ...entry.normalized,
        width: finalWidth,
        height: finalHeight,
        x,
        y
      }, entry.index);

      positionedImages[entry.index] = placed;
      occupiedFrames.push(placed);
    });

    regularEntries.forEach((entry) => {
      const size = getDefaultImageSizeForWorkspace(workspace, entry.normalized.aspectRatio, entries.length);
      const preferredStart = {
        ...entry.normalized,
        width: size.width,
        height: size.height,
        x: workspace.x + Math.max(18, Math.min(workspace.width - size.width - 18, (workspace.width * 0.58) + ((occupiedFrames.length % 3) * 34))),
        y: Math.max(workspace.y + 8, workspace.y + 8 + ((occupiedFrames.length % 4) * 34))
      };
      const placed = clampImageFrame(
        findOpenImagePosition(workspace, preferredStart, occupiedFrames),
        entry.index
      );

      positionedImages[entry.index] = placed;
      occupiedFrames.push(placed);
    });
  });

  return positionedImages;
}

function clampImageFrame(item, fallbackIndex = 0, options = {}) {
  const normalized = normalizeImageFrame(item, fallbackIndex);
  const workspace = getSlideImageWorkspace(normalized.pageIndex, true);
  if (!workspace) {
    return normalized;
  }

  const freeResize = options.freeResize === true || normalized.freeResize;
  const minWidth = STAGE_IMAGE_MIN_WIDTH_PX;
  const minHeight = STAGE_IMAGE_MIN_HEIGHT_PX;

  let width = normalized.width;
  let height = normalized.height;

  if (freeResize) {
    width = clamp(width, minWidth, Math.max(minWidth, workspace.width));
    height = clamp(height, minHeight, Math.max(minHeight, workspace.height));
  } else {
    const maxWidth = Math.max(minWidth, Math.min(workspace.width, workspace.height * normalized.aspectRatio));
    width = clamp(width, minWidth, maxWidth);
    height = width / normalized.aspectRatio;
  }

  const maxX = workspace.x + workspace.width - width;
  const maxY = workspace.y + workspace.height - height;

  return {
    ...normalized,
    freeResize,
    width,
    height,
    x: clamp(normalized.x, workspace.x, Math.max(workspace.x, maxX)),
    y: clamp(normalized.y, workspace.y, Math.max(workspace.y, maxY))
  };
}

function syncImageLayouts() {
  state.images = state.images.map((item, index) => clampImageFrame(item, index));
}

function bringImageToFront(index) {
  if (index < 0 || index >= state.images.length) {
    return -1;
  }

  state.images[index] = {
    ...state.images[index],
    zIndex: getNextImageLayerOrder()
  };
  return index;
}

function getImageResizeHandles(box) {
  // Corner handles keep resize hit-testing predictable across zoomed stage previews.
  const handleSize = STAGE_IMAGE_HANDLE_SIZE_PX;
  const halfHandle = handleSize / 2;
  return [
    { name: "nw", x: box.x - halfHandle, y: box.y - halfHandle, size: handleSize },
    { name: "ne", x: box.x + box.width - halfHandle, y: box.y - halfHandle, size: handleSize },
    { name: "sw", x: box.x - halfHandle, y: box.y + box.height - halfHandle, size: handleSize },
    { name: "se", x: box.x + box.width - halfHandle, y: box.y + box.height - halfHandle, size: handleSize }
  ];
}

function getResizeCursorForHandle(handleName = "") {
  return /^(nw|se)$/i.test(handleName) ? "nwse-resize" : "nesw-resize";
}

function drawHeaderBackdrop() {
  drawRoundedRect(0, 0, canvas.width, 118, 0, "#fefefe");

  const shadowGradient = ctx.createLinearGradient(0, 112, 0, 126);
  shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.22)");
  shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(0, 112, canvas.width, 18);

  ctx.fillStyle = "rgba(114, 159, 188, 0.16)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(135, 0);
  ctx.lineTo(50, 118);
  ctx.lineTo(0, 118);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(72, 122, 160, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(92, 0);
  ctx.lineTo(22, 118);
  ctx.lineTo(0, 118);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(53, 93, 127, 0.15)";
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(72, 0);
  ctx.lineTo(8, 118);
  ctx.lineTo(0, 118);
  ctx.closePath();
  ctx.fill();
}

function getLogoDrawRect() {
  const headerY = 18;
  const headerHeight = 94;
  const rightInset = 6;

  const canUseImageLogo = stageLogoImage
    && stageLogoImage.complete
    && stageLogoImage.naturalWidth
    && isSafeImageSource(stageLogoImage.currentSrc || stageLogoImage.src);

  if (!canUseImageLogo) {
    return {
      x: canvas.width - 332,
      y: headerY + 14,
      width: 308,
      height: headerHeight - 14
    };
  }

  const sourceWidth = LOGO_SOURCE_BOUNDS.width;
  const sourceHeight = LOGO_SOURCE_BOUNDS.height;
  const scale = (headerHeight - 8) / sourceHeight;
  const displayWidth = (sourceWidth * scale) * LOGO_WIDTH_COMPRESSION;
  const displayHeight = sourceHeight * scale;

  return {
    x: canvas.width - displayWidth - rightInset,
    y: headerY + (headerHeight - displayHeight) / 2,
    width: displayWidth,
    height: displayHeight
  };
}


let infoKidsLogoImg = new Image();
infoKidsLogoImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArQAAADwCAYAAADxaPeJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgMTAuMC1jMDAwIDI1LkcuZDIwZTQ2NiwgMjAyNS8xMi8wOC0yMDo1MDoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI3LjQgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wMy0zMVQxOTozOToyMSswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDQtMDFUMTI6NDc6MDQrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDQtMDFUMTI6NDc6MDQrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmU1ZWYwNzliLWFkNWItNWY0ZC04ZjU5LWNiNDc0NmM3MDlmZCIgeG1wTU06RG9jdW1lbnRJ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";


function drawInfoKidsLogo() {
  if (normalizePresentationTemplate(state.presentationTemplate) !== PRESENTATION_TEMPLATE_OUTCOMES) {
    return;
  }

  const enableCheck = document.getElementById("logoEnableCheck");
  if (enableCheck && !enableCheck.checked) {
     // logo disabled
  } else {
     if(infoKidsLogoImg.complete) {
       logoConfig.w = infoKidsLogoImg.width * logoConfig.scale;
       logoConfig.h = infoKidsLogoImg.height * logoConfig.scale;
       
       if (!logoConfig.initialized) {
           logoConfig.x = canvas.width - logoConfig.w - 50; 
           logoConfig.y = canvas.height - logoConfig.h - 30;
           logoConfig.initialized = true;
       }
       ctx.save();
       if (logoConfig.hovered) {
          ctx.strokeStyle = "rgba(42, 133, 255, 0.8)";
          ctx.lineWidth = 4;
          ctx.strokeRect(logoConfig.x, logoConfig.y, logoConfig.w, logoConfig.h);
       }
       ctx.drawImage(infoKidsLogoImg, logoConfig.x, logoConfig.y, logoConfig.w, logoConfig.h);
       ctx.restore();
     }
  }

  const titleLines = wrapCanvasText(
    getPresentationHeaderTitle(),
    canvas.width - 140,
    '900 66px "League Spartan", sans-serif'
  ).slice(0, 2);
  const titleFontSize = titleLines.length > 1 ? 54 : 66;
  const titleLineHeight = titleLines.length > 1 ? 48 : 56;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const titleY = 36 + Math.max(0, (80 - titleBlockHeight) / 2);

  ctx.save();
  ctx.fillStyle = "#cc0000"; // Red heading for Learning Outcomes
  ctx.font = `900 ${titleFontSize}px "League Spartan", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  titleLines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, titleY + (index * titleLineHeight));
  });
  ctx.restore();
}

let transparentAnjaliCanvas = null;

// We are switching from a static Anjali image to a live transparent video
avatarVideoElement = document.createElement('video');
avatarVideoElement.style.position = "fixed";
avatarVideoElement.style.top = "0";
avatarVideoElement.style.width = "1px";
avatarVideoElement.style.height = "1px";
avatarVideoElement.style.opacity = "0";
avatarVideoElement.style.pointerEvents = "none";
document.body.appendChild(avatarVideoElement); // Required for Chrome to honor infinite looping

// Use the exact path requested by the user!
avatarVideoElement.src = "teacher_video.mp4"; 
avatarVideoElement.loop = true;
avatarVideoElement.muted = true;
avatarVideoElement.crossOrigin = "anonymous";
avatarVideoElement.autoplay = true;
avatarVideoElement.setAttribute("playsinline", "");
avatarVideoElement.playbackRate = 1.8; // Ensure 1.8x speed as requested

// Immediately sync the UI to the element
(function() {
    const speedRange = document.getElementById("avatarSpeedRange");
    const speedLabel = document.getElementById("avatarSpeedLabel");
    
    function applySpeed(val) {
        avatarVideoElement.playbackRate = val;
        avatarVideoElement.defaultPlaybackRate = val; // Crucial for Chrome to preserve speed across loops
        if (speedLabel) speedLabel.textContent = val.toFixed(1) + "x";
    }

    if (speedRange) {
        applySpeed(parseFloat(speedRange.value) || 1.8);
        speedRange.addEventListener('input', (e) => applySpeed(parseFloat(e.target.value)));
    }
})();

// Rely completely on HTML5 'loop=true' so there are NO javascript frame-drop gaps at the video boundary!
// Further prevent "millisec vanishing" by skipping the raw encode's zero-frame boundaries!
avatarVideoElement.addEventListener('timeupdate', () => {
    if (avatarVideoElement.duration && avatarVideoElement.currentTime >= avatarVideoElement.duration - 0.25) {
        avatarVideoElement.currentTime = 0.15;
    }
});

// Because it's an mp4, we MUST run flood-fill background removal on every single video frame before drawing it
avatarVideoElement.addEventListener('play', function() {
let videoW = 0;
let videoH = 0;
let floodStack = null;
let floodVisited = null;
let erosionMask = null;
const scratchCvs = document.createElement('canvas');
const sCtx = scratchCvs.getContext('2d', { willReadFrequently: true });

    function step() {
        if (avatarVideoElement.readyState >= 2) { // Read frame safely instantly if video is ready!
            const w = avatarVideoElement.videoWidth || 720;
            const h = avatarVideoElement.videoHeight || 1280;
            
            if (w === 0) {
               setTimeout(step, 50); 
               return;
            }
            
            if (videoW !== w || videoH !== h) {
                videoW = w;
                videoH = h;
                scratchCvs.width = w;
                scratchCvs.height = h;
                floodStack = new Int32Array(w * h * 2);
                floodVisited = new Uint8Array(w * h);
                erosionMask = new Uint8Array(w * h);
            }
            
            sCtx.drawImage(avatarVideoElement, 0, 0, w, h);
            
            const frameData = sCtx.getImageData(0, 0, w, h);
            const d = frameData.data;
            
            floodVisited.fill(0);
            
            let stackPtr = 0;
            function push(x, y) {
                if (stackPtr < floodStack.length - 2) {
                    floodStack[stackPtr++] = x;
                    floodStack[stackPtr++] = y;
                }
            }
            
            const cx = w >> 1; const cy = h >> 1;
            const seeds = [
                [0,0], [w-1,0], [0,h-1], [w-1,h-1],
                [cx, 0], [cx, h-1], [0, cy], [w-1, cy]
            ];
            for (const [sx, sy] of seeds) {
                push(sx, sy);
                floodVisited[sy * w + sx] = 1;
            }
            
            function isBgEdge(x, y) {
                if (x < 0 || x >= w || y < 0 || y >= h) return false;
                const r = d[(y * w + x) * 4], g = d[(y * w + x) * 4 + 1], b = d[(y * w + x) * 4 + 2];
                return (r > 200 && g > 200 && b > 200) || (r < 55 && g < 55 && b < 55);
            }
            
            while(stackPtr > 0) {
                const y = floodStack[--stackPtr];
                const x = floodStack[--stackPtr];
                if (isBgEdge(x, y)) {
                    d[(y * w + x) * 4 + 3] = 0; // Vaporize
                    if (x+1 < w && !floodVisited[y*w + x+1]) { floodVisited[y*w + x+1] = 1; push(x+1, y); }
                    if (x-1 >= 0 && !floodVisited[y*w + x-1]) { floodVisited[y*w + x-1] = 1; push(x-1, y); }
                    if (y+1 < h && !floodVisited[(y+1)*w + x]) { floodVisited[(y+1)*w + x] = 1; push(x, y+1); }
                    if (y-1 >= 0 && !floodVisited[(y-1)*w + x]) { floodVisited[(y-1)*w + x] = 1; push(x, y-1); }
                }
            }
            
            erosionMask.fill(0);
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = (y * w + x) * 4;
                    if (d[idx + 3] > 0) {
                        if (d[idx - 4 + 3] === 0 || d[idx + 4 + 3] === 0 || 
                            d[idx - w*4 + 3] === 0 || d[idx + w*4 + 3] === 0) {
                            erosionMask[y * w + x] = 1; 
                        }
                    }
                }
            }
            for (let i = 0; i < erosionMask.length; i++) {
                if (erosionMask[i] === 1) d[i * 4 + 3] = 0;
            }
            
            for(let y=0; y<12; y++) { for(let x=0; x<w; x++) { d[(y*w+x)*4 + 3] = 0; } }
            for(let y=h-12; y<h; y++) { for(let x=0; x<w; x++) { d[(y*w+x)*4 + 3] = 0; } }
            for(let y=12; y<h-12; y++) { 
                for(let x=0; x<12; x++) { d[(y*w+x)*4 + 3] = 0; }
                for(let x=w-12; x<w; x++) { d[(y*w+x)*4 + 3] = 0; }
            }
            
            sCtx.putImageData(frameData, 0, 0);
            transparentAnjaliCanvas = scratchCvs;
            if (typeof drawScene === 'function') requestAnimationFrame(() => drawScene());
        }
        // Sync perfectly at ~60fps securely (setTimeout prevents browser background tab freezing during exports)
        setTimeout(step, 1000/60);
    }
    
    // Start secure non-dropping loop
    setTimeout(step, 1000/60);
});

// Autoplay policy bypass helper
document.addEventListener('click', () => {
   if (avatarVideoElement && avatarVideoElement.paused) avatarVideoElement.play(); 
}, {once: true});




function drawPresenterFigure(mouthOpen = 0) {
  const enableCheck = document.getElementById("avatarEnableCheck");
  if (enableCheck && !enableCheck.checked) return;
  if (!transparentAnjaliCanvas) return;

  const baseHeight = 1110; 
  avatarConfig.h = baseHeight * avatarConfig.scale;
  const aspect_scale = avatarConfig.h / transparentAnjaliCanvas.height;
  avatarConfig.w = transparentAnjaliCanvas.width * aspect_scale;
  
  if (!avatarConfig.initialized) {
      avatarConfig.x = 0;
      avatarConfig.y = transparentAnjaliCanvas.height ? canvas.height - avatarConfig.h : 0;
      avatarConfig.initialized = true;
  }
  
  ctx.save();
  // Drag-and-drop hover box removed by user request!
  
  // Synthetic floating animation removed. Video provides natural movement!
  let finalHeight = avatarConfig.h;
  let finalWidth = avatarConfig.w;
  let finalX = avatarConfig.x;
  let finalY = avatarConfig.y;
  
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  
  // Real-time Audio Reactive Lip Sync Projection
  let effectiveMouthOpen = mouthOpen;
  if (state.speaking && state.displayedText !== state.text && (!mouthOpen || mouthOpen < 0.05)) {
      effectiveMouthOpen = (Math.sin(performance.now() / 45) + 1) * 0.5;
  }
  
  let isTalking = effectiveMouthOpen > 0.05 || state.speaking;
  if (isTalking) {
      const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "16.5") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "4.5") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "28.5") / 100;
      const mouthHPercent = parseFloat(document.getElementById('avatarJawHeightRange')?.value || "3.0") / 100;
      
      // Restored with a natural human multiplier of 3.5 instead of the robotic extreme 14.5!
      const lipOpenPixels = effectiveMouthOpen * 3.5 * avatarConfig.scale; 
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * mouthHPercent; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      const srcMouthX = transparentAnjaliCanvas.width * (mouthXPercent - mouthWPercent / 2);
      const srcMouthY = transparentAnjaliCanvas.height * mouthYPercent;
      const srcMouthW = transparentAnjaliCanvas.width * mouthWPercent;
      const srcMouthH = transparentAnjaliCanvas.height * mouthHPercent;
      
      ctx.shadowColor = "transparent"; 
      
      // Draw the dropped jaw cleanly
      ctx.drawImage(
         transparentAnjaliCanvas,
         srcMouthX, srcMouthY, srcMouthW, srcMouthH,
         destMouthX, destMouthY + lipOpenPixels, destMouthWidth, destMouthHeight
      );
      
      // Paint realistic soft drop shadow deep inside the mouth cavity 
      ctx.fillStyle = "rgba(10, 2, 2, 0.7)"; 
      ctx.fillRect(destMouthX, destMouthY, destMouthWidth, lipOpenPixels * 1.0);
  }
  
  // Debug Jaw Calibrator view
  if (document.getElementById('showJawDebugCheck')?.checked) {
      const dbgYPercent = parseFloat(document.getElementById('avatarJawYRange').value) / 100;
      const dbgWPercent = parseFloat(document.getElementById('avatarJawWidthRange').value) / 100;
      const dbgXPercent = parseFloat(document.getElementById('avatarJawXRange').value) / 100;
      const dbgHPercent = parseFloat(document.getElementById('avatarJawHeightRange').value) / 100;
      
      const dbgW = finalWidth * dbgWPercent;
      const dbgH = finalHeight * dbgHPercent;
      const dbgX = finalX + finalWidth * (dbgXPercent - dbgWPercent / 2);
      const dbgY = finalY + finalHeight * dbgYPercent;
      
      ctx.strokeStyle = "#5cb85c";
      ctx.lineWidth = 2;
      ctx.strokeRect(dbgX, dbgY, dbgW, dbgH);
  }
  
  ctx.restore();
}

function drawWhiteboardStrokes() {
  if (!state.whiteboard.strokes.length && !state.whiteboard.currentStroke.length) {
    return;
  }
  
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const allStrokes = [...state.whiteboard.strokes];
  if (state.whiteboard.currentStroke.length > 0) {
     allStrokes.push({
       color: state.whiteboard.color,
       width: state.whiteboard.lineWidth,
       points: state.whiteboard.currentStroke
     });
  }

  allStrokes.forEach(stroke => {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
       ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
  
  ctx.restore();
}

function drawAutoQuizOverlay() {
  if (proQuizEnabled && !proQuizEnabled.checked) return;
  if (!state.speaking && !state.exportingVideo) return;
  const boardSourceText = state.displayedText || state.text;
  
  const quizMatch = boardSourceText.match(/Quiz:\s*(.*?)\s*[A|a]\)\s*(.*?)\s*[B|b]\)\s*(.*?)\s*[C|c]\)\s*(.*?)(?:\s*[D|d]\)\s*(.*?))?\s*(?:The\s*answer\s*is|Answer:)\s*([A-D])/i);
  if (!quizMatch) return;
  
  const [_, question, optA, optB, optC, optD, answer] = quizMatch;
  
  const rawTime = (state.activeAudio?.currentTime || performance.now() / 1000);
  const currentMs = rawTime * 1000;
  
  const timeline = state.narration?.syncProfile?.timeline || [];
  let answerRevealMs = 99999999;
  for (let i = 0; i < timeline.length; i++) {
     if (timeline[i].text.toLowerCase().includes("answer") || timeline[i].text.toLowerCase().includes(answer.toLowerCase())) {
         answerRevealMs = Math.min(answerRevealMs, timeline[i].startMs);
     }
  }

  const isAnswerRevealed = currentMs >= answerRevealMs;

  ctx.save();
  ctx.fillStyle = "rgba(10, 15, 25, 0.95)";
  ctx.fillRect(0, 0, canvas.width, canvas.height); 
  
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 50px "Nunito", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillText(question.trim(), canvas.width / 2, 180);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  
  const options = [
    { label: "A", text: optA, y: 350 },
    { label: "B", text: optB, y: 450 },
    { label: "C", text: optC, y: 550 },
  ];
  if (optD && optD.trim().length > 0) options.push({ label: "D", text: optD, y: 650 });

  options.forEach((opt) => {
     let optBg = "#1c2b36";
     let optTxt = "#ffffff";
     
     if (isAnswerRevealed) {
         if (opt.label.toLowerCase() === answer.toLowerCase()) {
             optBg = "#4ceb34"; 
             optTxt = "#000000";
         } else {
             optBg = "#11151a"; 
             optTxt = "#334455";
         }
     }
     
     const boxW = 860;
     const boxH = 80;
     const boxX = (canvas.width - boxW) / 2;
     
     ctx.fillStyle = optBg;
     ctx.beginPath();
     if (ctx.roundRect) {
         ctx.roundRect(boxX, opt.y - boxH/2, boxW, boxH, 16);
     } else {
         ctx.fillRect(boxX, opt.y - boxH/2, boxW, boxH);
     }
     ctx.fill();
     
     if (!isAnswerRevealed || opt.label.toLowerCase() === answer.toLowerCase()) {
         ctx.lineWidth = 3;
         ctx.strokeStyle = isAnswerRevealed ? "#ffffff" : "#2a4254";
         ctx.stroke();
     }
     
     ctx.fillStyle = optTxt;
     ctx.font = 'bold 36px "Nunito", sans-serif';
     ctx.textAlign = "left";
     ctx.fillText(`${opt.label})  ${opt.text.trim()}`, boxX + 40, opt.y);
  });
  
  ctx.restore();
}

function drawProceduralConceptAnimations() {
  if (proAnimationsEnabled && !proAnimationsEnabled.checked) return;
  // Run during active narration, export, or whenever viewing the presentation stage
  if (!state.speaking && !state.exportingVideo && (!stagePanel || stagePanel.classList.contains("hidden"))) return;
  const isAnimatingContent = state.speaking || (state.displayedText && state.displayedText !== state.text);
  const boardSourceText = isAnimatingContent ? (state.displayedText || state.text) : state.text;
  if (!boardSourceText) return;
  const rawTime = (state.activeAudio?.currentTime || performance.now() / 1000);

  // 1. Math Jumps / Addition
  const mathMatch = boardSourceText.match(/(?:let's\s*add|adding)?\s*(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/i) ||
                    boardSourceText.match(/jumps?\s*from\s*(\d+).*?(?:add|jump|moves)\s*(\d+).*?(?:to|position)\s*(\d+)/i) ||
                    boardSourceText.match(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/);

  if (mathMatch) {
    const startNum = parseInt(mathMatch[1]);
    const jumps = parseInt(mathMatch[2]);
    const endNum = parseInt(mathMatch[3]);
    if (!isNaN(startNum) && !isNaN(jumps) && !isNaN(endNum) && startNum + jumps === endNum && jumps <= 30) {
      drawProceduralNumberLine(startNum, jumps, endNum, rawTime);
      return;
    }
  }

  // 2. Multiplication Arrays
  const multMatch = boardSourceText.match(/(\d+)\s*(?:x|\*|times)\s*(\d+)\s*(?:=|equals|is)\s*(\d+)/i);
  if (multMatch) {
    const rows = parseInt(multMatch[1]);
    const cols = parseInt(multMatch[2]);
    const total = parseInt(multMatch[3]);
    if (rows * cols === total && rows <= 12 && cols <= 12) {
      drawMultiplicationGrid(rows, cols, rawTime);
      return;
    }
  }

  // 3. Fallback: Generic High-Tech Image Scanner (only when images are present)
  drawGenericImageScanner(rawTime);
}

function drawGenericImageScanner(rawTime) {
  if (!state.images || state.images.length === 0) return;
  const imgData = state.images[state.imageEditor?.activeIndex >= 0 ? state.imageEditor.activeIndex : 0];
  if (!imgData) return;

  const progress = (rawTime * Math.max(1, state.exportPlaybackRate)) % 4; // 4 second loop
  
  if (!state.imageRenderBoxes || !state.imageRenderBoxes.length) return;
  const box = state.imageRenderBoxes[0]; 
  
  ctx.save();
  const scanY = box.y + (progress / 4) * box.height;

  ctx.beginPath();
  ctx.moveTo(box.x, scanY);
  ctx.lineTo(box.x + box.width, scanY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
  ctx.shadowColor = "rgba(0, 255, 255, 1)";
  ctx.shadowBlur = 15;
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
  gradient.addColorStop(0, "rgba(0, 255, 255, 0)");
  gradient.addColorStop(1, "rgba(0, 255, 255, 0.2)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(box.x, scanY - 30, box.width, 30);
  ctx.restore();
}

function drawMultiplicationGrid(rows, cols, rawTime) {
  const progress = (rawTime * Math.max(1, state.exportPlaybackRate)); 
  const total = rows * cols;
  
  const boxSize = 40;
  const padding = 10;
  const gridWidth = (cols * boxSize) + ((cols - 1) * padding);
  const gridHeight = (rows * boxSize) + ((rows - 1) * padding);
  
  const startX = (canvas.width - gridWidth) / 2;
  const startY = (canvas.height - gridHeight) / 2 + 50;

  ctx.save();
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const staggerTime = (count / total) * 3; 
      count++;
      
      if (progress < staggerTime) continue;
      
      const x = startX + c * (boxSize + padding);
      const y = startY + r * (boxSize + padding);
      
      const popAlpha = Math.min(1, (progress - staggerTime) * 3);
      const yOffset = Math.max(0, 20 * (1 - popAlpha) * (1 - popAlpha));
      
      ctx.globalAlpha = popAlpha;
      ctx.fillStyle = `hsl(${(count * 20) % 360}, 80%, 60%)`;
      ctx.fillRect(x, y - yOffset, boxSize, boxSize);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(x, y - yOffset, boxSize, boxSize);
    }
  }
  ctx.restore();
}

function drawProceduralNumberLine(startNum, jumps, endNum, rawTime) {
  const progress = (rawTime * Math.max(1, state.exportPlaybackRate)) % (jumps * 1.5 + 2); 
  
  const lineY = canvas.height - 150;
  const lineStartX = 100;
  const lineEndX = canvas.width - 100;
  const lineLength = Math.max(endNum, startNum + jumps) + 1; 
  const segmentWidth = (lineEndX - lineStartX) / lineLength;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255, 204, 0, 0.95)";
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= lineLength; i++) {
    const x = lineStartX + (i * segmentWidth);
    ctx.beginPath();
    ctx.arc(x, lineY, 8, 0, Math.PI * 2);
    ctx.fillStyle = i === startNum || i === endNum ? "#ffffff" : "rgba(255,255,255,0.7)";
    ctx.fill();
    ctx.fillText(`${i}`, x, lineY + 20);
  }

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#4ceb34"; 
  
  const jumpProgressIndex = Math.floor(progress / 1.5);
  const arcProgress = (progress % 1.5) / 1.5;

  for (let j = 0; j < jumps; j++) {
     if (j > jumpProgressIndex) continue;
     const jxStart = lineStartX + ((startNum + j) * segmentWidth);
     const jxEnd = lineStartX + ((startNum + j + 1) * segmentWidth);
     const arcHeight = -80;
     ctx.beginPath();
     ctx.moveTo(jxStart, lineY);
     if (j < jumpProgressIndex) {
        ctx.quadraticCurveTo(jxStart + (jxEnd - jxStart)/2, lineY + arcHeight, jxEnd, lineY);
        ctx.stroke();
     } else if (j === jumpProgressIndex) {
        const p = arcProgress;
        const currentX = jxStart + (jxEnd - jxStart) * p;
        const currentY = lineY + (arcHeight * Math.sin(p * Math.PI));
        ctx.quadraticCurveTo(jxStart + (currentX - jxStart)/2, lineY + (arcHeight * Math.sin((p/2) * Math.PI)), currentX, currentY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(currentX, currentY, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4545"; 
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
     }
  }

  if (progress >= jumps * 1.5) {
     const endX = lineStartX + (endNum * segmentWidth);
     ctx.beginPath();
     ctx.arc(endX, lineY, 24, 0, Math.PI * 2);
     ctx.fillStyle = "#ff4545";
     ctx.fill();
     ctx.strokeStyle = "#ffffff";
     ctx.lineWidth = 4;
     ctx.stroke();
  }
  ctx.restore();
}

function drawOptionalImages(currentPageIndex = 0, totalPageCount = 1) {
  const pageIndex = clamp(currentPageIndex, 0, Math.max(0, Math.max(1, totalPageCount) - 1));
  const pageEntries = getImageEntriesForPage(pageIndex);

  state.imageRenderBoxes = [];
  if (!pageEntries.length) {
    return;
  }

  const interactivePreview = canvas === previewCanvas && !stagePanel.classList.contains("hidden");

  let elapsedMs = 0;
  let durationMs = 0;
  if (state.speaking || state.exportVideoTrack?.readyState === "live") {
    elapsedMs = state.exportVideoTrack?.readyState === "live" ? state.exportCapture.elapsedMs : state.playback.elapsedMs;
    durationMs = state.narration?.syncProfile?.totalDurationMs || 0;
  }
  const totalImages = pageEntries.length;

  pageEntries.forEach(({ item, index }) => {
    let drawScale = 1.0;
    let drawAlpha = 1.0;
    
    if (durationMs > 0 && totalImages > 0 && (state.speaking || state.exportVideoTrack?.readyState === "live")) {
      const staggeredRevealTimeMs = (durationMs / (totalImages + 1)) * (index + 1);
      if (elapsedMs < staggeredRevealTimeMs) {
         drawAlpha = 0;
      } else {
         const popProgressMs = elapsedMs - staggeredRevealTimeMs;
         if (popProgressMs < 400) {
            const ease = 1 - Math.pow(1 - (popProgressMs / 400), 3);
            drawAlpha = ease;
            drawScale = 0.8 + (0.2 * Math.sin(ease * Math.PI / 2)); 
         } else {
            const cinematicProgress = (popProgressMs - 400) / Math.max(1, durationMs);
            drawScale = 1.0 + (cinematicProgress * 0.04);
         }
      }
    }

    if (drawAlpha <= 0 && !interactivePreview) return;

    const frame = clampImageFrame(item, index);
    const cellX = frame.x;
    const cellY = frame.y;
    const cellWidth = frame.width;
    const cellHeight = frame.height;
    
    const centerX = cellX + (cellWidth / 2);
    const centerY = cellY + (cellHeight / 2);

    ctx.save();
    
    if ((drawAlpha < 1.0 || drawScale !== 1.0) && !interactivePreview) {
      ctx.globalAlpha = drawAlpha;
      ctx.translate(centerX, centerY);
      ctx.scale(drawScale, drawScale);
      ctx.translate(-centerX, -centerY);
    }
    const innerX = cellX + 8;
    const innerY = cellY + 8;
    const innerW = Math.max(24, cellWidth - 16);
    const innerH = Math.max(24, cellHeight - 16);
    ctx.save();
    ctx.shadowColor = "rgba(18, 47, 68, 0.24)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    drawRoundedRect(cellX, cellY, cellWidth, cellHeight, 18, "rgba(255,255,255,0.94)");
    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.moveTo(innerX + 14, innerY);
    ctx.arcTo(innerX + innerW, innerY, innerX + innerW, innerY + innerH, 14);
    ctx.arcTo(innerX + innerW, innerY + innerH, innerX, innerY + innerH, 14);
    ctx.arcTo(innerX, innerY + innerH, innerX, innerY, 14);
    ctx.arcTo(innerX, innerY, innerX + innerW, innerY, 14);
    ctx.closePath();
    ctx.clip();

    const targetW = innerW;
    const targetH = innerH;
    const scale = Math.max(targetW / item.image.width, targetH / item.image.height);
    const drawW = item.image.width * scale;
    const drawH = item.image.height * scale;
    const drawX = innerX + (targetW - drawW) / 2;
    const drawY = innerY + (targetH - drawH) / 2;
    applyHighQualityImageRendering(ctx);
    ctx.drawImage(item.image, drawX, drawY, drawW, drawH);
    if (item.cutoutApplied) {
      applyScreenMatchOverlay(
        {
          x: innerX,
          y: innerY,
          width: innerW,
          height: innerH
        },
        0.1 + (getCutoutScreenBlendStrength() * 0.72)
      );
    }
    ctx.restore();

    if (item.cutoutApplied) {
      ctx.save();
      ctx.shadowColor = `rgba(88, 159, 196, ${0.14 + (getCutoutScreenBlendStrength() * 0.24)})`;
      ctx.shadowBlur = 18 + (getCutoutScreenBlendStrength() * 12);
      ctx.shadowOffsetY = 8;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cellX + 4, cellY + 4, cellWidth - 8, cellHeight - 8);
      ctx.restore();
    }

    const resizeHandles = getImageResizeHandles({
      x: cellX,
      y: cellY,
      width: cellWidth,
      height: cellHeight
    });
    const isSelected = interactivePreview && state.imageEditor.activeIndex === index;
    const isHovered = interactivePreview && state.imageEditor.hoverIndex === index;

    if (isSelected || isHovered) {
      ctx.save();
      ctx.strokeStyle = isSelected ? "#0d7ea9" : "rgba(13, 126, 169, 0.46)";
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.setLineDash(isSelected ? [] : [8, 6]);
      ctx.strokeRect(cellX - 2, cellY - 2, cellWidth + 4, cellHeight + 4);
      ctx.setLineDash([]);

      if (isSelected) {
        resizeHandles.forEach((handle) => {
          ctx.fillStyle = state.imageEditor.activeHandle === handle.name ? "#0d7ea9" : "#ffffff";
          ctx.strokeStyle = "#0d7ea9";
          ctx.lineWidth = 2;
          drawRoundedRect(handle.x, handle.y, handle.size, handle.size, 6, ctx.fillStyle);
          ctx.strokeRect(handle.x + 1, handle.y + 1, handle.size - 2, handle.size - 2);
        });
      }
      ctx.restore();
    }

    state.imageRenderBoxes.push({
      index,
      x: cellX,
      y: cellY,
      width: cellWidth,
      height: cellHeight,
      handles: resizeHandles
    });
  });

}

function drawPdfAutoExampleImages(pageIndex = state.previewPageIndex, autoImages = []) {
  const safeImages = Array.isArray(autoImages) ? autoImages.filter((image) => image?.image) : [];
  if (!safeImages.length) {
    return;
  }

  const stripArea = getPinnedPdfImageStripArea();
  const frameGap = 18;
  const framePadding = 8;
  const totalGap = Math.max(0, safeImages.length - 1) * frameGap;
  const frameHeight = Math.max(
    132,
    Math.min(stripArea.height, (stripArea.height - totalGap) / Math.max(1, safeImages.length))
  );

  safeImages.forEach((image, index) => {
    const x = stripArea.x;
    const y = stripArea.y + (index * (frameHeight + frameGap));
    const width = stripArea.width;
    const height = Math.min(frameHeight, Math.max(120, stripArea.y + stripArea.height - y));
    if (height <= 0) {
      return;
    }

    const innerX = x + framePadding;
    const innerY = y + framePadding;
    const innerWidth = Math.max(24, width - (framePadding * 2));
    const innerHeight = Math.max(24, height - (framePadding * 2));
    const scale = Math.min(innerWidth / image.image.width, innerHeight / image.image.height);
    const drawWidth = Math.max(1, image.image.width * scale);
    const drawHeight = Math.max(1, image.image.height * scale);
    const drawX = innerX + ((innerWidth - drawWidth) / 2);
    const drawY = innerY + ((innerHeight - drawHeight) / 2);

    ctx.save();
    ctx.shadowColor = "rgba(18, 47, 68, 0.24)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    drawRoundedRect(x, y, width, height, 18, "rgba(255,255,255,0.96)");
    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.moveTo(innerX + 14, innerY);
    ctx.arcTo(innerX + innerWidth, innerY, innerX + innerWidth, innerY + innerHeight, 14);
    ctx.arcTo(innerX + innerWidth, innerY + innerHeight, innerX, innerY + innerHeight, 14);
    ctx.arcTo(innerX, innerY + innerHeight, innerX, innerY, 14);
    ctx.arcTo(innerX, innerY, innerX + innerWidth, innerY, 14);
    ctx.closePath();
    ctx.clip();
    applyHighQualityImageRendering(ctx);
    ctx.drawImage(image.image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  });
}

function requestCanvasExportFrame() {
  if (state.exportVideoTrack?.readyState === "live" && typeof state.exportVideoTrack.requestFrame === "function") {
    try {
      const minFrameIntervalMs = state.exportCapture.minFrameIntervalMs || 0;
      if (minFrameIntervalMs > 0) {
        const now = performance.now();
        if ((now - state.exportCapture.lastFrameAt) < minFrameIntervalMs) {
          return;
        }

        state.exportCapture.lastFrameAt = now;
      }

      state.exportVideoTrack.requestFrame();
    } catch (error) {
      console.error(error);
    }
  }
}

function drawPdfContextScene() {
  state.stageVideoRenderBox = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTeachingStageBackdrop(mouthOpen);
  drawSceneVfx();

  syncPdfContextStageImages({ skipDraw: true });
  const contextPages = getPdfContextPages();
  const totalPageCount = Math.max(1, contextPages.length);
  const currentPageIndex = clamp(state.previewPageIndex, 0, Math.max(0, totalPageCount - 1));
  const currentPage = contextPages[currentPageIndex] || null;

  state.previewPageIndex = currentPageIndex;
  state.renderedPageCount = totalPageCount;
  updateStagePageUi(currentPageIndex, totalPageCount);
  updateStageTimelineUi();

  if (!currentPage) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '800 34px "League Spartan"';
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Select at least one PDF page", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '700 20px "Nunito"';
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("Use the page picker on the input side to choose what should be presented.", canvas.width / 2, canvas.height / 2 + 24);
    ctx.restore();
    requestCanvasExportFrame();
    return;
  }

  drawInfoKidsLogo();

  const hasSideImages = getStageHasVisibleImagesForPage(currentPageIndex);
  const contentArea = getStageContentArea(currentPageIndex, hasSideImages);
  const visibleState = getPdfContextVisibleText(currentPage, currentPageIndex);
  const visibleText = visibleState?.partText || "";
  const usingFullPageText = visibleText === currentPage.text;
  const visibleLayout = usingFullPageText
    ? null
    : getContentLayoutWithMetrics(
      buildDisplayedLines(visibleText),
      contentArea.width,
      contentArea.height,
      !currentPage.text,
      {
        wordCount: currentPage.wordCount || splitIntoWords(currentPage.text).length,
        hasImages: hasSideImages
      }
    );
  const layoutRows = visibleState?.layoutPage?.rows?.length
    ? visibleState.layoutPage.rows
    : (usingFullPageText && currentPage?.rows?.length
      ? currentPage.rows
      : (visibleLayout?.rows || []));
  const layoutPageFontSize = visibleState?.layoutPage?.fontSize || null;
  const layoutPageRowHeight = visibleState?.layoutPage?.rowHeight || null;
  const layoutFontSize = usingFullPageText
    ? (layoutPageFontSize || currentPage?.fontSize || clamp(Math.round(28 * state.fontScale), 16, 54))
    : (visibleLayout?.fontSize || clamp(Math.round(28 * state.fontScale), 16, 54));
  const layoutRowHeight = usingFullPageText
    ? (layoutPageRowHeight || currentPage?.rowHeight || Math.max(layoutFontSize + 4, Math.round(layoutFontSize * 1.2)))
    : (visibleLayout?.rowHeight || Math.max(layoutFontSize + 4, Math.round(layoutFontSize * 1.2)));

  drawContentHighlightPanel(contentArea, {
    insetX: 24,
    insetY: 20,
    radius: 30
  });

  ctx.save();
  ctx.beginPath();
  ctx.rect(contentArea.x - 12, contentArea.y - 12, contentArea.width + 18, contentArea.height + 24);
  ctx.clip();

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const contentPaddingX = 6;
  const contentPaddingY = 6;
  let y = contentArea.y + contentPaddingY;

  layoutRows.forEach((row, rowIndex) => {
    if (row.spacer) {
      y += row.height;
      return;
    }

    const rowText = row.segments.map((segment) => segment.text).join("");
    const rowStartX = contentArea.x + contentPaddingX + (row.bullet ? 18 : 0);

    if (row.bullet) {
      ctx.beginPath();
      ctx.arc(contentArea.x + contentPaddingX + 6, y + Math.round(layoutFontSize * 0.42), 6, 0, Math.PI * 2);
      ctx.fillStyle = getAnimatedTeachingTextColor(null, rowText, rowIndex, 0);
      ctx.fill();
    }

    let x = rowStartX;
    row.segments.forEach((segment, segmentIndex) => {
      if (!segment.text) {
        return;
      }

      ctx.font = getContentFont(layoutFontSize, segment.style);
      const segmentWidth = drawAnimatedTeachingSegment(
        segment,
        x,
        y,
        rowText,
        rowIndex,
        segmentIndex,
        layoutFontSize
      );
      if (segment.style.underline) {
        const visibleUnderlineText = segment.text.replace(/\s+$/, "");
        if (visibleUnderlineText) {
          const underlineWidth = ctx.measureText(visibleUnderlineText).width;
          const underlineY = y + layoutFontSize + Math.max(2, Math.round(layoutFontSize * 0.06));
          ctx.fillStyle = isUsingDefaultStageStyle(segment.style)
            ? getAnimatedTeachingTextColor(null, rowText, rowIndex, segmentIndex)
            : segment.style.color;
          ctx.fillRect(x, underlineY, underlineWidth, Math.max(2, Math.round(layoutFontSize * 0.08)));
        }
      }

      x += segmentWidth;
    });

    y += layoutRowHeight;
  });

  if (state.speaking && visibleText !== currentPage.text) {
    ctx.fillStyle = "#0d7ea9";
    ctx.fillRect(contentArea.x, Math.min(contentArea.y + contentArea.height - 34, y + 6) - 4, 5, 34);
  }

  ctx.restore();

  if (totalPageCount > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = '700 14px "Nunito"';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Page ${currentPageIndex + 1} / ${totalPageCount}`, contentArea.x + contentArea.width, contentArea.y + contentArea.height - 4);
  }

  drawOptionalImages(currentPageIndex, totalPageCount);
  requestCanvasExportFrame();
}

function drawPdfScene() {
  state.stageVideoRenderBox = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#15181d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const selectedPages = getPdfPresentationPages("exact");
  const totalPageCount = Math.max(1, selectedPages.length);
  const currentPageIndex = clamp(state.previewPageIndex, 0, Math.max(0, totalPageCount - 1));
  const currentPage = selectedPages[currentPageIndex] || null;

  state.previewPageIndex = currentPageIndex;
  state.renderedPageCount = totalPageCount;
  updateStagePageUi(currentPageIndex, totalPageCount);
  updateStageTimelineUi();

  if (!currentPage) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '800 34px "League Spartan"';
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Select at least one PDF page", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '700 20px "Nunito"';
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("Use the page picker on the input side to choose what should be presented.", canvas.width / 2, canvas.height / 2 + 24);
    ctx.restore();
    requestCanvasExportFrame();
    return;
  }

  const pageArea = {
    x: 20,
    y: 20,
    width: canvas.width - 40,
    height: canvas.height - 40
  };
  const drawScale = Math.min(pageArea.width / currentPage.width, pageArea.height / currentPage.height);
  const drawWidth = Math.max(1, currentPage.width * drawScale);
  const drawHeight = Math.max(1, currentPage.height * drawScale);
  const drawX = pageArea.x + (pageArea.width - drawWidth) / 2;
  const drawY = pageArea.y + (pageArea.height - drawHeight) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 18;
  // Draw the live video frame directly!
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layout cache: caches getPaginatedSlideContent results for state.text so
// the two expensive layout passes per drawScene frame (textOnly + full) are
// only recomputed when the source text, page index, or image state changes.
// Only activeContent (animated partial text) is recomputed every frame.
// ---------------------------------------------------------------------------
const _drawSceneLayoutCache = {
  textOnlyKey: "",
  textOnlyResult: null,
  fullKey: "",
  fullResult: null
};

function invalidateDrawSceneLayoutCache() {
  _drawSceneLayoutCache.textOnlyKey = "";
  _drawSceneLayoutCache.textOnlyResult = null;
  _drawSceneLayoutCache.fullKey = "";
  _drawSceneLayoutCache.fullResult = null;
}

function getCachedTextOnlyContent(text, pageIndex) {
  const key = `${text}||${pageIndex}`;
  if (_drawSceneLayoutCache.textOnlyKey === key && _drawSceneLayoutCache.textOnlyResult) {
    return _drawSceneLayoutCache.textOnlyResult;
  }
  const result = getPaginatedSlideContent(text, !text, pageIndex, false);
  _drawSceneLayoutCache.textOnlyKey = key;
  _drawSceneLayoutCache.textOnlyResult = result;
  return result;
}

function getCachedFullContent(text, pageIndex, hasImages) {
  const key = `${text}||${pageIndex}||${hasImages}`;
  if (_drawSceneLayoutCache.fullKey === key && _drawSceneLayoutCache.fullResult) {
    return _drawSceneLayoutCache.fullResult;
  }
  const result = getPaginatedSlideContent(text, !text, pageIndex, hasImages);
  _drawSceneLayoutCache.fullKey = key;
  _drawSceneLayoutCache.fullResult = result;
  return result;
}
// ---------------------------------------------------------------------------

function drawScene(mouthOpen = 0.12) {
  if ((state.introPlayback.active || state.introPlayback.previewVisible) && state.introPlayback.element) {
    drawIntroScene();
    drawRuntimeDisplayErrorOverlay();
    requestCanvasExportFrame();
    return;
  }

  if (isPdfPresentationMode()) {
    if (getPdfRenderMode() === "exact") {
      drawPdfScene();
    } else {
      drawPdfContextScene();
    }
    drawRuntimeDisplayErrorOverlay();
    requestCanvasExportFrame();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTeachingStageBackdrop(mouthOpen);
  drawSceneVfx();
  drawStageVideoLayer();

  const isAnimatingContent = state.speaking || (state.displayedText && state.displayedText !== state.text);
  const boardSourceText = isAnimatingContent ? (state.displayedText || state.text) : state.text;
  const boardData = getMathPlaceValueBoardData(boardSourceText) || (isAnimatingContent ? getMathPlaceValueBoardData(state.text) : null);
  // Use cached layouts for state.text (unchanged during playback) — only
  // activeContent uses the per-frame displayedText and is always recomputed.
  const textOnlyContent = getCachedTextOnlyContent(state.text, state.previewPageIndex);
  const predictedAnimatedPageIndex = isAnimatingContent
    ? clamp(
      getStableAnimatedPageIndex(textOnlyContent, state.displayedText),
      0,
      Math.max(0, Math.max(textOnlyContent.pageCount, state.images.length ? getImagePageCount() : 1) - 1)
    )
    : clamp(state.previewPageIndex, 0, Math.max(0, Math.max(textOnlyContent.pageCount, state.images.length ? getImagePageCount() : 1) - 1));
  const currentPageHasImages = getStageHasVisibleImagesForPage(predictedAnimatedPageIndex);
  const fullContent = getCachedFullContent(state.text, predictedAnimatedPageIndex, currentPageHasImages);
  const activeContent = isAnimatingContent
    ? getPaginatedSlideContent(
      state.displayedText,
      !state.text,
      predictedAnimatedPageIndex,
      currentPageHasImages
    )
    : fullContent;
  const contentArea = fullContent.contentArea;
  const totalPageCount = boardData
    ? Math.max(1, state.images.length ? getImagePageCount() : 1)
    : Math.max(
      fullContent.pageCount,
      state.images.length ? getImagePageCount() : 1
    );
  const animatedPageIndex = isAnimatingContent
    ? clamp(
      getStableAnimatedPageIndex(fullContent, state.displayedText),
      0,
      Math.max(0, totalPageCount - 1)
    )
    : clamp(activeContent.pageCount - 1, 0, Math.max(0, totalPageCount - 1));
  const currentPageIndex = boardData
    ? clamp(state.previewPageIndex, 0, Math.max(0, totalPageCount - 1))
    : (isAnimatingContent
      ? animatedPageIndex
      : clamp(state.previewPageIndex, 0, Math.max(0, totalPageCount - 1)));
  const currentPage = isAnimatingContent
    ? activeContent.pages[animatedPageIndex] || {
      rows: [],
      totalHeight: 0,
      fontSize: activeContent.layout.fontSize,
      rowHeight: activeContent.layout.rowHeight
    }
    : fullContent.pages[currentPageIndex] || {
      rows: [],
      totalHeight: 0,
      fontSize: fullContent.layout.fontSize,
      rowHeight: fullContent.layout.rowHeight
    };

  state.previewPageIndex = currentPageIndex;
  state.renderedPageCount = totalPageCount;
  updateStagePageUi(currentPageIndex, totalPageCount);

  const currentFontSize = currentPage?.fontSize || activeContent.layout.fontSize || fullContent.layout.fontSize || 28;
  const currentRowHeight = currentPage?.rowHeight || activeContent.layout.rowHeight || fullContent.layout.rowHeight || 32;
  const contentPaddingX = 6;
  const contentPaddingY = 6;
  const contentScrollOffset = 0;
  const cursorBottomGap = Math.max(18, Math.round(currentRowHeight * 1.15));
  const visibleCursorY = Math.min(
    contentArea.y + contentArea.height - cursorBottomGap,
    contentArea.y + contentPaddingY + (currentPage?.totalHeight || 0) - contentScrollOffset + 8
  );

  drawInfoKidsLogo();
  drawContentHighlightPanel(contentArea, {
    insetX: 24,
    insetY: 20,
    radius: 30
  });

  if (boardData) {
    state.contentScrollOffset = 0;
    drawMathPlaceValueBoard(contentArea, boardData, currentPageIndex, totalPageCount);
    drawOptionalImages(currentPageIndex, totalPageCount);
    drawProceduralConceptAnimations();
    drawAutoQuizOverlay();
    drawWhiteboardStrokes();
    drawRuntimeDisplayErrorOverlay();
    requestCanvasExportFrame();
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(contentArea.x - 12, contentArea.y - 12, contentArea.width + 18, contentArea.height + 24);
  ctx.clip();

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  let y = contentArea.y + contentPaddingY - contentScrollOffset;

  (currentPage?.rows || []).forEach((row, rowIndex) => {
    if (row.spacer) {
      y += row.height;
      return;
    }

    const rowText = row.segments.map((segment) => segment.text).join("");
    const rowWidth = measureStyledRuns(ctx, row.segments, currentFontSize);
    const rowStartX = contentArea.x + contentPaddingX + (row.bullet ? 18 : 0);

    if (row.bullet) {
      ctx.beginPath();
      ctx.arc(contentArea.x + contentPaddingX + 6, y + Math.round(currentFontSize * 0.42), 6, 0, Math.PI * 2);
      ctx.fillStyle = getAnimatedTeachingTextColor(null, rowText, rowIndex, 0);
      ctx.fill();
    }

    let x = rowStartX;
    row.segments.forEach((segment, segmentIndex) => {
      if (!segment.text) {
        return;
      }

      ctx.font = getContentFont(currentFontSize, segment.style);
      const segmentWidth = drawAnimatedTeachingSegment(
        segment,
        x,
        y,
        rowText,
        rowIndex,
        segmentIndex,
        currentFontSize
      );
      if (segment.style.underline) {
        const visibleUnderlineText = segment.text.replace(/\s+$/, "");
        if (visibleUnderlineText) {
          const underlineWidth = ctx.measureText(visibleUnderlineText).width;
          const underlineY = y + currentFontSize + Math.max(2, Math.round(currentFontSize * 0.06));
          ctx.fillStyle = isUsingDefaultStageStyle(segment.style)
            ? getAnimatedTeachingTextColor(null, rowText, rowIndex, segmentIndex)
            : segment.style.color;
          ctx.fillRect(x, underlineY, underlineWidth, Math.max(2, Math.round(currentFontSize * 0.08)));
        }
      }

      x += segmentWidth;
    });

    y += currentRowHeight;
  });

  if (state.speaking && state.displayedText !== state.text) {
    ctx.fillStyle = "#0d7ea9";
    ctx.fillRect(contentArea.x + contentPaddingX, visibleCursorY - 4, 5, 34);
  }

  if (totalPageCount > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = '700 14px "Nunito"';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Page ${currentPageIndex + 1} / ${totalPageCount}`, contentArea.x + contentArea.width, contentArea.y + contentArea.height - 4);
  }

  ctx.restore();
  drawOptionalImages(currentPageIndex, totalPageCount);
  drawProceduralConceptAnimations();
  drawAutoQuizOverlay();
  drawWhiteboardStrokes();
  drawRuntimeDisplayErrorOverlay();
  
  if (window._renderHologramFrame) {
    window._renderHologramFrame(ctx, typeof mouthOpen !== 'undefined' ? mouthOpen : (state.mouthOpen || 0.12));
  }
  
  requestCanvasExportFrame();
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("One of the selected images could not be loaded."));
    image.src = dataUrl;
  });
}

function ensurePdfExampleImageLoaded(exampleImage) {
  if (!exampleImage?.dataUrl) {
    return Promise.resolve(null);
  }

  if (exampleImage.image) {
    return Promise.resolve(exampleImage.image);
  }

  if (exampleImage.loadFailed) {
    return Promise.resolve(null);
  }

  if (!exampleImage.loadPromise) {
    exampleImage.loadPromise = loadImageFromDataUrl(exampleImage.dataUrl)
      .then((image) => {
        exampleImage.image = image;
        exampleImage.width = image.naturalWidth || image.width || exampleImage.width;
        exampleImage.height = image.naturalHeight || image.height || exampleImage.height;
        if (isPdfPresentationMode() && getPdfRenderMode() === "context" && !stagePanel.classList.contains("hidden")) {
          drawScene(state.mouthOpen);
        }
        return image;
      })
      .catch((error) => {
        console.error(error);
        exampleImage.loadFailed = true;
        return null;
      })
      .finally(() => {
        exampleImage.loadPromise = null;
      });
  }

  return exampleImage.loadPromise;
}

function preloadPdfExampleImages(pages = state.pdf.pages) {
  if (!Array.isArray(pages) || !pages.length) {
    return;
  }

  pages.forEach((page) => {
    const exampleImages = Array.isArray(page?.exampleImages) ? page.exampleImages : [];
    exampleImages.forEach((exampleImage) => {
      void ensurePdfExampleImageLoaded(exampleImage);
    });
  });
}

function getPdfLessonAutoImageSyncKey() {
  const lessonText = lessonInput?.value.trim() || "";
  const selectedPageSignature = getPdfSelectedPages()
    .map((page) => Math.max(0, Math.round(Number(page?.pageNumber) || 0)))
    .filter(Boolean)
    .join(",");
  const manualPdfSignature = state.images
    .filter((item) => item?.sourceTag === "pdf-clipboard")
    .map((item) => `${Math.max(0, Math.round(Number(item?.sourcePageNumber) || 0))}:${getImagePageIndexForItem(item)}`)
    .sort()
    .join("|");

  return `${state.pdf.fileSignature || state.pdf.fileName}|${selectedPageSignature}|${manualPdfSignature}|${state.fontScale}|${lessonText}`;
}

function getPdfAutoImageSyncKey() {
  const presentationKey = getPdfRenderMode() === "context" ? getPdfContextPagesKey() : "";
  const manualPdfSignature = state.images
    .filter((item) => item?.sourceTag === "pdf-clipboard")
    .map((item) => `${Math.max(0, Math.round(Number(item?.sourcePageNumber) || 0))}:${getImagePageIndexForItem(item)}`)
    .sort()
    .join("|");

  return `${state.presentationMode}|${getPdfRenderMode()}|${presentationKey}|${manualPdfSignature}|${state.pdf.fileSignature || state.pdf.fileName}`;
}

function getPdfPageTextRangeInExtractedText(pageIndex = -1) {
  const safePageIndex = Math.max(0, Math.round(Number(pageIndex) || 0));
  let cursor = 0;

  for (let index = 0; index < state.pdf.pageTexts.length; index += 1) {
    const pageText = String(state.pdf.pageTexts[index] || "").trim();
    if (!pageText) {
      continue;
    }

    const start = cursor;
    const end = start + pageText.length;
    if (index === safePageIndex) {
      return { start, end, matched: true };
    }

    cursor = end + 2;
  }

  return {
    start: 0,
    end: 0,
    matched: false
  };
}

function getPdfLessonImagePageAssignments(lessonText = lessonInput?.value.trim() || "") {
  const safeLessonText = String(lessonText || "").trim();
  if (!safeLessonText) {
    return new Map();
  }

  const paginatedContent = getPaginatedSlideContent(safeLessonText, !safeLessonText, state.previewPageIndex, false);
  const pages = Array.isArray(paginatedContent?.pages) ? paginatedContent.pages : [];
  const pageAssignments = new Map();
  const lessonMatchesExtractedPdf = normalizePdfSearchFragment(safeLessonText) === normalizePdfSearchFragment(state.pdf.extractedText);
  let searchStart = 0;
  let fallbackPageIndex = 0;

  getPdfSelectedPages().forEach((page) => {
    const sourcePageNumber = Math.max(0, Math.round(Number(page?.pageNumber) || 0));
    if (!sourcePageNumber) {
      return;
    }

    let matchedPageIndex = clamp(fallbackPageIndex, 0, Math.max(0, pages.length - 1));
    const pageText = String(page?.text || state.pdf.pageTexts[page.index] || "").trim();

    if (pageText) {
      const match = findPdfAnchorLocalOffset(safeLessonText, pageText, searchStart);
      if (match.matched) {
        matchedPageIndex = getPageIndexForTextOffset(pages, match.nextSearchStart, matchedPageIndex);
        searchStart = Math.max(searchStart, match.nextSearchStart);
      } else if (lessonMatchesExtractedPdf) {
        const extractedRange = getPdfPageTextRangeInExtractedText(page.index);
        if (extractedRange.matched) {
          matchedPageIndex = getPageIndexForTextOffset(pages, extractedRange.end, matchedPageIndex);
          searchStart = Math.max(searchStart, extractedRange.end);
        } else {
          return;
        }
      } else {
        return;
      }
    } else if (!lessonMatchesExtractedPdf) {
      return;
    }

    fallbackPageIndex = matchedPageIndex;
    pageAssignments.set(sourcePageNumber, matchedPageIndex);
  });

  return pageAssignments;
}

function syncExtractedPdfLessonImages(options = {}) {
  const existingImages = [...state.images];
  const existingLessonAutoImages = existingImages.filter((item) => isAutoPdfLessonImage(item));
  const nonLessonAutoImages = existingImages.filter((item) => !isAutoPdfLessonImage(item));
  const lessonText = lessonInput?.value.trim() || "";
  const shouldShowLessonAutoImages = Boolean(lessonText && getPdfSelectedPageCount() > 0 && state.pdf.pages.length);
  const nextSyncKey = shouldShowLessonAutoImages ? getPdfLessonAutoImageSyncKey() : "";

  if (state.pdf.lessonAutoImageSyncKey === nextSyncKey && (shouldShowLessonAutoImages || !existingLessonAutoImages.length)) {
    return;
  }

  let syncedImages = [...nonLessonAutoImages];

  if (shouldShowLessonAutoImages) {
    const pageAssignments = getPdfLessonImagePageAssignments(lessonText);
    const manualSourcePages = new Set(
      nonLessonAutoImages
        .filter((item) => item?.sourceTag === "pdf-clipboard" && Number.isFinite(Number(item?.sourcePageNumber)))
        .map((item) => Math.max(0, Math.round(Number(item.sourcePageNumber) || 0)))
        .filter(Boolean)
    );
    const existingAutoByKey = new Map(
      existingLessonAutoImages
        .filter((item) => item?.pdfImageKey)
        .map((item) => [item.pdfImageKey, item])
    );

    getPdfSelectedPages().forEach((page) => {
      const sourcePageNumber = Math.max(0, Math.round(Number(page?.pageNumber) || 0));
      if (!sourcePageNumber || manualSourcePages.has(sourcePageNumber)) {
        return;
      }

      const pageIndex = pageAssignments.get(sourcePageNumber);
      if (!Number.isInteger(pageIndex) || pageIndex < 0) {
        return;
      }

      const exampleImages = Array.isArray(page?.exampleImages) ? page.exampleImages : [];
      exampleImages.forEach((exampleImage, exampleIndex) => {
        const dataUrl = exampleImage?.dataUrl || "";
        const imageElement = exampleImage?.image || null;
        if (!dataUrl.startsWith("data:image/")) {
          return;
        }

        if (!imageElement) {
          void ensurePdfExampleImageLoaded(exampleImage).then(() => {
            state.pdf.lessonAutoImageSyncKey = "";
            syncExtractedPdfLessonImages();
          });
          return;
        }

        const pdfImageKey = `pdf-lesson-auto:${sourcePageNumber}:${exampleIndex}`;
        const existingAuto = existingAutoByKey.get(pdfImageKey);
        syncedImages.push({
          ...existingAuto,
          fileName: exampleImage.fileName || `pdf-page-${sourcePageNumber}-example-${exampleIndex + 1}.png`,
          dataUrl,
          image: imageElement,
          sourceTag: "pdf-lesson-auto",
          pdfImageKey,
          sourcePageNumber,
          pageIndex,
          aspectRatio: imageElement.width && imageElement.height
            ? imageElement.width / imageElement.height
            : (existingAuto?.aspectRatio || 4 / 3)
        });
      });
    });
  }

  state.images = applyDefaultImageLayouts(syncedImages);
  state.pdf.lessonAutoImageSyncKey = nextSyncKey;

  if (state.imageEditor.activeIndex >= state.images.length) {
    state.imageEditor.activeIndex = state.images.length ? state.images.length - 1 : -1;
  }

  renderImagePreviews();
  updateStageMediaToolUi();

  if (!options.skipDraw && !stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function syncPdfContextStageImages(options = {}) {
  const existingImages = [...state.images];
  const existingAutoImages = existingImages.filter((item) => isAutoPdfExampleImage(item));
  const nonAutoImages = existingImages.filter((item) => !isAutoPdfExampleImage(item));
  const shouldShowAutoImages = isPdfPresentationMode() && getPdfRenderMode() === "context" && getPdfSelectedPageCount() > 0;
  const nextSyncKey = shouldShowAutoImages ? getPdfAutoImageSyncKey() : "";

  if (state.pdf.autoImageSyncKey === nextSyncKey && (shouldShowAutoImages || !existingAutoImages.length)) {
    return;
  }

  let syncedImages = [...nonAutoImages];

  if (shouldShowAutoImages) {
    const selectedPages = getPdfSelectedPages();
    const manualSourcePages = new Set(
      nonAutoImages
        .filter((item) => item?.sourceTag === "pdf-clipboard" && Number.isFinite(Number(item?.sourcePageNumber)))
        .map((item) => Math.max(0, Math.round(Number(item.sourcePageNumber) || 0)))
        .filter(Boolean)
    );
    const existingAutoByKey = new Map(
      existingAutoImages
        .filter((item) => item?.pdfImageKey)
        .map((item) => [item.pdfImageKey, item])
    );

    selectedPages.forEach((page) => {
      const sourcePageNumber = Math.max(0, Math.round(Number(page?.pageNumber) || 0));
      if (!sourcePageNumber || manualSourcePages.has(sourcePageNumber)) {
        return;
      }

      const presentationPageIndex = getPdfPresentationPageIndexForSourcePageNumber(sourcePageNumber);
      if (presentationPageIndex < 0) {
        return;
      }

      const exampleImages = Array.isArray(page?.exampleImages) ? page.exampleImages : [];
      exampleImages.forEach((exampleImage, exampleIndex) => {
        const imageElement = exampleImage?.image || null;
        const dataUrl = exampleImage?.dataUrl || "";
        if (!imageElement || !dataUrl.startsWith("data:image/")) {
          return;
        }

        const pdfImageKey = `pdf-auto:${sourcePageNumber}:${exampleIndex}`;
        const existingAuto = existingAutoByKey.get(pdfImageKey);
        syncedImages.push({
          ...existingAuto,
          fileName: exampleImage.fileName || `pdf-page-${sourcePageNumber}-example-${exampleIndex + 1}.png`,
          dataUrl,
          image: imageElement,
          sourceTag: "pdf-auto",
          pdfImageKey,
          sourcePageNumber,
          pageIndex: presentationPageIndex,
          aspectRatio: imageElement.width && imageElement.height
            ? imageElement.width / imageElement.height
            : (existingAuto?.aspectRatio || 4 / 3)
        });
      });
    });

    syncedImages = syncedImages.map((item, index) => {
      if (item?.sourceTag !== "pdf-clipboard") {
        return item;
      }

      const mappedPageIndex = getPdfPresentationPageIndexForSourcePageNumber(item?.sourcePageNumber);
      if (mappedPageIndex < 0) {
        return item;
      }

      return {
        ...item,
        pageIndex: mappedPageIndex
      };
    });
  }

  state.images = applyDefaultImageLayouts(syncedImages);
  state.pdf.autoImageSyncKey = nextSyncKey;

  if (state.imageEditor.activeIndex >= state.images.length) {
    state.imageEditor.activeIndex = state.images.length ? state.images.length - 1 : -1;
  }

  renderImagePreviews();
  updateStageMediaToolUi();

  if (!options.skipDraw && !stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

async function addStageImagesFromDataUrls(imageItems = [], options = {}) {
  const existingImages = [...state.images];
  const targetPageIndex = Number.isInteger(options.targetPageIndex)
    ? Math.max(0, options.targetPageIndex)
    : (stagePanel.classList.contains("hidden") ? 0 : state.previewPageIndex);
  const remainingSlots = Math.max(0, MAX_IMAGE_UPLOADS - existingImages.length);
  const itemsToLoad = imageItems
    .filter((item) => item && typeof item.dataUrl === "string" && item.dataUrl.startsWith("data:image/"))
    .slice(0, remainingSlots || MAX_IMAGE_UPLOADS);

  if (!itemsToLoad.length) {
    return 0;
  }

  const loadedImages = await Promise.all(
    itemsToLoad.map(async (item, index) => ({
      fileName: item.fileName || `pasted-example-${Date.now()}-${index + 1}.png`,
      dataUrl: item.dataUrl,
      image: await loadImageFromDataUrl(item.dataUrl),
      sourceTag: item.sourceTag || "pdf-clipboard",
      sourcePageNumber: Math.max(0, Math.round(Number(item?.sourcePageNumber) || 0)),
      pageIndex: Number.isInteger(item.pageIndex) ? Math.max(0, item.pageIndex) : undefined
    }))
  );

  const pageAssignedImages = assignPageIndexesToNewImages(existingImages, loadedImages, targetPageIndex);
  state.images = applyDefaultImageLayouts([...existingImages, ...pageAssignedImages]);
  state.imageEditor.activeIndex = state.images.length ? state.images.length - 1 : -1;
  if (getPdfRenderMode() === "context") {
    syncPdfContextStageImages({ skipDraw: true });
  }
  renderImagePreviews();
  drawScene(state.mouthOpen);
  return pageAssignedImages.length;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function createLoadedVideo(url, options = {}) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("error", handleError);
    };
    const handleReady = () => {
      cleanup();
      try {
        video.currentTime = 0;
      } catch (error) {
        console.error(error);
      }
      resolve(video);
    };
    const handleError = () => {
      cleanup();
      reject(new Error(options.errorMessage || "The video could not be loaded."));
    };

    video.preload = "auto";
    video.muted = options.muted !== false;
    video.defaultMuted = video.muted;
    video.loop = options.loop !== false;
    video.autoplay = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("preload", "auto");
    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("error", handleError);
    video.src = url;
    video.load();
  });
}

async function playVideoWithAutoplayRecovery(videoElement, options = {}) {
  if (!videoElement) {
    return false;
  }

  const requestedMuted = options.muted === true;
  const requestedVolume = Number.isFinite(Number(options.volume))
    ? clamp(Number(options.volume), 0, 1)
    : (requestedMuted ? 0 : 1);

  try {
    videoElement.defaultMuted = requestedMuted;
    videoElement.muted = requestedMuted;
    videoElement.volume = requestedVolume;
    await videoElement.play();
    return true;
  } catch (error) {
    console.error(error);
  }

  try {
    videoElement.defaultMuted = true;
    videoElement.muted = true;
    videoElement.volume = 0;
    await videoElement.play();

    if (!requestedMuted) {
      window.setTimeout(() => {
        try {
          videoElement.defaultMuted = false;
          videoElement.muted = false;
          videoElement.volume = requestedVolume;
        } catch (error) {
          console.error(error);
        }
      }, STRICT_AUTOPLAY_RECOVERY_MS);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function playAudioWithRecovery(audioElement, options = {}) {
  if (!audioElement) {
    return false;
  }

  const requestedVolume = Number.isFinite(Number(options.volume))
    ? clamp(Number(options.volume), 0, 1)
    : STRICT_VOICE_VOLUME;

  try {
    audioElement.muted = false;
    audioElement.volume = requestedVolume;
    await audioElement.play();
    return true;
  } catch (error) {
    console.error(error);
  }

  try {
    audioElement.muted = true;
    audioElement.volume = 0;
    await audioElement.play();
    window.setTimeout(() => {
      try {
        audioElement.muted = false;
        audioElement.volume = requestedVolume;
      } catch (error) {
        console.error(error);
      }
    }, 180);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function syncActiveStageVideo() {
  const activeVideoIndex = state.stageVideos.findIndex((item) => item.id === state.activeStageVideoId);
  const resolvedIndex = activeVideoIndex >= 0 ? activeVideoIndex : (state.stageVideos[0] ? 0 : -1);
  const activeVideo = resolvedIndex >= 0 ? clampStageVideoFrame(state.stageVideos[resolvedIndex]) : null;

  if (resolvedIndex >= 0) {
    state.stageVideos[resolvedIndex] = activeVideo;
  } else if (state.stageVideoEditor.activeId) {
    state.stageVideoEditor.activeId = "";
    state.stageVideoEditor.mode = "";
    state.stageVideoEditor.pointerId = null;
  }

  state.activeStageVideoId = activeVideo?.id || "";
  state.stageVideo = activeVideo || createEmptyStageVideoState();
  return state.stageVideo;
}

function getActiveStageVideo() {
  return syncActiveStageVideo();
}

function getStageVideoPageLabel(index) {
  return `Blue screen video ${index + 1}`;
}

function selectStageVideo(videoId, options = {}) {
  const nextVideo = state.stageVideos.find((item) => item.id === videoId) || null;
  if (!nextVideo) {
    return;
  }

  state.activeStageVideoId = nextVideo.id;
  state.stageVideoEditor.activeId = nextVideo.id;
  state.stageVideoEditor.mode = "";
  state.stageVideoEditor.pointerId = null;
  syncActiveStageVideo();
  updateStageVideoUi();

  if (!stagePanel.classList.contains("hidden") && !isPdfPresentationMode()) {
    void startStageVideoPlayback({ restart: options.restart !== false });
  } else {
    ensureStageMediaLoop();
  }

  drawScene(state.mouthOpen);
}

function removeStageVideoAt(index) {
  const item = state.stageVideos[index];
  if (!item) {
    return;
  }

  if (state.stageVideo.id === item.id) {
    pauseStageVideoPlayback();
  }

  if (item.element) {
    item.element.pause();
    item.element.removeAttribute("src");
    item.element.load();
  }

  if (item.url) {
    URL.revokeObjectURL(item.url);
  }

  state.stageVideos.splice(index, 1);
  if (state.stageVideoEditor.activeId === item.id) {
    state.stageVideoEditor.activeId = "";
    state.stageVideoEditor.mode = "";
    state.stageVideoEditor.pointerId = null;
  }
  syncActiveStageVideo();
  updateStageVideoUi();
  if (state.stageVideo.element && !stagePanel.classList.contains("hidden") && !isPdfPresentationMode()) {
    void startStageVideoPlayback({ restart: true });
  }
  drawScene(state.mouthOpen);
  setVideoStatus(state.stageVideos.length ? "The stage video library was updated." : "No stage video selected.");
}

async function applySmartCutoutToStageVideoAt(index, force = true) {
  const item = state.stageVideos[index];
  if (!item?.element) {
    return false;
  }

  const videoElement = item.element;
  const sampleWidth = Math.max(1, Math.min(320, item.width || videoElement.videoWidth || 320));
  const sampleHeight = Math.max(
    1,
    Math.round(sampleWidth / Math.max(0.1, (item.width || videoElement.videoWidth || 320) / Math.max(1, item.height || videoElement.videoHeight || 180)))
  );
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleContext.drawImage(videoElement, 0, 0, sampleWidth, sampleHeight);
  const imageData = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight);
  const key = buildSmartCutoutKey(imageData, force);

  if (!key) {
    state.stageVideos[index] = {
      ...item,
      cutoutApplied: false,
      cutoutConfidence: 0,
      cutoutKey: null,
      cutoutSurface: null
    };
    syncActiveStageVideo();
    return false;
  }

  state.stageVideos[index] = {
    ...item,
    cutoutApplied: true,
    cutoutConfidence: key.confidence || 0,
    cutoutKey: key,
    cutoutSurface: item.cutoutSurface || null
  };
  syncActiveStageVideo();
  return true;
}

function renderStageVideoPreviewList() {
  if (!videoPreviewList) {
    return;
  }

  videoPreviewList.innerHTML = "";

  if (!state.stageVideos.length) {
    renderMediaEmptyState(
      videoPreviewList,
      "No stage videos yet",
      "Upload a stage video when you want motion behind the lesson. The active video can still be managed from the presentation screen."
    );
    updateStageMediaToolUi();
    return;
  }

  state.stageVideos.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "image-preview-card";
    card.classList.toggle("is-active", item.id === state.activeStageVideoId);

    const preview = document.createElement("video");
    preview.src = item.url;
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.preload = "metadata";

    const label = document.createElement("p");
    label.className = "image-preview-label";
    label.textContent = item.fileName;

    const meta = document.createElement("p");
    meta.className = "image-preview-meta";
    meta.textContent = item.cutoutApplied
      ? `${getStageVideoPageLabel(index)} | cutout ${Math.round((item.cutoutConfidence || 0) * 100)}%${item.id === state.activeStageVideoId ? " | active" : ""}`
      : (item.id === state.activeStageVideoId
        ? `${getStageVideoPageLabel(index)} | active`
        : getStageVideoPageLabel(index));

    const tools = document.createElement("div");
    tools.className = "image-preview-tools";

    const cutoutBtn = document.createElement("button");
    cutoutBtn.type = "button";
    cutoutBtn.className = "ghost-btn image-cutout-btn";
    cutoutBtn.textContent = item.cutoutApplied ? "Restore" : "Remove BG";
    cutoutBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      cutoutBtn.disabled = true;

      try {
        if (item.cutoutApplied) {
          state.stageVideos[index] = {
            ...state.stageVideos[index],
            cutoutApplied: false,
            cutoutConfidence: 0,
            cutoutKey: null,
            cutoutSurface: null
          };
          syncActiveStageVideo();
          setVideoStatus(`${item.fileName} was restored to the original video.`);
        } else {
          const applied = await applySmartCutoutToStageVideoAt(index, true);
          setVideoStatus(
            applied
              ? `${item.fileName} now uses background removal on the blue screen.`
              : `${item.fileName} did not have a clear green/plain background to remove.`
          );
        }

        renderStageVideoPreviewList();
        drawScene(state.mouthOpen);
      } catch (error) {
        console.error(error);
        setVideoStatus(error.message || "Smart cutout could not finish for that video.");
      } finally {
        cutoutBtn.disabled = false;
      }
    });

    card.addEventListener("click", () => {
      selectStageVideo(item.id);
      setVideoStatus(`${item.fileName} is now active on the blue screen.`);
    });
    card.appendChild(preview);
    card.appendChild(label);
    card.appendChild(meta);
    const showOnScreenBtn = document.createElement("button");
    showOnScreenBtn.type = "button";
    showOnScreenBtn.className = "ghost-btn image-cutout-btn";
    showOnScreenBtn.textContent = "Show On Screen";
    showOnScreenBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      selectStageVideo(item.id);
      setVideoStatus(`${item.fileName} is now active on the blue screen.`);
    });

    tools.appendChild(cutoutBtn);
    tools.appendChild(showOnScreenBtn);
    card.appendChild(tools);
    videoPreviewList.appendChild(card);
  });

  videoPreviewList.classList.remove("hidden");
  updateStageMediaToolUi();
}

async function ensureDefaultIntroClip() {
  if (state.introPlayback.available === false) {
    return false;
  }

  if (state.introPlayback.element) {
    return true;
  }

  try {
    const introElement = await createLoadedVideo(resolveProjectAssetUrl(state.introPlayback.url || DEFAULT_INTRO_VIDEO_FILE), {
      muted: false,
      loop: false,
      errorMessage: "The default intro clip could not be loaded."
    });
    introElement.pause();
    try {
      introElement.currentTime = 0;
    } catch (error) {
      console.error(error);
    }
    introElement.volume = STRICT_VOICE_VOLUME;
    introElement.muted = false;
    state.introPlayback.element = introElement;
    state.introPlayback.durationMs = Number.isFinite(introElement.duration)
      ? Math.max(1000, Math.ceil(introElement.duration * 1000))
      : 0;
    state.introPlayback.available = true;
    setIntroClipStatus("The default intro clip is ready.");
    return true;
  } catch (error) {
    console.error(error);
    state.introPlayback.available = false;
    setIntroClipStatus("The default intro clip could not be loaded.");
    return false;
  }
}

function cancelStageMediaLoop() {
  if (state.mediaFrame) {
    cancelAnimationFrame(state.mediaFrame);
    state.mediaFrame = null;
  }
}

function shouldAnimateStageMedia() {
  return Boolean(
    state.stageVideo.url
    && state.stageVideo.element
    && !stagePanel.classList.contains("hidden")
    && !isPdfPresentationMode()
    && !state.speaking
    && !state.exportingVideo
  );
}

function ensureStageMediaLoop() {
  cancelStageMediaLoop();
  if (!shouldAnimateStageMedia()) {
    return;
  }

  const tick = () => {
    if (!shouldAnimateStageMedia()) {
      state.mediaFrame = null;
      return;
    }

    drawScene(state.mouthOpen);
    state.mediaFrame = requestAnimationFrame(tick);
  };

  state.mediaFrame = requestAnimationFrame(tick);
}

async function startStageVideoPlayback(options = {}) {
  syncActiveStageVideo();
  const videoElement = state.stageVideo.element;
  if (!videoElement) {
    cancelStageMediaLoop();
    return;
  }

  if (options.restart) {
    try {
      videoElement.currentTime = 0;
    } catch (error) {
      console.error(error);
    }
  }

  const playbackRate = Number.isFinite(Number(options.playbackRate)) && Number(options.playbackRate) > 0
    ? Number(options.playbackRate)
    : 1;
  try {
    videoElement.playbackRate = playbackRate;
    videoElement.preservesPitch = true;
    videoElement.mozPreservesPitch = true;
    videoElement.webkitPreservesPitch = true;
  } catch (error) {
    console.error(error);
  }

  try {
    const started = await playVideoWithAutoplayRecovery(videoElement, { muted: true, volume: 0 });
    if (!started) {
      setVideoStatus("The stage video could not autoplay on screen.");
      return;
    }
  } catch (error) {
    console.error(error);
  }

  ensureStageMediaLoop();
}

async function playIntroClipIfEnabled() {
  if (isPdfPresentationMode() || !state.introPlayback.enabled) {
    return;
  }

  const ready = await ensureDefaultIntroClip();
  if (!ready || !state.introPlayback.element) {
    return;
  }

  const introElement = state.introPlayback.element;
  state.introPlayback.previewVisible = false;
  state.introPlayback.active = true;
  state.mouthOpen = 0.12;
  updatePlaybackProgressUi(0, true);
  setStatus("Playing the intro clip first.");
  drawScene(0.12);

  try {
    introElement.loop = false;
    introElement.muted = false;
    introElement.volume = STRICT_VOICE_VOLUME;
    introElement.currentTime = 0;
  } catch (error) {
    console.error(error);
  }

  const introFinished = new Promise((resolve, reject) => {
    const handleEnded = () => resolve();
    const handleError = () => reject(new Error("The intro clip could not be played."));
    introElement.addEventListener("ended", handleEnded, { once: true });
    introElement.addEventListener("error", handleError, { once: true });
  });

  const tick = () => {
    if (!state.introPlayback.active) {
      return;
    }

    const duration = introElement.duration || (state.introPlayback.durationMs / 1000) || 1;
    const progress = clamp((introElement.currentTime || 0) / duration, 0, 1);
    updatePlaybackProgressUi(progress, true);
    drawScene(0.12);

    if (!introElement.paused && !introElement.ended) {
      state.animationFrame = requestAnimationFrame(tick);
    }
  };

  try {
    const started = await playVideoWithAutoplayRecovery(introElement, { muted: false, volume: STRICT_VOICE_VOLUME });
    if (!started) {
      throw new Error("The intro clip could not be played.");
    }
    state.animationFrame = requestAnimationFrame(tick);
    await introFinished;
  } catch (error) {
    console.error(error);
    setIntroClipStatus("The intro clip could not start, so the lesson continued without it.");
  } finally {
    state.introPlayback.active = false;
    introElement.pause();
    try {
      introElement.currentTime = 0;
    } catch (error) {
      console.error(error);
    }
    updatePlaybackProgressUi(0, false);
    drawScene(0.12);
  }
}

async function playIntroClipForExport(options = {}) {
  if (isPdfPresentationMode() || !state.introPlayback.enabled) {
    return false;
  }

  const ready = await ensureDefaultIntroClip();
  if (!ready || !state.introPlayback.element) {
    return false;
  }

  const introElement = state.introPlayback.element;
  const playbackRate = Number.isFinite(Number(options.playbackRate)) && Number(options.playbackRate) > 0
    ? Number(options.playbackRate)
    : 1;
  state.introPlayback.previewVisible = false;
  state.introPlayback.active = true;
  state.mouthOpen = 0.12;
  updatePlaybackProgressUi(0, true);
  drawScene(0.12);

  try {
    introElement.pause();
    introElement.loop = false;
    introElement.muted = true;
    introElement.volume = 0;
    introElement.playbackRate = 1;
    introElement.currentTime = 0;

    const duration = introElement.duration || (state.introPlayback.durationMs / 1000) || 0;
    if (!duration) {
      return false;
    }

    const renderSpeedMultiplier = playbackRate;
    const frameRate = getAcceleratedExportCaptureRate(getLessonExportCaptureRate(), renderSpeedMultiplier);
    const frameDurationMs = Math.max(4, Math.round(1000 / frameRate));
    const targetDurationMs = (duration * 1000) / renderSpeedMultiplier;
    const exportLoopStartMs = performance.now();
    let virtualElapsedMs = 0;

    while (state.introPlayback.active && virtualElapsedMs <= targetDurationMs) {
      const progress = clamp(virtualElapsedMs / targetDurationMs, 0, 1);
      introElement.currentTime = (virtualElapsedMs * renderSpeedMultiplier) / 1000;
      updatePlaybackProgressUi(progress, true);
      drawScene(0.12);

      if (progress >= 1) {
        break;
      }
      virtualElapsedMs = performance.now() - exportLoopStartMs;
      await delay(frameDurationMs);
    }

    updatePlaybackProgressUi(1, true);
    drawScene(0.12);
    await delay(80);
    return true;
  } finally {
    state.introPlayback.active = false;
    introElement.pause();
    try {
      introElement.currentTime = 0;
      introElement.playbackRate = 1;
    } catch (error) {
      console.error(error);
    }
    updatePlaybackProgressUi(0, false);
    drawScene(0.12);
  }
}

async function renderNarrationTimelineForExport(durationMs, playbackRate = getLessonPlaybackRate(), options = {}) {
  const safeDurationMs = Math.max(1000, Math.round(durationMs || 1000));
  const safePlaybackRate = Number.isFinite(Number(playbackRate)) && Number(playbackRate) > 0
    ? Number(playbackRate)
    : 1;
  const renderSpeedMultiplier = Number.isFinite(Number(options.renderSpeedMultiplier)) && Number(options.renderSpeedMultiplier) > 0
    ? Number(options.renderSpeedMultiplier)
    : getExportRenderSpeedMultiplier();
  const frameRate = getAcceleratedExportCaptureRate(getLessonExportCaptureRate(), renderSpeedMultiplier);
  const frameDurationMs = Math.max(4, Math.round(1000 / frameRate));
  const narrationTimelineMs = Math.max(1, Math.round(safeDurationMs / safePlaybackRate));
  const visualLagMs = Math.max(0, Math.round((Number(SPEECH_SYNC_VISUAL_PROGRESS_LAG) || 0) * 1000));
  let lastDisplayedLength = 0;
  let lastDisplayedAdvanceProgress = 0;
  let virtualElapsedMs = 0;
  const exportLoopStartMs = performance.now();

  state.displayedText = "";
  state.speaking = true;
  syncLessonPlaybackProgressUi(0, true);
  drawScene(0.12);

  while (true) {
    const elapsedMs = Math.min(
      narrationTimelineMs,
      virtualElapsedMs * renderSpeedMultiplier
    );

    if (state.stageVideo.element) {
      const stageVidDuration = state.stageVideo.element.duration || 1;
      state.stageVideo.element.currentTime = (elapsedMs / 1000) % stageVidDuration;
    }

    const syncElapsedMs = Math.max(0, elapsedMs - visualLagMs);
    const progress = clamp(elapsedMs / narrationTimelineMs, 0, 1);
    const syncFrame = getSpeechSyncFrame(state.text, syncElapsedMs, narrationTimelineMs);
    let nextDisplayedText = syncFrame.displayedText;
    const nextDisplayedLength = nextDisplayedText.length;

    if (nextDisplayedLength > lastDisplayedLength) {
      lastDisplayedLength = nextDisplayedLength;
      lastDisplayedAdvanceProgress = progress;
    } else if ((progress - lastDisplayedAdvanceProgress) >= 0.12) {
      const recoveryProgress = clamp((progress - 0.12) / 0.88, 0, 1);
      const recoveryText = getVisibleTextForProgress(state.text, recoveryProgress);
      if (recoveryText.length > nextDisplayedLength) {
        nextDisplayedText = recoveryText;
        lastDisplayedLength = recoveryText.length;
        lastDisplayedAdvanceProgress = progress;
      }
    }

    const remainingNarrationMs = Math.max(0, narrationTimelineMs - elapsedMs);
    if (remainingNarrationMs <= Math.max(240, visualLagMs)) {
      nextDisplayedText = state.text;
      lastDisplayedLength = state.text.length;
      lastDisplayedAdvanceProgress = 1;
    }

    state.displayedText = nextDisplayedText;
    syncLessonPlaybackProgressUi(progress, true);
    updateTaskProgressUi(0.26 + (progress * 0.54), true, { mirrorStage: true });
    state.mouthOpen = syncFrame.mouthActive ? getFallbackMouth(syncFrame.speechElapsedMs) : 0.12;
    drawScene(state.mouthOpen);

    if (progress >= 1) {
      break;
    }

    virtualElapsedMs = performance.now() - exportLoopStartMs;
    await delay(frameDurationMs);
  }
}

async function renderPdfTimelineForExport(renderMode = getPdfRenderMode(), options = {}) {
  const safeRenderMode = renderMode === "exact" ? "exact" : "context";
  const renderSpeedMultiplier = Number.isFinite(Number(options.renderSpeedMultiplier)) && Number(options.renderSpeedMultiplier) > 0
    ? Number(options.renderSpeedMultiplier)
    : getExportRenderSpeedMultiplier();
  const frameRate = getAcceleratedExportCaptureRate(getPdfExportCaptureRate(safeRenderMode), renderSpeedMultiplier);
  const frameDurationMs = Math.max(4, Math.round(1000 / frameRate));
  const targetTimelineMs = Math.max(1, Math.round(state.pdf.totalDurationMs || 1000));
  const timelineAdvanceRate = Math.max(0.1, getPdfPlaybackRate()) * renderSpeedMultiplier;
  const startedAt = performance.now();

  state.pdf.audioDriven = false;
  state.pdf.paused = false;
  state.pdf.timelineStartedAt = 0;
  state.pdf.timelineStartOffsetMs = 0;
  state.pdf.currentTimeMs = 0;
  state.speaking = true;
  state.mouthOpen = 0.12;
  syncPdfPreviewPageFromTime(0);
  updatePlaybackProgressUi(0, true);
  drawScene(0.12);

  while (true) {
    const elapsedMs = Math.min(
      targetTimelineMs,
      (performance.now() - startedAt) * timelineAdvanceRate
    );
    const progress = clamp(elapsedMs / targetTimelineMs, 0, 1);
    state.pdf.currentTimeMs = elapsedMs;
    syncPdfPreviewPageFromTime(elapsedMs);
    updatePlaybackProgressUi(progress, true);
    updateTaskProgressUi(0.26 + (progress * 0.54), true, { mirrorStage: true });

    const activeSelectionIndex = getPdfSelectionIndexForTime(elapsedMs);
    const activePage = getPdfPresentationPages()[activeSelectionIndex] || null;
    const visibleState = safeRenderMode === "context"
      ? getPdfContextVisibleText(activePage, activeSelectionIndex)
      : null;
    state.mouthOpen = visibleState?.mouthActive
      ? getFallbackMouth(visibleState.speechElapsedMs)
      : 0.12;
    drawScene(state.mouthOpen);

    if (progress >= 1) {
      break;
    }

    await delay(frameDurationMs);
  }
}

function pauseStageVideoPlayback() {
  if (state.stageVideo.element) {
    state.stageVideo.element.pause();
  }

  cancelStageMediaLoop();
}

function updateStageVideoUi() {
  syncActiveStageVideo();
  const hasVideo = Boolean(state.stageVideo.url);

  if (videoPreview) {
    if (hasVideo) {
      videoPreview.src = state.stageVideo.url;
      videoPreview.classList.remove("hidden");
    } else {
      videoPreview.pause();
      videoPreview.removeAttribute("src");
      videoPreview.load();
      videoPreview.classList.add("hidden");
    }
  }

  renderStageVideoPreviewList();

  if (clearVideoBtn) {
    clearVideoBtn.disabled = !state.stageVideos.length;
  }

  if (stageVideoUploadBtn) {
    stageVideoUploadBtn.disabled = isPdfPresentationMode();
  }
}

async function handleVideoSelection(event) {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    updateStageVideoUi();
    return;
  }

  stopPlayback(false);
  updateTaskProgressUi(0.18, true, { label: "Preparing stage video" });

  try {
    const loadedVideos = await Promise.all(
      files.map(async (file, index) => {
        const nextUrl = URL.createObjectURL(file);
        try {
          const videoElement = await createLoadedVideo(nextUrl, {
            muted: true,
            loop: true
          });
          const durationMs = Number.isFinite(videoElement.duration)
            ? Math.max(1000, Math.ceil(videoElement.duration * 1000))
            : 0;

          return {
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
            url: nextUrl,
            fileName: file.name,
            blob: file,
            element: videoElement,
            durationMs,
            width: videoElement.videoWidth || 0,
            height: videoElement.videoHeight || 0,
            posterDataUrl: "",
            cutoutApplied: false,
            cutoutConfidence: 0,
            cutoutKey: null,
            cutoutSurface: null,
            aspectRatio: (videoElement.videoWidth && videoElement.videoHeight)
              ? (videoElement.videoWidth / videoElement.videoHeight)
              : (16 / 9),
            frameX: NaN,
            frameY: NaN,
            frameWidth: NaN,
            frameHeight: NaN
          };
        } catch (error) {
          URL.revokeObjectURL(nextUrl);
          throw error;
        }
      })
    );

    state.stageVideos = [...state.stageVideos, ...loadedVideos];
    if (!state.activeStageVideoId && loadedVideos[0]) {
      state.activeStageVideoId = loadedVideos[0].id;
    }
    syncActiveStageVideo();

    updateStageVideoUi();
    if (!stagePanel.classList.contains("hidden") && !isPdfPresentationMode()) {
      await startStageVideoPlayback({ restart: true });
    } else {
      ensureStageMediaLoop();
    }
    drawScene(state.mouthOpen);
    setVideoStatus(`${loadedVideos.length} video${loadedVideos.length === 1 ? "" : "s"} loaded. Click any preview to make it active, then drag or resize it directly on the blue screen.`);
    setStatus(`Stage video library updated. The active blue screen video is ${state.stageVideo.fileName}, and exports will use ${getExportQualityLabel()} quality.`);
    updateTaskProgressUi(1, true, { label: "Stage video ready" });
  } catch (error) {
    console.error(error);
    setVideoStatus(error.message || "Video upload failed.");
    setStatus(error.message || "Video upload failed.");
  } finally {
    resetTaskProgressUi();
    event.target.value = "";
  }
}

function resetStageVideoState() {
  pauseStageVideoPlayback();

  state.stageVideos.forEach((item) => {
    if (item.element) {
      item.element.pause();
      item.element.removeAttribute("src");
      item.element.load();
    }

    if (item.url) {
      URL.revokeObjectURL(item.url);
    }
  });

  state.stageVideos = [];
  state.activeStageVideoId = "";
  state.stageVideo = createEmptyStageVideoState();
  state.stageVideoEditor.activeId = "";
  state.stageVideoEditor.hoverMode = "";
  state.stageVideoEditor.mode = "";
  state.stageVideoEditor.pointerId = null;
  state.stageVideoRenderBox = null;

  updateStageVideoUi();
}

function getStageVideoDrawArea() {
  const metrics = getPresentationTemplateMetrics();
  return {
    x: 0,
    y: metrics.videoTopInset,
    width: canvas.width,
    height: canvas.height - metrics.videoTopInset
  };
}

function getStageVideoAspectRatio(videoItem) {
  return videoItem?.aspectRatio
    || ((videoItem?.width && videoItem?.height) ? (videoItem.width / videoItem.height) : (16 / 9));
}

function getDefaultStageVideoFrame(videoItem) {
  const area = getStageVideoDrawArea();
  const aspectRatio = Math.max(0.1, getStageVideoAspectRatio(videoItem));
  let width = clamp(area.width * 0.34, 220, Math.max(220, area.width * 0.82));
  let height = width / aspectRatio;
  const maxHeight = area.height * 0.72;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    x: clamp(area.x + area.width - width - 36, area.x, area.x + Math.max(0, area.width - width)),
    y: clamp(area.y + 32, area.y, area.y + Math.max(0, area.height - height)),
    width,
    height
  };
}

function normalizeStageVideoFrame(videoItem) {
  const aspectRatio = Math.max(0.1, getStageVideoAspectRatio(videoItem));
  const fallback = getDefaultStageVideoFrame({ ...videoItem, aspectRatio });

  return {
    ...videoItem,
    aspectRatio,
    frameX: Number.isFinite(videoItem?.frameX) ? videoItem.frameX : fallback.x,
    frameY: Number.isFinite(videoItem?.frameY) ? videoItem.frameY : fallback.y,
    frameWidth: Number.isFinite(videoItem?.frameWidth) ? videoItem.frameWidth : fallback.width,
    frameHeight: Number.isFinite(videoItem?.frameHeight) ? videoItem.frameHeight : fallback.height
  };
}

function clampStageVideoFrame(videoItem) {
  const normalized = normalizeStageVideoFrame(videoItem);
  const area = getStageVideoDrawArea();
  const minWidth = 140;
  const maxWidth = Math.max(
    minWidth,
    Math.min(area.width, area.height * normalized.aspectRatio)
  );
  const width = clamp(normalized.frameWidth, minWidth, maxWidth);
  const height = width / normalized.aspectRatio;
  const maxX = area.x + area.width - width;
  const maxY = area.y + area.height - height;

  return {
    ...normalized,
    frameWidth: width,
    frameHeight: height,
    frameX: clamp(normalized.frameX, area.x, Math.max(area.x, maxX)),
    frameY: clamp(normalized.frameY, area.y, Math.max(area.y, maxY))
  };
}

function commitStageVideoUpdate(videoId, updates) {
  const videoIndex = state.stageVideos.findIndex((item) => item.id === videoId);
  if (videoIndex < 0) {
    return null;
  }

  state.stageVideos[videoIndex] = {
    ...state.stageVideos[videoIndex],
    ...updates
  };

  if (!state.activeStageVideoId || state.activeStageVideoId === videoId) {
    state.activeStageVideoId = videoId;
    state.stageVideo = state.stageVideos[videoIndex];
  }

  return state.stageVideos[videoIndex];
}

function drawVideoCover(source, area, options = {}) {
  if (!source) {
    return;
  }

  const isVideoElement = typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement;
  if (isVideoElement && source.readyState < 2) {
    return;
  }

  const sourceWidth = Number(options.sourceWidth) || source.videoWidth || source.width || 1;
  const sourceHeight = Number(options.sourceHeight) || source.videoHeight || source.height || 1;
  const scale = Math.max(area.width / sourceWidth, area.height / sourceHeight);
  const drawWidth = Math.max(1, sourceWidth * scale);
  const drawHeight = Math.max(1, sourceHeight * scale);
  const drawX = area.x + ((area.width - drawWidth) / 2);
  const drawY = area.y + ((area.height - drawHeight) / 2);

  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.width, area.height);
  ctx.clip();
  ctx.globalAlpha = Number.isFinite(options.opacity) ? options.opacity : 1;
  ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function getStageVideoCutoutSource(videoItem) {
  const videoElement = videoItem?.element;
  if (!videoElement || !videoItem?.cutoutApplied || !videoItem.cutoutKey || videoElement.readyState < 2) {
    return videoElement;
  }

  const sourceWidth = videoItem.width || videoElement.videoWidth || 1;
  const sourceHeight = videoItem.height || videoElement.videoHeight || 1;
  const maxDimension = Math.max(sourceWidth, sourceHeight);
  const scale = maxDimension > 960 ? (960 / maxDimension) : 1;
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  if (
    !videoItem.cutoutSurface
    || videoItem.cutoutSurface.canvas.width !== targetWidth
    || videoItem.cutoutSurface.canvas.height !== targetHeight
  ) {
    const surfaceCanvas = document.createElement("canvas");
    surfaceCanvas.width = targetWidth;
    surfaceCanvas.height = targetHeight;
    const surfaceContext = surfaceCanvas.getContext("2d", { willReadFrequently: true });
    videoItem.cutoutSurface = {
      canvas: surfaceCanvas,
      context: surfaceContext
    };
  }

  const { canvas: surfaceCanvas, context: surfaceContext } = videoItem.cutoutSurface;
  surfaceContext.clearRect(0, 0, targetWidth, targetHeight);
  surfaceContext.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

  const imageData = surfaceContext.getImageData(0, 0, targetWidth, targetHeight);
  const { data } = imageData;
  const tolerance = getCutoutKeyTolerance(videoItem.cutoutKey);
  const feather = getCutoutFeather();
  for (let offset = 0; offset < data.length; offset += 4) {
    if (!isLikelyCutoutBackgroundPixel(data[offset], data[offset + 1], data[offset + 2], data[offset + 3], videoItem.cutoutKey)) {
      const distance = getColorDistance(data[offset], data[offset + 1], data[offset + 2], videoItem.cutoutKey);
      const edgeFactor = distance <= (tolerance + feather)
        ? clamp(1 - ((distance - tolerance) / Math.max(1, feather)), 0, 1)
        : 0;
      softenForegroundSpill(data, offset, videoItem.cutoutKey, edgeFactor);
      continue;
    }

    data[offset + 3] = 0;
  }

  surfaceContext.putImageData(imageData, 0, 0);
  return surfaceCanvas;
}

function drawStageVideoLayer() {
  const videoElement = state.stageVideo.element;
  state.stageVideoRenderBox = null;
  if (!videoElement || videoElement.readyState < 2 || state.exportFallbackMode) {
    return;
  }

  const interactivePreview = canvas === previewCanvas && !stagePanel.classList.contains("hidden");
  const videoFrame = clampStageVideoFrame(state.stageVideo);
  if (
    videoFrame.frameX !== state.stageVideo.frameX
    || videoFrame.frameY !== state.stageVideo.frameY
    || videoFrame.frameWidth !== state.stageVideo.frameWidth
    || videoFrame.frameHeight !== state.stageVideo.frameHeight
  ) {
    commitStageVideoUpdate(videoFrame.id, videoFrame);
  }

  const area = {
    x: videoFrame.frameX,
    y: videoFrame.frameY,
    width: videoFrame.frameWidth,
    height: videoFrame.frameHeight
  };
  const drawSource = getStageVideoCutoutSource(state.stageVideo) || videoElement;
  ctx.save();
  ctx.shadowColor = "rgba(12, 33, 53, 0.28)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  drawRoundedRect(area.x, area.y, area.width, area.height, 24, "rgba(255,255,255,0.16)");
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(area.x + 24, area.y);
  ctx.arcTo(area.x + area.width, area.y, area.x + area.width, area.y + area.height, 24);
  ctx.arcTo(area.x + area.width, area.y + area.height, area.x, area.y + area.height, 24);
  ctx.arcTo(area.x, area.y + area.height, area.x, area.y, 24);
  ctx.arcTo(area.x, area.y, area.x + area.width, area.y, 24);
  ctx.closePath();
  ctx.clip();
  drawVideoCover(drawSource, area, {
    sourceWidth: state.stageVideo.width || videoElement.videoWidth || 1,
    sourceHeight: state.stageVideo.height || videoElement.videoHeight || 1,
    opacity: state.stageVideo.cutoutApplied ? 1 : 0.94
  });
  applyScreenMatchOverlay(
    area,
    state.stageVideo.cutoutApplied
      ? (0.18 + (getCutoutScreenBlendStrength() * 0.82))
      : 0.22
  );
  ctx.restore();

  const handleSize = 18;
  const handleX = area.x + area.width - handleSize - 10;
  const handleY = area.y + area.height - handleSize - 10;
  const isActive = interactivePreview && state.stageVideoEditor.activeId === state.stageVideo.id;
  const isHovering = interactivePreview && state.stageVideoEditor.hoverMode;

  if (interactivePreview) {
    state.stageVideoRenderBox = {
      id: state.stageVideo.id,
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
      handleX,
      handleY,
      handleSize
    };
  }

  if (interactivePreview && (isActive || isHovering)) {
    ctx.save();
    ctx.strokeStyle = "#0d7ea9";
    ctx.lineWidth = 4;
    ctx.strokeRect(area.x - 2, area.y - 2, area.width + 4, area.height + 4);
    drawRoundedRect(handleX, handleY, handleSize, handleSize, 6, "#0d7ea9");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handleX + 5, handleY + handleSize - 5);
    ctx.lineTo(handleX + handleSize - 5, handleY + 5);
    ctx.stroke();
    ctx.restore();
  }
}

function drawIntroScene() {
  const introElement = state.introPlayback.element;
  state.stageVideoRenderBox = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#08131d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawVideoCover(introElement, {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  });
  requestCanvasExportFrame();
}

function getBorderPixelSummary(imageData) {
  const { width, height, data } = imageData;
  if (!width || !height) {
    return null;
  }

  const samples = [];
  const stepX = Math.max(1, Math.round(width / 80));
  const stepY = Math.max(1, Math.round(height / 80));
  const pushPixel = (x, y) => {
    const offset = ((y * width) + x) * 4;
    const alpha = data[offset + 3];
    if (alpha < 16) {
      return;
    }

    samples.push([
      data[offset],
      data[offset + 1],
      data[offset + 2]
    ]);
  };

  for (let x = 0; x < width; x += stepX) {
    pushPixel(x, 0);
    pushPixel(x, height - 1);
  }

  for (let y = stepY; y < height - 1; y += stepY) {
    pushPixel(0, y);
    pushPixel(width - 1, y);
  }

  if (!samples.length) {
    return null;
  }

  const average = samples.reduce((sum, sample) => ({
    r: sum.r + sample[0],
    g: sum.g + sample[1],
    b: sum.b + sample[2]
  }), { r: 0, g: 0, b: 0 });

  const mean = {
    r: average.r / samples.length,
    g: average.g / samples.length,
    b: average.b / samples.length
  };

  let variance = 0;
  samples.forEach((sample) => {
    const dr = sample[0] - mean.r;
    const dg = sample[1] - mean.g;
    const db = sample[2] - mean.b;
    variance += (dr * dr) + (dg * dg) + (db * db);
  });

  variance /= samples.length;
  return {
    r: mean.r,
    g: mean.g,
    b: mean.b,
    variance
  };
}

function buildSmartCutoutKey(imageData, force = false) {
  const summary = getBorderPixelSummary(imageData);
  if (!summary) {
    return null;
  }

  const maxChannel = Math.max(summary.r, summary.g, summary.b);
  const minChannel = Math.min(summary.r, summary.g, summary.b);
  const greenBias = summary.g - Math.max(summary.r, summary.b);
  const greenish = greenBias > 18 && summary.g > 70;
  const neutralUniform = summary.variance < 1800 && (maxChannel - minChannel) < 26;
  const candidate = greenish || neutralUniform || (force && summary.variance < 12000);

  if (!candidate) {
    return null;
  }

  const confidence = clamp(
    (greenish ? 0.74 : 0.42)
    + (neutralUniform ? 0.18 : 0)
    - Math.min(0.34, summary.variance / 24000),
    0,
    1
  );

  return {
    r: Math.round(summary.r),
    g: Math.round(summary.g),
    b: Math.round(summary.b),
    tolerance: getCutoutTolerance(force),
    toleranceBoost: force ? 10 : 0,
    greenish,
    confidence
  };
}

function getColorDistance(r, g, b, key) {
  const dr = r - key.r;
  const dg = g - key.g;
  const db = b - key.b;
  return Math.sqrt((dr * dr) + (dg * dg) + (db * db));
}

function isLikelyCutoutBackgroundPixel(r, g, b, a, key) {
  if (a < 16) {
    return true;
  }

  const tolerance = getCutoutKeyTolerance(key);
  const distance = getColorDistance(r, g, b, key);
  if (distance <= tolerance) {
    return true;
  }

  if (!key.greenish) {
    return false;
  }

  return distance <= (tolerance + 28)
    && g > (r + 12)
    && g > (b + 10)
    && g > 68;
}

async function applySmartCutoutToDataUrl(dataUrl, options = {}) {
  const sourceImage = await loadImageFromDataUrl(dataUrl);
  const scale = Math.min(1, STAGE_VIDEO_MAX_DIMENSION / Math.max(sourceImage.width, sourceImage.height, 1));
  const targetWidth = Math.max(1, Math.round(sourceImage.width * scale));
  const targetHeight = Math.max(1, Math.round(sourceImage.height * scale));
  const workCanvas = document.createElement("canvas");
  workCanvas.width = targetWidth;
  workCanvas.height = targetHeight;
  const workContext = workCanvas.getContext("2d", { willReadFrequently: true });
  workContext.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

  const imageData = workContext.getImageData(0, 0, targetWidth, targetHeight);
  const key = buildSmartCutoutKey(imageData, options.force === true);
  if (!key || (!options.force && key.confidence < 0.46)) {
    return {
      dataUrl,
      image: sourceImage,
      cutoutApplied: false,
      confidence: key?.confidence || 0
    };
  }

  const { width, height, data } = imageData;
  const tolerance = getCutoutKeyTolerance(key);
  const feather = getCutoutFeather();
  const visited = new Uint8Array(width * height);
  const backgroundMask = new Uint8Array(width * height);
  const queue = [];
  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const index = (y * width) + x;
    if (visited[index]) {
      return;
    }

    const offset = index * 4;
    if (!isLikelyCutoutBackgroundPixel(data[offset], data[offset + 1], data[offset + 2], data[offset + 3], key)) {
      return;
    }

    visited[index] = 1;
    backgroundMask[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  const yieldToUi = () => new Promise((r) => setTimeout(r, 0));

  for (let head = 0; head < queue.length; head += 1) {
    if (head > 0 && head % 35000 === 0) await yieldToUi();
    const index = queue[head];
    const x = index % width;
    const y = Math.floor(index / width);
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  let removedPixels = 0;
  for (let index = 0; index < backgroundMask.length; index += 1) {
    if (index > 0 && index % 150000 === 0) await yieldToUi();
    if (!backgroundMask[index]) {
      continue;
    }

    data[(index * 4) + 3] = 0;
    removedPixels += 1;
  }

  for (let index = 0; index < backgroundMask.length; index += 1) {
    if (index > 0 && index % 100000 === 0) await yieldToUi();
    if (backgroundMask[index]) {
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    let touchesRemoved = false;
    for (let offsetY = -1; offsetY <= 1 && !touchesRemoved; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const nextX = x + offsetX;
        const nextY = y + offsetY;
        if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
          continue;
        }

        if (backgroundMask[(nextY * width) + nextX]) {
          touchesRemoved = true;
          break;
        }
      }
    }

    if (!touchesRemoved) {
      continue;
    }

    const pixelOffset = index * 4;
    const distance = getColorDistance(data[pixelOffset], data[pixelOffset + 1], data[pixelOffset + 2], key);
    if (distance > tolerance + feather) {
      continue;
    }

    const edgeFactor = clamp(1 - ((distance - tolerance) / Math.max(1, feather)), 0, 1);
    const alphaFactor = clamp((distance - tolerance) / Math.max(1, feather), 0.08, 1);
    softenForegroundSpill(data, pixelOffset, key, edgeFactor);
    data[pixelOffset + 3] = Math.round(data[pixelOffset + 3] * alphaFactor);
  }

  workContext.putImageData(imageData, 0, 0);
  if (!removedPixels) {
    return {
      dataUrl,
      image: sourceImage,
      cutoutApplied: false,
      confidence: key.confidence
    };
  }

  const nextDataUrl = workCanvas.toDataURL("image/png");
  return {
    dataUrl: nextDataUrl,
    image: await loadImageFromDataUrl(nextDataUrl),
    cutoutApplied: true,
    confidence: key.confidence
  };
}

async function applySmartCutoutToImageAt(index, force = true) {
  const item = state.images[index];
  if (!item) {
    return;
  }

  const sourceDataUrl = item.originalDataUrl || item.dataUrl;
  const result = await applySmartCutoutToDataUrl(sourceDataUrl, { force });
  state.images[index] = {
    ...item,
    dataUrl: result.cutoutApplied ? result.dataUrl : sourceDataUrl,
    image: result.cutoutApplied ? result.image : await loadImageFromDataUrl(sourceDataUrl),
    originalDataUrl: sourceDataUrl,
    cutoutApplied: result.cutoutApplied,
    cutoutConfidence: result.confidence || 0
  };
}

async function autoFetchSmartBRoll() {
  if (state.exportingVideo) return; 
  
  const currentText = lessonInput?.value.trim();
  if (!currentText) {
     setStatus("No lesson text found! Please write a script first before generating B-Roll.");
     return;
  }
  
  setStatus("🎬 Analyzing script and fetching cinematic B-Roll imagery...");
  
  const words = currentText.split(/\s+/).filter(w => w.length > 5 && !w.match(/jump|add|equal|quiz|answer|times|this|that/i));
  const keyword = words.length > 0 ? words[Math.floor(Math.random() * Math.min(3, words.length))].replace(/[^a-zA-Z]/g, "") : "Science";
  
  let bRollUrl = `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1280/720`;
  
  try {
     const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(keyword)}&origin=*`;
     const res = await fetch(url);
     const data = await res.json();
     const pages = data.query.pages;
     const pageId = Object.keys(pages)[0];
     if (pageId !== "-1" && pages[pageId].original) {
         bRollUrl = pages[pageId].original.source; 
     }
  } catch (e) {
     console.warn("Wikipedia API failed, falling back to Picsum.");
  }
  
  try {
      const res = await fetch(bRollUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
         const dataUrl = reader.result;
         
         const imageObj = await loadImageFromDataUrl(dataUrl);
         state.images.push({
           dataUrl,
           image: imageObj,
           originalDataUrl: dataUrl,
           width: imageObj.width,
           height: imageObj.height,
           renderWidth: Math.min(800, imageObj.width),
           renderHeight: Math.min(450, imageObj.height),
           x: 60,
           y: 120 + (state.images.length * 30) % 150, 
           aspectRatio: imageObj.width / imageObj.height,
           active: true,
           sourceTag: "b-roll",
           hasSmartCutout: false
         });
         
         state.imageEditor.activeIndex = state.images.length - 1;
         setStatus(`🎬 Successfully fetched and appended cinematic B-Roll for topic: ${keyword.toUpperCase()}`);
         updateStageMediaToolUi();
         requestCanvasExportFrame();
      };
      reader.readAsDataURL(blob);
  } catch (error) {
     setStatus("Failed to fetch B-Roll. Please check your internet connection.");
  }
}

async function autoTeachSelectedImage() {
  if (isPdfPresentationMode()) {
    setStatus("Auto-Teach is only available for individually uploaded Stage Images.");
    return;
  }
  const selectedImage = state.images[state.imageEditor.activeIndex];
  if (!selectedImage || !selectedImage.dataUrl) {
    setStatus("Please select an image on the board first to auto-teach.");
    return;
  }
  
  setStatus("Engaging Moondream2 Vision AI... (The brain takes ~25 seconds to download/load if this is the first use!)");
  try {
    const response = await fetch("http://127.0.0.1:8426/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: selectedImage.originalDataUrl || selectedImage.dataUrl,
        prompt: "Analyze this image and explain exactly what mathematical concept it teaches in a short, easy-to-read educational paragraph that a teacher could read out loud. DO NOT use asterisks or bold formatting. IF the image shows addition or multiplication, you MUST end your paragraph with the exact math equation on a new line (for example '2 + 3 = 5' or '3 x 4 = 12') so that the procedural visual animations can automatically track and demonstrate it during playback."
      })
    });
    
    const result = await response.json();
    if (!response.ok) {
       throw new Error(result.error || "Failed to analyze image.");
    }
    if (lessonInput && result.text) {
       lessonInput.value = result.text.trim();
       lessonInput.dispatchEvent(new Event("input"));
       lessonInput.dispatchEvent(new Event("change"));
       setStatus("Success! AI Vision generated the lesson script. You can edit it now.");
    }
  } catch (error) {
    setStatus(`Vision AI Error: ${error.message}`);
    console.error("AutoTeach Error:", error);
  }
}

function removeImageAt(index) {
  if (index < 0 || index >= state.images.length) {
    return;
  }

  state.images.splice(index, 1);
  state.imageEditor.activeIndex = -1;
  state.imageRenderBoxes = [];
  previewCanvas.style.cursor = "default";

  const contentPageCount = getPaginatedSlideContent(state.text, !state.text, state.previewPageIndex, false).pageCount;
  const maxPageIndex = Math.max(
    0,
    Math.max(contentPageCount, getImagePageCount()) - 1
  );
  state.previewPageIndex = clamp(state.previewPageIndex, 0, maxPageIndex);

  renderImagePreviews();
  drawScene(state.mouthOpen);
  setStatus(state.images.length ? "Image removed from the slide." : "All images removed from the slide.");
}

function getSelectedImageIndex() {
  if (
    Number.isInteger(state.imageEditor.activeIndex)
    && state.imageEditor.activeIndex >= 0
    && state.imageEditor.activeIndex < state.images.length
  ) {
    return state.imageEditor.activeIndex;
  }

  const visibleEntries = getImageEntriesForPage(state.previewPageIndex);
  if (visibleEntries.length) {
    return visibleEntries[visibleEntries.length - 1].index;
  }

  return state.images.length ? (state.images.length - 1) : -1;
}

function removeSelectedStageImage() {
  const imageIndex = getSelectedImageIndex();
  if (imageIndex < 0) {
    setStageMediaStatus("Select an image on the screen first.");
    return;
  }

  const fileName = state.images[imageIndex]?.fileName || "Selected image";
  removeImageAt(imageIndex);
  setStageMediaStatus(`${fileName} was removed from the presentation.`);
}

function clearAllStageImages() {
  if (!state.images.length) {
    setStageMediaStatus("There are no images to remove.");
    return;
  }

  state.images = [];
  state.imageEditor.activeIndex = -1;
  state.imageRenderBoxes = [];
  renderImagePreviews();
  drawScene(state.mouthOpen);
  setStatus("All images were removed from the slide.");
  setStageMediaStatus("All presentation images were removed.");
}

function removeActiveStageVideo() {
  const activeIndex = state.stageVideos.findIndex((item) => item.id === state.activeStageVideoId);
  if (activeIndex < 0) {
    setStageMediaStatus("There is no active video to remove.");
    return;
  }

  const fileName = state.stageVideos[activeIndex]?.fileName || "Active video";
  removeStageVideoAt(activeIndex);
  setStageMediaStatus(`${fileName} was removed from the presentation.`);
}

function updateStageMediaToolUi() {
  const imageIndex = getSelectedImageIndex();
  const selectedImage = imageIndex >= 0 ? state.images[imageIndex] : null;
  const hasActiveVideo = Boolean(state.stageVideo?.id);
  const activeVideo = hasActiveVideo ? state.stageVideo : null;
  const pdfContextMode = isPdfPresentationMode() && getPdfRenderMode() === "context";
  const exactPdfMode = isPdfPresentationMode() && getPdfRenderMode() === "exact";

  if (stageImageCutoutBtn) {
    stageImageCutoutBtn.disabled = isPdfPresentationMode() || !selectedImage || Boolean(selectedImage.cutoutApplied);
    setIconButtonState(stageImageCutoutBtn, "IMG-", "Remove image background");
  }

  if (stageImageRestoreBtn) {
    stageImageRestoreBtn.disabled = isPdfPresentationMode() || !selectedImage || !selectedImage.cutoutApplied;
    setIconButtonState(stageImageRestoreBtn, "IMG+", "Restore image");
  }

  if (stageVideoCutoutBtn) {
    stageVideoCutoutBtn.disabled = isPdfPresentationMode() || !activeVideo || Boolean(activeVideo.cutoutApplied);
    setIconButtonState(stageVideoCutoutBtn, "VID-", "Remove video background");
  }

  if (stageVideoRestoreBtn) {
    stageVideoRestoreBtn.disabled = isPdfPresentationMode() || !activeVideo || !activeVideo.cutoutApplied;
    setIconButtonState(stageVideoRestoreBtn, "VID+", "Restore video");
  }

  if (stageRemoveImageBtn) {
    stageRemoveImageBtn.disabled = isPdfPresentationMode() || !selectedImage;
  }
  
  if (stageAutoTeachBtn) {
    stageAutoTeachBtn.style.display = (isPdfPresentationMode() || !selectedImage) ? "none" : "block";
  }

  if (stageAutoBRollBtn) {
    stageAutoBRollBtn.style.display = isPdfPresentationMode() ? "none" : "block";
  }

  if (stageClearImagesBtn) {
    stageClearImagesBtn.disabled = isPdfPresentationMode() || !state.images.length;
  }

  if (stageRemoveVideoBtn) {
    stageRemoveVideoBtn.disabled = isPdfPresentationMode() || !activeVideo;
  }

  if (stageMediaStatus) {
    if (pdfContextMode && selectedImage) {
      setStageMediaStatus(`${selectedImage.fileName} is selected on narration page ${getImagePageIndexForItem(selectedImage, imageIndex) + 1}. Drag it anywhere on this PDF context page and use the corner handles to resize it. Removal and cutout stay locked while PDF narration is active.`);
    } else if (pdfContextMode && state.images.length) {
      setStageMediaStatus("PDF narration images can be dragged and resized on the current page. Removal and cutout stay locked while PDF narration is active.");
    } else if (exactPdfMode) {
      setStageMediaStatus("Exact PDF mode stays locked to the original page render. Switch to PDF Context to drag and resize example images.");
    } else if (selectedImage) {
      setStageMediaStatus(`${selectedImage.fileName} is selected on page ${getImagePageIndexForItem(selectedImage, imageIndex) + 1}. Drag it anywhere on the full slide, use the corner handles to resize, and hold Shift for free resize.`);
    } else if (activeVideo) {
      setStageMediaStatus(`${activeVideo.fileName} is active on the screen. You can remove it here.`);
    } else if (state.images.length) {
      setStageMediaStatus("Select an image on the screen to move or resize it across the full slide.");
    } else {
      setStageMediaStatus("Upload media, then place images anywhere on the presentation screen from this panel.");
    }
  }
}

function selectImageAt(index, options = {}) {
  if (index < 0 || index >= state.images.length) {
    return;
  }

  const activeIndex = options.bringToFront === false ? index : bringImageToFront(index);
  state.imageEditor.activeIndex = activeIndex;
  state.imageEditor.activeHandle = "";
  const targetPageIndex = getImagePageIndexForItem(state.images[activeIndex], activeIndex);
  if (options.moveToPage !== false) {
    state.previewPageIndex = targetPageIndex;
  }

  renderImagePreviews();
  updateStageMediaToolUi();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
}

function moveImageToCurrentPage(index) {
  if (index < 0 || index >= state.images.length) {
    return;
  }

  const targetPageIndex = Math.max(0, state.previewPageIndex);
  state.images[index] = clampImageFrame({
    ...state.images[index],
    pageIndex: targetPageIndex,
    x: NaN,
    y: NaN,
    width: NaN,
    height: NaN
  }, index);
  state.images = applyDefaultImageLayouts([...state.images]);
  selectImageAt(index);
  setStatus(`${state.images[index].fileName} will now show on page ${targetPageIndex + 1}.`);
}

async function restoreImageAt(index) {
  const item = state.images[index];
  if (!item?.originalDataUrl) {
    return;
  }

  state.images[index] = {
    ...item,
    dataUrl: item.originalDataUrl,
    image: await loadImageFromDataUrl(item.originalDataUrl),
    cutoutApplied: false,
    cutoutConfidence: 0
  };
}

async function applyBackgroundRemovalToSelectedImage() {
  const imageIndex = getSelectedImageIndex();
  if (imageIndex < 0) {
    setImageCutoutStatus("Select an image first.");
    return;
  }

  await applySmartCutoutToImageAt(imageIndex, true);
  selectImageAt(imageIndex, { moveToPage: false });
  setImageCutoutStatus(`${state.images[imageIndex].fileName} now uses background removal on the slide.`);
}

async function restoreSelectedImage() {
  const imageIndex = getSelectedImageIndex();
  if (imageIndex < 0) {
    setImageCutoutStatus("Select an image first.");
    return;
  }

  await restoreImageAt(imageIndex);
  selectImageAt(imageIndex, { moveToPage: false });
  setImageCutoutStatus(`${state.images[imageIndex].fileName} was restored to the original image.`);
}

async function applyBackgroundRemovalToActiveVideo() {
  if (!state.stageVideo?.id) {
    setVideoStatus("Select a video first.");
    return;
  }

  const activeIndex = state.stageVideos.findIndex((item) => item.id === state.stageVideo.id);
  if (activeIndex < 0) {
    setVideoStatus("Select a video first.");
    return;
  }

  const applied = await applySmartCutoutToStageVideoAt(activeIndex, true);
  renderStageVideoPreviewList();
  drawScene(state.mouthOpen);
  setVideoStatus(
    applied
      ? `${state.stageVideos[activeIndex].fileName} now uses background removal on the blue screen.`
      : `${state.stageVideos[activeIndex].fileName} did not have a clear green/plain background to remove.`
  );
}

function restoreActiveVideo() {
  if (!state.stageVideo?.id) {
    setVideoStatus("Select a video first.");
    return;
  }

  const activeIndex = state.stageVideos.findIndex((item) => item.id === state.stageVideo.id);
  if (activeIndex < 0) {
    setVideoStatus("Select a video first.");
    return;
  }

  state.stageVideos[activeIndex] = {
    ...state.stageVideos[activeIndex],
    cutoutApplied: false,
    cutoutConfidence: 0,
    cutoutKey: null,
    cutoutSurface: null
  };
  syncActiveStageVideo();
  renderStageVideoPreviewList();
  drawScene(state.mouthOpen);
  setVideoStatus(`${state.stageVideos[activeIndex].fileName} was restored to the original video.`);
}

function assignPageIndexesToNewImages(existingImages, loadedImages, startPageIndex) {
  const pageCounts = new Map();

  existingImages.forEach((item, index) => {
    const pageIndex = getImagePageIndexForItem(item, index);
    pageCounts.set(pageIndex, (pageCounts.get(pageIndex) || 0) + 1);
  });

  return loadedImages.map((item) => {
    let targetPageIndex = Number.isInteger(item?.pageIndex)
      ? Math.max(0, item.pageIndex)
      : Math.max(0, startPageIndex);

    while ((pageCounts.get(targetPageIndex) || 0) >= SLIDE_IMAGES_PER_PAGE) {
      targetPageIndex += 1;
    }

    pageCounts.set(targetPageIndex, (pageCounts.get(targetPageIndex) || 0) + 1);

    return {
      ...item,
      pageIndex: targetPageIndex
    };
  });
}

function renderMediaEmptyState(container, title, message) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const card = document.createElement("div");
  card.className = "media-empty-state";

  const heading = document.createElement("p");
  heading.className = "media-empty-title";
  heading.textContent = title;

  const body = document.createElement("p");
  body.className = "media-empty-copy";
  body.textContent = message;

  card.appendChild(heading);
  card.appendChild(body);
  container.appendChild(card);
  container.classList.remove("hidden");
}

function renderImagePreviewsLegacy() {
  imagePreviewList.innerHTML = "";

  if (!state.images.length) {
    renderMediaEmptyState(
      imagePreviewList,
      "No stage images yet",
      "Upload lesson images here. On the presentation screen you can select them, drag them anywhere on the full slide, and resize them from the corner handles."
    );
    setImageCutoutStatus("Smart cutout is ready for new image uploads.");
    updateStageMediaToolUi();
    return;
  }

  state.images.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "image-preview-card";
    card.classList.add("is-selectable");
    card.classList.toggle("is-active", index === getSelectedImageIndex());

    const img = document.createElement("img");
    img.src = item.dataUrl;
    img.alt = `Uploaded preview ${index + 1}`;
    img.loading = "lazy";

    const label = document.createElement("p");
    label.className = "image-preview-label";
    label.textContent = `${item.fileName} • P${getImagePageIndexForItem(item, index) + 1}`;

    card.appendChild(img);
    card.appendChild(label);
    imagePreviewList.appendChild(card);
  });

  imagePreviewList.classList.remove("hidden");
  updateStageMediaToolUi();
}

function renderImagePreviews() {
  imagePreviewList.innerHTML = "";

  if (!state.images.length) {
    renderMediaEmptyState(
      imagePreviewList,
      "No stage images yet",
      "Upload lesson images here. On the presentation screen you can select them, drag them anywhere on the full slide, and resize them from the corner handles."
    );
    setImageCutoutStatus("Smart cutout is ready for new image uploads.");
    updateStageMediaToolUi();
    return;
  }

  state.images.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "image-preview-card";
    card.classList.add("is-selectable");
    card.classList.toggle("is-active", index === getSelectedImageIndex());

    const img = document.createElement("img");
    img.src = item.dataUrl;
    img.alt = `Uploaded preview ${index + 1}`;
    img.loading = "lazy";

    const label = document.createElement("p");
    label.className = "image-preview-label";
    label.textContent = `${item.fileName} • P${getImagePageIndexForItem(item, index) + 1}`;

    const meta = document.createElement("p");
    meta.className = "image-preview-meta";
    meta.textContent = item.cutoutApplied
      ? `Cutout ready${item.cutoutConfidence ? ` • ${Math.round(item.cutoutConfidence * 100)}%` : ""}`
      : "Original image";

    const tools = document.createElement("div");
    tools.className = "image-preview-tools";

    const cutoutBtn = document.createElement("button");
    cutoutBtn.type = "button";
    cutoutBtn.className = "ghost-btn image-cutout-btn";
    cutoutBtn.textContent = item.cutoutApplied ? "Restore" : "Remove BG";
    cutoutBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      cutoutBtn.disabled = true;
      try {
        if (item.cutoutApplied && item.originalDataUrl) {
          await restoreImageAt(index);
          setImageCutoutStatus(`${item.fileName} was restored to the original image.`);
        } else {
          await applySmartCutoutToImageAt(index, true);
          setImageCutoutStatus(`${item.fileName} now uses background removal on the slide.`);
        }

        selectImageAt(index, { moveToPage: false });
      } catch (error) {
        console.error(error);
        setImageCutoutStatus(error.message || "Background removal could not finish for that image.");
      } finally {
        cutoutBtn.disabled = false;
      }
    });

    const showHereBtn = document.createElement("button");
    showHereBtn.type = "button";
    showHereBtn.className = "ghost-btn image-cutout-btn";
    showHereBtn.textContent = "Show Here";
    showHereBtn.disabled = isPdfPresentationMode() && isPinnedPdfExampleImage(item);
    showHereBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (showHereBtn.disabled) {
        return;
      }
      moveImageToCurrentPage(index);
    });

    tools.appendChild(cutoutBtn);
    tools.appendChild(showHereBtn);

    card.addEventListener("click", () => {
      selectImageAt(index);
      setImageCutoutStatus(`${item.fileName} is selected. Use Remove BG, Restore, or Show Here, then drag it anywhere on the slide.`);
    });

    card.appendChild(img);
    card.appendChild(label);
    card.appendChild(meta);
    card.appendChild(tools);
    imagePreviewList.appendChild(card);
  });

  imagePreviewList.classList.remove("hidden");
  updateStageMediaToolUi();
}

function getCanvasPoint(event) {
  const rect = previewCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return { x: 0, y: 0 };
  }

  return {
    x: (event.clientX - rect.left) * (previewCanvas.width / rect.width),
    y: (event.clientY - rect.top) * (previewCanvas.height / rect.height)
  };
}

function getImageHitTarget(point) {
  for (let index = state.imageRenderBoxes.length - 1; index >= 0; index -= 1) {
    const box = state.imageRenderBoxes[index];
    const matchingHandle = (box.handles || []).find((handle) => (
      point.x >= handle.x
      && point.x <= handle.x + handle.size
      && point.y >= handle.y
      && point.y <= handle.y + handle.size
    ));

    if (matchingHandle) {
      return { index: box.index, mode: "resize", handle: matchingHandle.name };
    }

    const insideBox = point.x >= box.x
      && point.x <= box.x + box.width
      && point.y >= box.y
      && point.y <= box.y + box.height;

    if (insideBox) {
      return { index: box.index, mode: "drag" };
    }
  }

  return null;
}

function getStageVideoHitTarget(point) {
  const box = state.stageVideoRenderBox;
  if (!box || !state.stageVideo.id) {
    return null;
  }

  const insideHandle = point.x >= box.handleX
    && point.x <= box.handleX + box.handleSize
    && point.y >= box.handleY
    && point.y <= box.handleY + box.handleSize;

  if (insideHandle) {
    return { id: box.id, mode: "resize" };
  }

  const insideBox = point.x >= box.x
    && point.x <= box.x + box.width
    && point.y >= box.y
    && point.y <= box.y + box.height;

  if (insideBox) {
    return { id: box.id, mode: "drag" };
  }

  return null;
}

function updateCanvasCursor(point) {
  const exactPdfMode = isPdfPresentationMode() && getPdfRenderMode() === "exact";
  if (stagePanel.classList.contains("hidden") || exactPdfMode) {
    previewCanvas.style.cursor = "default";
    state.imageEditor.hoverIndex = -1;
    state.imageEditor.hoverMode = "";
    state.imageEditor.activeHandle = "";
    state.stageVideoEditor.hoverMode = "";
    return;
  }

  const imageHit = point ? getImageHitTarget(point) : null;
  const videoHit = !isPdfPresentationMode() && !imageHit && point ? getStageVideoHitTarget(point) : null;
  const hitMode = videoHit?.mode || imageHit?.mode || "";
  state.stageVideoEditor.hoverMode = videoHit?.mode || "";
  state.imageEditor.hoverIndex = imageHit ? imageHit.index : -1;
  state.imageEditor.hoverMode = imageHit ? imageHit.mode : "";
  state.imageEditor.activeHandle = imageHit?.handle || "";
  previewCanvas.style.cursor = hitMode === "resize"
    ? getResizeCursorForHandle(imageHit?.handle || "se")
    : hitMode === "drag"
      ? "move"
      : "default";
}

function beginImageInteraction(event) {
  const exactPdfMode = isPdfPresentationMode() && getPdfRenderMode() === "exact";
  if (stagePanel.classList.contains("hidden") || exactPdfMode) {
    return;
  }

  const point = getCanvasPoint(event);
  
  if (state.whiteboard.enabled) {
    state.whiteboard.drawing = true;
    state.whiteboard.currentStroke = [point];
    if (typeof previewCanvas.setPointerCapture === "function") {
      try { previewCanvas.setPointerCapture(event.pointerId); } catch(e) {}
    }
    drawScene(state.mouthOpen);
    return;
  }

  const imageHit = getImageHitTarget(point);
  const videoHit = isPdfPresentationMode() || imageHit ? null : getStageVideoHitTarget(point);
  if (videoHit) {
    const video = clampStageVideoFrame(state.stageVideo);
    commitStageVideoUpdate(video.id, video);
    state.stageVideoEditor = {
      ...state.stageVideoEditor,
      activeId: video.id,
      hoverMode: videoHit.mode,
      mode: videoHit.mode,
      pointerId: event.pointerId,
      startPointerX: point.x,
      startPointerY: point.y,
      startX: video.frameX,
      startY: video.frameY,
      startWidth: video.frameWidth,
      startHeight: video.frameHeight
    };
    state.imageEditor.activeIndex = -1;

    if (typeof previewCanvas.setPointerCapture === "function") {
      try {
        previewCanvas.setPointerCapture(event.pointerId);
      } catch (error) {
        console.error(error);
      }
    }

    event.preventDefault();
    drawScene(state.mouthOpen);
    return;
  }

  const hit = imageHit;

  if (!hit) {
    if (state.imageEditor.activeIndex !== -1) {
      state.imageEditor.activeIndex = -1;
      renderImagePreviews();
      updateStageMediaToolUi();
      drawScene(state.mouthOpen);
    }
    updateCanvasCursor(point);
    return;
  }

  const image = clampImageFrame(state.images[hit.index], hit.index);
  state.images[hit.index] = image;
  const activeIndex = bringImageToFront(hit.index);
  const activeImage = clampImageFrame(state.images[activeIndex], activeIndex);
  state.images[activeIndex] = activeImage;
  state.imageEditor = {
    ...state.imageEditor,
    activeIndex,
    hoverIndex: activeIndex,
    hoverMode: hit.mode,
    activeHandle: hit.handle || "",
    mode: hit.mode,
    pointerId: event.pointerId,
    startPointerX: point.x,
    startPointerY: point.y,
    startX: activeImage.x,
    startY: activeImage.y,
    startWidth: activeImage.width,
    startHeight: activeImage.height,
    startAspectRatio: activeImage.aspectRatio
  };

  renderImagePreviews();
  updateStageMediaToolUi();

  if (typeof previewCanvas.setPointerCapture === "function") {
    try {
      previewCanvas.setPointerCapture(event.pointerId);
    } catch (error) {
      console.error(error);
    }
  }

  event.preventDefault();
  drawScene(state.mouthOpen);
}

function moveImageInteraction(event) {
  const point = getCanvasPoint(event);
  
  if (state.whiteboard.drawing && state.whiteboard.enabled) {
      state.whiteboard.currentStroke.push(point);
      event.preventDefault();
      drawScene(state.mouthOpen);
      return;
  }

  const editor = state.imageEditor;
  const videoEditor = state.stageVideoEditor;

  if (videoEditor.mode && videoEditor.activeId) {
    const video = clampStageVideoFrame(state.stageVideo);
    const workspace = getStageVideoDrawArea();
    if (!workspace) {
      return;
    }

    const dx = point.x - videoEditor.startPointerX;
    const dy = point.y - videoEditor.startPointerY;

    if (videoEditor.mode === "drag") {
      commitStageVideoUpdate(video.id, clampStageVideoFrame({
        ...video,
        frameX: videoEditor.startX + dx,
        frameY: videoEditor.startY + dy
      }));
    } else if (videoEditor.mode === "resize") {
      const aspectRatio = video.aspectRatio;
      const widthFromX = videoEditor.startWidth + dx;
      const widthFromY = videoEditor.startWidth + (dy * aspectRatio);
      const widthDelta = Math.abs(widthFromX - videoEditor.startWidth) >= Math.abs(widthFromY - videoEditor.startWidth)
        ? (widthFromX - videoEditor.startWidth)
        : (widthFromY - videoEditor.startWidth);
      const requestedWidth = videoEditor.startWidth + widthDelta;
      const maxWidth = Math.min(
        workspace.x + workspace.width - videoEditor.startX,
        (workspace.y + workspace.height - videoEditor.startY) * aspectRatio
      );

      commitStageVideoUpdate(video.id, clampStageVideoFrame({
        ...video,
        frameX: videoEditor.startX,
        frameY: videoEditor.startY,
        frameWidth: clamp(requestedWidth, 140, Math.max(140, maxWidth)),
        frameHeight: clamp(requestedWidth, 140, Math.max(140, maxWidth)) / aspectRatio
      }));
    }

    event.preventDefault();
    drawScene(state.mouthOpen);
    return;
  }

  if (!editor.mode || editor.activeIndex < 0 || !state.images[editor.activeIndex]) {
    updateCanvasCursor(point);
    return;
  }

  const activeItem = state.images[editor.activeIndex];
  const activePageIndex = getImagePageIndexForItem(activeItem, editor.activeIndex);
  const workspace = getSlideImageWorkspace(activePageIndex, true);
  if (!workspace) {
    return;
  }

  const dx = point.x - editor.startPointerX;
  const dy = point.y - editor.startPointerY;
  const image = normalizeImageFrame(state.images[editor.activeIndex], editor.activeIndex);

  if (editor.mode === "drag") {
    state.images[editor.activeIndex] = clampImageFrame({
      ...image,
      x: editor.startX + dx,
      y: editor.startY + dy
    }, editor.activeIndex);
  } else if (editor.mode === "resize") {
    const aspectRatio = editor.startAspectRatio || image.aspectRatio || 1;
    const freeResize = event.shiftKey === true;
    const handle = editor.activeHandle || "se";
    const workspaceRight = workspace.x + workspace.width;
    const workspaceBottom = workspace.y + workspace.height;
    const startRight = editor.startX + editor.startWidth;
    const startBottom = editor.startY + editor.startHeight;

    if (freeResize) {
      let left = /w/.test(handle) ? editor.startX + dx : editor.startX;
      let top = /n/.test(handle) ? editor.startY + dy : editor.startY;
      let right = /e/.test(handle) ? startRight + dx : startRight;
      let bottom = /s/.test(handle) ? startBottom + dy : startBottom;

      if (/w/.test(handle)) {
        left = clamp(left, workspace.x, startRight - STAGE_IMAGE_MIN_WIDTH_PX);
      }
      if (/n/.test(handle)) {
        top = clamp(top, workspace.y, startBottom - STAGE_IMAGE_MIN_HEIGHT_PX);
      }
      if (/e/.test(handle)) {
        right = clamp(right, editor.startX + STAGE_IMAGE_MIN_WIDTH_PX, workspaceRight);
      }
      if (/s/.test(handle)) {
        bottom = clamp(bottom, editor.startY + STAGE_IMAGE_MIN_HEIGHT_PX, workspaceBottom);
      }

      state.images[editor.activeIndex] = clampImageFrame({
        ...image,
        x: left,
        y: top,
        width: Math.max(STAGE_IMAGE_MIN_WIDTH_PX, right - left),
        height: Math.max(STAGE_IMAGE_MIN_HEIGHT_PX, bottom - top),
        freeResize: true
      }, editor.activeIndex, { freeResize: true });
    } else {
      const anchorX = /w/.test(handle) ? startRight : editor.startX;
      const anchorY = /n/.test(handle) ? startBottom : editor.startY;
      const pointerWidth = Math.abs(point.x - anchorX);
      const pointerHeight = Math.abs(point.y - anchorY);
      const requestedWidth = Math.max(pointerWidth, pointerHeight * aspectRatio);
      const maxWidth = /w/.test(handle)
        ? /n/.test(handle)
          ? Math.min(anchorX - workspace.x, (anchorY - workspace.y) * aspectRatio)
          : Math.min(anchorX - workspace.x, (workspaceBottom - anchorY) * aspectRatio)
        : /n/.test(handle)
          ? Math.min(workspaceRight - anchorX, (anchorY - workspace.y) * aspectRatio)
          : Math.min(workspaceRight - anchorX, (workspaceBottom - anchorY) * aspectRatio);
      const width = clamp(requestedWidth, STAGE_IMAGE_MIN_WIDTH_PX, Math.max(STAGE_IMAGE_MIN_WIDTH_PX, maxWidth));
      const height = width / aspectRatio;

      state.images[editor.activeIndex] = clampImageFrame({
        ...image,
        x: /w/.test(handle) ? anchorX - width : anchorX,
        y: /n/.test(handle) ? anchorY - height : anchorY,
        width,
        height,
        freeResize: false
      }, editor.activeIndex);
    }
  }

  updateStageMediaToolUi();
  event.preventDefault();
  drawScene(state.mouthOpen);
}

function endImageInteraction(event) {
  if (state.whiteboard.drawing) {
     if (state.whiteboard.currentStroke.length > 0) {
        state.whiteboard.strokes.push({
           color: state.whiteboard.color,
           width: state.whiteboard.lineWidth,
           points: [...state.whiteboard.currentStroke]
        });
     }
     state.whiteboard.currentStroke = [];
     state.whiteboard.drawing = false;
     if (typeof previewCanvas.releasePointerCapture === "function" && event && event.pointerId !== undefined) {
       try { previewCanvas.releasePointerCapture(event.pointerId); } catch(e) {}
     }
     drawScene(state.mouthOpen);
     return;
  }

  if (!state.imageEditor.mode && !state.stageVideoEditor.mode) {
    return;
  }

  const pointerId = state.stageVideoEditor.pointerId ?? state.imageEditor.pointerId;
  if (typeof previewCanvas.releasePointerCapture === "function" && pointerId !== null) {
    try {
      previewCanvas.releasePointerCapture(pointerId);
    } catch (error) {
      console.error(error);
    }
  }

  state.imageEditor.mode = "";
  state.imageEditor.pointerId = null;
  state.imageEditor.activeHandle = "";
  state.stageVideoEditor.mode = "";
  state.stageVideoEditor.pointerId = null;
  syncImageLayouts();
  updateCanvasCursor(event ? getCanvasPoint(event) : null);
  renderImagePreviews();
  updateStageMediaToolUi();
  drawScene(state.mouthOpen);
}

function getSupportedAudioMimeType() {
  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus"
  ];

  return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function clearRecordingSession() {
  if (state.recording.stream) {
    state.recording.stream.getTracks().forEach((track) => track.stop());
  }

  state.recording = {
    recorder: null,
    chunks: [],
    stream: null
  };

  setRecordingUi(false);
}

function teardownAudioGraph() {
  if (state.audioGraph?.sourceNode) {
    state.audioGraph.sourceNode.disconnect();
  }

  if (state.audioGraph?.analyser) {
    state.audioGraph.analyser.disconnect();
  }

  if (state.audioGraph?.gainNode) {
    state.audioGraph.gainNode.disconnect();
  }

  state.audioGraph = null;
}

function stopActiveAudio() {
  if (state.activeAudio) {
    state.activeAudio.pause();
    state.activeAudio.removeAttribute("src");
    state.activeAudio.load();
    if (state.activeAudio.dataset?.runtimeAudio === "true") {
      state.activeAudio.remove();
    }
    state.activeAudio = null;
  }

  if (state.activeMusic) {
    state.activeMusic.pause();
    state.activeMusic.removeAttribute("src");
    state.activeMusic.load();
    if (state.activeMusic.dataset?.runtimeAudio === "true") {
      state.activeMusic.remove();
    }
    state.activeMusic = null;
  }

  teardownAudioGraph();
}

function stopPlayback(restoreFullText = true) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  clearTypingInterval();
  cancelVisualLoop();
  if (state.introPlayback.element) {
    state.introPlayback.element.pause();
    try {
      state.introPlayback.element.currentTime = 0;
    } catch (error) {
      console.error(error);
    }
  }
  state.introPlayback.active = false;
  state.introPlayback.previewVisible = false;
  stopActiveAudio();
  state.speechUtterance = null;
  state.speaking = false;
  state.mouthOpen = 0.12;
  state.contentScrollOffset = 0;

  if (isPdfPresentationMode()) {
    state.pdf.paused = false;
    state.pdf.audioDriven = false;
    state.pdf.timelineStartedAt = 0;
    state.pdf.timelineStartOffsetMs = 0;

    if (restoreFullText) {
      state.pdf.currentTimeMs = 0;
    }

    syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
    updatePlaybackProgressUi(
      state.pdf.totalDurationMs ? (state.pdf.currentTimeMs / state.pdf.totalDurationMs) : 0,
      false
    );
    updateStageTimelineUi();
    updateStageModeUi();
    drawScene(state.mouthOpen);
    return;
  }

  if (restoreFullText) {
    state.displayedText = state.text;
  }

  updatePlaybackProgressUi(restoreFullText ? 0 : getDisplayedTextProgress(), false);
  drawScene(state.mouthOpen);
  if (state.stageVideo.element && !stagePanel.classList.contains("hidden")) {
    void startStageVideoPlayback();
  } else {
    ensureStageMediaLoop();
  }
}

function finishPlayback(message) {
  clearTypingInterval();
  cancelVisualLoop();
  if (state.introPlayback.element) {
    state.introPlayback.element.pause();
    try {
      state.introPlayback.element.currentTime = 0;
    } catch (error) {
      console.error(error);
    }
  }
  state.introPlayback.active = false;
  state.introPlayback.previewVisible = false;
  stopActiveAudio();
  state.speechUtterance = null;
  state.speaking = false;
  state.mouthOpen = 0.12;
  state.contentScrollOffset = 0;

  if (isPdfPresentationMode()) {
    state.pdf.paused = false;
    state.pdf.audioDriven = false;
    state.pdf.timelineStartedAt = 0;
    state.pdf.timelineStartOffsetMs = 0;
    state.pdf.currentTimeMs = state.pdf.totalDurationMs;
    syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
    updatePlaybackProgressUi(1, false);
    updateStageTimelineUi();
    updateStageModeUi();
    drawScene(0.12);
    setStatus(message);
    return;
  }

  state.displayedText = state.text;
  updatePlaybackProgressUi(1, false);
  drawScene(0.12);
  if (state.stageVideo.element && !stagePanel.classList.contains("hidden")) {
    void startStageVideoPlayback();
  } else {
    ensureStageMediaLoop();
  }
  setStatus(message);
}

function createLoadedAudio(url) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "auto";
    audio.src = url;
    audio.playsInline = true;
    audio.dataset.runtimeAudio = "true";
    audio.classList.add("hidden");
    audio.setAttribute("aria-hidden", "true");
    document.body.appendChild(audio);

    const handleLoaded = () => resolve(audio);
    const handleError = () => {
      audio.remove();
      reject(new Error("The narration audio could not be loaded."));
    };

    if (audio.readyState >= 1) {
      resolve(audio);
      return;
    }

    audio.addEventListener("loadedmetadata", handleLoaded, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    audio.load();
  });
}

async function startBackgroundMusicPlayback() {
  if (!state.music.enabled || !state.music.url) {
    return null;
  }

  const musicAudio = await createLoadedAudio(state.music.url);
  musicAudio.loop = true;
  musicAudio.volume = Math.min(STRICT_BACKGROUND_MUSIC_VOLUME, Number(state.music.volume) || STRICT_BACKGROUND_MUSIC_VOLUME);
  state.activeMusic = musicAudio;

  try {
    await musicAudio.play();
  } catch (error) {
    console.error(error);
  }

  return musicAudio;
}

async function ensureAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!state.audioContext) {
    state.audioContext = new AudioContextConstructor();
  }

  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }

  return state.audioContext;
}

async function connectAudioGraph(audioElement, includeExportTrack = false, monitorGain = 1) {
  const audioContext = await ensureAudioContext();
  if (!audioContext) {
    state.audioGraph = null;
    return null;
  }

  try {
    teardownAudioGraph();

    const sourceNode = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = monitorGain;
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;

    sourceNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let exportDestination = null;
    if (includeExportTrack) {
      exportDestination = audioContext.createMediaStreamDestination();
      gainNode.connect(exportDestination);
    }

    state.audioGraph = {
      sourceNode,
      analyser,
      gainNode,
      exportDestination
    };

    return state.audioGraph;
  } catch (error) {
    console.error(error);
    state.audioGraph = null;
    return null;
  }
}

async function ensureCanvasReadyForExport() {
  let shouldRedraw = false;

  if (!isCanvasOriginClean()) {
    resetCanvasSurface();
    shouldRedraw = true;
  }

  if (window.INFO_KIDS_LOGO_DATA_URI && (!stageLogoImage.src || stageLogoImage.src !== window.INFO_KIDS_LOGO_DATA_URI)) {
    await loadImageElementSource(stageLogoImage, window.INFO_KIDS_LOGO_DATA_URI);
    shouldRedraw = true;
  }

  if (state.images.length) {
    state.images = await Promise.all(
      state.images.map(async (item) => ({
        ...item,
        image: await loadImageFromDataUrl(item.dataUrl)
      }))
    );
    shouldRedraw = true;
  }

  state.exportFallbackMode = false;

  if (shouldRedraw) {
    drawScene(state.mouthOpen);
  }

  if (!isCanvasOriginClean()) {
    state.exportFallbackMode = true;
    resetCanvasSurface();
    drawScene(state.mouthOpen);
  }

  if (!isCanvasOriginClean()) {
    throw new Error("The slide contains an image source that the browser will not allow in video export.");
  }
}

function sampleAudioEnergy() {
  if (!state.audioGraph?.analyser) {
    return null;
  }

  const buffer = new Uint8Array(state.audioGraph.analyser.fftSize);
  state.audioGraph.analyser.getByteTimeDomainData(buffer);

  let total = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const value = (buffer[i] - 128) / 128;
    total += value * value;
  }

  return Math.sqrt(total / buffer.length);
}

function getAudioDrivenMouth() {
  const energy = sampleAudioEnergy();
  if (energy === null) {
    return null;
  }

  // Increased amplitude to make lip movement feel more normal/exaggerated like a human speaking
  return clamp(0.08 + energy * 4.5, 0.08, 0.85); 
}

function getFallbackMouth(elapsedMs) {
  const time = elapsedMs / 185;
  const pulse = (Math.sin(time) + 1) / 2;
  const sway = (Math.sin((time * 0.72) + 0.6) + 1) / 2;
  // Make the fallback mouth movement more expressive
  return clamp(0.08 + pulse * 0.25 + sway * 0.15, 0.08, 0.55);
}

function startSpeechLipLoop() {
  const startedAt = performance.now();

  const tick = () => {
    if (!state.speaking) {
      return;
    }

    state.mouthOpen = getFallbackMouth(performance.now() - startedAt);
    drawScene(state.mouthOpen);
    state.animationFrame = requestAnimationFrame(tick);
  };

  state.animationFrame = requestAnimationFrame(tick);
}

function startTypingFallback(totalDurationMs) {
  if (!state.tokens.length) {
    return;
  }

  clearTypingInterval();
  const stepMs = Math.max(24, Math.floor(totalDurationMs / state.tokens.length));
  let index = 0;

  state.typingInterval = setInterval(() => {
    index += 1;
    setDisplayedTokenCount(index);

    if (index >= state.tokens.length) {
      clearTypingInterval();
    }
  }, stepMs);
}

function startNarrationLoop(audioElement) {
  let lastRenderAt = 0;
  let lastRenderedMouth = state.mouthOpen;
  const durationMs = Math.max(
    1000,
    Math.round(
      Number.isFinite(audioElement.duration)
        ? (audioElement.duration * 1000)
        : (state.narration.durationMs || getDefaultNarrationDurationMs())
    )
  );
  const visualLagMs = Math.max(0, Math.round((Number(SPEECH_SYNC_VISUAL_PROGRESS_LAG) || 0) * 1000));

  const tick = () => {
    if (!state.speaking || !state.activeAudio) {
      return;
    }

    const nowMs = performance.now();
    const elapsedMs = Math.max(0, (audioElement.currentTime || 0) * 1000);
    const syncElapsedMs = Math.max(0, elapsedMs - visualLagMs);
    const progress = durationMs ? clamp(elapsedMs / durationMs, 0, 1) : 0;
    const previousText = state.displayedText;
    const syncFrame = getSpeechSyncFrame(state.text, syncElapsedMs, durationMs);
    state.displayedText = syncFrame.displayedText;
    syncLessonPlaybackProgressUi(progress, true);

    if (state.exportingVideo) {
      updateTaskProgressUi(0.26 + (progress * 0.54), true, { mirrorStage: true });
    }

    const audioMouth = getAudioDrivenMouth();
    const nextMouth = (audioMouth !== null && audioMouth > 0.11 && syncFrame.mouthActive)
      ? clamp(audioMouth, 0.08, 0.48)
      : syncFrame.mouthActive
      ? (audioMouth ?? getFallbackMouth(syncFrame.speechElapsedMs))
      : 0.12;
    state.mouthOpen = nextMouth;
    if (shouldRenderAnimatedSceneFrame(nowMs, {
      force: previousText !== state.displayedText || progress >= 0.995,
      lastRenderAt,
      mouthDelta: nextMouth - lastRenderedMouth
    })) {
      drawScene(state.mouthOpen);
      lastRenderAt = nowMs;
      lastRenderedMouth = state.mouthOpen;
    }

    if (!audioElement.ended) {
      state.animationFrame = requestAnimationFrame(tick);
    }
  };

  state.animationFrame = requestAnimationFrame(tick);
}

async function playNarrationAudio() {
  stopPlayback(false);
  resetTaskProgressUi();
  state.displayedText = "";
  syncLessonPlaybackProgressUi(0, true);
  drawScene(0.12);

  try {
    if (state.stageVideo.element) {
      await startStageVideoPlayback({ restart: true });
    }

    const audioElement = await createLoadedAudio(state.narration.url);
    applyNaturalVoicePlayback(audioElement, getLessonPlaybackRate());
    audioElement.muted = false;
    audioElement.volume = STRICT_VOICE_VOLUME;
    state.activeAudio = audioElement;
    await connectAudioGraph(audioElement, false);
    await startBackgroundMusicPlayback();

    audioElement.addEventListener("ended", () => {
      window.setTimeout(() => {
        finishPlayback("Playback complete. The narration finished.");
      }, STRICT_SCENE_END_BUFFER_MS);
    }, { once: true });

    audioElement.addEventListener("error", () => {
      finishPlayback("Narration playback failed. Please upload or record the audio again.");
    }, { once: true });

    state.speaking = true;
    setStatus(`The slide is reading with ${state.narration.source.toLowerCase()} audio at ${getLessonPlaybackRate()}x with strict word sync.`);
    const started = await playAudioWithRecovery(audioElement, { volume: STRICT_VOICE_VOLUME });
    if (!started) {
      throw new Error("The narration audio could not start in this browser.");
    }
    startNarrationLoop(audioElement);
  } catch (error) {
    console.error(error);
    finishPlayback(error.message || "Narration playback failed.");
    setStatus("Generated Anjali playback failed. The app did not switch to another voice. Generate Anjali narration again or restart the local Anjali voice server on port 8426.");
  }
}

function playSpeechFallback() {
  stopPlayback(false);
  state.displayedText = "";
  drawScene(0.12);

  if (!("speechSynthesis" in window)) {
    setStatus("This browser does not support speech playback. Record or upload narration instead.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(buildNarrationText(state.text));
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => /female|zira|samantha|aria|google us english/i.test(voice.name));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = getVoiceSpecificPreviewRate("female", getLessonPlaybackRate());
  utterance.pitch = 1.08;
  utterance.volume = STRICT_VOICE_VOLUME;
  const estimatedDurationMs = getDefaultNarrationDurationMs();

  utterance.onstart = () => {
    state.speaking = true;
    syncLessonPlaybackProgressUi(0, true);
    if (state.stageVideo.element) {
      void startStageVideoPlayback({ restart: true });
    }
    startBackgroundMusicPlayback().catch((error) => console.error(error));
    setStatus(`The slide is reading with the browser voice at ${getLessonPlaybackRate()}x because generated narration is unavailable right now.`);
    const startedAt = performance.now();

    const tick = () => {
      if (!state.speaking) {
        return;
      }

      const elapsed = performance.now() - startedAt;
      const progress = clamp(elapsed / estimatedDurationMs, 0, 1);
      const syncFrame = getSpeechSyncFrame(state.text, elapsed, estimatedDurationMs);
      state.displayedText = syncFrame.displayedText;
      syncLessonPlaybackProgressUi(progress, true);
      state.mouthOpen = syncFrame.mouthActive ? getFallbackMouth(syncFrame.speechElapsedMs) : 0.12;
      drawScene(state.mouthOpen);

      if (progress < 1) {
        state.animationFrame = requestAnimationFrame(tick);
      }
    };

    state.animationFrame = requestAnimationFrame(tick);
  };

  utterance.onend = () => {
    window.setTimeout(() => {
      finishPlayback("Playback complete. Start the local narration server if you want matching generated audio for download.");
    }, STRICT_SCENE_END_BUFFER_MS);
  };

  utterance.onerror = () => {
    finishPlayback("Browser speech playback was interrupted.");
  };

  state.speechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function hasFreshGeneratedAnjaliNarration(currentText = "") {
  const safeText = String(currentText || "").trim();
  return Boolean(
    state.narration.url
    && state.narration.blob
    && state.narration.voice === "anjali"
    && state.narration.textSource === safeText
    && !isNarrationDurationTooShortForText(buildNarrationText(safeText), state.narration.durationMs, "anjali")
    && /generated anjali narration/i.test(state.narration.source || "")
  );
}

async function ensureNarrationReadyForSlide(options = {}) {
  const currentText = commitLatestLessonText();
  if (!ensureLessonTextIsReady(currentText)) {
    throw new Error("The lesson text is not ready for narration.");
  }
  if (hasFreshGeneratedAnjaliNarration(currentText)) {
    return;
  }

  const voice = "anjali";
  const label = `Generated ${getNarrationVoiceLabel(voice).toLowerCase()} narration`;
  const fileName = `generated-${voice}-narration.wav`;
  let syncProfile = null;
  const blob = await requestNarrationBlob(currentText, voice, {
    ...options,
    onSyncProfile: (profile) => {
      syncProfile = profile;
      if (typeof options.onSyncProfile === "function") {
        options.onSyncProfile(profile);
      }
    }
  });
  await setNarrationFromBlob(blob, fileName, label, currentText, voice, { syncProfile });
}

async function playSlide() {
  const currentText = commitLatestLessonText();
  if (!isPdfPresentationMode() && shouldPreferPdfScreenFromInput()) {
    const ready = await loadSelectedPdf();
    if (!ready) {
      return;
    }

    showPdfScreen("context");
  }

  if (isPdfPresentationMode()) {
    await playPdfPresentation();
    return;
  }

  if (!ensureLessonTextIsReady(currentText)) {
    return;
  }

  stopDictation(false);
  stopInputPreview(false);

  const canReuseExistingNarration = hasFreshGeneratedAnjaliNarration(currentText);

  if (canReuseExistingNarration) {
    await playIntroClipIfEnabled();
    playNarrationAudio();
    return;
  }

  try {
    setStatus("Preparing narration for live playback...");
    updateTaskProgressUi(0.2, true, { mirrorStage: true });
    await ensureNarrationReadyForSlide({
      timeoutMs: getLongNarrationRequestTimeoutMs(currentText)
    });
    updateTaskProgressUi(0.62, true, { mirrorStage: true, label: state.introPlayback.enabled ? "Narration ready. Playing intro clip..." : "Narration ready. Starting playback..." });
    await playIntroClipIfEnabled();
    updateTaskProgressUi(0.88, true, { mirrorStage: true });
    resetTaskProgressUi();
    playNarrationAudio();
  } catch (error) {
    console.error(error);
    resetTaskProgressUi();
    setStatus("The Anjali voice server is unavailable, so playback could not start. Start the local Anjali voice server on port 8426 and try again.");
    return;
  }
}

async function openPreviewVoiceChooser() {
  const text = getEffectiveLessonText();
  const lessonIssue = getLessonTextIssue(text);
  if (lessonIssue) {
    setSpeechToolsStatus(lessonIssue.message);
    updateSpeechToolsUi();
    return;
  }

  stopPlayback(false);
  stopDictation(false);
  setPreviewVoiceChooserVisible(false);
  await startTextPreview("anjali");
}

async function startTextPreview(voicePreference) {
  const text = getEffectiveLessonText();
  const lessonIssue = getLessonTextIssue(text);
  if (lessonIssue) {
    setSpeechToolsStatus(lessonIssue.message);
    updateSpeechToolsUi();
    return;
  }

  stopPlayback(false);
  stopDictation(false);
  stopInputPreview(false);
  state.preferredNarrationVoice = "anjali";
  updatePreferredVoiceUi();

  const voiceLabel = getNarrationVoiceLabel("anjali");
  try {
    await playServerBackedTextPreview(text, "anjali");
    return;
  } catch (error) {
    console.error(error);
  }

  setSpeechToolsStatus(`${voiceLabel} voice preview needs the local Anjali voice server on port 8426.`);
  updateSpeechToolsUi();
}

function startDictation() {
  const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();
  if (!SpeechRecognitionConstructor) {
    setSpeechToolsStatus("Speech to text is not supported in this browser. Use Chrome or Edge.");
    updateSpeechToolsUi();
    return;
  }

  stopPlayback(false);
  stopInputPreview(false);

  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = navigator.language || "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  state.dictation = {
    recognition,
    active: true,
    baseText: lessonInput.value,
    finalTranscript: ""
  };

  recognition.onstart = () => {
    state.dictation.active = true;
    setSpeechToolsStatus("Speech to text is listening. Speak now to fill the content box.");
    updateSpeechToolsUi();
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript.trim();
      if (!transcript) {
        continue;
      }

      if (event.results[index].isFinal) {
        state.dictation.finalTranscript = `${state.dictation.finalTranscript} ${transcript}`.trim();
      } else {
        interimTranscript = `${interimTranscript} ${transcript}`.trim();
      }
    }

    lessonInput.value = mergeSpeechText(
      state.dictation.baseText,
      `${state.dictation.finalTranscript} ${interimTranscript}`.trim()
    );

    handleLessonInputChange();
  };

  recognition.onerror = (event) => {
    state.dictation.active = false;
    state.dictation.recognition = null;

    if (event.error === "not-allowed") {
      setSpeechToolsStatus("Microphone permission was blocked for speech to text.");
    } else {
      setSpeechToolsStatus(`Speech to text error: ${event.error}.`);
    }

    updateSpeechToolsUi();
  };

  recognition.onend = () => {
    state.dictation.active = false;
    state.dictation.recognition = null;
    setSpeechToolsStatus("Speech to text stopped. You can start again or continue typing.");
    updateSpeechToolsUi();
  };

  recognition.start();
  updateSpeechToolsUi();
}

function generateAndDownloadSrtCaptions(introOffsetMs = 0) {
  const timeline = state.narration?.syncProfile?.timeline || [];
  if (!timeline.length) return;

  const formatSrtTimeMs = (ms) => {
    const d = new Date(ms);
    const hs = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const s = d.getUTCSeconds().toString().padStart(2, '0');
    const ms2 = (ms % 1000).toString().padStart(3, '0');
    return `${hs}:${m}:${s},${ms2}`;
  };

  let srtStr = "";
  let counter = 1;
  let chunkText = [];
  let chunkStartMs = timeline[0].startMs + introOffsetMs;
  let chunkEndMs = 0;

  timeline.forEach((item, index) => {
    chunkText.push(item.text);
    chunkEndMs = item.startMs + item.lengthMs + introOffsetMs;

    const hasPunctuation = /[.,?!]/.test(item.text);
    const isLast = index === timeline.length - 1;
    if (chunkText.length >= 7 || hasPunctuation || isLast) {
      srtStr += `${counter}\n`;
      srtStr += `${formatSrtTimeMs(chunkStartMs)} --> ${formatSrtTimeMs(chunkEndMs)}\n`;
      srtStr += `${chunkText.join(" ")}\n\n`;
      counter++;

      chunkText = [];
      if (!isLast) chunkStartMs = timeline[index + 1].startMs + introOffsetMs;
    }
  });

  const srtBlob = new Blob([srtStr], { type: "text/srt" });
  triggerFileDownload(srtBlob, "captions.srt");
}

let unlockAudioContext = null;
let unlockOscillator = null;

function preventBackgroundThrottling() {
  try {
    if (!unlockAudioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) unlockAudioContext = new AudioCtx();
    }
    if (unlockAudioContext && unlockAudioContext.state === 'suspended') {
      unlockAudioContext.resume();
    }
    if (unlockAudioContext && !unlockOscillator) {
      unlockOscillator = unlockAudioContext.createOscillator();
      const gain = unlockAudioContext.createGain();
      gain.gain.value = 0.001; 
      unlockOscillator.connect(gain);
      gain.connect(unlockAudioContext.destination);
      unlockOscillator.start();
    }
  } catch(e) {}
}

function allowBackgroundThrottling() {
  try {
    if (unlockOscillator) {
      unlockOscillator.stop();
      unlockOscillator.disconnect();
      unlockOscillator = null;
    }
  } catch(e) {}
}

async function exportPdfModeVideo(renderMode = "context") {
  preventBackgroundThrottling();
  if (!getPdfSelectedPageCount()) {
    setStatus("Select at least one PDF page before downloading the PDF video.");
    allowBackgroundThrottling();
    return;
  }

  if (!canExportVideo()) {
    setStatus("Video export is not supported in this browser. Please use the latest Chrome or Edge.");
    return;
  }

  const normalizedRenderMode = renderMode === "exact" ? "exact" : "context";
  const modeLabel = normalizedRenderMode === "exact" ? "exact PDF" : "PDF context";
  const outputFileName = normalizedRenderMode === "exact"
    ? "pdf-presentation-video.mp4"
    : "selected-pdf-context-video.mp4";
  const effectiveExportQuality = getEffectiveExportQuality();
  const exportQualityLabel = getExportQualityLabel(effectiveExportQuality);
  const pdfTimelineDurationMs = Math.max(1000, Math.round(state.pdf.totalDurationMs || 1000));
  const pdfExportTargetDurationMs = pdfTimelineDurationMs + getExportCompletionTailMs();
  const pdfBaseCaptureRate = getPdfExportCaptureRate(normalizedRenderMode);
  const exportRenderSpeedMultiplier = getEffectiveExportRenderSpeedMultiplier(
    pdfBaseCaptureRate,
    pdfTimelineDurationMs
  );
  const previousRenderMode = getPdfRenderMode();
  const previousPresentationMode = state.presentationMode;

  stopDictation(false);
  stopInputPreview(false);
  stopPlayback(false);
  forceExportVoiceToAnjali();
  state.exportingVideo = true;
  const preparingPdfExportMessage = `Preparing ${exportQualityLabel} ${modeLabel} video with Anjali narration. Please wait...`;
  setStatus(preparingPdfExportMessage);
  updateTaskProgressUi(0.06, true, { mirrorStage: true, label: preparingPdfExportMessage });
  updateStageModeUi();
  downloadBtn.disabled = true;
  if (downloadPdfContextBtn) {
    downloadPdfContextBtn.disabled = true;
  }
  playBtn.disabled = true;
  stopStageBtn.disabled = true;
  recordBtn.disabled = true;
  stopRecordBtn.disabled = true;
  clearAudioBtn.disabled = true;
  audioInput.disabled = true;

  let exportStream = null;
  let canvasStream = null;
  let exportCanvas = null;

  try {
    state.presentationMode = "pdf";
    setPdfRenderMode(normalizedRenderMode);

    // exportCanvas = document.createElement("canvas");
    // exportCanvas.width = previewCanvas.width;
    // exportCanvas.height = previewCanvas.height;
    // useCanvasSurface(exportCanvas);

    rebuildPdfPresentationSchedule({ preserveTime: false });
    updateTaskProgressUi(0.12, true, { mirrorStage: true });

    const pdfText = getPdfPresentationText();
    const requiresNarrationForContext = normalizedRenderMode === "context" && Boolean(pdfText);
    let exportAudioBlob = null;
    let exportAudioFileName = normalizedRenderMode === "exact"
      ? "pdf-presentation-audio.wav"
      : "pdf-context-audio.wav";
    let audioStatusLabel = "silent timing track";

    if (pdfText) {
      try {
        updateTaskProgressUi(0.18, true, { mirrorStage: true });
        exportAudioBlob = await ensureAnjaliPdfNarrationReadyForExport();
        exportAudioFileName = state.pdf.narration.fileName || exportAudioFileName;
        audioStatusLabel = "Anjali narration";
      } catch (error) {
        console.error(error);
        throw new Error(error?.message || "Anjali PDF narration could not be generated.");
      }
    } else {
      exportAudioBlob = createSilentWavBlob(state.pdf.totalDurationMs || 5000);
      exportAudioFileName = normalizedRenderMode === "exact"
        ? "silent-pdf-timeline.wav"
        : "silent-pdf-context-timeline.wav";
    }

    await ensureVideoExportServer();
    const renderingPdfExportMessage = normalizedRenderMode === "exact"
      ? `Rendering ${modeLabel} video with full page images and ${audioStatusLabel} at ${exportRenderSpeedMultiplier}x export speed. Please wait...`
      : `Rendering ${modeLabel} video with synced page text, visuals, and ${audioStatusLabel} at ${exportRenderSpeedMultiplier}x export speed. Please wait...`;
    setStatus(renderingPdfExportMessage);
    updateTaskProgressUi(0.24, true, { mirrorStage: true, label: renderingPdfExportMessage });
    state.pdf.currentTimeMs = 0;
    syncPdfPreviewPageFromTime(0);
    drawScene(0.12);

    const captureRate = getAcceleratedExportCaptureRate(
      pdfBaseCaptureRate,
      exportRenderSpeedMultiplier
    );
    setExportCaptureRate(captureRate);
    if (typeof avatarVideoElement !== 'undefined' && avatarVideoElement) {
        avatarVideoElement.playbackRate = (Number(document.getElementById("avatarSpeedRange")?.value) || 1.8) * exportRenderSpeedMultiplier;
    }
    canvasStream = canvas.captureStream(captureRate);
    const videoTracks = canvasStream.getVideoTracks();
    if (!videoTracks.length) {
      throw new Error("The browser did not provide a video track for the PDF canvas export.");
    }

    const videoOnlyTracks = videoTracks.filter((track) => track.kind === "video");
    if (!videoOnlyTracks.length) {
      throw new Error("PDF export did not produce a usable video track.");
    }

    state.exportVideoTrack = videoOnlyTracks[0];
    drawScene(0.12);
    exportStream = canvasStream;

    const recorder = createExportMediaRecorder(
      exportStream,
      getPdfExportBitrate(effectiveExportQuality, normalizedRenderMode)
    );
    const mimeType = recorder.mimeType || getSupportedVideoMimeType(false) || "video/webm";
    if (recorder.mimeType && recorder.mimeType.startsWith("audio/")) {
      throw new Error("The browser tried to start an audio-only recorder instead of PDF video export.");
    }

    const chunks = [];
    let recorderError = null;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event) => {
      recorderError = event.error || new Error("Recording failed.");
    };

    const blobPromise = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        if (recorderError) {
          reject(recorderError);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "video/webm" });
        if (!blob.size) {
          reject(new Error("The browser finished recording, but no PDF video data was produced."));
          return;
        }

        resolve(blob);
      };
    });

    recorder.start(1500);
    await renderPdfTimelineForExport(normalizedRenderMode, {
      renderSpeedMultiplier: exportRenderSpeedMultiplier
    });

    state.speaking = false;
    cancelVisualLoop();
    state.mouthOpen = 0.12;
    state.pdf.currentTimeMs = state.pdf.totalDurationMs;
    syncPdfPreviewPageFromTime(state.pdf.currentTimeMs);
    drawScene(0.12);
    await delay(Math.max(24, Math.round(getFinalExportHoldMs() / exportRenderSpeedMultiplier)));
    recorder.stop();

    const videoBlob = await blobPromise;
    if (!videoBlob.type.startsWith("video/")) {
      throw new Error(`The browser returned ${videoBlob.type || "an unknown file"} instead of PDF video.`);
    }

    const finalAudioLabel = audioStatusLabel === "generated narration" ? "narration" : "a timing track";
    let videoSaveHandle = null;

    try {
      videoSaveHandle = await requestVideoSaveHandle(outputFileName);
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus(`${modeLabel} export cancelled after rendering.`);
        return;
      }

      console.error(error);
    }

    const combiningPdfExportMessage = `Combining ${modeLabel} video${state.music.enabled ? `, ${finalAudioLabel}, and music` : ` and ${finalAudioLabel}`} with FFmpeg. Please wait...`;
    setStatus(combiningPdfExportMessage);
    updateTaskProgressUi(0.9, true, { mirrorStage: true, label: combiningPdfExportMessage });
    const finalBlob = await muxVideoAndAudio(videoBlob, exportAudioBlob, {
      audioFileName: exportAudioFileName,
      audioSpeed: getPdfPlaybackRate(),
      videoSpeed: exportRenderSpeedMultiplier,
      targetDurationMs: pdfExportTargetDurationMs,
      saveHandle: videoSaveHandle
    });
    if (!videoSaveHandle && (!finalBlob || !finalBlob.size)) {
      throw new Error("The final PDF video file was empty.");
    }

    if (videoSaveHandle) {
      updateTaskProgressUi(1, true, { mirrorStage: true });
      setStatus(`${modeLabel} video saved successfully.`);
    } else {
      generateAndDownloadSrtCaptions(0);
      triggerFileDownload(finalBlob, outputFileName);
      updateTaskProgressUi(1, true, { mirrorStage: true });
      setStatus(`${modeLabel} video downloaded successfully.`);
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message || "unknown error";
    if (/Anjali (clone )?server|local Anjali voice server|local narration server/i.test(errorMessage)) {
      setStatus(`PDF export failed: ${errorMessage} Start the local Anjali voice server on port 8426, then export again.`);
    } else {
      const recoveryHint = normalizedRenderMode === "exact"
        ? " Try Download PDF Context Video if the full exact-PDF export is still too large."
        : "";
      setStatus(`${modeLabel} export failed: ${errorMessage}.${recoveryHint}`);
    }
  } finally {
    allowBackgroundThrottling();
    state.exportingVideo = false;
    cancelVisualLoop();
    stopActiveAudio();
    state.exportFallbackMode = false;
    useCanvasSurface(previewCanvas);
    if (exportStream) {
      exportStream.getTracks().forEach((track) => track.stop());
    }
    if (canvasStream) {
      canvasStream.getTracks().forEach((track) => track.stop());
    }
    clearExportCaptureRate();
    state.exportVideoTrack = null;
    state.speechUtterance = null;
    state.speaking = false;
    state.mouthOpen = 0.12;
    state.pdf.paused = false;
    state.pdf.audioDriven = false;
    state.pdf.timelineStartedAt = 0;
    state.pdf.timelineStartOffsetMs = 0;
    state.presentationMode = previousPresentationMode;
    setPdfRenderMode(previousRenderMode);
    rebuildPdfPresentationSchedule({ preserveTime: false });
    if (typeof avatarVideoElement !== 'undefined' && avatarVideoElement) {
        avatarVideoElement.playbackRate = Number(document.getElementById("avatarSpeedRange")?.value) || 1.8;
    }
    drawScene(0.12);
    setRecordingUi(false);
    updateNarrationUi();
    updateSpeechToolsUi();
    updateStageModeUi();
    updatePlaybackProgressUi(0, false);
    resetTaskProgressUi();
    audioInput.disabled = false;
    stopStageBtn.disabled = false;
    downloadBtn.disabled = false;
    if (downloadPdfContextBtn) {
      downloadPdfContextBtn.disabled = false;
    }
    playBtn.disabled = false;
  }
}

async function exportPdfVideo() {
  await exportPdfModeVideo("exact");
}

async function exportPdfContextVideo() {
  await exportPdfModeVideo("context");
}

async function exportVideo() {
  if (isPdfPresentationMode()) {
    await exportPdfModeVideo(getPdfRenderMode());
    return;
  }

  preventBackgroundThrottling();
  const exportText = commitLatestLessonText();
  if (!ensureLessonTextIsReady(exportText)) {
    allowBackgroundThrottling();
    return;
  }

  if (!canExportVideo()) {
    setStatus("Video export is not supported in this browser. Please use the latest Chrome or Edge.");
    return;
  }

  stopDictation(false);
  stopInputPreview(false);
  stopPlayback(false);
  forceExportVoiceToAnjali();
  state.exportingVideo = true;
  const exportPlaybackRate = getLessonPlaybackRate();
  const effectiveExportQuality = getEffectiveExportQuality();
  const exportQualityLabel = getExportQualityLabel(effectiveExportQuality);
  const shouldIncludeIntro = Boolean(state.introPlayback.enabled);
  const preparingVideoExportMessage = `Preparing ${exportQualityLabel} video with${shouldIncludeIntro ? " intro, " : " "}Anjali narration and typing effect. Please wait...`;
  setStatus(preparingVideoExportMessage);
  updateTaskProgressUi(0.06, true, { mirrorStage: true, label: preparingVideoExportMessage });
  updateStageModeUi();
  downloadBtn.disabled = true;
  playBtn.disabled = true;
  stopStageBtn.disabled = true;
  recordBtn.disabled = true;
  stopRecordBtn.disabled = true;
  clearAudioBtn.disabled = true;
  audioInput.disabled = true;
  let exportStream = null;
  let canvasStream = null;
  let exportCanvas = null;
  let includedIntroInExport = false;

  try {
    // exportCanvas = document.createElement("canvas");
    // exportCanvas.width = previewCanvas.width;
    // exportCanvas.height = previewCanvas.height;
    // useCanvasSurface(exportCanvas);

    updateTaskProgressUi(0.14, true, { mirrorStage: true });
    const exportNarrationBlob = await ensureAnjaliNarrationReadyForExport({
      timeoutMs: getLongNarrationRequestTimeoutMs(state.text)
    });
    const lessonTimelineDurationMs = Math.max(
      1000,
      Math.round((state.narration.durationMs || getDefaultNarrationDurationMs()) / Math.max(0.1, exportPlaybackRate))
    );
    const introTimelineDurationMs = shouldIncludeIntro
      ? Math.max(0, Math.round(state.introPlayback.durationMs || 0))
      : 0;
    const totalExportTimelineDurationMs = lessonTimelineDurationMs + introTimelineDurationMs;
    const exportTargetDurationMs = totalExportTimelineDurationMs + getExportCompletionTailMs();
    const lessonBaseCaptureRate = getLessonExportCaptureRate();
    const exportRenderSpeedMultiplier = getEffectiveExportRenderSpeedMultiplier(
      lessonBaseCaptureRate,
      totalExportTimelineDurationMs
    );
    updateTaskProgressUi(0.2, true, { mirrorStage: true });
    await ensureVideoExportServer();
    await ensureCanvasReadyForExport();
    const renderingVideoExportMessage = shouldIncludeIntro
      ? `Rendering video in the background at ${exportRenderSpeedMultiplier}x with the intro clip first, then natural Anjali narration and typing. Please wait...`
      : `Rendering video in the background at ${exportRenderSpeedMultiplier}x with natural Anjali narration and typing effect. Please wait...`;
    setStatus(renderingVideoExportMessage);
    updateTaskProgressUi(0.24, true, { mirrorStage: true, label: renderingVideoExportMessage });
    state.displayedText = "";
    drawScene(0.12);

    const captureRate = getAcceleratedExportCaptureRate(
      lessonBaseCaptureRate,
      exportRenderSpeedMultiplier
    );
    setExportCaptureRate(captureRate);
    if (typeof avatarVideoElement !== 'undefined' && avatarVideoElement) {
        avatarVideoElement.playbackRate = (Number(document.getElementById("avatarSpeedRange")?.value) || 1.8) * exportRenderSpeedMultiplier;
    }

    try {
      canvasStream = canvas.captureStream(captureRate);
    } catch (error) {
      if (/origin-clean/i.test(error.message || "")) {
        await ensureCanvasReadyForExport();
        canvasStream = canvas.captureStream(captureRate);
      } else {
        throw error;
      }
    }
    const videoTracks = canvasStream.getVideoTracks();
    if (!videoTracks.length) {
      throw new Error("The browser did not provide a video track for the canvas export.");
    }

    const videoOnlyTracks = videoTracks.filter((track) => track.kind === "video");
    if (!videoOnlyTracks.length) {
      throw new Error("Canvas export did not produce a usable video track.");
    }
    state.exportVideoTrack = videoOnlyTracks[0];
    drawScene(0.12);

    exportStream = canvasStream;
    if (!exportStream.getVideoTracks().length) {
      throw new Error("The export stream is missing the video track.");
    }

    const recorder = createExportMediaRecorder(
      exportStream,
      getLessonExportBitrate(effectiveExportQuality)
    );
    const mimeType = recorder.mimeType || getSupportedVideoMimeType(false) || "video/webm";
    if (recorder.mimeType && recorder.mimeType.startsWith("audio/")) {
      throw new Error("The browser tried to start an audio-only recorder instead of video export.");
    }
    const chunks = [];
    let recorderError = null;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event) => {
      recorderError = event.error || new Error("Recording failed.");
    };

    const blobPromise = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        if (recorderError) {
          reject(recorderError);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "video/webm" });
        if (!blob.size) {
          reject(new Error("The browser finished recording, but no video data was produced."));
          return;
        }

        resolve(blob);
      };
    });

    recorder.start(1500);
    const renderStartedAt = performance.now();
    if (shouldIncludeIntro) {
      try {
        includedIntroInExport = await playIntroClipForExport({
          playbackRate: exportRenderSpeedMultiplier
        });
      } catch (error) {
        console.error(error);
        includedIntroInExport = false;
        setIntroClipStatus("The intro clip could not be rendered during export, so the export continued with the lesson only.");
      }
    }
    if (state.stageVideo.element) {
      await startStageVideoPlayback({
        restart: true,
        playbackRate: exportRenderSpeedMultiplier
      });
      state.stageVideo.element.pause(); // Controlled by virtual time loop
    }
    await renderNarrationTimelineForExport(
      state.narration.durationMs || getDefaultNarrationDurationMs(),
      exportPlaybackRate,
      { renderSpeedMultiplier: exportRenderSpeedMultiplier }
    );

    state.speaking = false;
    cancelVisualLoop();
    state.mouthOpen = 0.12;
    state.displayedText = state.text;
    drawScene(0.12);
    await delay(Math.max(24, Math.round(getFinalExportHoldMs() / exportRenderSpeedMultiplier)));
    recorder.stop();
    const renderFinishedAt = performance.now();
    const actualRecordedDurationMs = Math.max(1, renderFinishedAt - renderStartedAt);

    const videoBlob = await blobPromise;
    if (!videoBlob.type.startsWith("video/")) {
      throw new Error(`The browser returned ${videoBlob.type || "an unknown file"} instead of video.`);
    }

    let audioBlob = exportNarrationBlob;
    let audioFileName = "lesson-export-audio.wav";
    if (includedIntroInExport) {
      try {
        const introAudioBlob = await getIntroExportBlob();
        audioBlob = await combineNarrationBlobs([introAudioBlob, exportNarrationBlob]);
        setIntroClipStatus("The intro clip and its audio will be included before the Anjali lesson narration.");
      } catch (error) {
        console.error(error);
        audioBlob = await combineNarrationBlobs([
          createSilentWavBlob(state.introPlayback.durationMs || 1000),
          exportNarrationBlob
        ]);
        setIntroClipStatus("The intro video exported, but its audio could not be merged cleanly, so the export used silent intro audio.");
      }
      audioFileName = "intro-and-lesson-audio.wav";
    }
    let videoSaveHandle = null;

    try {
      videoSaveHandle = await requestVideoSaveHandle("learning-outcomes-video.mp4");
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("Video export cancelled after rendering.");
        return;
      }

      console.error(error);
    }

    const combiningVideoExportMessage = `Combining video, ${includedIntroInExport ? "intro audio, " : ""}narration${state.music.enabled ? ", and music" : ""} with FFmpeg. Please wait...`;
    setStatus(combiningVideoExportMessage);
    updateTaskProgressUi(0.9, true, { mirrorStage: true, label: combiningVideoExportMessage });
    const finalBlob = await muxVideoAndAudio(videoBlob, audioBlob, {
      audioFileName,
      audioSpeed: exportPlaybackRate,
      videoSpeed: exportRenderSpeedMultiplier,
      targetDurationMs: exportTargetDurationMs,
      saveHandle: videoSaveHandle
    });
    if (!videoSaveHandle && (!finalBlob || !finalBlob.size)) {
      throw new Error("The final video file was empty.");
    }

    if (videoSaveHandle) {
      updateTaskProgressUi(1, true, { mirrorStage: true });
      setStatus(`Video saved with${includedIntroInExport ? " intro and " : " "}narration audio.`);
    } else {
      generateAndDownloadSrtCaptions(includedIntroInExport ? Math.max(0, Math.round(state.introPlayback.durationMs || 0)) : 0);
      triggerFileDownload(finalBlob, "learning-outcomes-video.mp4");
      updateTaskProgressUi(1, true, { mirrorStage: true });
      setStatus(`Video downloaded with${includedIntroInExport ? " intro and " : " "}narration audio.`);
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message || "unknown error";
    if (/Anjali (clone )?server|local Anjali voice server|local narration server/i.test(errorMessage)) {
      setStatus(`Video export failed: ${errorMessage} Start the local Anjali voice server on port 8426, then export again.`);
    } else {
      setStatus(`Video export failed: ${errorMessage}.`);
    }
  } finally {
    allowBackgroundThrottling();
    state.exportingVideo = false;
    clearTypingInterval();
    cancelVisualLoop();
    stopActiveAudio();
    state.exportFallbackMode = false;
    useCanvasSurface(previewCanvas);
    if (exportStream) {
      exportStream.getTracks().forEach((track) => track.stop());
    }
    if (canvasStream) {
      canvasStream.getTracks().forEach((track) => track.stop());
    }
    clearExportCaptureRate();
    state.exportVideoTrack = null;
    state.speechUtterance = null;
    state.speaking = false;
    state.mouthOpen = 0.12;
    state.introPlayback.active = false;
    state.introPlayback.previewVisible = false;
    if (state.introPlayback.element) {
      state.introPlayback.element.pause();
      try {
        state.introPlayback.element.currentTime = 0;
        state.introPlayback.element.playbackRate = 1;
      } catch (error) {
        console.error(error);
      }
    }
    if (state.stageVideo.element) {
      try {
        state.stageVideo.element.playbackRate = 1;
      } catch (error) {
        console.error(error);
      }
    }
    if (typeof avatarVideoElement !== 'undefined' && avatarVideoElement) {
        avatarVideoElement.playbackRate = Number(document.getElementById("avatarSpeedRange")?.value) || 1.8;
    }
    state.displayedText = state.text;
    drawScene(0.12);
    setRecordingUi(false);
    updateNarrationUi();
    updateSpeechToolsUi();
    updateStageModeUi();
    updatePlaybackProgressUi(0, false);
    resetTaskProgressUi();
    audioInput.disabled = false;
    stopStageBtn.disabled = false;
    downloadBtn.disabled = false;
    playBtn.disabled = false;
  }
}

async function handleAlternatePdfDownload() {
  if (!isPdfPresentationMode()) {
    return;
  }

  await exportPdfModeVideo(getPdfRenderMode() === "exact" ? "context" : "exact");
}

async function setNarrationFromBlob(blob, fileName, sourceLabel, textSource = "", voice = "", options = {}) {
  stopPlayback(false);

  const nextUrl = URL.createObjectURL(blob);

  try {
    const audioElement = await createLoadedAudio(nextUrl);
    const durationMs = Number.isFinite(audioElement.duration)
      ? Math.max(1000, Math.ceil(audioElement.duration * 1000))
      : getDefaultNarrationDurationMs();

    resetNarrationState();
    const syncProfile = options.syncProfile
      ? scaleSpeechSyncProfile(options.syncProfile, durationMs)
      : null;
    state.narration = {
      url: nextUrl,
      fileName,
      durationMs,
      source: sourceLabel,
      blob,
      textSource,
      voice,
      syncProfile: syncProfile
        ? {
          text: textSource,
          profile: syncProfile
        }
        : null
    };

    updateNarrationUi();
    setRecordingUi(false);
    setAudioStatus(`${sourceLabel}: ${fileName}`);
    if (!options.silent) {
      setStatus("Narration is ready. Play uses this audio, and download will include it.");
    }
  } catch (error) {
    URL.revokeObjectURL(nextUrl);
    throw error;
  }
}

async function handleImageSelection(event) {
  const selectedFiles = Array.from(event.target.files || []);
  if (!selectedFiles.length) {
    return;
  }

  const existingImages = [...state.images];
  const targetPageIndex = stagePanel.classList.contains("hidden") ? 0 : state.previewPageIndex;
  const remainingSlots = Math.max(0, MAX_IMAGE_UPLOADS - existingImages.length);
  const files = selectedFiles.slice(0, remainingSlots || MAX_IMAGE_UPLOADS);

  if (!files.length) {
    setStatus(`You already reached the ${MAX_IMAGE_UPLOADS} image limit. Remove one image first if you want to add another.`);
    return;
  }

  try {
    const loadedImages = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
          reader.readAsDataURL(file);
        });

        const image = await loadImageFromDataUrl(dataUrl);
        return { fileName: file.name, dataUrl, image };
      })
    );

    const pageAssignedImages = assignPageIndexesToNewImages(existingImages, loadedImages, targetPageIndex);
    state.images = applyDefaultImageLayouts([...existingImages, ...pageAssignedImages]);
    state.imageEditor.activeIndex = state.images.length ? state.images.length - 1 : -1;
    renderImagePreviews();
    drawScene(state.mouthOpen);
    setStatus(
      (existingImages.length + selectedFiles.length) > MAX_IMAGE_UPLOADS
        ? `Loaded up to ${MAX_IMAGE_UPLOADS} images. New images were placed on page ${targetPageIndex + 1} and can now be dragged anywhere on the full slide.`
        : `Images were added to page ${targetPageIndex + 1} and can now be moved anywhere on the presentation slide.`
    );
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Image upload failed.");
  } finally {
    event.target.value = "";
  }
}

function insertTextIntoTextarea(textarea, text) {
  if (!textarea || typeof text !== "string") {
    return {
      endIndex: 0,
      insertedText: ""
    };
  }

  const selectionStart = Number.isFinite(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
  const selectionEnd = Number.isFinite(textarea.selectionEnd) ? textarea.selectionEnd : textarea.value.length;
  const prefix = textarea.value.slice(0, selectionStart);
  const suffix = textarea.value.slice(selectionEnd);
  const needsLeadingBreak = prefix && !/\s$/.test(prefix) && text ? "\n" : "";
  const needsTrailingBreak = suffix && !/^\s/.test(suffix) && text ? "\n" : "";
  const insertion = `${needsLeadingBreak}${text}${needsTrailingBreak}`;

  textarea.setRangeText(insertion, selectionStart, selectionEnd, "end");
  return {
    startIndex: selectionStart,
    endIndex: selectionStart + insertion.length,
    insertedText: insertion
  };
}

function getPageIndexForTextOffset(pages = [], textOffset = 0, fallbackIndex = 0) {
  if (!Array.isArray(pages) || !pages.length) {
    return Math.max(0, fallbackIndex);
  }

  const safeOffset = Math.max(0, Math.round(Number(textOffset) || 0));
  const matchIndex = pages.findIndex((page) => safeOffset <= Math.max(0, Number(page?.textEndIndex) || 0));
  if (matchIndex >= 0) {
    return matchIndex;
  }

  return Math.max(0, Math.min(Math.max(0, pages.length - 1), Math.round(Number(fallbackIndex) || 0)));
}

function buildNormalizedPdfSearchIndex(text = "") {
  const source = String(text || "");
  const chars = [];
  const indexMap = [];
  let pendingSpace = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (/\s/.test(character)) {
      pendingSpace = chars.length > 0;
      continue;
    }

    if (pendingSpace) {
      chars.push(" ");
      indexMap.push(index);
      pendingSpace = false;
    }

    chars.push(character.toLowerCase());
    indexMap.push(index);
  }

  return {
    text: chars.join(""),
    indexMap
  };
}

function normalizePdfSearchFragment(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getPdfAnchorSearchCandidates(anchorText = "") {
  const normalizedAnchor = normalizePdfSearchFragment(anchorText);
  if (!normalizedAnchor) {
    return [];
  }

  const candidates = [normalizedAnchor];
  const clauses = normalizedAnchor
    .split(/\s{2,}|(?<=[.:;!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 10);

  clauses.forEach((clause) => {
    if (!candidates.includes(clause)) {
      candidates.push(clause);
    }
  });

  const firstWords = normalizedAnchor.split(" ").slice(0, 8).join(" ").trim();
  if (firstWords.length >= 10 && !candidates.includes(firstWords)) {
    candidates.push(firstWords);
  }

  return candidates.sort((left, right) => right.length - left.length);
}

function findPdfAnchorLocalOffset(insertedText = "", anchorText = "", searchStart = 0) {
  const directAnchor = String(anchorText || "").trim();
  if (directAnchor) {
    const directIndex = String(insertedText || "").indexOf(directAnchor, Math.max(0, searchStart));
    if (directIndex >= 0) {
      return {
        localOffset: directIndex,
        nextSearchStart: directIndex + directAnchor.length,
        matched: true
      };
    }
  }

  const normalizedInserted = buildNormalizedPdfSearchIndex(insertedText);
  if (!normalizedInserted.text) {
    return {
      localOffset: -1,
      nextSearchStart: Math.max(0, searchStart),
      matched: false
    };
  }

  const normalizedSearchStart = (() => {
    if (searchStart <= 0 || !normalizedInserted.indexMap.length) {
      return 0;
    }

    const mappedIndex = normalizedInserted.indexMap.findIndex((sourceIndex) => sourceIndex >= searchStart);
    return mappedIndex >= 0 ? mappedIndex : normalizedInserted.text.length;
  })();

  const candidates = getPdfAnchorSearchCandidates(anchorText);
  for (const candidate of candidates) {
    let normalizedIndex = normalizedInserted.text.indexOf(candidate, normalizedSearchStart);
    if (normalizedIndex < 0 && normalizedSearchStart > 0) {
      normalizedIndex = normalizedInserted.text.indexOf(candidate);
    }

    if (normalizedIndex < 0) {
      continue;
    }

    const localOffset = normalizedInserted.indexMap[Math.min(normalizedIndex, normalizedInserted.indexMap.length - 1)] ?? 0;
    const nextNormalizedIndex = Math.min(
      normalizedInserted.indexMap.length - 1,
      normalizedIndex + Math.max(0, candidate.length - 1)
    );
    const nextSearchStart = (normalizedInserted.indexMap[nextNormalizedIndex] ?? localOffset) + 1;
    return {
      localOffset,
      nextSearchStart,
      matched: true
    };
  }

  return {
    localOffset: -1,
    nextSearchStart: Math.max(0, searchStart),
    matched: false
  };
}

function getPdfClipboardImagePageIndexes(insertedText, insertedAbsoluteStartIndex, pages, images = [], fallbackPageIndex = 0) {
  const safeInsertedText = String(insertedText || "");
  if (!safeInsertedText || !Array.isArray(images) || !images.length) {
    return [];
  }

  let searchStart = 0;
  const sourcePageAssignments = new Map();
  const orderedImages = [...images].sort((left, right) => {
    const leftOrder = Number(left?.anchorOrder) || 0;
    const rightOrder = Number(right?.anchorOrder) || 0;
    return leftOrder - rightOrder;
  });

  return orderedImages.map((image) => {
    const anchorMatch = findPdfAnchorLocalOffset(safeInsertedText, image?.anchorText || "", searchStart);
    if (anchorMatch.matched) {
      searchStart = anchorMatch.nextSearchStart;
      const matchedPageIndex = getPageIndexForTextOffset(
        pages,
        Math.max(0, insertedAbsoluteStartIndex + anchorMatch.localOffset),
        fallbackPageIndex
      );
      const sourcePageNumber = Math.max(0, Math.round(Number(image?.sourcePageNumber) || 0));
      if (sourcePageNumber > 0) {
        sourcePageAssignments.set(sourcePageNumber, matchedPageIndex);
      }
      return matchedPageIndex;
    }

    const sourcePageNumber = Math.max(0, Math.round(Number(image?.sourcePageNumber) || 0));
    if (sourcePageNumber > 0 && sourcePageAssignments.has(sourcePageNumber)) {
      return sourcePageAssignments.get(sourcePageNumber);
    }

    return Math.max(0, fallbackPageIndex);
  });
}

function parsePdfClipboardPayload(html = "") {
  if (!html || !html.includes(PDF_CLIPBOARD_MARKER_ATTRIBUTE)) {
    return {
      text: "",
      images: []
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.querySelector(`[${PDF_CLIPBOARD_MARKER_ATTRIBUTE}]`);
  if (!root) {
    return {
      text: "",
      images: []
    };
  }

  const text = root.querySelector("[data-maths-teacher-pdf-text]")?.textContent || "";
  const images = Array.from(root.querySelectorAll("img[data-maths-teacher-example-image='1']"))
    .map((image, index) => ({
      dataUrl: image.getAttribute("src") || "",
      fileName: image.getAttribute("data-file-name") || `pasted-example-${index + 1}.png`,
      sourceTag: "pdf-clipboard",
      anchorText: image.getAttribute("data-anchor-text") || "",
      anchorOrder: Math.max(0, Math.round(Number(image.getAttribute("data-anchor-order")) || index)),
      sourcePageNumber: Math.max(0, Math.round(Number(image.getAttribute("data-source-page-number")) || 0))
    }))
    .filter((item) => item.dataUrl.startsWith("data:image/"));

  return { text, images };
}

async function handleLessonInputPaste(event) {
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }

  const html = clipboardData.getData("text/html") || "";
  const plainText = clipboardData.getData("text/plain") || "";
  const pdfPayload = parsePdfClipboardPayload(html);
  const imageFiles = Array.from(clipboardData.items || [])
    .filter((item) => item.kind === "file" && /^image\//i.test(item.type || ""))
    .map((item) => item.getAsFile())
    .filter(Boolean);

  if (!pdfPayload.images.length && !imageFiles.length) {
    return;
  }

  event.preventDefault();

  try {
    const filesAsImages = await Promise.all(
      imageFiles.map(async (file, index) => ({
        dataUrl: await readFileAsDataUrl(file),
        fileName: file.name || `pasted-image-${index + 1}.png`,
        sourceTag: "clipboard-image"
      }))
    );
    const stageImages = [...pdfPayload.images, ...filesAsImages];
    let targetPageIndex = stagePanel.classList.contains("hidden") ? 0 : state.previewPageIndex;
    let imagePageIndexes = [];

    if (pdfPayload.text || plainText) {
      const insertResult = insertTextIntoTextarea(lessonInput, pdfPayload.text || plainText);
      scheduleLessonInputChange();
      const insertedTextEndIndex = Math.max(0, Number(insertResult.endIndex) || 0);
      const insertedTextStartIndex = Math.max(0, Number(insertResult.startIndex) || 0);
      const updatedContent = getPaginatedSlideContent(lessonInput.value.trim(), !lessonInput.value.trim(), targetPageIndex, false);
      targetPageIndex = getPageIndexForTextOffset(updatedContent.pages, insertedTextEndIndex, targetPageIndex);
      imagePageIndexes = getPdfClipboardImagePageIndexes(
        insertResult.insertedText,
        insertedTextStartIndex,
        updatedContent.pages,
        pdfPayload.images,
        targetPageIndex
      );
    }

    const stageImagesWithPages = stageImages.map((item, index) => ({
      ...item,
      pageIndex: (() => {
        const pdfPresentationIndex = getPdfPresentationPageIndexForSourcePageNumber(item?.sourcePageNumber);
        if (pdfPresentationIndex >= 0) {
          return pdfPresentationIndex;
        }

        if (Number.isInteger(imagePageIndexes[index])) {
          return imagePageIndexes[index];
        }

        if (Number.isInteger(item.pageIndex)) {
          return item.pageIndex;
        }

        return targetPageIndex;
      })()
    }));

    const addedCount = await addStageImagesFromDataUrls(stageImagesWithPages, { targetPageIndex });
    setStatus(
      addedCount
        ? `Pasted lesson content and added ${addedCount} maths/example image${addedCount === 1 ? "" : "s"} to the matching lesson pages.`
        : "Pasted lesson content."
    );
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not paste the copied PDF example images.");
  }
}

async function handleAudioSelection(event) {
  const [file] = Array.from(event.target.files || []);

  if (!file) {
    clearNarration();
    return;
  }

  try {
    await setNarrationFromBlob(file, file.name, "Uploaded narration");
  } catch (error) {
    console.error(error);
    clearNarration();
    setStatus(error.message || "Audio upload failed.");
  }
}

async function startRecordingNarration() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setStatus("Recording is not supported in this browser.");
    return;
  }

  stopPlayback(false);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedAudioMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    state.recording = {
      recorder,
      chunks: [],
      stream
    };

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.recording.chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      clearRecordingSession();
      setStatus("Recording failed. Please try again.");
    };

    recorder.onstop = async () => {
      const recordedBlob = new Blob(
        state.recording.chunks,
        { type: recorder.mimeType || mimeType || "audio/webm" }
      );

      clearRecordingSession();

      try {
        await setNarrationFromBlob(
          recordedBlob,
          `recorded-narration-${Date.now()}.webm`,
          "Recorded narration"
        );
      } catch (error) {
        console.error(error);
        clearNarration();
        setStatus(error.message || "Recorded audio could not be prepared.");
      }
    };

    recorder.start();
    setRecordingUi(true);
    setAudioStatus("Recording narration... click Stop Recording when you finish.");
    setStatus("Recording narration from your microphone.");
  } catch (error) {
    console.error(error);
    setStatus("Microphone access failed. Please allow microphone permission and try again.");
  }
}

function stopRecordingNarration() {
  if (!state.recording.recorder || state.recording.recorder.state !== "recording") {
    return;
  }

  setAudioStatus("Processing recorded narration...");
  setStatus("Finishing the recording...");
  state.recording.recorder.stop();
}

function clearNarration() {
  stopPlayback(false);
  resetNarrationState();
  updateNarrationUi();
  audioInput.value = "";
  setRecordingUi(false);
  setAudioStatus("No narration audio selected.");
  setStatus("Narration cleared. Upload or record again if you want audio in the downloaded video.");
}

function handleTranscribeAudioSelection(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) {
    state.transcribeSelectedFile = null;
    setTranscribeStatus("No audio uploaded for transcription.");
    resetTranscribeProgress();
    updateSpeechToolsUi();
    return;
  }

  state.transcribeSelectedFile = file;
  setTranscribeStatus(`Selected audio: ${file.name}. Click Submit Audio to convert it into text.`);
  resetTranscribeProgress();
  updateSpeechToolsUi();
}

async function handleTranscribeAudioUpload() {
  const file = state.transcribeSelectedFile;
  if (!file) {
    setTranscribeStatus("Select an audio file first, then click Submit Audio.");
    updateSpeechToolsUi();
    return;
  }

  state.transcribing = true;
  setTranscribeProgress(10, "Starting");
  updateSpeechToolsUi();

  try {
    setTranscribeProgress(20, "Checking server");
    const serverReady = await ensureTranscribeServer();
    if (!serverReady) {
      throw new Error("The local transcription server is not running.");
    }

    setTranscribeStatus(`Transcribing ${file.name}...`);
    setTranscribeProgress(40, "Preparing audio");
    const wavBlob = await decodeAudioFileToWav(file);
    setTranscribeProgress(65, "Converting audio");
    const wavBase64 = arrayBufferToBase64(await wavBlob.arrayBuffer());
    setTranscribeProgress(82, "Sending audio");
    const response = await fetch(`${state.transcribeServerUrl}/api/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: file.name,
        audioBase64: wavBase64
      })
    });

    setTranscribeProgress(94, "Finishing transcript");
    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || "Audio transcription failed.");
    }

    const payload = await response.json();
    const transcript = (payload.text || "").trim();

    if (!transcript) {
      throw new Error("No clear speech was recognized from the uploaded audio.");
    }

    lessonInput.value = lessonInput.value.trim()
      ? mergeSpeechText(lessonInput.value, transcript)
      : transcript;

    setTranscribeProgress(100, "Completed");
    setTranscribeStatus(`Audio converted to text from ${file.name}.`);
    setSpeechToolsStatus("Uploaded audio was added to the content box as text.");
    state.transcribeSelectedFile = null;
    transcribeAudioInput.value = "";
    handleLessonInputChange();
  } catch (error) {
    console.error(error);
    setTranscribeProgress(0, "Failed");
    setTranscribeStatus(error.message || "Audio transcription failed.");
  } finally {
    state.transcribing = false;
    window.setTimeout(() => {
      if (!state.transcribing) {
        resetTaskProgressUi();
      }
    }, 900);
    updateSpeechToolsUi();
  }
}

async function generateNarrationDownload(voice) {
  clearNarrationWarmupTimer();
  const text = getEffectiveLessonText();
  const lessonIssue = getLessonTextIssue(text);
  if (lessonIssue) {
    setNarrationGenStatus(lessonIssue.message);
    updateSpeechToolsUi();
    return;
  }

  state.generatingNarration = true;
  updateSpeechToolsUi();
  startNarrationLiveProgress("Generating anjali narration...");

  try {
    const label = getNarrationVoiceLabel(voice);
    const sourceLabel = voice === "anjali"
      ? `Generated ${label.toLowerCase()} narration`
      : `${label} narration`;
    state.preferredNarrationVoice = voice;
    updatePreferredVoiceUi();
    setNarrationGenStatus(`Generating ${label.toLowerCase()} narration...`);
    setStatus(`Generating ${label.toLowerCase()} narration...`);
    updateTaskProgressUi(0.16, true, { label: `Generating ${label.toLowerCase()} narration...` });

    let syncProfile = null;
    const blob = await requestNarrationBlob(text, voice, {
      timeoutMs: getLongNarrationRequestTimeoutMs(text),
      onProgress: ({ label, progress }) => updateNarrationLiveProgress(label, progress),
      onSyncProfile: (profile) => {
        syncProfile = profile;
      }
    });
    updateTaskProgressUi(0.74, true, { label: `Finishing ${label.toLowerCase()} narration...` });
    const fileName = `${voice}-narration.wav`;
    await setNarrationFromBlob(blob, fileName, sourceLabel, text, voice, { syncProfile });
    updateTaskProgressUi(0.9, true, { label: `${label} narration is ready to download.` });
    triggerFileDownload(blob, fileName);
    setNarrationGenStatus(`${label} narration downloaded and loaded into the app.`);
    setStatus(`${label} narration downloaded and loaded into the app.`);
    updateTaskProgressUi(1, true, { label: `${label} narration downloaded and loaded into the app.` });
    finishNarrationLiveProgress(`${label} narration ready.`);
  } catch (error) {
    console.error(error);
    setNarrationGenStatus(error.message || "Narration generation failed.");
    setStatus(error.message || "Narration generation failed.", { error: true });
    finishNarrationLiveProgress(error.message || "Narration generation failed.", { error: true });
  } finally {
    state.generatingNarration = false;
    resetTaskProgressUi();
    updateSpeechToolsUi();
  }
}

async function loadGeneratedNarrationIntoApp(voice) {
  clearNarrationWarmupTimer();
  const text = getEffectiveLessonText();
  const lessonIssue = getLessonTextIssue(text);
  if (lessonIssue) {
    setNarrationGenStatus(lessonIssue.message);
    updateSpeechToolsUi();
    return;
  }

  state.generatingNarration = true;
  updateSpeechToolsUi();
  startNarrationLiveProgress("Generating anjali narration for the app...");

  try {
    const label = getNarrationVoiceLabel(voice);
    const sourceLabel = voice === "anjali"
      ? `Generated ${label.toLowerCase()} narration`
      : `${label} narration`;
    state.preferredNarrationVoice = voice;
    updatePreferredVoiceUi();
    setNarrationGenStatus(`Generating ${label.toLowerCase()} narration for the app...`);
    setStatus(`Generating ${label.toLowerCase()} narration for the app...`);
    updateTaskProgressUi(0.16, true, { label: `Generating ${label.toLowerCase()} narration for the app...` });

    let syncProfile = null;
    const blob = await requestNarrationBlob(text, voice, {
      timeoutMs: getLongNarrationRequestTimeoutMs(text),
      onProgress: ({ label, progress }) => updateNarrationLiveProgress(label, progress),
      onSyncProfile: (profile) => {
        syncProfile = profile;
      }
    });
    updateTaskProgressUi(0.74, true, { label: `Loading ${label.toLowerCase()} narration into the app...` });
    const fileName = `${voice}-narration.wav`;
    await setNarrationFromBlob(blob, fileName, sourceLabel, text, voice, { syncProfile });
    setNarrationGenStatus(`${label} narration is loaded into the app.`);
    setStatus(`${label} narration is loaded into the app.`);
    if (audioPreview?.src) {
      try {
        audioPreview.currentTime = 0;
        await audioPreview.play();
      } catch (playError) {
        console.error(playError);
      }
    }
    updateTaskProgressUi(1, true, { label: `${label} narration is loaded into the app.` });
    finishNarrationLiveProgress(`${label} narration is loaded into the app.`);
  } catch (error) {
    console.error(error);
    setNarrationGenStatus(error.message || "Narration generation failed.");
    setStatus(error.message || "Narration generation failed.", { error: true });
    finishNarrationLiveProgress(error.message || "Narration generation failed.", { error: true });
  } finally {
    state.generatingNarration = false;
    resetTaskProgressUi();
    updateSpeechToolsUi();
  }
}

async function showScreen() {
  if (shouldPreferPdfScreenFromInput()) {
    showPdfScreen("context");
    return;
  }

  const text = lessonInput.value.trim();
  if (!ensureLessonTextIsReady(text)) {
    return;
  }

  stopDictation(false);
  stopInputPreview(false);
  state.presentationMode = "lesson";
  state.text = text;
  state.lines = splitIntoLines(text);
  state.words = splitIntoWords(text);
  state.tokens = splitIntoTokens(text);
  state.displayedText = text;
  state.contentScrollOffset = 0;
  state.previewPageIndex = 0;
  updatePlaybackProgressUi(0, false);
  syncImageLayouts();
  inputPanel.classList.add("hidden");
  stagePanel.classList.remove("hidden");
  updateStageModeUi();
  updateStageViewUi();

  if (state.introPlayback.enabled) {
    const introReady = await ensureDefaultIntroClip();
    if (introReady && state.introPlayback.element) {
      state.introPlayback.previewVisible = true;
      state.introPlayback.active = false;
      try {
        state.introPlayback.element.pause();
        state.introPlayback.element.currentTime = 0;
      } catch (error) {
        console.error(error);
      }
      drawScene(0.12);
      setIntroClipStatus("Intro clip is marked and shown on the screen. Play or Export will start with it.");
    } else {
      state.introPlayback.previewVisible = false;
      state.introPlayback.active = false;
      drawScene(0.12);
    }
  } else {
    state.introPlayback.previewVisible = false;
    state.introPlayback.active = false;
    drawScene(0.12);
  }
  if (state.stageVideo.element) {
    void startStageVideoPlayback({ restart: true });
  } else {
    ensureStageMediaLoop();
  }

  const hasMultiplePages = state.renderedPageCount > 1;
  const pageHint = hasMultiplePages
    ? " Use Prev Page and Next Page to review the full presentation. Play and Download move through those pages automatically."
    : "";
  const videoHint = state.stageVideo.element
    ? " Drag the active stage video anywhere on the blue screen and resize it from the corner handle."
    : "";

  if (state.narration.url) {
    setStatus(state.images.length
      ? `Screen is ready. Drag images anywhere on the full slide and resize them as needed.${videoHint}${pageHint}`
      : `Screen is ready. Play uses your narration audio, and download will include it.${videoHint}${pageHint}`);
  } else {
    setStatus(state.images.length
      ? `Screen is ready. Drag images anywhere on the full slide and resize them as needed.${videoHint}${pageHint}`
      : (state.preferredNarrationVoice === "anjali"
        ? `Screen is ready. Play and Download will use the latest output text in Anjali voice automatically.${videoHint}${pageHint}`
        : `Screen is ready. Play and Download will use the saved ${getNarrationVoiceLabel(state.preferredNarrationVoice).toLowerCase()} voice when the local speech server is running.${videoHint}${pageHint}`));
  }
}

showScreenBtn.addEventListener("click", () => runLockedAction("showScreen", [showScreenBtn, pdfShowBtn, pdfPresentBtn], showScreen));
imageInput.addEventListener("change", handleImageSelection);
sceneImageInput.addEventListener("change", handleSceneImageSelection);
sceneMusicInput.addEventListener("change", handleSceneMusicSelection);
if (mathsSourceInput) {
  mathsSourceInput.addEventListener("input", () => {
    if (state.mathsTranslator.auto) {
      scheduleMathsTranslation({ applyToLesson: true, force: true, fromUserAction: true });
    } else {
      scheduleMathsPreviewOnly(mathsSourceInput.value, {
        delayMs: 160,
        loadingLabel: "Preparing maths preview...",
        statusMessage: "Auto translate is off. Use Translate To Pure Maths when you want to sync the result."
      });
    }
  });
}
if (translateMathsBtn) {
  translateMathsBtn.addEventListener("click", () => {
    scheduleMathsTranslation({ applyToLesson: true, force: true, fromUserAction: true, useLessonInputSource: true, delayMs: 60 });
    window.setTimeout(() => {
      if (state.mathsTranslator.lastTranslated) {
        setStatus("Pure maths translation is ready in the lesson box.");
      }
    }, 100);
  });
}
if (clearMathsSourceBtn) {
  clearMathsSourceBtn.addEventListener("click", () => {
    if (state.mathsTranslator.timerId) {
      window.clearTimeout(state.mathsTranslator.timerId);
      state.mathsTranslator.timerId = 0;
    }
    if (state.mathsTranslator.previewTimerId) {
      window.clearTimeout(state.mathsTranslator.previewTimerId);
      state.mathsTranslator.previewTimerId = 0;
    }
    if (mathsSourceInput) {
      mathsSourceInput.value = "";
    }
    state.mathsTranslator.lastSource = "";
    state.mathsTranslator.lastTranslated = "";
    setMathsTranslateLoading(false, "Translation complete.");
    updateMathsTranslationPreview("");
    setMathsTranslatorStatus("Maths translator source cleared.");
  });
}
if (mathsAutoTranslateToggle) {
  mathsAutoTranslateToggle.addEventListener("change", (event) => {
    state.mathsTranslator.auto = Boolean(event.target.checked);
    if (state.mathsTranslator.auto && mathsSourceInput?.value.trim()) {
      scheduleMathsTranslation({ applyToLesson: true, force: true, fromUserAction: true, delayMs: 60 });
    } else {
      setMathsTranslateLoading(false, "Translation complete.");
      setMathsTranslatorStatus(state.mathsTranslator.auto
        ? "Auto translate is on. New source input will sync into the lesson box."
        : "Auto translate is off. The lesson box keeps its current text until you translate again.");
    }
  });
}
if (placeValueNumberInput) {
  placeValueNumberInput.addEventListener("input", () => {
    const digitsOnly = sanitizePlaceValueNumber(placeValueNumberInput.value);
    placeValueNumberInput.value = digitsOnly;
  });
}
if (applyPlaceValueTableBtn) {
  applyPlaceValueTableBtn.addEventListener("click", () => {
    void runLockedAction("placeValueTable", [applyPlaceValueTableBtn, showPlaceValueTableBtn], async () => applyPlaceValueTableBuilder());
  });
}
if (showPlaceValueTableBtn) {
  showPlaceValueTableBtn.addEventListener("click", () => {
    void runLockedAction("placeValueTable", [applyPlaceValueTableBtn, showPlaceValueTableBtn], async () => applyPlaceValueTableBuilder({ showScreenAfter: true }));
  });
}
lessonInput.addEventListener("input", () => {
  scheduleLessonInputChange();
  if (!mathsSourceInput?.value.trim()) {
    scheduleMathsPreviewOnly(lessonInput.value, {
      delayMs: 180,
      loadingLabel: "Preparing maths preview..."
    });
    if (state.mathsTranslator.auto && lessonInput.value.trim()) {
      setMathsTranslatorStatus("Lesson text will be normalized to pure maths when you translate, preview, present, or export.");
    }
  }
});
lessonInput.addEventListener("paste", (event) => {
  void handleLessonInputPaste(event);
});
lessonInput.addEventListener("select", refreshSelectedPhraseFromInput);
lessonInput.addEventListener("mouseup", refreshSelectedPhraseFromInput);
lessonInput.addEventListener("keyup", refreshSelectedPhraseFromInput);
scenePromptInput.addEventListener("input", () => {
  const previewScene = analyzeScenePrompt(scenePromptInput.value.trim() || lessonInput.value.trim());
  state.scene = {
    ...state.scene,
    ...previewScene,
    vfx: sceneVfxSelect.value === "auto" ? previewScene.vfx : sceneVfxSelect.value,
    exportQuality: getSelectedExportQuality()
  };
  updateScenePreview();
});
sceneVfxSelect.addEventListener("change", () => {
  const detectedVfx = analyzeScenePrompt(scenePromptInput.value.trim() || lessonInput.value.trim()).vfx;
  state.scene.vfx = sceneVfxSelect.value === "auto" ? detectedVfx : sceneVfxSelect.value;
  updateScenePreview();

  if (!stagePanel.classList.contains("hidden")) {
    drawScene(state.mouthOpen);
  }
});
sceneMusicModeSelect.addEventListener("change", () => {
  updateScenePreview();
});
exportQualitySelect.addEventListener("change", () => {
  state.scene.exportQuality = getSelectedExportQuality();
  updateScenePreview();
});
generateSceneBtn.addEventListener("click", generateSceneSetup);
generateSceneShowBtn.addEventListener("click", () => generateSceneSetup({ showScreenAfter: true }));
clearSceneBtn.addEventListener("click", clearSceneSetup);
if (themeSelect) {
  themeSelect.addEventListener("change", (event) => {
    applyTheme(event.target.value);
  });
}
if (themeToggle) {
  themeToggle.addEventListener("change", (event) => {
    applyTheme(event.target.checked ? "dark" : "light");
  });
}
workflowStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openWorkflowTarget(button.dataset.workflowTarget || "");
  });
});
presentationTemplateInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    if (event.target.checked) {
      setPresentationTemplate(event.target.value);
    }
  });
});
if (saveOutcomesTitleBtn) {
  saveOutcomesTitleBtn.addEventListener("click", () => {
    setOutcomesTitle(outcomesTitleInput?.value || "");
  });
}
if (outcomesTitleInput) {
  outcomesTitleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setOutcomesTitle(outcomesTitleInput.value);
    }
  });
}
if (insertSpaceBtn) {
  insertSpaceBtn.addEventListener("click", () => insertTextIntoActiveField(" ", "Space"));
}
if (insertNewLineBtn) {
  insertNewLineBtn.addEventListener("click", () => insertTextIntoActiveField("\n", "New line"));
}
if (insertTabBtn) {
  insertTabBtn.addEventListener("click", () => insertTextIntoActiveField("    ", "Tab spacing"));
}
if (insertBulletBtn) {
  insertBulletBtn.addEventListener("click", () => insertTextIntoActiveField("• ", "Bullet"));
}
if (insertArrowBtn) {
  insertArrowBtn.addEventListener("click", () => insertTextIntoActiveField(" → ", "Arrow"));
}
if (insertMultiplyBtn) {
  insertMultiplyBtn.addEventListener("click", () => insertTextIntoActiveField(" × ", "Multiplication sign"));
}
if (insertDivideBtn) {
  insertDivideBtn.addEventListener("click", () => insertTextIntoActiveField(" ÷ ", "Division sign"));
}
if (insertLessEqualBtn) {
  insertLessEqualBtn.addEventListener("click", () => insertTextIntoActiveField(" ≤ ", "Less-than-or-equal sign"));
}
if (insertGreaterEqualBtn) {
  insertGreaterEqualBtn.addEventListener("click", () => insertTextIntoActiveField(" ≥ ", "Greater-than-or-equal sign"));
}
if (insertRupeeBtn) {
  insertRupeeBtn.addEventListener("click", () => insertTextIntoActiveField("₹", "Rupee sign"));
}
textColorSelect.addEventListener("change", (event) => {
  updateDisplayStyle({ color: event.target.value });
});
boldToggleBtn.addEventListener("click", () => {
  updateDisplayStyle({ bold: !state.displayStyle.bold });
});
italicToggleBtn.addEventListener("click", () => {
  updateDisplayStyle({ italic: !state.displayStyle.italic });
});
underlineToggleBtn.addEventListener("click", () => {
  updateDisplayStyle({ underline: !state.displayStyle.underline });
});
caseOriginalBtn.addEventListener("click", () => {
  updateDisplayStyle({ caseMode: "original" });
});
caseLowerBtn.addEventListener("click", () => {
  updateDisplayStyle({ caseMode: "lower" });
});
caseTitleBtn.addEventListener("click", () => {
  updateDisplayStyle({ caseMode: "title" });
});
caseUpperBtn.addEventListener("click", () => {
  updateDisplayStyle({ caseMode: "upper" });
});
selectedTextColorSelect.addEventListener("change", (event) => {
  updateSelectionStyle({ color: event.target.value });
});
selectedBoldToggleBtn.addEventListener("click", () => {
  updateSelectionStyle({ bold: !state.selectionStyle.bold });
});
selectedItalicToggleBtn.addEventListener("click", () => {
  updateSelectionStyle({ italic: !state.selectionStyle.italic });
});
selectedUnderlineToggleBtn.addEventListener("click", () => {
  updateSelectionStyle({ underline: !state.selectionStyle.underline });
});
applySelectedStyleBtn.addEventListener("click", applySelectedTextStyle);
clearSelectedStyleBtn.addEventListener("click", clearSelectedTextStyle);
dictateBtn.addEventListener("click", startDictation);
stopDictateBtn.addEventListener("click", () => stopDictation(true));
previewTextBtn.addEventListener("click", () => runLockedAction("preview", [previewTextBtn, previewAnjaliBtn], async () => openPreviewVoiceChooser()));
if (previewAnjaliBtn) {
  previewAnjaliBtn.addEventListener("click", () => runLockedAction("preview", [previewTextBtn, previewAnjaliBtn], async () => startTextPreview("anjali")));
}
stageToolbarGroups.forEach((group) => {
  group.addEventListener("toggle", () => {
    if (!group.open) {
      return;
    }

    stageToolbarGroups.forEach((otherGroup) => {
      if (otherGroup !== group) {
        otherGroup.open = false;
      }
    });
  });
});
pdfInput.addEventListener("change", handlePdfSelection);
pdfShowBtn.addEventListener("click", () => runLockedAction("pdfShow", [pdfShowBtn, showScreenBtn], showPdfOnScreen));
pdfPresentBtn.addEventListener("click", () => runLockedAction("pdfPresent", [pdfPresentBtn, playBtn], presentPdf));
pdfSelectAllBtn.addEventListener("click", selectAllPdfPages);
pdfClearSelectionBtn.addEventListener("click", clearSelectedPdfPages);
clearPdfBtn.addEventListener("click", () => clearPdfSelection({ keepLessonText: true }));
slideVoiceSelect.addEventListener("change", (event) => {
  state.preferredNarrationVoice = "anjali";
  updatePreferredVoiceUi();
  setSpeechToolsStatus("Saved slide voice is locked to Anjali Voice.");
});
stopPreviewBtn.addEventListener("click", () => stopInputPreview(true));
previewCanvas.addEventListener("pointerdown", beginImageInteraction);
previewCanvas.addEventListener("pointermove", moveImageInteraction);
previewCanvas.addEventListener("pointerup", endImageInteraction);
previewCanvas.addEventListener("pointercancel", endImageInteraction);
previewCanvas.addEventListener("pointerleave", () => {
  if (!state.imageEditor.mode) {
    updateCanvasCursor(null);
  }
});
startServersBtn.addEventListener("click", startServersFromPage);
copyStartAllBtn.addEventListener("click", copyStartAllCommand);
checkServersBtn.addEventListener("click", checkServerHealth);
transcribeAudioInput.addEventListener("change", handleTranscribeAudioSelection);
submitTranscribeBtn.addEventListener("click", handleTranscribeAudioUpload);
audioInput.addEventListener("change", handleAudioSelection);
videoInput.addEventListener("change", handleVideoSelection);
introClipEnabled.addEventListener("change", (event) => {
  state.introPlayback.enabled = event.target.checked;
  setIntroClipStatus(
    state.introPlayback.enabled
      ? "Intro clip is enabled. It will be used only when available."
      : "Intro clip is off. The lesson will start directly."
  );
  if (state.introPlayback.enabled) {
    void ensureDefaultIntroClip();
  }
});
recordBtn.addEventListener("click", startRecordingNarration);
stopRecordBtn.addEventListener("click", stopRecordingNarration);
clearAudioBtn.addEventListener("click", clearNarration);
if (loadAnjaliNarrationBtn) {
  loadAnjaliNarrationBtn.addEventListener("click", () => {
    void runLockedAction("narrationLoad", [loadAnjaliNarrationBtn, downloadAnjaliBtn], async () => loadGeneratedNarrationIntoApp("anjali"));
  });
}
if (downloadAnjaliBtn) {
  downloadAnjaliBtn.addEventListener("click", () => runLockedAction("narrationDownload", [downloadAnjaliBtn, loadAnjaliNarrationBtn], async () => generateNarrationDownload("anjali")));
}
if (loadMathsNumbersBtn) {
  loadMathsNumbersBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_NUMBERS_TEMPLATE, "Numbers lesson loaded."));
}
if (loadMathsOperationsBtn) {
  loadMathsOperationsBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_OPERATIONS_TEMPLATE, "Operations lesson loaded."));
}
if (loadMathsTablesBtn) {
  loadMathsTablesBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_TABLES_TEMPLATE, "Tables from 2 to 10 loaded."));
}
if (loadMathsSumsBtn) {
  loadMathsSumsBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_SUMS_TEMPLATE, "Mixed maths sums loaded."));
}
if (loadMathsPronunciationBtn) {
  loadMathsPronunciationBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_PRONUNCIATION_TEMPLATE, "Pronunciation practice loaded."));
}
if (loadTable2Btn) {
  loadTable2Btn.addEventListener("click", () => applyMathsLessonTemplate(buildSingleTimesTable(2), "Table of 2 loaded."));
}
if (loadTable3Btn) {
  loadTable3Btn.addEventListener("click", () => applyMathsLessonTemplate(buildSingleTimesTable(3), "Table of 3 loaded."));
}
if (loadTable4Btn) {
  loadTable4Btn.addEventListener("click", () => applyMathsLessonTemplate(buildSingleTimesTable(4), "Table of 4 loaded."));
}
if (loadTable5Btn) {
  loadTable5Btn.addEventListener("click", () => applyMathsLessonTemplate(buildSingleTimesTable(5), "Table of 5 loaded."));
}
if (loadTable10Btn) {
  loadTable10Btn.addEventListener("click", () => applyMathsLessonTemplate(buildSingleTimesTable(10), "Table of 10 loaded."));
}
if (loadTableComboBtn) {
  loadTableComboBtn.addEventListener("click", () => applyMathsLessonTemplate(MATHS_TABLES_TEMPLATE, "Tables from 2 to 10 loaded."));
}
if (useAnjaliSampleBtn) {
  useAnjaliSampleBtn.addEventListener("click", () => {
    void useBundledAnjaliSampleAsNarration();
  });
}
if (downloadPdfContextBtn) {
  downloadPdfContextBtn.addEventListener("click", () => {
    void beginExportFromUi(handleAlternatePdfDownload);
  });
}
editBtn.addEventListener("click", () => {
  stopInputPreview(false);
  stopPlayback();
  invalidatePdfPresentationRequest();
  pauseStageVideoPlayback();
  state.images = state.images.filter((item) => !isAutoPdfExampleImage(item));
  state.presentationMode = "lesson";
  updatePlaybackProgressUi(0, false);
  stagePanel.classList.add("hidden");
  inputPanel.classList.remove("hidden");
  renderImagePreviews();
  setStatus("You can edit the content now.");
  updateStageModeUi();
  updateStageViewUi();
  updateSpeechToolsUi();
});
playBtn.addEventListener("click", () => runLockedAction("play", [playBtn, pdfPresentBtn, pdfShowBtn], playSlide));
pauseStageBtn.addEventListener("click", pausePdfPresentation);
stageImageUploadBtn.addEventListener("click", () => {
  imageInput.click();
});
stageVideoUploadBtn.addEventListener("click", () => {
  videoInput.click();
});
if (stageImageCutoutBtn) {
  stageImageCutoutBtn.addEventListener("click", async () => {
    try {
      await applyBackgroundRemovalToSelectedImage();
    } catch (error) {
      console.error(error);
      setImageCutoutStatus(error.message || "Background removal could not finish for that image.");
    }
  });
}
if (stageImageRestoreBtn) {
  stageImageRestoreBtn.addEventListener("click", async () => {
    try {
      await restoreSelectedImage();
    } catch (error) {
      console.error(error);
      setImageCutoutStatus(error.message || "The selected image could not be restored.");
    }
  });
}
if (stageVideoCutoutBtn) {
  stageVideoCutoutBtn.addEventListener("click", async () => {
    try {
      await applyBackgroundRemovalToActiveVideo();
    } catch (error) {
      console.error(error);
      setVideoStatus(error.message || "Background removal could not finish for that video.");
    }
  });
}
if (stageVideoRestoreBtn) {
  stageVideoRestoreBtn.addEventListener("click", () => {
    try {
      restoreActiveVideo();
    } catch (error) {
      console.error(error);
      setVideoStatus(error.message || "The selected video could not be restored.");
    }
  });
}
clearVideoBtn.addEventListener("click", () => {
  resetStageVideoState();
  drawScene(state.mouthOpen);
  setVideoStatus("No stage video selected.");
  setStatus("Stage video removed from the screen.");
});
prevPageBtn.addEventListener("click", () => {
  if (state.speaking) {
    return;
  }

  setPreviewPage(state.previewPageIndex - 1);
});
nextPageBtn.addEventListener("click", () => {
  if (state.speaking) {
    return;
  }

  setPreviewPage(state.previewPageIndex + 1);
});
zoomOutBtn.addEventListener("click", () => {
  setPreviewZoom(state.previewZoom - PREVIEW_ZOOM_STEP);
});
zoomInBtn.addEventListener("click", () => {
  setPreviewZoom(state.previewZoom + PREVIEW_ZOOM_STEP);
});
fontDecreaseBtn.addEventListener("click", () => {
  setFontScale(state.fontScale - FONT_SCALE_STEP);
});
fontIncreaseBtn.addEventListener("click", () => {
  setFontScale(state.fontScale + FONT_SCALE_STEP);
});
stageBoldBtn.addEventListener("click", () => {
  updateDisplayStyle({ bold: !state.displayStyle.bold });
});
stageItalicBtn.addEventListener("click", () => {
  updateDisplayStyle({ italic: !state.displayStyle.italic });
});
stageUnderlineBtn.addEventListener("click", () => {
  updateDisplayStyle({ underline: !state.displayStyle.underline });
});
seekBackwardBtn.addEventListener("click", () => {
  jumpPdfPresentation(-PDF_STAGE_SEEK_STEP_MS);
});
seekForwardBtn.addEventListener("click", () => {
  jumpPdfPresentation(PDF_STAGE_SEEK_STEP_MS);
});
stageTimelineInput.addEventListener("input", (event) => {
  seekPdfPresentation(event.target.value);
});
playbackSpeedSelect.addEventListener("change", (event) => {
  handleStagePlaybackRateChange(event.target.value);
});
playbackSpeedSelect.addEventListener("input", (event) => {
  handleStagePlaybackRateChange(event.target.value);
});
if (stagePlaybackSpeedSelect) {
  stagePlaybackSpeedSelect.addEventListener("change", (event) => {
    handleStagePlaybackRateChange(event.target.value);
  });
  stagePlaybackSpeedSelect.addEventListener("input", (event) => {
    handleStagePlaybackRateChange(event.target.value);
  });
}
stopStageBtn.addEventListener("click", () => {
  stopPlayback();
  setStatus("Playback stopped.");
});
[
  cutoutToleranceInput,
  cutoutFeatherInput,
  cutoutSpillInput,
  cutoutScreenBlendInput
].forEach((input) => {
  if (!input) {
    return;
  }

  input.addEventListener("input", handleCutoutControlChange);
  input.addEventListener("change", handleCutoutControlChange);
});
downloadBtn.addEventListener("click", () => {
  void beginExportFromUi(exportVideo);
});

document.addEventListener("keydown", (event) => {
  // Toggle whiteboard with W
  if (event.key.toLowerCase() === "w" && !event.ctrlKey && !event.metaKey && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    state.whiteboard.enabled = !state.whiteboard.enabled;
    const word = state.whiteboard.enabled ? "enabled" : "disabled";
    setStatus(`Whiteboard drawing is now ${word}. Click and drag on the screen to draw.`);
  }
  // Clear whiteboard with C
  if (event.key.toLowerCase() === "c" && !event.ctrlKey && !event.metaKey && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    if (state.whiteboard.strokes.length > 0) {
       state.whiteboard.strokes = [];
       drawScene(state.mouthOpen);
       setStatus("Whiteboard cleared.");
    }
  }
});

const resetInputsBtn = document.getElementById("resetInputsBtn");
if (resetInputsBtn) {
  resetInputsBtn.addEventListener("click", () => {
    if (window.confirm("Are you sure you want to clear all inputs and reset the workspace?")) {
        if (lessonInput) lessonInput.value = "";
        state.text = "";
        try { window.localStorage.removeItem(LESSON_STORAGE_KEY); } catch (e) {}

        if (mathsSourceInput) mathsSourceInput.value = "";
        state.mathsSource = "";
        try { window.localStorage.removeItem(MATHS_SOURCE_STORAGE_KEY); } catch (e) {}

        if (placeValueNumberInput) placeValueNumberInput.value = "";
        state.placeValueNumber = "";
        try { window.localStorage.removeItem(PLACE_VALUE_STORAGE_KEY); } catch (e) {}

        if (outcomesTitleInput) outcomesTitleInput.value = "";
        state.outcomesTitle = "";
        try { window.localStorage.removeItem(OUTCOMES_TITLE_STORAGE_KEY); } catch (e) {}

        if (window.watermarkCheck) window.watermarkCheck.checked = true;

        state.images = [];
        if (imageInput) imageInput.value = "";

        const audioInput = document.getElementById("audioFileInput");
        if (audioInput) audioInput.value = "";
        state.activeAudioFile = null;

        const videoInput = document.getElementById("videoFileInput");
        if (videoInput) videoInput.value = "";
        state.activeVideoFile = null;

        const audioFileName = document.getElementById("audioFileName");
        if (audioFileName) audioFileName.textContent = "No narration audio loaded.";
        
        const sceneVideoFileName = document.getElementById("sceneVideoFileName");
        if (sceneVideoFileName) sceneVideoFileName.textContent = "No scene video loaded.";

        _drawSceneLayoutCache.pagesReady = false;
        _drawSceneLayoutCache.pagesResult = null;
        _drawSceneLayoutCache.fullReady = false;
        _drawSceneLayoutCache.fullResult = null;
        
        state.previewPageIndex = 0;
        updateStagePageUi(0, 1);
        drawScene(0.12);
        setStatus("Workspace inputs successfully cleared.");
    }
  });
}

window.addEventListener("beforeunload", () => {
  if (state.anjaliMonitor.timerId) {
    window.clearInterval(state.anjaliMonitor.timerId);
    state.anjaliMonitor.timerId = 0;
  }
  stopInputPreview(false);
  stopDictation(false);
  stopPlayback(false);
  clearRecordingSession();
  resetNarrationState();
});

window.addEventListener("error", (event) => {
  const message = getDisplayErrorMessage(event?.error || event?.message, "The app hit an unexpected error.");
  console.error(event?.error || event);
  showRuntimeDisplayError(message);
});

window.addEventListener("unhandledrejection", (event) => {
  const message = getDisplayErrorMessage(event?.reason, "The app hit an unexpected async error.");
  console.error(event?.reason || event);
  showRuntimeDisplayError(message);
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    void ensureAnjaliCloneServer();
  }
});

window.addEventListener("online", () => {
  void ensureAnjaliCloneServer();
});

stageLogoImage.addEventListener("load", () => {
  drawScene(state.mouthOpen);
});

if (window.INFO_KIDS_LOGO_DATA_URI) {
  stageLogoImage.src = window.INFO_KIDS_LOGO_DATA_URI;
} else {
  stageLogoImage.removeAttribute("src");
}

window.__learningOutcomesState = state;

initializeTheme();
initializePresentationTemplate();
initializeDefaultPlaybackRate();
initializeMathsTeacherAssets();
updateStageVideoUi();
applyPreviewZoom();
drawScene(0.12);
state.introPlayback.enabled = Boolean(introClipEnabled?.checked);
if (state.introPlayback.enabled) {
  void ensureDefaultIntroClip();
} else {
  setIntroClipStatus("Intro clip is off. The lesson will start directly.");
}
setRecordingUi(false);
resetPdfProgress();
renderPdfPreview();
resetTranscribeProgress();
resetSceneGenerationProgress();
updateTextStyleUi();
updateStageViewUi();
updatePreferredVoiceUi();
updateBackgroundMusicUi();
updateScenePreview();
updateSceneGeneratorUi();
updateSpeechToolsUi();
updatePdfUi();
updateCutoutControlsUi();
setCutoutControlsStatus("These controls apply to both image and video background removal.");
checkServerHealth();
startAnjaliCloneMonitor();
if (stageAutoTeachBtn) {
  stageAutoTeachBtn.addEventListener("click", autoTeachSelectedImage);
}
if (stageAutoBRollBtn) {
  stageAutoBRollBtn.addEventListener("click", autoFetchSmartBRoll);
}
if (stageRemoveImageBtn) {
  stageRemoveImageBtn.addEventListener("click", removeSelectedStageImage);
}
if (stageClearImagesBtn) {
  stageClearImagesBtn.addEventListener("click", clearAllStageImages);
}
if (stageRemoveVideoBtn) {
  stageRemoveVideoBtn.addEventListener("click", removeActiveStageVideo);
}

const autoExplainBtn = document.getElementById("autoExplainBtn");
if (autoExplainBtn) {
  autoExplainBtn.addEventListener("click", async () => {
    if (!lessonInput || !lessonInput.value.trim()) {
      setStatus("Please type a short math concept or a math equation like '4 + 4 = 8' into the text box first!");
      return;
    }
    
    setStatus("Engaging Moondream2 Vision AI as a math explainer... (This takes a few seconds)");
    
    // We send a 1x1 blank image to trick Moondream into answering our text prompt
    const blankImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const mathConcept = lessonInput.value.trim();
    const specificPrompt = `Analyze this mathematical concept or equation: "${mathConcept}". Please write a short, easy-to-read educational paragraph that a teacher could read out loud to explain it to young students clearly. DO NOT use asterisks or bold formatting. IF it is addition or multiplication, you MUST end your paragraph with the exact math equation on a new line (for example '4 + 5 = 9' or what you were given) so that the procedural visual animations can automatically track and demonstrate it during playback.`;
    
    try {
      autoExplainBtn.disabled = true;
      const response = await fetch("http://127.0.0.1:8426/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: blankImage,
          prompt: specificPrompt
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
         throw new Error(result.error || "Failed to generate explanation.");
      }
      
      if (result.text) {
         lessonInput.value = result.text.trim();
         lessonInput.dispatchEvent(new Event("input"));
         lessonInput.dispatchEvent(new Event("change"));
         setStatus("Success! AI automatically generated the lesson explanation. You can edit it if needed.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Failed to auto-explain the concept.");
    } finally {
      autoExplainBtn.disabled = false;
    }
  });
}

// UI FLOW & ORGANIZATION: Exclusive Accordion
document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(document.querySelectorAll('.section-card'));
  sections.forEach((section) => {
    section.addEventListener('toggle', (e) => {
      if (section.open) {
        sections.forEach((other) => {
          if (other !== section && other.open) {
            other.removeAttribute('open');
          }
        });
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  });
});



function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

previewCanvas.addEventListener('pointerdown', (e) => {
    const pos = getMousePos(previewCanvas, e);
    
    if (document.getElementById("avatarEnableCheck")?.checked && !!transparentAnjaliCanvas) {
        if (pos.x >= avatarConfig.x && pos.x <= avatarConfig.x + avatarConfig.w &&
            pos.y >= avatarConfig.y && pos.y <= avatarConfig.y + avatarConfig.h) {
            avatarConfig.dragging = true;
            avatarConfig.dragOffX = pos.x - avatarConfig.x;
            avatarConfig.dragOffY = pos.y - avatarConfig.y;
            previewCanvas.setPointerCapture(e.pointerId);
            return;
        }
    }
    
    if (document.getElementById("logoEnableCheck")?.checked && infoKidsLogoImg.complete) {
        if (normalizePresentationTemplate(state.presentationTemplate) === 'learning-outcomes') {
            if (pos.x >= logoConfig.x && pos.x <= logoConfig.x + logoConfig.w &&
                pos.y >= logoConfig.y && pos.y <= logoConfig.y + logoConfig.h) {
                logoConfig.dragging = true;
                logoConfig.dragOffX = pos.x - logoConfig.x;
                logoConfig.dragOffY = pos.y - logoConfig.y;
                previewCanvas.setPointerCapture(e.pointerId);
                return;
            }
        }
    }
});

previewCanvas.addEventListener('pointermove', (e) => {
    const pos = getMousePos(previewCanvas, e);
    let dirty = false;
    
    if (avatarConfig.dragging) {
        avatarConfig.x = pos.x - avatarConfig.dragOffX;
        avatarConfig.y = pos.y - avatarConfig.dragOffY;
        dirty = true;
    } else if (logoConfig.dragging) {
        logoConfig.x = pos.x - logoConfig.dragOffX;
        logoConfig.y = pos.y - logoConfig.dragOffY;
        dirty = true;
    } else {
        let hoverAvatar = false;
        if (document.getElementById("avatarEnableCheck")?.checked && !!transparentAnjaliCanvas) {
            if (pos.x >= avatarConfig.x && pos.x <= avatarConfig.x + avatarConfig.w &&
                pos.y >= avatarConfig.y && pos.y <= avatarConfig.y + avatarConfig.h) {
                hoverAvatar = true;
            }
        }
        if (hoverAvatar !== avatarConfig.hovered) {
             avatarConfig.hovered = hoverAvatar;
             dirty = true;
        }
        
        let hoverLogo = false;
        if (document.getElementById("logoEnableCheck")?.checked && infoKidsLogoImg.complete) {
            if (normalizePresentationTemplate(state.presentationTemplate) === 'learning-outcomes') {
                if (pos.x >= logoConfig.x && pos.x <= logoConfig.x + logoConfig.w &&
                    pos.y >= logoConfig.y && pos.y <= logoConfig.y + logoConfig.h) {
                    hoverLogo = true;
                }
            }
        }
        if (hoverLogo !== logoConfig.hovered) {
             logoConfig.hovered = hoverLogo;
             dirty = true;
        }
        
        if (hoverAvatar) {
            previewCanvas.style.cursor = 'grab';
        } else if (hoverLogo) {
            previewCanvas.style.cursor = 'grab';
        } else {
            previewCanvas.style.cursor = 'default';
        }
    }
    
    if (dirty) {
        if (typeof drawScene === 'function') drawScene();
    }
});

previewCanvas.addEventListener('pointerup', (e) => {
    if (avatarConfig.dragging || logoConfig.dragging) {
        previewCanvas.releasePointerCapture(e.pointerId);
        avatarConfig.dragging = false;
        logoConfig.dragging = false;
        if (typeof drawScene === 'function') drawScene();
    }
});

previewCanvas.addEventListener('wheel', (e) => {
    if (avatarConfig.hovered) {
        e.preventDefault();
        avatarConfig.scale -= e.deltaY * 0.001;
        if (avatarConfig.scale < 0.1) avatarConfig.scale = 0.1;
        if (typeof drawScene === 'function') drawScene();
    } else if (logoConfig.hovered) {
        e.preventDefault();
        logoConfig.scale -= e.deltaY * 0.001;
        if (logoConfig.scale < 0.1) logoConfig.scale = 0.1;
        if (typeof drawScene === 'function') drawScene();
    }
}, {passive: false});

document.getElementById("avatarEnableCheck")?.addEventListener('change', () => { if (typeof drawScene === 'function') drawScene(); });
document.getElementById("logoEnableCheck")?.addEventListener('change', () => { if (typeof drawScene === 'function') drawScene(); });

// -- FLOATING COLOR PALETTE FOR QUICK DRAG & DROP COLORING --
const floatingPalette = document.getElementById("floatingColorPalette");
if (floatingPalette && lessonInput) {
    lessonInput.addEventListener("mouseup", (e) => {
        const start = lessonInput.selectionStart ?? 0;
        const end = lessonInput.selectionEnd ?? 0;
        if (start !== end) {
            floatingPalette.style.display = "flex";
            // Align beautifully under mouse coordinates
            floatingPalette.style.left = (e.clientX + 14) + "px";
            floatingPalette.style.top = (e.clientY - 14) + "px";
        } else {
            floatingPalette.style.display = "none";
        }
    });

    document.addEventListener("mousedown", (e) => {
        if (e.target !== lessonInput && !floatingPalette.contains(e.target)) {
            floatingPalette.style.display = "none";
        }
    });

    floatingPalette.querySelectorAll(".color-swatch").forEach(swatch => {
        // Prevent clicking the swatch from destroying the text selection in the input box!
        swatch.addEventListener("mousedown", (e) => {
            e.preventDefault(); 
        });
        
        swatch.addEventListener("click", () => {
            const color = swatch.getAttribute("data-color");
            updateSelectionStyle({ color: color }); // instantly paints canvas word via system state
            
            // Mirror onto visual side-panel style card 
            const colorSelect = document.getElementById("selectedTextColorSelect");
            if (colorSelect) colorSelect.value = color;
            
            floatingPalette.style.display = "none";
        });
    });
}

// -- PURE ENGLISH TEXT TRANSLATOR (GRAMMAR & PROFESSIONAL POLISH) --
const pureEnglishBtn = document.getElementById("pureEnglishTranslateBtn");
if (pureEnglishBtn) {
    pureEnglishBtn.addEventListener('click', () => {
        const sourceInput = document.getElementById("mathsSourceInput");
        let text = sourceInput?.value.trim() || lessonInput.value.trim();
        if (!text) return;
        
        // Comprehensive heuristic translation to "Pure Indian English Female Teacher Style"
        let translated = text
            // Common shorthands
            .replace(/\b(u|ur|y)\b/gi, (match) => {
                if(match.toLowerCase() === 'u') return 'you';
                if(match.toLowerCase() === 'ur') return 'your';
                if(match.toLowerCase() === 'y') return 'why';
                return match;
            })
            .replace(/\b(plz|pls)\b/gi, "please")
            .replace(/\b(thx|tnx)\b/gi, "thank you")
            .replace(/\b(v)\b/gi, "we")
            .replace(/\b(bcoz|cuz|cos|because)\b/gi, "because")
            .replace(/\b(gud)\b/gi, "good")
            .replace(/\b(dat)\b/gi, "that")
            .replace(/\b(wid)\b/gi, "with")
            .replace(/\b(msg)\b/gi, "message")
            // Grammar fixes and filler expansion
            .replace(/\b(gonna)\b/gi, "going to")
            .replace(/\b(wanna)\b/gi, "want to")
            .replace(/\b(lemme)\b/gi, "let me")
            // Indian teacher style polish
            .replace(/\b(students|guys|kids)\b/gi, "students") // formalize
            .replace(/(!{2,})/g, "!") // normalize excitement
            .replace(/\s+/g, ' '); // space collapsing
            
        // Capitalize first letter of sentences
        translated = translated.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        
        if (sourceInput && sourceInput.value.trim().length > 0) {
            sourceInput.value = translated;
            lessonInput.value = translated;
            try { refreshSelectedPhraseFromInput(); } catch(e){}
        } else {
            lessonInput.value = translated;
        }
        
        // Push update to rendering loop synchronously
        if (typeof scheduleLessonInputChange === "function") {
            scheduleLessonInputChange(0);
        }
    });
}
