import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CashDispenser = ({ amount, show, onCollect }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-glow-cyan"
          >
            {/* Safe dispenser icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/30">
              <span className="text-emerald-400 font-extrabold text-2xl">₹</span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-1">ATM CASH DISPENSED</h3>
            <p className="text-xs text-slate-400 mb-6">Your transaction is complete. Please collect your cash notes below.</p>

            {/* Note dispensing drawer box */}
            <div className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl relative flex items-center justify-center overflow-hidden mb-6">
              {/* Shutter slit */}
              <div className="absolute top-2 w-full h-1 bg-slate-900 shadow-inner" />
              
              {/* Fanned money bills */}
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 60 }}
                className="relative flex flex-col items-center cursor-pointer"
                onClick={onCollect}
              >
                {/* Visual bills stacked */}
                <div className="w-48 h-20 bg-emerald-700/80 rounded border-2 border-emerald-500 p-2 flex flex-col justify-between shadow-2xl transform rotate-2">
                  <div className="flex justify-between items-center text-[10px] text-emerald-200 font-bold">
                    <span>RESERVE BANK</span>
                    <span>₹{amount}</span>
                  </div>
                  <div className="text-center font-serif text-sm text-emerald-100 font-bold tracking-widest">
                    RUPEES
                  </div>
                  <div className="text-[6px] text-emerald-300 font-mono">SPECIMEN ATM NOTE ONLY</div>
                </div>

                <div className="absolute top-1 w-48 h-20 bg-emerald-700/70 rounded border-2 border-emerald-500 p-2 flex flex-col justify-between shadow-2xl transform -rotate-3" />
                <div className="absolute top-2 w-48 h-20 bg-emerald-800 rounded border-2 border-emerald-500 p-2 flex flex-col justify-between shadow-2xl" />
              </motion.div>
            </div>

            <button
              onClick={onCollect}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-glow-cyan transition-all"
            >
              Collect Cash (₹{amount})
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CashDispenser;
