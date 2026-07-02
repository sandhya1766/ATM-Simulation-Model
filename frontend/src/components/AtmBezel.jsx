import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiWifi, FiClock, FiSettings, FiGlobe, FiVolume2, FiVolumeX, FiInfo } from 'react-icons/fi';
import AccessibilityToggle from './AccessibilityToggle';

const AtmBezel = ({ children, activeScreenTitle = "SECURE TERMINAL" }) => {
  const { 
    logout, 
    isAuthenticated, 
    user, 
    language, 
    setLanguage, 
    voiceAssistance, 
    setVoiceAssistance,
    accessibilityMode
  } = useAuth();
  
  const [time, setTime] = useState(new Date());

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#020617] via-[#0b1329] to-[#040814] transition-all duration-300 ${accessibilityMode ? 'text-lg font-bold' : ''}`}>
      {/* ATM Main Frame Outer Bezel */}
      <div className="w-full max-w-5xl atm-bezel bg-slate-900 border-slate-800 text-slate-100 flex flex-col overflow-hidden relative">
        
        {/* ATM Top Header / Bank Name Board */}
        <div className="w-full bg-gradient-to-r from-slate-950 via-[#101b3b] to-slate-950 px-6 py-4 flex justify-between items-center border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Premium Gold/Silver Logo */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center font-extrabold text-slate-950 text-xl tracking-wider shadow-md">
              A
            </div>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500">
                APEX BANK
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">PREMIUM DIGITAL ATM</p>
            </div>
          </div>
          
          {/* Top Status Displays */}
          <div className="flex items-center gap-4 text-xs md:text-sm text-slate-300 font-mono">
            <div className="flex items-center gap-1 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
              <FiClock className="text-amber-400 animate-pulse" />
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
              <FiWifi />
              <span className="text-[10px] uppercase font-semibold text-slate-300">Online</span>
            </div>
          </div>
        </div>

        {/* ATM Middle Core - The Inner Screen Panel */}
        <div className="flex-1 bg-[#04091a] relative flex flex-col min-h-[450px] p-2 md:p-6 select-none border-b-8 border-slate-950">
          {/* Inner Screen Bezel Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />
          
          {/* Screen Content Wrapper */}
          <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden glass-panel relative border border-slate-800">
            
            {/* Screen Sub-Header */}
            <div className="w-full bg-[#0d1530] px-4 py-2 flex justify-between items-center text-xs border-b border-slate-800 font-mono">
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <FiInfo className="inline" /> TERMINAL ID: APX-98822
              </span>
              <span className="text-slate-400 tracking-wider">
                {activeScreenTitle.toUpperCase()}
              </span>
            </div>

            {/* Main Screen Body View */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto relative">
              {children}
            </div>

            {/* Screen Interactive Footer (Accessibility / Language Toggles) */}
            <div className="w-full bg-[#080d24] px-4 py-3 flex flex-wrap justify-between items-center gap-3 border-t border-slate-800/80 text-xs">
              {/* Voice guidance status */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setVoiceAssistance(!voiceAssistance)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md border font-semibold transition-all ${
                    voiceAssistance 
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-glow-cyan' 
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                  title="Toggle Voice Assistance Speech"
                >
                  {voiceAssistance ? <FiVolume2 className="text-sm animate-bounce" /> : <FiVolumeX className="text-sm" />}
                  <span>{voiceAssistance ? 'Voice On' : 'Voice Off'}</span>
                </button>
                <AccessibilityToggle />
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <FiGlobe className="text-slate-400" />
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 text-[11px]"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ATM Lower Hardware Console - Slots for Card, Cash, Receipt */}
        <div className="w-full bg-slate-950 p-4 md:p-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Hardware Slot 1: Receipt Printer Outlet */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-semibold mb-2">RECEIPT PRINTER</span>
            <div className="w-48 h-3 bg-slate-900 rounded border-2 border-slate-800 relative flex items-center justify-center">
              <div className="absolute inset-x-4 h-[2px] bg-slate-800 animate-pulse" />
              {/* Receipt outlet paper shadow */}
              <div className="absolute -bottom-1 w-40 h-[6px] bg-white border border-slate-300 rounded shadow-md pointer-events-none transform translate-y-1 opacity-80" />
            </div>
            <p className="text-[9px] text-slate-500 mt-2">Print and receipts drop here</p>
          </div>

          {/* Hardware Slot 2: Cash Dispenser Shutter Drawer */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-semibold mb-2">CASH DISPENSER</span>
            <div className="w-56 h-7 bg-slate-900 rounded-lg border-2 border-slate-800 relative flex items-center justify-center overflow-hidden shadow-inner">
              <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                {/* Dispenser shutter panels */}
                <div className="w-1/2 h-full bg-[#111827] border-r border-slate-900" />
                <div className="w-1/2 h-full bg-[#111827] border-l border-slate-900" />
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">Simulated cash drawers</p>
          </div>

          {/* Hardware Slot 3: Glowing Card Slot Entry */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-semibold mb-2">ATM CARD SLOT</span>
            <div className="w-44 h-8 bg-slate-900 rounded border-2 border-slate-800 relative flex items-center justify-center shadow-inner">
              {/* Glowing Insert Port */}
              <div className="w-24 h-1.5 rounded-full bg-cyan-500 shadow-glow-cyan animate-pulse" />
            </div>
            <p className="text-[9px] text-slate-500 mt-2 font-mono">Insert card to authenticate</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AtmBezel;
