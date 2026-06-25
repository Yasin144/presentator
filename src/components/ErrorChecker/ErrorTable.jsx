import React from 'react';

export const ErrorTable = ({ auditLog, onStatusChange }) => {
  const allErrors = auditLog.flatMap(page => 
    page.errors.map((err) => ({ ...err, pageNumber: page.pageNumber }))
  );

  if (allErrors.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border border-white/10 rounded-2xl bg-[#121212] animate-fade-in">
      <div className="overflow-x-auto dark-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Pg</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">ID</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Status</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Type</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Original</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Correction</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allErrors.map((err) => (
              <tr key={err.id} className={`hover:bg-white/[0.02] transition-colors ${err.status === 'dismissed' ? 'opacity-40 grayscale' : ''}`}>
                <td className="px-4 py-4 align-top">
                  <span className="text-[11px] font-bold text-white/40">#{err.pageNumber}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">{err.questionNo || '-'}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    err.status === 'accepted' ? 'text-green-400 bg-green-400/10' : 
                    err.status === 'dismissed' ? 'text-white/40 bg-white/5' : 'text-yellow-400 bg-yellow-400/10'
                  }`}>
                    {err.status}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{err.category}</span>
                </td>
                <td className="px-4 py-4 align-top max-w-[200px]">
                  <p className="text-[11px] text-white/80 font-serif italic line-clamp-3">"{err.incorrectText}"</p>
                </td>
                <td className="px-4 py-4 align-top max-w-[200px]">
                  <p className="text-[11px] text-green-400 font-bold line-clamp-3">"{err.correctVersion}"</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex gap-2">
                    <button onClick={() => onStatusChange(err.id, 'accepted')} className="material-symbols-outlined text-[18px] text-white/20 hover:text-green-400">check_circle</button>
                    <button onClick={() => onStatusChange(err.id, 'dismissed')} className="material-symbols-outlined text-[18px] text-white/20 hover:text-red-400">cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
