import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Typewriter character-by-character reveal ─────────────────────────────────
const TypewriterWord = ({ word, isActive, accentColor, speed }) => {
  const chars = useMemo(() => word.split(''), [word]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleCount(chars.length);
      return;
    }
    setVisibleCount(0);
    const charInterval = Math.max(20, 60 / speed);
    const interval = setInterval(() => {
      setVisibleCount(prev => {
        if (prev < chars.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, charInterval);
    return () => clearInterval(interval);
  }, [isActive, chars.length, speed]);

  return (
    <span className="relative inline-flex items-center">
      {chars.map((char, i) => (
        <span
          key={`${char}-${i}`}
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transition: 'opacity 60ms ease',
          }}
        >
          {char}
        </span>
      ))}
      {isActive && (
        <span
          className="animate-cursor"
          style={{
            display: 'inline-block',
            width: '0.1em',
            height: '0.85em',
            backgroundColor: accentColor,
            marginLeft: '0.05em',
            verticalAlign: 'middle',
          }}
        />
      )}
    </span>
  );
};

const FORCE_ICON_COLORS = {
  force: '#0d7ea9',
  friction: '#f97316',
  contact: '#16a34a',
  magnet: '#7c3aed',
};

const ScienceIcon = ({ type = 'force', active = false }) => {
  const color = FORCE_ICON_COLORS[type] || FORCE_ICON_COLORS.force;
  return (
    <motion.div
      className="relative h-[84px] w-[84px] shrink-0 rounded-[22px] border border-white/15 bg-white/[0.06]"
      animate={{
        y: active ? [0, -5, 0] : 0,
        boxShadow: active
          ? `0 18px 44px ${color}35, inset 0 0 0 1px ${color}55`
          : '0 12px 28px rgba(0,0,0,0.24), inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
      transition={{ duration: 1.8, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
      style={{ color }}
    >
      {type === 'friction' ? (
        <svg viewBox="0 0 84 84" className="h-full w-full" aria-hidden="true">
          <path d="M17 56h50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <path d="M24 46h31c7 0 11 3 11 8v2H17v-3c0-4 3-7 7-7Z" fill="currentColor" opacity="0.86" />
          <path d="M22 62c8-6 15 6 23 0s15 6 23 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.78" />
        </svg>
      ) : type === 'contact' ? (
        <svg viewBox="0 0 84 84" className="h-full w-full" aria-hidden="true">
          <rect x="48" y="30" width="18" height="26" rx="4" fill="currentColor" opacity="0.84" />
          <path d="M18 48h28" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <path d="M45 42l11 6-11 6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="58" cy="58" r="4" fill="#fff" opacity="0.86" />
        </svg>
      ) : type === 'magnet' ? (
        <svg viewBox="0 0 84 84" className="h-full w-full" aria-hidden="true">
          <path d="M25 23v22c0 10 7 17 17 17s17-7 17-17V23h-12v22c0 4-2 7-5 7s-5-3-5-7V23H25Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M25 23h12M47 23h12" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.88" />
          <circle cx="18" cy="62" r="3" fill="#fff" opacity="0.8" />
          <circle cx="68" cy="62" r="3" fill="#fff" opacity="0.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 84 84" className="h-full w-full" aria-hidden="true">
          <path d="M18 42h43" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <path d="M51 25l17 17-17 17" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 55h24" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.72" />
          <path d="M18 29h18" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.72" />
        </svg>
      )}
    </motion.div>
  );
};

function buildTokenLines(wordTokens) {
  const lines = [];
  let current = null;

  wordTokens.forEach((token, idx) => {
    if (!current || token.startsNewLine) {
      current = { start: idx, end: idx, tokens: [] };
      lines.push(current);
    }
    current.tokens.push({ ...token, tokenIndex: idx });
    current.end = idx;
  });

  return lines.map(line => ({
    ...line,
    text: line.tokens.map(token => token.text).join(' ').trim(),
  })).filter(line => line.text);
}

function getScienceIconType(text, index) {
  const lower = text.toLowerCase();
  if (lower.includes('friction')) return 'friction';
  if (lower.includes('non-contact') || lower.includes('non contact') || lower.includes('magnet')) return 'magnet';
  if (lower.includes('contact')) return 'contact';
  if (lower.includes('effect') || lower.includes('real life')) return 'force';
  return ['force', 'contact', 'friction', 'magnet'][index % 4];
}

function shouldUseScienceObjectiveLayout(lines) {
  const text = lines.map(line => line.text).join(' ').toLowerCase();
  return (
    lines.length >= 2 &&
    (text.includes('learner') || text.includes('objective') || text.includes('able to')) &&
    (text.includes('force') || text.includes('friction') || text.includes('contact'))
  );
}

const ScienceObjectiveStage = ({ lines, activeIndex, isPresenting, theme, speed }) => {
  const displayLines = lines.filter(line => {
    const text = line.text.trim();
    if (!text) return false;
    if (/^[A-Z0-9]{4,}$/i.test(text) && text.length <= 8) return false;
    return true;
  });
  const visibleLines = displayLines.length ? displayLines : lines;
  const totalCharacters = visibleLines.reduce((sum, line) => sum + line.text.length, 0);
  const lineCount = Math.max(1, visibleLines.length);
  const fontSize = lineCount <= 2 && totalCharacters < 110
    ? 'clamp(82px, 7.2vw, 136px)'
    : lineCount <= 4 && totalCharacters < 240
      ? 'clamp(58px, 5.2vw, 96px)'
      : lineCount <= 7 && totalCharacters < 420
        ? 'clamp(42px, 3.7vw, 72px)'
        : 'clamp(30px, 2.8vw, 52px)';
  const lineGap = lineCount <= 3 ? '5.2vh' : lineCount <= 6 ? '3.6vh' : '2.2vh';

  const renderLineText = (line) => (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.26em] gap-y-[0.1em]">
      {line.tokens.map(token => {
        const isActive = isPresenting && token.tokenIndex === activeIndex;
        const isPast = isPresenting && token.tokenIndex < activeIndex;
        const isVisible = !isPresenting || isActive || isPast;
        return (
          <span
            key={`${token.text}-${token.tokenIndex}`}
            className="inline-block transition-all duration-200"
            style={{
              opacity: isVisible ? 1 : 0,
              color: isActive ? '#facc15' : '#ffffff',
              textShadow: isActive
                ? '0 0 22px rgba(250,204,21,0.45), 0 4px 22px rgba(0,0,0,0.35)'
                : '0 4px 22px rgba(0,0,0,0.42)',
              transform: isActive ? 'translateY(-2px) scale(1.02)' : 'none',
            }}
          >
            {isActive && theme.animationStyle === 'typewriter' ? (
              <TypewriterWord word={token.text} isActive={isActive} accentColor="#ffffff" speed={speed} />
            ) : token.text}
          </span>
        );
      })}
    </span>
  );

  return (
    <div className="relative z-10 h-full w-full overflow-hidden bg-[#06171d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(30,180,200,0.22),rgba(6,23,29,0)_46%),linear-gradient(135deg,#06171d_0%,#0b3b46_54%,#051116_100%)]" />
      <div className="absolute inset-0 opacity-35">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/12" />
        <div className="absolute left-1/2 top-1/2 h-[650px] w-[1450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/10" />
      </div>

      <div className="relative flex h-full items-center justify-center px-[8vw] py-[9vh]">
        <div
          className="grid w-full max-w-[1680px] justify-items-center text-center"
          style={{ rowGap: lineGap }}
        >
            {visibleLines.map((line, index) => {
              const isActiveLine = isPresenting && activeIndex >= line.start && activeIndex <= line.end;
              const isPastLine = isPresenting && activeIndex > line.end;
              const isFutureLine = isPresenting && activeIndex < line.start;
              return (
                <motion.div
                  key={`${line.text}-${index}`}
                  className="max-w-full font-black leading-[1.08]"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{
                    opacity: !isPresenting || isPastLine || isActiveLine ? 1 : 0.12,
                    y: 0,
                    scale: isActiveLine ? 1.018 : 1,
                  }}
                  transition={{ duration: 0.34, delay: index * 0.06 }}
                  style={{
                    fontFamily: theme.fontFamily,
                    fontSize,
                    letterSpacing: 0,
                    maxWidth: line.text.length > 70 ? '100%' : '92%',
                  }}
                >
                  {isFutureLine ? <span className="opacity-0">{line.text}</span> : renderLineText(line)}
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// ─── Shooting Star ─────────────────────────────────────────────────────────────
const ShootingStar = ({ delay, top, width, duration }) => (
  <motion.div
    className="absolute flex items-center pointer-events-none"
    style={{ top, left: '-5%', width: `${width}%` }}
    initial={{ x: '-100%', opacity: 0 }}
    animate={{ x: ['0%', '120%'], opacity: [0, 0.9, 0.9, 0] }}
    transition={{ duration, delay, repeat: Infinity, repeatDelay: duration * 3 + delay, ease: 'linear' }}
  >
    <div
      className="h-px flex-1"
      style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.5), rgba(255,255,255,1))' }}
    />
    <div
      className="rounded-full bg-white"
      style={{ width: '8px', height: '8px', boxShadow: '0 0 8px 3px rgba(255,255,255,0.9)' }}
    />
  </motion.div>
);

// ─── Background Engine ─────────────────────────────────────────────────────────
const BackgroundEngine = ({ theme }) => {
  const stars = useMemo(() => Array.from({ length: 140 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.4,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 6,
    color: i % 14 === 0 ? '#facc15' : i % 8 === 0 ? '#93c5fd' : '#ffffff',
  })), []);

  const blobs = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    width: `${Math.random() * 40 + 30}%`,
    height: `${Math.random() * 40 + 30}%`,
    top: `${Math.random() * 60}%`,
    left: `${Math.random() * 60}%`,
    delay: i * 2,
  })), []);

  const dotGrid = useMemo(() => Array.from({ length: 300 }, (_, i) => ({
    id: i,
    top: `${(Math.floor(i / 20) / 15) * 100}%`,
    left: `${(i % 20) * 5}%`,
  })), []);

  const shootingStars = [
    { delay: 2.0, top: '18%', width: 26, duration: 2.0 },
    { delay: 5.5, top: '40%', width: 20, duration: 1.7 },
    { delay: 9.0, top: '65%', width: 30, duration: 2.4 },
  ];

  if (theme.backgroundType === 'none') return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">

      {/* Stars */}
      {(theme.backgroundType === 'stars' || theme.backgroundType === 'galaxy') && (
        <div className="absolute inset-0">
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full animate-twinkle"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.color,
                opacity: 0,
                // @ts-ignore
                '--duration': `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                boxShadow: star.size > 1.8 ? `0 0 ${star.size * 2}px ${star.color}` : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Galaxy: Dot grid overlay */}
      {theme.backgroundType === 'galaxy' && (
        <div className="absolute inset-0">
          {dotGrid.map(dot => (
            <div
              key={dot.id}
              className="absolute rounded-full"
              style={{ top: dot.top, left: dot.left, width: '3px', height: '3px', backgroundColor: 'rgba(255,255,255,0.06)' }}
            />
          ))}
        </div>
      )}

      {/* Galaxy: Shooting lines */}
      {theme.backgroundType === 'galaxy' && (
        <div className="absolute inset-0 overflow-hidden">
          {shootingStars.map((s, i) => <ShootingStar key={i} {...s} />)}
        </div>
      )}

      {/* Galaxy: Wave silhouette at bottom */}
      {theme.backgroundType === 'galaxy' && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '26%' }}>
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,100 C180,155 360,45 540,100 C720,155 900,55 1080,110 C1260,160 1380,80 1440,100 L1440,200 L0,200 Z"
              fill="rgba(8,16,32,0.88)"
            />
            <path
              d="M0,135 C200,85 400,170 600,120 C800,72 1000,158 1200,112 C1330,82 1400,130 1440,120 L1440,200 L0,200 Z"
              fill="rgba(5,10,22,0.96)"
            />
          </svg>
        </div>
      )}

      {/* Blobs */}
      {theme.backgroundType === 'blobs' && (
        <div className="absolute inset-0">
          {blobs.map(blob => (
            <div
              key={blob.id}
              className="absolute rounded-full blur-[100px] animate-blob opacity-10"
              style={{
                top: blob.top, left: blob.left,
                width: blob.width, height: blob.height,
                backgroundColor: theme.accentColor,
                animationDelay: `${blob.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      {theme.backgroundType === 'gradient' && theme.gradient && theme.gradient !== 'none' && (
        <div className="absolute inset-0" style={{ background: theme.gradient }} />
      )}

      {/* Mesh */}
      {theme.backgroundType === 'mesh' && (
        <div
          className="absolute inset-0 opacity-20 animate-mesh"
          style={{
            backgroundImage: `radial-gradient(at 0% 0%, ${theme.accentColor} 0px, transparent 50%),
              radial-gradient(at 50% 0%, ${theme.textColor} 0px, transparent 50%),
              radial-gradient(at 100% 0%, ${theme.accentColor} 0px, transparent 50%)`,
          }}
        />
      )}

      {/* Waves */}
      {theme.backgroundType === 'waves' && (
        <div className="absolute bottom-0 left-0 w-[200%] h-64 opacity-8 flex overflow-hidden">
          <div
            className="w-full h-full animate-waves"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'bottom',
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Reader Stage ──────────────────────────────────────────────────────────────
export const ReaderStage = ({
  wordTokens, activeIndex, isPresenting, isPaused, theme
}) => {
  const containerRef = useRef(null);
  const activeWordRef = useRef(null);
  const speed = theme.animationSpeed || 1.0;

  // Auto-scroll to keep active word visible
  useEffect(() => {
    if (isPresenting && activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex, isPresenting]);

  const alignClass = {
    left: 'justify-start text-left items-start',
    center: 'justify-center text-center items-center',
    right: 'justify-end text-right items-end',
  }[theme.textAlign] || 'justify-start text-left items-start';

  const hPad = Math.max(60, theme.horizontalPadding ?? 80);
  const vPad = Math.max(60, theme.verticalPadding ?? 160);
  const tokenLines = useMemo(() => buildTokenLines(wordTokens), [wordTokens]);
  const useScienceObjectiveLayout = shouldUseScienceObjectiveLayout(tokenLines);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-700 ${isPaused ? 'opacity-25 blur-xl' : 'opacity-100'}`}
    >
      {/* Background layer */}
      <BackgroundEngine theme={theme} />

      {useScienceObjectiveLayout ? (
        <ScienceObjectiveStage
          lines={tokenLines}
          activeIndex={activeIndex}
          isPresenting={isPresenting}
          theme={theme}
          speed={speed}
        />
      ) : (
        <>

      {/* Text content — no scrollbar visible, clips overflow */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-full overflow-y-auto no-scrollbar"
        style={{
          fontFamily: theme.fontFamily,
          paddingLeft: `${hPad}px`,
          paddingRight: `${hPad}px`,
          paddingTop: `${vPad}px`,
          paddingBottom: '12vh',
          backgroundColor: 'transparent',
        }}
      >
        <div
          className={`flex flex-wrap w-full ${alignClass}`}
          style={{
            columnGap: `${theme.wordSpacing ?? 0.25}em`,
            rowGap: `${theme.rowGap ?? 0.4}em`,
            lineHeight: theme.lineHeight ?? 1.3,
          }}
        >
          {wordTokens.map((token, idx) => {
            const isActive  = isPresenting && idx === activeIndex;
            const isPast    = isPresenting && idx < activeIndex;
            const isFuture  = isPresenting && idx > activeIndex;
            const notStarted = !isPresenting;

            // ── Color logic ──────────────────────────────────────────────
            // Not presenting → full textColor preview
            // Active word    → accentColor, full brightness
            // Past words     → pure white (or accentColor) at full opacity — CLEARLY visible
            // Future words   → completely invisible (opacity 0) — only reveal when narrated
            const wordColor = notStarted
              ? theme.textColor
              : isActive
              ? theme.accentColor
              : isPast
              ? theme.textColor         // already narrated: show in full text color
              : 'transparent';          // not yet reached: invisible

            const wordOpacity = notStarted
              ? 1
              : isActive
              ? 1
              : isPast
              ? 1                       // past: fully visible
              : 0;                      // future: completely hidden until narrated

            const wordWeight = notStarted
              ? 400
              : isActive || isPast
              ? 800
              : 400;

            // ── Animation variants per style ─────────────────────────────
            const getVariants = () => {
              const spring = { type: 'spring', stiffness: 260 * speed, damping: 28 };
              const ease = { duration: 0.22 / speed };

              switch (theme.animationStyle) {
                case 'pop':
                  return {
                    initial: { opacity: 0, scale: 0.75 },
                    animate: { opacity: wordOpacity, scale: isActive ? 1.12 : 1 },
                    transition: spring,
                  };
                case 'float':
                  return {
                    initial: { opacity: 0, y: 14 },
                    animate: { opacity: wordOpacity, y: isActive ? -8 : 0 },
                    transition: spring,
                  };
                case 'slide':
                  return {
                    initial: { opacity: 0, x: -16 },
                    animate: { opacity: wordOpacity, x: 0 },
                    transition: spring,
                  };
                case 'blur-in':
                  return {
                    initial: { opacity: 0, filter: 'blur(12px)' },
                    animate: {
                      opacity: wordOpacity,
                      filter: (isActive || isPast) ? 'blur(0px)' : 'blur(12px)',
                    },
                    transition: { duration: 0.28 / speed },
                  };
                case 'bounce':
                  return {
                    initial: { opacity: 0, y: 18, scale: 0.8 },
                    animate: {
                      opacity: wordOpacity,
                      y: isActive ? [0, -14, 0] : 0,
                      scale: isActive ? 1.08 : 1,
                    },
                    transition: isActive
                      ? { duration: 0.38 / speed, times: [0, 0.45, 1], type: 'tween' }
                      : spring,
                  };
                case 'glow':
                  return {
                    initial: { opacity: 0 },
                    animate: { opacity: wordOpacity },
                    transition: { duration: 0.2 / speed },
                  };
                case 'typewriter':
                default:
                  return {
                    initial: { opacity: 0 },
                    animate: { opacity: wordOpacity },
                    transition: ease,
                  };
              }
            };

            const v = getVariants();

            const glowStyle = (theme.animationStyle === 'glow' && isActive)
              ? { textShadow: `0 0 18px ${theme.accentColor}, 0 0 36px ${theme.accentColor}99` }
              : {};

            return (
              <React.Fragment key={`${token.text}-${idx}`}>
                {token.startsNewLine && idx > 0 && <div className="w-full h-0" />}

                <motion.div
                  initial={v.initial}
                  animate={v.animate}
                  transition={v.transition}
                  className="inline-block"
                  style={{ marginRight: `${theme.wordSpacing ?? 0.25}em` }}
                >
                  <span
                    ref={isActive ? activeWordRef : null}
                    className="transition-colors duration-200"
                    style={{
                      fontSize: `${theme.fontSize}px`,
                      color: wordColor,
                      fontWeight: wordWeight,
                      letterSpacing: '-0.02em',
                      display: 'inline-block',
                      ...glowStyle,
                    }}
                  >
                    {theme.animationStyle === 'typewriter' && (isActive || isPast) ? (
                      <TypewriterWord
                        word={token.text}
                        isActive={isActive}
                        accentColor={theme.accentColor}
                        speed={speed}
                      />
                    ) : (
                      token.text
                    )}
                  </span>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Empty state */}
        {!isPresenting && wordTokens.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 pointer-events-none">
            <span className="material-symbols-outlined text-[100px] text-white/5">auto_stories</span>
            <div className="text-center space-y-3 max-w-sm">
              <p className="font-bold uppercase tracking-[0.4em] text-[11px] text-white/10">Type your narrative</p>
              <p className="text-[10px] text-white/15 uppercase tracking-widest font-medium leading-relaxed">
                The narrator is waiting for words.
              </p>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
