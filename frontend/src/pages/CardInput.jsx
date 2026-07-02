import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AtmBezel from '../components/AtmBezel';
import { FiCreditCard, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const CardInput = () => {
  const { checkCard, setLoginStep, error, loading } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s+/g, '');
    await checkCard(cleanNum, expiryDate);
  };

  // Auto inject seed card
  const handleInjectMockCard = () => {
    setCardNumber('1234 5678 1234 5678');
    setExpiryDate('12/28');
  };

  return (
    <AtmBezel activeScreenTitle="CARD VERIFICATION">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4">
        
        <div className="text-center mb-6 space-y-1">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">
            Insert ATM Card
          </h3>
          <p className="text-[10px] text-slate-400">Please enter your debit card credentials below</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-3 text-xs mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Card Number */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Card Number</label>
            <div className="relative">
              <FiCreditCard className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                maxLength="19"
                placeholder="1234 5678 1234 5678"
                value={cardNumber}
                onChange={(e) => {
                  // Format as space separated groups
                  const val = e.target.value.replace(/\D/g, '');
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setCardNumber(formatted);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Expiry Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                maxLength="5"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) {
                    setExpiryDate(val.slice(0, 2) + '/' + val.slice(2, 4));
                  } else {
                    setExpiryDate(val);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:shadow-glow-cyan text-xs uppercase tracking-wider flex items-center justify-center"
            >
              {loading ? 'Reading chip...' : 'Verify Card'}
            </button>

            <button
              type="button"
              onClick={handleInjectMockCard}
              className="w-full bg-slate-900 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Autofill Test Card Details
            </button>
          </div>
        </form>

        {/* Back navigation */}
        <button
          onClick={() => setLoginStep('welcome')}
          className="mt-6 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-all mx-auto font-mono"
        >
          <FiArrowLeft /> Back to Welcome Card
        </button>

      </div>
    </AtmBezel>
  );
};

export default CardInput;
