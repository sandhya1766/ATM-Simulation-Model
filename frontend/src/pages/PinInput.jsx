import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AtmBezel from '../components/AtmBezel';
import { FiLock, FiArrowLeft, FiX, FiCheck } from 'react-icons/fi';

const PinInput = () => {
  const { verifyPin, setLoginStep, error, loading, tempCardData } = useAuth();
  const [pin, setPin] = useState('');

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (pin.length === 4) {
      await verifyPin(pin);
    }
  };

  return (
    <AtmBezel activeScreenTitle="SECURE PIN AUTHENTICATION">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-2">
        
        {/* Header */}
        <div className="text-center mb-4 space-y-1">
          <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 text-blue-400">
            <FiLock className="text-lg" />
          </div>
          <h3 className="text-md font-bold text-white uppercase tracking-wider">
            Enter ATM PIN
          </h3>
          <p className="text-[9px] text-slate-400">Cardholder: <span className="text-cyan-400 font-bold">{tempCardData?.name || 'Customer'}</span></p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-xs mb-3 text-center font-mono">
            {error}
          </div>
        )}

        {/* Masked Output */}
        <div className="w-full flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                pin.length > idx 
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-glow-cyan' 
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              {pin.length > idx ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Physical Styled Keypad Grid */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="bg-slate-900 border border-slate-800 text-slate-100 hover:text-white hover:border-slate-600 rounded-xl py-3 text-sm font-bold active:scale-95 transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
            
            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-400 rounded-xl py-3 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <FiX /> CLEAR
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              className="bg-slate-900 border border-slate-800 text-slate-100 hover:text-white hover:border-slate-600 rounded-xl py-3 text-sm font-bold active:scale-95 transition-all"
            >
              0
            </button>

            {/* Enter Button */}
            <button
              onClick={handleSubmit}
              disabled={pin.length < 4 || loading}
              className="bg-emerald-950/40 hover:bg-emerald-950 disabled:bg-slate-900 border border-emerald-900 disabled:border-slate-800 text-emerald-400 disabled:text-slate-600 rounded-xl py-3 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <FiCheck /> ENTER
            </button>
          </div>
        </div>

        {/* Cancel link */}
        <button
          onClick={() => setLoginStep('card-input')}
          className="mt-4 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-all mx-auto font-mono"
        >
          <FiArrowLeft /> Back to Card Insertion
        </button>

      </div>
    </AtmBezel>
  );
};

export default PinInput;
