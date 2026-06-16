import { create } from 'zustand';

export const PRESENTATION_TEMPLATE_CLASSIC = "classic";
export const PRESENTATION_TEMPLATE_OUTCOMES = "learning-outcomes";
export const DEFAULT_STAGE_PLAYBACK_RATE = 1.0;
export const DEFAULT_INTRO_VIDEO_FILE = "default-intro-optimized.mp4";
export const STAGE_VIDEO_CUTOUT_TOLERANCE = 15;
export const STAGE_VIDEO_EDGE_FEATHER = 3;

const createEmptyStageVideoState = () => ({
  id: "",
  file: null,
  fileName: "",
  url: "",
  element: null,
  durationMs: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  cutoutApplied: false,
  muted: false,
  volume: 1
});

const initialState = {
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

export const useStore = create((set, get) => ({
  ...initialState,
  
  // Generic update functions
  setState: (newState) => set((state) => ({ ...state, ...newState })),
  
  setNestedState: (path, value) => set((state) => {
    const keys = path.split('.');
    const newState = { ...state };
    let current = newState;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return newState;
  }),
}));
