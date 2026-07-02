import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiEye } from 'react-icons/fi';

const AccessibilityToggle = () => {
  const { accessibilityMode, setAccessibilityMode, triggerSpeech } = useAuth();

  const handleToggle = () => {
    const nextState = !accessibilityMode;
    setAccessibilityMode(nextState);
    if (nextState) {
      triggerSpeech("Accessibility mode active. Larger fonts applied.");
    } else {
      triggerSpeech("Standard mode active.");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1 px-3 py-1 rounded-md border font-semibold transition-all ${
        accessibilityMode
          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
      }`}
      title="Toggle Large Fonts / Accessibility Mode"
    >
      <FiEye className="text-sm" />
      <span>{accessibilityMode ? 'Large Fonts' : 'Normal Text'}</span>
    </button>
  );
};

export default AccessibilityToggle;
