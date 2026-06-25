import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PlaybackBar = ({
  isPresenting, isPaused, onPresent, onPause, onResume, onStop, canPlay, accentColor
}) => {
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence mode="wait">
        {!isPresenting ? (
          <motion.div 
            key="start"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-white/95 backdrop-blur-2xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[28px] p-2"
          >
            <button 
              onClick={onPresent}
              disabled={!canPlay}
              style={{ backgroundColor: accentColor }}
              className="h-14 px-10 rounded-[22px] text-black font-black text-[12px] uppercase tracking-[0.25em] flex items-center gap-4 transition-all active:scale-[0.97] disabled:opacity-20 group"
            >
              <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">auto_awesome</span>
              Start Narration
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="controls"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1.5 flex items-center gap-1.5 transition-all"
          >
            <button 
              onClick={isPaused ? onResume : onPause}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition-all active:scale-90 hover:bg-white/90"
            >
              <span className="material-symbols-outlined text-[28px]">{isPaused ? 'play_arrow' : 'pause'}</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={onStop}
              className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
