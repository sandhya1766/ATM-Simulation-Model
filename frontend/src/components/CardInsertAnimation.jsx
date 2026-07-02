import React from 'react';
import { motion } from 'framer-motion';

const CardInsertAnimation = ({ onComplete }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-6">
      <div className="relative w-72 h-48 flex items-center justify-center overflow-hidden border border-slate-800 rounded-xl bg-slate-950 shadow-inner">
        {/* Slot Entry lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-4 bg-slate-900 border-2 border-slate-700 rounded flex items-center justify-center shadow-inner">
          {/* Glowing led */}
          <div className="w-20 h-1 bg-cyan-500 shadow-glow-cyan animate-pulse" />
        </div>

        {/* Floating Credit Card sliding into slot */}
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.8, rotateX: 45 }}
          animate={{ 
            y: [-10, 0, -25], 
            opacity: [1, 1, 0],
            scale: [0.95, 0.95, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute z-10 w-40 h-24 rounded-lg bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] border border-blue-400 p-3 shadow-2xl flex flex-col justify-between"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card Chip & Details */}
          <div className="flex justify-between items-start">
            <div className="w-8 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-md" />
            <div className="text-[8px] font-bold text-white tracking-widest">APEX</div>
          </div>
          <div className="text-[9px] text-slate-300 font-mono tracking-widest">
            •••• •••• •••• 5678
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[6px] text-slate-400 font-mono">SANDHYA SHARMA</span>
            <span className="text-[6px] text-slate-400 font-mono">12/28</span>
          </div>
        </motion.div>
      </div>
      <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-wide uppercase">Click details below to test card insertion</p>
    </div>
  );
};

export default CardInsertAnimation;
