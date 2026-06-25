import React from 'react';

export const AnswerKeyTable = ({ auditLog }) => {
  const allAnswers = auditLog.flatMap(p => p.answerKeys);

  if (allAnswers.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
        <span className="material-symbols-outlined text-4xl text-white/20 mb-2">quiz</span>
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest">No Answer Keys Detected</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3 px-4">
         <span className="material-symbols-outlined text-green-400">task_alt</span>
         <h3 className="text-sm font-black uppercase tracking-widest text-white">Choose the Correct Answers – Answer Key</h3>
      </div>
      
      <div className="w-full overflow-hidden border border-white/10 rounded-2xl bg-[#121212]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Question No.</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Correct Answer</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Page No.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allAnswers.map((ak, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[12px] font-black text-white">{ak.questionNo}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-bold text-green-400 px-3 py-1 bg-green-400/10 rounded-lg border border-green-400/20">
                    {ak.correctAnswer}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-medium text-white/40">Page {ak.pageNumber}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
