import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AtmBezel from '../components/AtmBezel';
import { FiSmartphone, FiArrowLeft, FiRotateCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OtpVerification = () => {
  const { verifyOtp, setLoginStep, error, loading, tempCardData, triggerSpeech, t } = useAuth();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [showSmsAlert, setShowSmsAlert] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Show push notification alert for dev convenience
  useEffect(() => {
    if (tempCardData?.devOtp) {
      const delay = setTimeout(() => {
        setShowSmsAlert(true);
        triggerSpeech(`Your 6 digit verification code is ${tempCardData.devOtp.split('').join(' ')}`);
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [tempCardData, triggerSpeech]);

  const handleKeyPress = (num) => {
    if (otp.length < 6) {
      setOtp(prev => prev + num);
    }
  };

  const handleClear = () => {
    setOtp('');
  };

  const handleSubmit = async () => {
    if (otp.length === 6) {
      await verifyOtp(otp);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp('');
    // For simulation, trigger a dummy OTP send alert
    triggerSpeech("A new verification code has been dispatched.");
  };

  return (
    <AtmBezel activeScreenTitle="MULTI-FACTOR OTP VERIFICATION">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-2 relative">
        
        {/* Mock Simulated Smartphone SMS Notification Pop-up */}
        <AnimatePresence>
          {showSmsAlert && tempCardData?.devOtp && (
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.9 }}
              className="absolute -top-6 inset-x-0 bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-glow-cyan flex items-start gap-3 z-20 cursor-pointer"
              onClick={() => {
                setOtp(tempCardData.devOtp);
                setShowSmsAlert(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <FiSmartphone />
              </div>
              <div className="flex-1 text-left text-[10px]">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>APEX SECURE SMS</span>
                  <span className="text-slate-500">NOW</span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  Use OTP <span className="text-cyan-400 font-extrabold text-xs">{tempCardData.devOtp}</span> to authorize your Apex login. Click to autofill.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <div className="text-center mb-4 space-y-1 mt-6">
          <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 text-blue-400">
            <FiSmartphone className="text-lg" />
          </div>
          <h3 className="text-md font-bold text-white uppercase tracking-wider">
            One-Time Password
          </h3>
          <p className="text-[10px] text-slate-400">OTP has been sent to your registered details.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-xs mb-3 text-center">
            {error}
          </div>
        )}

        {/* Masked Output */}
        <div className="w-full flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div 
              key={idx} 
              className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all ${
                otp.length > idx 
                  ? 'bg-blue-600/20 border-blue-500 text-cyan-400 shadow-glow-cyan' 
                  : 'bg-slate-950 border-slate-800 text-slate-700'
              }`}
            >
              {otp[idx] || ''}
            </div>
          ))}
        </div>

        {/* Timer Panel */}
        <div className="text-center text-xs font-mono mb-4 text-slate-400">
          {timer > 0 ? (
            <span>Code expires in <span className="text-amber-400 font-bold">{timer}s</span></span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 mx-auto"
            >
              <FiRotateCw /> Resend OTP Code
            </button>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="bg-slate-900 border border-slate-800 text-slate-100 hover:text-white hover:border-slate-600 rounded-xl py-2.5 text-xs font-bold active:scale-95 transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
            
            <button
              onClick={handleClear}
              className="bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-400 rounded-xl py-2.5 text-[10px] font-bold active:scale-95 transition-all"
            >
              CLEAR
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              className="bg-slate-900 border border-slate-800 text-slate-100 hover:text-white hover:border-slate-600 rounded-xl py-2.5 text-xs font-bold active:scale-95 transition-all"
            >
              0
            </button>

            <button
              onClick={handleSubmit}
              disabled={otp.length < 6 || loading}
              className="bg-emerald-950/40 hover:bg-emerald-950 disabled:bg-slate-900 border border-emerald-900 disabled:border-slate-800 text-emerald-400 disabled:text-slate-600 rounded-xl py-2.5 text-[10px] font-bold active:scale-95 transition-all shadow-sm"
            >
              SUBMIT
            </button>
          </div>
        </div>

        {/* Back Link */}
        <button
          onClick={() => setLoginStep('pin-input')}
          className="mt-4 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-all mx-auto font-mono"
        >
          <FiArrowLeft /> Back to PIN Input
        </button>

      </div>
    </AtmBezel>
  );
};

export default OtpVerification;
