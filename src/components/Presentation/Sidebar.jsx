import React, { useState, useRef, useEffect } from 'react';

// ─── Primitive UI Components ──────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <div className="flex items-center px-2 mb-2">
    <span className="text-[11px] font-medium text-[rgba(218,220,224,0.9)] tracking-[0.1px] normal-case">
      {children}
    </span>
  </div>
);

const FieldDropdown = ({ label, value, options, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left border border-[#595959] hover:border-[#7a7a7a] transition-colors rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-2.5 pr-1 pt-[5px] select-none focus:outline-none bg-transparent">
        <p className="text-[11px] font-medium text-[rgba(255,255,255,0.35)] tracking-[0.1px]">{label}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-white tracking-[0.1px] truncate pr-2">{value}</span>
          <span className={`material-symbols-outlined text-[16px] text-[rgba(218,220,224,0.5)] mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-[#0e0e0e] border border-[#595959] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md animate-dropdown origin-top">
          <div className="max-h-60 overflow-y-auto dark-scrollbar">
            {options.map((opt) => (
              <button key={opt} type="button"
                className={`w-full text-left px-2.5 py-2 text-[11px] font-medium tracking-[0.1px] hover:bg-[#1a1a1a] transition-colors ${value === opt ? 'bg-[#1a1a1a] text-white' : 'text-[rgba(218,220,224,0.9)]'}`}
                onClick={() => { onChange(opt); setIsOpen(false); }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DragNumberField = ({ label, value, min = 0, max = 999, step = 1, suffix = '', onChange, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef(null);
  const dragRef = useRef(null);

  const commitEdit = (raw) => {
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const snapped = Math.round(parsed / step) * step;
      onChange(Math.min(max, Math.max(min, snapped)));
    }
    setIsEditing(false);
  };

  const handleMouseDown = (e) => {
    if (isEditing) return;
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startVal: value, moved: false };
    const handleMouseMove = (ev) => {
      if (!dragRef.current) return;
      if (Math.abs(ev.clientY - dragRef.current.startY) > 3) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        const delta = (dragRef.current.startY - ev.clientY) * step;
        const newVal = dragRef.current.startVal + delta;
        onChange(Math.min(max, Math.max(min, Math.round(newVal / step) * step)));
        document.body.style.cursor = 'ns-resize';
      }
    };
    const handleMouseUp = () => {
      const wasDrag = dragRef.current?.moved;
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      if (!wasDrag) {
        setEditValue(String(value));
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`border border-[#595959] hover:border-[#7a7a7a] rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-2.5 pr-1 pt-[5px] select-none transition-colors ${isEditing ? '' : 'cursor-ns-resize'} ${className}`}
      onMouseDown={handleMouseDown}>
      <p className="text-[11px] font-medium text-[rgba(255,255,255,0.35)] tracking-[0.1px]">{label}</p>
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input ref={inputRef} type="text" value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(editValue); if (e.key === 'Escape') setIsEditing(false); }}
            onBlur={() => commitEdit(editValue)}
            className="bg-transparent text-[11px] font-medium text-white tracking-[0.1px] outline-none w-full border-none p-0 m-0" autoFocus />
        ) : (
          <>
            <span className="text-[11px] font-medium text-white tracking-[0.1px] cursor-text">{Number(value.toFixed(2))}{suffix}</span>
            <div className="flex flex-col items-center mr-1.5 -gap-px text-white/40">
              <span className="material-symbols-outlined text-[12px]">unfold_more</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RangeSlider = ({ label, value, min, max, step = 1, formatValue = (v) => String(v), onChange }) => (
  <div className="flex flex-col gap-2 pt-1 pb-[5px] w-full">
    <div className="flex items-center justify-between px-1 select-none">
      <span className="text-[11px] font-medium text-[rgba(218,220,224,0.9)] tracking-[0.1px]">{label}</span>
      <span className="text-[11px] font-medium text-[#c7c9cd] tracking-[0.1px]">{formatValue(value)}</span>
    </div>
    <div className="px-1 w-full flex items-center h-2">
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  </div>
);

const ColorControl = ({ label, value, onChange, className = '' }) => {
  // Safely extract hex for the color input — handles both #rrggbb and rgba(...)
  const toHex = (v) => {
    if (!v) return '#ffffff';
    if (v.startsWith('#') && v.length <= 7) return v;
    // Parse rgba
    const match = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return '#' + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    }
    return '#ffffff';
  };

  const displayLabel = value && value.length > 9 ? value.slice(0, 14) + '…' : (value || '').toUpperCase();

  return (
    <div className={`border border-[#595959] hover:border-[#7a7a7a] rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-2.5 pr-1 pt-[5px] select-none transition-colors ${className}`}>
      <p className="text-[11px] font-medium text-[rgba(255,255,255,0.35)] tracking-[0.1px]">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/50 truncate pr-1">{displayLabel}</span>
        <div className="relative w-5 h-5 rounded-md overflow-hidden border border-white/10 mr-1 shrink-0">
          <input
            type="color"
            value={toHex(value)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EDGE_VOICES = [
  { id: 'en-IN-NeerjaExpressiveNeural', name: 'India - Neerja (Expressive)' },
  { id: 'en-IN-NeerjaNeural', name: 'India - Neerja' },
  { id: 'en-IN-PrabhatNeural', name: 'India - Prabhat' },
  { id: 'en-US-JennyNeural', name: 'US - Jenny' },
  { id: 'en-US-GuyNeural', name: 'US - Guy' },
  { id: 'en-US-AriaNeural', name: 'US - Aria' },
  { id: 'en-US-AnaNeural', name: 'US - Ana' },
  { id: 'en-US-AvaNeural', name: 'US - Ava' },
  { id: 'en-US-EmmaNeural', name: 'US - Emma' },
  { id: 'en-US-BrianNeural', name: 'US - Brian' },
  { id: 'en-GB-SoniaNeural', name: 'UK - Sonia' },
  { id: 'en-GB-RyanNeural', name: 'UK - Ryan' },
  { id: 'en-GB-LibbyNeural', name: 'UK - Libby' },
  { id: 'en-GB-ThomasNeural', name: 'UK - Thomas' },
  { id: 'en-CA-ClaraNeural', name: 'Canada - Clara' },
  { id: 'en-CA-LiamNeural', name: 'Canada - Liam' },
  { id: 'en-AU-NatashaNeural', name: 'Australia - Natasha' },
  { id: 'en-AU-WilliamMultilingualNeural', name: 'Australia - William (Multilingual)' }
];

const SC3_VOICES = [
  { id: 'sc3', name: 'SC3 / Anjali (Default)' },
  { id: 'pattan', name: 'Pattan Neural Voice' }
];

// ─── Template Presets ─────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'galaxy',
    name: 'Galaxy Night',
    emoji: '🌌',
    preview: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 60%, #0d1b2a 100%)',
    accentPreview: '#a78bfa',
    theme: {
      fontSize: 68,
      fontFamily: 'Space Grotesk',
      textColor: 'rgba(196,181,253,0.55)',
      accentColor: '#c4b5fd',
      boardBg: 'transparent',
      pageBg: '#0d1b2a',
      animationStyle: 'float',
      animationSpeed: 1.0,
      backgroundType: 'galaxy',
      textAlign: 'left',
      wordSpacing: 0.3,
      lineHeight: 1.4,
      rowGap: 0.5,
      horizontalPadding: 100,
      verticalPadding: 120,
      gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 60%, #0d1b2a 100%)',
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Dark',
    emoji: '🌑',
    preview: '#0a0a0a',
    accentPreview: '#ffffff',
    theme: {
      fontSize: 72,
      fontFamily: 'Inter',
      textColor: 'rgba(255,255,255,0.4)',
      accentColor: '#ffffff',
      boardBg: 'transparent',
      pageBg: '#0a0a0a',
      animationStyle: 'typewriter',
      animationSpeed: 1.2,
      backgroundType: 'none',
      textAlign: 'left',
      wordSpacing: 0.25,
      lineHeight: 1.3,
      rowGap: 0.4,
      horizontalPadding: 80,
      verticalPadding: 160,
      gradient: 'none',
    }
  },
  {
    id: 'warmDusk',
    name: 'Warm Dusk',
    emoji: '🌅',
    preview: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1a0020 100%)',
    accentPreview: '#fb923c',
    theme: {
      fontSize: 64,
      fontFamily: 'Lexend',
      textColor: 'rgba(253,186,116,0.45)',
      accentColor: '#fb923c',
      boardBg: 'transparent',
      pageBg: '#130800',
      animationStyle: 'pop',
      animationSpeed: 1.1,
      backgroundType: 'blobs',
      textAlign: 'left',
      wordSpacing: 0.3,
      lineHeight: 1.4,
      rowGap: 0.5,
      horizontalPadding: 90,
      verticalPadding: 140,
      gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1a0020 100%)',
    }
  },
  {
    id: 'crystal',
    name: 'Crystal',
    emoji: '💎',
    preview: 'linear-gradient(135deg, #020617 0%, #0c1445 50%, #020617 100%)',
    accentPreview: '#22d3ee',
    theme: {
      fontSize: 70,
      fontFamily: 'Syne',
      textColor: 'rgba(103,232,249,0.4)',
      accentColor: '#22d3ee',
      boardBg: 'transparent',
      pageBg: '#020617',
      animationStyle: 'blur-in',
      animationSpeed: 0.9,
      backgroundType: 'mesh',
      textAlign: 'center',
      wordSpacing: 0.35,
      lineHeight: 1.5,
      rowGap: 0.6,
      horizontalPadding: 120,
      verticalPadding: 180,
      gradient: 'linear-gradient(135deg, #020617 0%, #0c1445 50%, #020617 100%)',
    }
  },
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '📰',
    preview: '#f5f5f0',
    accentPreview: '#1c1c1c',
    theme: {
      fontSize: 66,
      fontFamily: 'Playfair Display',
      textColor: 'rgba(28,28,28,0.35)',
      accentColor: '#1c1c1c',
      boardBg: 'transparent',
      pageBg: '#f5f5f0',
      animationStyle: 'slide',
      animationSpeed: 1.0,
      backgroundType: 'none',
      textAlign: 'left',
      wordSpacing: 0.2,
      lineHeight: 1.45,
      rowGap: 0.5,
      horizontalPadding: 100,
      verticalPadding: 160,
      gradient: 'none',
    }
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '🎯',
    preview: '#000000',
    accentPreview: '#facc15',
    theme: {
      fontSize: 80,
      fontFamily: 'JetBrains Mono',
      textColor: 'rgba(255,255,255,0.2)',
      accentColor: '#facc15',
      boardBg: 'transparent',
      pageBg: '#000000',
      animationStyle: 'typewriter',
      animationSpeed: 1.3,
      backgroundType: 'none',
      textAlign: 'left',
      wordSpacing: 0.15,
      lineHeight: 1.25,
      rowGap: 0.3,
      horizontalPadding: 80,
      verticalPadding: 200,
      gradient: 'none',
    }
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    emoji: '✨',
    preview: 'linear-gradient(180deg, #000000 0%, #0a0a2a 50%, #000000 100%)',
    accentPreview: '#818cf8',
    theme: {
      fontSize: 72,
      fontFamily: 'Inter',
      textColor: 'rgba(129,140,248,0.4)',
      accentColor: '#818cf8',
      boardBg: 'transparent',
      pageBg: '#000005',
      animationStyle: 'glow',
      animationSpeed: 1.0,
      backgroundType: 'stars',
      textAlign: 'center',
      wordSpacing: 0.3,
      lineHeight: 1.5,
      rowGap: 0.5,
      horizontalPadding: 120,
      verticalPadding: 160,
      gradient: 'none',
    }
  },
  {
    id: 'neon',
    name: 'Neon Pulse',
    emoji: '⚡',
    preview: 'linear-gradient(135deg, #0a001a 0%, #001a0a 100%)',
    accentPreview: '#39ff14',
    theme: {
      fontSize: 66,
      fontFamily: 'Space Grotesk',
      textColor: 'rgba(57,255,20,0.3)',
      accentColor: '#39ff14',
      boardBg: 'transparent',
      pageBg: '#060010',
      animationStyle: 'bounce',
      animationSpeed: 1.2,
      backgroundType: 'gradient',
      textAlign: 'left',
      wordSpacing: 0.25,
      lineHeight: 1.35,
      rowGap: 0.45,
      horizontalPadding: 80,
      verticalPadding: 150,
      gradient: 'linear-gradient(135deg, #0a001a 0%, #001a0a 100%)',
    }
  },
];

// ─── Template Card ────────────────────────────────────────────────────────────
const TemplateCard = ({ template, isActive, onApply }) => (
  <button
    type="button"
    onClick={() => onApply(template.theme)}
    className={`w-full rounded-xl overflow-hidden border transition-all group text-left active:scale-[0.97] ${isActive ? 'border-white/50 ring-1 ring-white/20' : 'border-[#595959] hover:border-white/30'}`}
  >
    {/* Mini preview bar */}
    <div
      className="w-full h-10 flex items-center justify-end pr-3"
      style={{ background: template.preview }}
    >
      <div
        className="w-4 h-4 rounded-full shadow-lg"
        style={{ backgroundColor: template.accentPreview, boxShadow: `0 0 8px ${template.accentPreview}` }}
      />
    </div>
    {/* Label */}
    <div className="px-2.5 py-2 bg-[#141414] flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-[13px]">{template.emoji}</span>
        <span className="text-[10px] font-bold tracking-wider text-white/80">{template.name}</span>
      </div>
      {isActive && <span className="material-symbols-outlined text-[14px] text-white/60">check_circle</span>}
    </div>
  </button>
);

// ─── Gradient Presets ─────────────────────────────────────────────────────────
const GRADIENT_PRESETS = [
  { name: 'Galaxy', value: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 60%, #0d1b2a 100%)' },
  { name: 'Midnight', value: 'linear-gradient(180deg, #000000 0%, #0f0f2d 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1a0020 100%)' },
  { name: 'Ocean', value: 'linear-gradient(180deg, #020617 0%, #0c1445 50%, #001020 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #0a1a0a 0%, #001a0a 100%)' },
  { name: 'Neon', value: 'linear-gradient(135deg, #0a001a 0%, #001a0a 100%)' },
  { name: 'Crimson', value: 'linear-gradient(135deg, #1a0000 0%, #3d0000 50%, #1a0000 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #001a0a 0%, #0a001a 50%, #1a0a00 100%)' },
];

const normalizeArrowLineBreaks = (value) =>
  String(value || '').replace(/=>[^\S\r\n]*/g, '=>\n');

// ─── Sidebar Component ────────────────────────────────────────────────────────
export const Sidebar = ({
  context, setContext, theme, setTheme, voices, selectedVoice, setSelectedVoice, disabled,
  engine = 'native', setEngine, selectedEdgeVoice = 'en-US-JennyNeural', setSelectedEdgeVoice,
  selectedSc3Voice = 'sc3', setSelectedSc3Voice,
  onExportVideo, isExporting, exportProgress, exportFileName, setExportFileName,
  onPreviewVoice,
  playIntro = false, setPlayIntro,
  posterImage = null, setPosterImage,
  posterFileName = '', setPosterFileName,
  posterDuration = 3, setPosterDuration
}) => {
  const [activeTab, setActiveTab] = useState('templates');
  const posterInputRef = React.useRef(null);

  const animationStyles = ['typewriter', 'pop', 'float', 'slide', 'bounce', 'glow', 'blur-in'];
  const backgroundTypes = ['none', 'galaxy', 'stars', 'gradient', 'blobs', 'mesh', 'waves'];
  const fontFamilies = ['Inter', 'Space Grotesk', 'Lexend', 'Arvo', 'Syne', 'JetBrains Mono', 'Playfair Display'];

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setPosterImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearPoster = () => {
    setPosterImage(null);
    setPosterFileName('');
    if (posterInputRef.current) posterInputRef.current.value = '';
  };

  const activeTemplateId = TEMPLATES.find(t =>
    t.theme.backgroundType === theme.backgroundType &&
    t.theme.fontFamily === theme.fontFamily &&
    t.theme.animationStyle === theme.animationStyle
  )?.id;

  const showGradientPicker = theme.backgroundType === 'gradient' || theme.backgroundType === 'galaxy';

  const tabs = ['templates', 'content', 'visuals', 'layout'];

  return (
    <div className="w-[320px] h-full bg-[#0e0e0e] flex flex-col border-r border-[rgba(218,220,224,0.15)] overflow-hidden">

      {/* Tab Navigation */}
      <div className="px-3 pt-4 pb-2 border-b border-white/5 bg-[#0e0e0e]">
        <div className="grid grid-cols-4 w-full items-center border border-[#595959] rounded-xl overflow-hidden bg-transparent">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center h-[32px] text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#969696] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {tab === 'templates' ? '🎨' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 dark-scrollbar pb-32 bg-[#0e0e0e]">

        {/* ══════════════════════════ TEMPLATES TAB ══════════════════════════ */}
        {activeTab === 'templates' && (
          <div className="flex flex-col gap-4">
            <div>
              <SectionLabel>Choose a Template</SectionLabel>
              <p className="text-[9px] text-white/30 px-2 mb-3 leading-relaxed">
                Click any template to instantly apply its background, font, colors and animation style.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isActive={activeTemplateId === template.id}
                    onApply={(t) => setTheme({ ...theme, ...t })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ CONTENT TAB ══════════════════════════ */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-6">
            <div>
              <SectionLabel>Story Script</SectionLabel>
              <textarea
                value={context}
                onChange={(e) => setContext(normalizeArrowLineBreaks(e.target.value))}
                disabled={disabled}
                placeholder="Enter your story here..."
                className="w-full h-80 p-3 bg-white/5 border border-white/10 rounded-xl text-[12px] leading-relaxed font-medium resize-none focus:outline-none focus:border-[#969696] placeholder:text-white/10 text-white/80 transition-all"
              />
            </div>

            <div className="flex flex-col gap-3">
              <SectionLabel>Narration Voice</SectionLabel>

              <FieldDropdown
                label="Speech Engine"
                value={engine === 'native' ? 'Web Speech API (Local)' : engine === 'edge' ? 'Microsoft Edge TTS (Cloud)' : 'Chatterbox SC3 Voice (Local)'}
                options={['Web Speech API (Local)', 'Microsoft Edge TTS (Cloud)', 'Chatterbox SC3 Voice (Local)']}
                onChange={(name) => {
                  if (setEngine) {
                    if (name.includes('Web Speech')) setEngine('native');
                    else if (name.includes('Edge')) setEngine('edge');
                    else setEngine('sc3');
                  }
                }}
              />

              <p className="text-[9px] text-white/40 px-1 -mt-1 leading-normal">
                {engine === 'native' && 'Uses standard system voice synthesis. Works offline, basic quality.'}
                {engine === 'edge' && 'Uses high-fidelity Microsoft Cloud voices. Requires internet.'}
                {engine === 'sc3' && 'Uses local neural voice cloning model. High quality, offline.'}
              </p>

              {engine === 'native' && (
                <div className="flex gap-1.5 items-end">
                  <FieldDropdown
                    label="Web Speech Voice"
                    value={selectedVoice?.name || 'Default'}
                    options={voices.map(v => v.name)}
                    onChange={(name) => {
                      const voice = voices.find(v => v.name === name);
                      if (voice) setSelectedVoice(voice);
                    }}
                    className="flex-1"
                  />
                  <button type="button" onClick={onPreviewVoice} disabled={disabled}
                    className="w-10 h-10 border border-[#595959] hover:bg-white/5 text-white/70 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 mb-0.5"
                    title="Preview Voice">
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </button>
                </div>
              )}

              {engine === 'edge' && (
                <div className="flex gap-1.5 items-end">
                  <FieldDropdown
                    label="Edge Neural Voice"
                    value={EDGE_VOICES.find(v => v.id === selectedEdgeVoice)?.name || 'Default'}
                    options={EDGE_VOICES.map(v => v.name)}
                    onChange={(name) => {
                      const voice = EDGE_VOICES.find(v => v.name === name);
                      if (voice && setSelectedEdgeVoice) setSelectedEdgeVoice(voice.id);
                    }}
                    className="flex-1"
                  />
                  <button type="button" onClick={onPreviewVoice} disabled={disabled}
                    className="w-10 h-10 border border-[#595959] hover:bg-white/5 text-white/70 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 mb-0.5"
                    title="Preview Voice">
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </button>
                </div>
              )}

              {engine === 'sc3' && (
                <div className="flex gap-1.5 items-end">
                  <FieldDropdown
                    label="SC3 Neural Voice"
                    value={SC3_VOICES.find(v => v.id === selectedSc3Voice)?.name || 'Default'}
                    options={SC3_VOICES.map(v => v.name)}
                    onChange={(name) => {
                      const voice = SC3_VOICES.find(v => v.name === name);
                      if (voice && setSelectedSc3Voice) setSelectedSc3Voice(voice.id);
                    }}
                    className="flex-1"
                  />
                  <button type="button" onClick={onPreviewVoice} disabled={disabled}
                    className="w-10 h-10 border border-[#595959] hover:bg-white/5 text-white/70 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 mb-0.5"
                    title="Preview Voice">
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </button>
                </div>
              )}

              <RangeSlider
                label="Reading Speed"
                value={theme.animationSpeed}
                min={0.5} max={2.0} step={0.1}
                onChange={(v) => setTheme({ ...theme, animationSpeed: v })}
                formatValue={v => `${v.toFixed(1)}x`}
              />
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              <SectionLabel>Intro &amp; Poster</SectionLabel>

              <label className="flex items-center gap-2 px-1 cursor-pointer select-none text-[11px] font-medium text-white/70 hover:text-white">
                <input
                  type="checkbox"
                  checked={playIntro}
                  onChange={(e) => setPlayIntro(e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-white text-black"
                />
                Play Intro Video
              </label>

              <div className="flex flex-col gap-1.5 mt-1">
                {posterImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/10 group mb-1 bg-[#121212]">
                    <img src={posterImage} alt="Poster preview" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={() => posterInputRef.current?.click()} disabled={disabled}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all active:scale-90">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button type="button" onClick={clearPoster} disabled={disabled}
                        className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 flex items-center justify-center text-red-300 transition-all active:scale-90">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-medium text-white/90 truncate border border-white/5">
                      {posterFileName}
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => posterInputRef.current?.click()} disabled={disabled}
                    className="w-full h-16 border border-dashed border-[#595959] hover:border-white/40 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/50 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-white/40">add_photo_alternate</span>
                    <span>Add Poster Image</span>
                  </button>
                )}
                <input ref={posterInputRef} type="file" accept="image/*" onChange={handlePosterChange} hidden disabled={disabled} />
              </div>

              {posterFileName && (
                <DragNumberField label="Poster Duration" value={posterDuration} min={1} max={10} step={1} suffix="s" onChange={setPosterDuration} />
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              <SectionLabel>Export Presentation</SectionLabel>

              <div className="border border-[#595959] rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-2.5 pr-2.5 pt-[5px] bg-transparent">
                <p className="text-[11px] font-medium text-[rgba(255,255,255,0.35)] tracking-[0.1px]">Output File Name</p>
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  disabled={disabled || isExporting}
                  className="bg-transparent text-[11px] font-medium text-white tracking-[0.1px] outline-none w-full border-none p-0 m-0"
                />
              </div>

              <button
                type="button"
                onClick={onExportVideo}
                disabled={disabled || isExporting || !context.trim()}
                className={`w-full h-11 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isExporting
                  ? 'bg-white/10 text-white/50 border border-white/10 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'}`}
              >
                <span className="material-symbols-outlined text-[18px] animate-none">
                  {isExporting ? 'sync' : 'videocam'}
                </span>
                {isExporting ? `Exporting: ${exportProgress}` : 'Export Entire Video'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════ VISUALS TAB ══════════════════════════ */}
        {activeTab === 'visuals' && (
          <div className="flex flex-col gap-6">
            <div>
              <SectionLabel>Typography</SectionLabel>
              <div className="flex flex-col gap-2">
                <FieldDropdown
                  label="Font Family"
                  value={theme.fontFamily}
                  options={fontFamilies}
                  onChange={(f) => setTheme({ ...theme, fontFamily: f })}
                />
                <div className="flex gap-1.5">
                  <DragNumberField label="Size" value={theme.fontSize} min={12} max={300} suffix="px" onChange={v => setTheme({ ...theme, fontSize: v })} className="flex-1" />
                  <DragNumberField label="Height" value={theme.lineHeight} min={0.5} max={3.0} step={0.1} suffix="x" onChange={v => setTheme({ ...theme, lineHeight: v })} className="flex-1" />
                </div>
                {/* Live font preview */}
                <div
                  className="border border-[#595959] rounded-xl px-3 py-2.5 text-center text-[14px] text-white/70 bg-white/3 leading-snug"
                  style={{ fontFamily: theme.fontFamily }}
                >
                  The quick brown fox jumps
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Animation &amp; Effect</SectionLabel>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {['typewriter', 'pop', 'float', 'slide', 'bounce', 'glow', 'blur-in'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTheme({ ...theme, animationStyle: style })}
                      className={`h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${theme.animationStyle === style
                        ? 'bg-white/15 border-white/40 text-white'
                        : 'border-[#595959] text-white/40 hover:text-white hover:border-white/30'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <RangeSlider label="Intensity" value={theme.animationSpeed} min={0.2} max={3.0} step={0.1} onChange={v => setTheme({ ...theme, animationSpeed: v })} formatValue={v => `${v.toFixed(1)}x`} />
              </div>
            </div>

            <div>
              <SectionLabel>Background &amp; Scene</SectionLabel>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {backgroundTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTheme({ ...theme, backgroundType: type })}
                      className={`h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1 ${theme.backgroundType === type
                        ? 'bg-white/15 border-white/40 text-white'
                        : 'border-[#595959] text-white/40 hover:text-white hover:border-white/30'}`}
                    >
                      {type === 'galaxy' ? '🌌' : type === 'stars' ? '⭐' : type === 'blobs' ? '🫧' : type === 'mesh' ? '🕸' : type === 'waves' ? '🌊' : type === 'gradient' ? '🎨' : '⬛'}
                      {type}
                    </button>
                  ))}
                </div>

                {/* Gradient preset picker */}
                {showGradientPicker && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="text-[10px] text-white/40 px-1">Gradient Preset</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {GRADIENT_PRESETS.map(g => (
                        <button
                          key={g.name}
                          type="button"
                          title={g.name}
                          onClick={() => setTheme({ ...theme, gradient: g.value })}
                          className={`h-10 rounded-lg border transition-all ${theme.gradient === g.value ? 'border-white/60 ring-1 ring-white/30' : 'border-white/10 hover:border-white/30'}`}
                          style={{ background: g.value }}
                        >
                          <span className="sr-only">{g.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-white/25 px-1">
                      {GRADIENT_PRESETS.find(g => g.value === theme.gradient)?.name || 'Custom'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  <ColorControl label="Text" value={theme.textColor} onChange={v => setTheme({ ...theme, textColor: v })} />
                  <ColorControl label="Accent" value={theme.accentColor} onChange={v => setTheme({ ...theme, accentColor: v })} />
                  <ColorControl label="Page Bg" value={theme.pageBg} onChange={v => setTheme({ ...theme, pageBg: v })} />
                  <ColorControl label="Board Bg" value={theme.boardBg === 'transparent' ? '#000000' : theme.boardBg} onChange={v => setTheme({ ...theme, boardBg: v })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ LAYOUT TAB ══════════════════════════ */}
        {activeTab === 'layout' && (
          <div className="flex flex-col gap-6">
            <div>
              <SectionLabel>Text Alignment</SectionLabel>
              <div className="flex w-full items-center border border-[#595959] rounded-xl overflow-hidden bg-transparent">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => setTheme({ ...theme, textAlign: align })}
                    className={`flex-1 flex items-center justify-center h-[34px] transition-all ${theme.textAlign === align ? 'bg-[#969696] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {align === 'left' ? 'format_align_left' : align === 'center' ? 'format_align_center' : 'format_align_right'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Spacing &amp; Margins</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <DragNumberField label="Word Gap" value={theme.wordSpacing} min={0} max={2} step={0.05} suffix="em" onChange={v => setTheme({ ...theme, wordSpacing: v })} />
                <DragNumberField label="Row Gap" value={theme.rowGap} min={0} max={2} step={0.05} suffix="em" onChange={v => setTheme({ ...theme, rowGap: v })} />
                <DragNumberField label="H-Padding" value={theme.horizontalPadding} min={0} max={400} suffix="px" onChange={v => setTheme({ ...theme, horizontalPadding: v })} />
                <DragNumberField label="V-Padding" value={theme.verticalPadding} min={0} max={400} suffix="px" onChange={v => setTheme({ ...theme, verticalPadding: v })} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setTheme({
                    fontSize: 72,
                    fontFamily: 'Inter',
                    textColor: 'rgba(255,255,255,0.4)',
                    accentColor: '#ffffff',
                    boardBg: 'transparent',
                    pageBg: '#0a0a0a',
                    animationStyle: 'typewriter',
                    animationSpeed: 1.2,
                    backgroundType: 'none',
                    textAlign: 'left',
                    wordSpacing: 0.25,
                    lineHeight: 1.3,
                    rowGap: 0.4,
                    horizontalPadding: 80,
                    verticalPadding: 160,
                    gradient: 'none',
                  });
                }}
                className="w-full h-10 border border-[#595959] hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/50 rounded-xl transition-all"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
