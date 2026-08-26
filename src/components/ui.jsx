import React, { useState } from "react";
import { Globe, ChevronLeft } from "lucide-react";
import { LANGS } from "../i18n";

export const Btn = ({ children, onClick, variant = "primary", className = "", disabled, type = "button" }) => {
  const base = "w-full py-3.5 rounded-2xl font-semibold text-[15px] transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#1F5E52] text-white shadow-sm hover:bg-[#184A41]",
    secondary: "bg-[#F1EEE6] text-[#1F5E52] hover:bg-[#E7E2D4]",
    outline: "border border-[#D9D3C3] text-[#3A362C] hover:bg-[#F7F5EF]",
    danger: "bg-[#B3432B] text-white hover:bg-[#96351F]",
    ghost: "text-[#6B6656] hover:bg-[#F1EEE6]",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#EBE7DA] p-4 ${className}`}>{children}</div>
);

export const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-[13px] font-medium text-[#6B6656] mb-1.5">{label}</label>
    {children}
  </div>
);

export const inputCls = "w-full px-3.5 py-3 rounded-xl border border-[#D9D3C3] bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1F5E52]/30 focus:border-[#1F5E52]";

export const StatusBadge = ({ status }) => {
  const colors = {
    active: "bg-[#E5F1EC] text-[#1F5E52]", offline: "bg-[#F1EEE6] text-[#6B6656]",
    blocked: "bg-[#FBE9E4] text-[#B3432B]", pending: "bg-[#FBF3DE] text-[#8A6A0E]",
    paid: "bg-[#E5F1EC] text-[#1F5E52]", cash_requested: "bg-[#EAE4F5] text-[#5B3E96]",
  };
  return <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

export const LangSwitch = ({ lang, setLang }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 border border-[#D9D3C3] text-[13px] font-medium text-[#3A362C]">
        <Globe size={14} /> {lang.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white rounded-xl border border-[#EBE7DA] shadow-lg overflow-hidden z-30 min-w-[130px]">
          {Object.entries(LANGS).map(([code, label]) => (
            <button key={code} onClick={() => { setLang(code); setOpen(false); }}
              className={`block w-full text-left px-3.5 py-2.5 text-[14px] hover:bg-[#F7F5EF] ${lang === code ? "text-[#1F5E52] font-semibold" : "text-[#3A362C]"}`}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TopBar = ({ title, onBack, lang, setLang }) => (
  <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#FAF8F2]/95 backdrop-blur z-20 border-b border-[#EBE7DA]">
    <div className="flex items-center gap-2 min-w-0">
      {onBack && <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full hover:bg-[#F1EEE6]"><ChevronLeft size={20} /></button>}
      <span className="font-semibold text-[16px] truncate text-[#221F17]">{title}</span>
    </div>
    <LangSwitch lang={lang} setLang={setLang} />
  </div>
);

export const BottomNav = ({ items }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE7DA] flex z-20">
    {items.map(it => (
      <button key={it.key} onClick={it.onClick} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 ${it.active ? "text-[#1F5E52]" : "text-[#9B9686]"}`}>
        {it.icon}
        <span className="text-[11px] font-medium">{it.label}</span>
      </button>
    ))}
  </div>
);

const MAKKAH_CENTER = { lat: 21.4225, lng: 39.8262 };

export const MockMap = ({ driverPos, pickupPos, height = 180 }) => {
  const w = 100, h = 100;
  const toXY = (p) => ({
    x: ((p.lng - (MAKKAH_CENTER.lng - 0.05)) / 0.1) * w,
    y: h - ((p.lat - (MAKKAH_CENTER.lat - 0.05)) / 0.1) * h,
  });
  const dp = driverPos ? toXY(driverPos) : null;
  const pp = pickupPos ? toXY(pickupPos) : null;
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#EBE7DA]" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <rect width="100" height="100" fill="#EEF3EF" />
        {Array.from({ length: 9 }).map((_, i) => <line key={"v"+i} x1={i*12.5} y1="0" x2={i*12.5} y2="100" stroke="#DDE6E0" strokeWidth="0.4" />)}
        {Array.from({ length: 9 }).map((_, i) => <line key={"h"+i} x1="0" y1={i*12.5} x2="100" y2={i*12.5} stroke="#DDE6E0" strokeWidth="0.4" />)}
        {pp && <circle cx={pp.x} cy={pp.y} r="2.4" fill="#1F5E52" stroke="white" strokeWidth="1" />}
        {dp && <circle cx={dp.x} cy={dp.y} r="2.4" fill="#B08A2E" stroke="white" strokeWidth="1" />}
      </svg>
      <div className="absolute bottom-2 left-2 text-[10px] bg-white/90 px-2 py-1 rounded-lg text-[#6B6656]">
        Map placeholder — swap for Google Maps/Mapbox using VITE_GOOGLE_MAPS_API_KEY / VITE_MAPBOX_ACCESS_TOKEN
      </div>
    </div>
  );
};
