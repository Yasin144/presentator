import React from 'react';

const severityStyles = {
  Critical: 'bg-red-500 text-white',
  Major: 'bg-orange-500 text-white',
  Minor: 'bg-blue-500 text-white'
};

const statusBorder = {
  pending: 'border-[#595959]',
  accepted: 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  dismissed: 'border-white/5 opacity-50 grayscale'
};

export const ErrorCard = ({ pageNumber, error, onStatusChange }) => {
  return (
    <div 
      className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all duration-300 ${statusBorder[error.status]}`}
    >
      <div className="bg-[#2a2a2a] px-4 py-2 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Page {pageNumber}</span>
          <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">{error.questionNo || 'Core Content'}</span>
          {error.status === 'accepted' && (
            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span> Verified
            </span>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${severityStyles[error.severity]}`}>
          {error.severity}
        </span>
      </div>
      
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Incident Detected</label>
          <p className="text-white font-serif italic text-sm border-l-2 border-red-500/40 pl-3 py-1 bg-red-500/5 rounded-r-lg">
            "{error.incorrectText}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Correction</label>
            <p className="text-green-400 font-bold text-xs bg-green-400/5 px-2 py-1.5 rounded border border-green-400/10">
              "{error.correctVersion}"
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Category</label>
            <p className="text-blue-400 font-black text-[10px] uppercase tracking-tighter">{error.category}</p>
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-xl">
          <p className="text-white/70 text-[11px] leading-relaxed italic">"{error.issueFound}"</p>
          <p className="text-white/40 text-[10px] mt-2 leading-snug">{error.explanation}</p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button 
            onClick={() => onStatusChange('accepted')}
            className={`flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
              error.status === 'accepted' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            {error.status === 'accepted' ? 'Verified' : 'Accept'}
          </button>
          <button 
            onClick={() => onStatusChange('dismissed')}
            className={`flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
              error.status === 'dismissed' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
