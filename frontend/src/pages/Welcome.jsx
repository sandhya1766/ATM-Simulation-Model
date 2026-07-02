import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CardInsertAnimation from '../components/CardInsertAnimation';
import AtmBezel from '../components/AtmBezel';
import { FiArrowRight, FiShield, FiUserCheck, FiSliders } from 'react-icons/fi';

const Welcome = () => {
  const { setLoginStep, triggerSpeech, t, language } = useAuth();

  useEffect(() => {
    triggerSpeech(t('welcome'));
  }, [language, triggerSpeech]);

  const handleQuickCustomer = () => {
    // Quick routing to CardInput
    setLoginStep('card-input');
  };

  return (
    <AtmBezel activeScreenTitle="WELCOME SCREEN">
      <div className="flex-1 flex flex-col items-center justify-between text-center max-w-2xl mx-auto py-4">
        
        {/* Welcome message */}
        <div className="space-y-3">
          <span className="bg-blue-900/40 text-blue-400 border border-blue-800 text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full">
            Security Tier Verified
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            APEX BANKING SYSTEMS
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-light max-w-md mx-auto">
            Experience state-of-the-art secure transactions, real-time transfers, and digital account service.
          </p>
        </div>

        {/* 3D Card Insert Visual */}
        <CardInsertAnimation />

        {/* Action Panel */}
        <div className="w-full space-y-4">
          <button
            onClick={handleQuickCustomer}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-glow-cyan transform hover:-translate-y-0.5"
          >
            <span>Click to Insert ATM Card</span>
            <FiArrowRight />
          </button>

          {/* Quick login helpers for assessment convenience */}
          <div className="border-t border-slate-800/80 my-4" />
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                // Auto inject cards number for customer Sandhya Sharma
                setLoginStep('card-input');
              }}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                <FiUserCheck /> Customer
              </div>
              <p className="text-[9px] text-slate-400 font-semibold truncate">Sandhya Sharma</p>
            </button>

            <button
              onClick={() => {
                setLoginStep('admin-login-direct');
              }}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">
                <FiShield /> Bank Admin
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Rahul Kumar</p>
            </button>

            <button
              onClick={() => {
                setLoginStep('super-login-direct');
              }}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 transition-all text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-1">
                <FiSliders /> Super Admin
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Vikram Mehta</p>
            </button>
          </div>
        </div>

      </div>
    </AtmBezel>
  );
};

export default Welcome;
