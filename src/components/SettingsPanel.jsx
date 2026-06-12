// src/components/SettingsPanel.jsx — Settings toggle component
import React from 'react';

export function ToggleSwitch({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${value ? 'bg-primary-800' : 'bg-[#BDBDBD]'}`}
      role="switch"
      aria-checked={value}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform duration-200 ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function SettingsRow({ icon, label, value, chevron, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between w-full h-14 px-4 border-b border-[#F0F0F0] tap-feedback">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-[15px] text-[#1A1A1A]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-[#757575]">{value}</span>}
        {chevron && <span className="text-sm text-[#BDBDBD]">→</span>}
      </div>
    </button>
  );
}
