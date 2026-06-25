import React from 'react';

export const SectionLabel = ({ children }) => (
  <div className="flex items-center px-2">
    <span className="text-[11px] font-medium text-[rgba(218,220,224,0.9)] tracking-[0.1px] normal-case">
      {children}
    </span>
  </div>
);

export const PillButton = ({ icon, children, variant = 'filled', onClick, disabled }) => {
  const base = 'flex items-center gap-[2px] justify-center w-full h-[34px] rounded-xl font-medium tracking-[0.1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    filled: 'bg-[#969696] hover:bg-[#a6a6a6] active:bg-[#868686] text-black text-[11px] pl-[8px] pr-[24px] py-1 select-none',
    outline: 'border border-[#595959] hover:bg-white/5 active:bg-white/10 backdrop-blur-[40px] text-[12px] pl-[8px] pr-[16px] py-2 text-white select-none',
    solid: 'bg-white hover:bg-gray-200 active:bg-gray-300 text-black text-[12px] pl-[8px] pr-[16px] py-2 select-none',
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
      {icon && <span className="flex items-center justify-center w-6 h-6">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export const FieldDisplay = ({ label, value, className = '' }) => (
  <div className={`border border-[#595959] rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-2.5 pr-1 pt-[5px] select-none ${className}`}>
    <p className="text-[11px] font-medium text-[rgba(255,255,255,0.35)] tracking-[0.1px]">{label}</p>
    <div className="flex items-center overflow-hidden">
      <span className="text-[11px] font-medium text-white tracking-[0.1px] truncate">{value}</span>
    </div>
  </div>
);

export const ProgressBar = ({ progress }) => (
  <div className="w-full h-1.5 bg-[#595959] rounded-full overflow-hidden">
    <div 
      className="h-full bg-white transition-all duration-300 ease-out" 
      style={{ width: `${progress}%` }}
    />
  </div>
);

export const SegmentedToggle = ({ value, items, onChange }) => (
  <div className="flex w-full items-center border border-[#595959] rounded-xl overflow-hidden bg-transparent">
    {items.map((item) => (
      <button key={item.value} type="button" onClick={() => onChange(item.value)}
        className={`flex-1 flex items-center justify-center gap-1 h-[34px] px-3 py-2 rounded-xl text-[11px] font-medium tracking-[0.1px] transition-all cursor-pointer ${
          value === item.value ? 'bg-[#969696] text-black' : 'text-[rgba(218,220,224,0.75)] hover:text-white hover:bg-white/5'
        }`}>
        {item.icon}<span>{item.label}</span>
      </button>
    ))}
  </div>
);

export const TextInput = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="border border-[#595959] hover:border-[#7a7a7a] focus:border-[#969696] rounded-xl w-full h-[80px] px-3 py-2.5 resize-none bg-transparent text-[11px] font-medium text-white placeholder-[rgba(218,220,224,0.3)] tracking-[0.1px] focus:outline-none transition-colors" />
);
