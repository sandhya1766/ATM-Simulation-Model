import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AtmBezel from '../components/AtmBezel';
import ChatAssistant from '../components/ChatAssistant';
import { 
  FiDollarSign, FiLogOut, FiRepeat, FiFileText, FiKey, 
  FiTrendingUp, FiBriefcase, FiPercent, FiGlobe, FiGrid
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, card, account, logout, refreshBalance, triggerSpeech, t } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);

  // Load balances
  useEffect(() => {
    if (account) {
      // Dynamic count animation up to actual balance
      let current = 0;
      const step = Math.ceil(account.balance / 30);
      const timer = setInterval(() => {
        current += step;
        if (current >= account.balance) {
          setBalance(account.balance);
          clearInterval(timer);
        } else {
          setBalance(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [account]);

  // Simulated Live Exchange rates
  const [rates] = useState({
    USD: 83.42,
    EUR: 89.85,
    GBP: 105.62,
    AED: 22.71
  });

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(12); // months
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    // Calculate Loan EMI: P * r * (1+r)^n / ((1+r)^n - 1)
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseInt(loanTenure);
    if (p > 0 && r > 0 && n > 0) {
      const emiVal = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(Math.round(emiVal));
    }
  }, [loanAmount, interestRate, loanTenure]);

  const handleLogout = async () => {
    triggerSpeech("Thank you for using Apex Bank. Ejecting card.");
    await logout();
  };

  return (
    <AtmBezel activeScreenTitle="CUSTOMER DIGITAL DASHBOARD">
      
      {/* 1. Header Profile Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* User Card */}
        <div className="col-span-2 glass-panel p-4 rounded-xl flex items-center gap-4 border border-slate-800">
          <img 
            src={user?.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
            alt="User profile" 
            className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500 shadow-glow-cyan"
          />
          <div className="flex-1 text-left text-xs font-mono">
            <h3 className="text-sm font-bold text-slate-100 font-sans">{user?.name}</h3>
            <p className="text-slate-400 mt-0.5">Acc Number: <span className="text-slate-200">{account?.accountNumber}</span></p>
            <p className="text-slate-400">Card Status: <span className="text-emerald-400 font-bold uppercase">Active</span></p>
            <p className="text-[10px] text-slate-500 mt-1">Branch: {account?.branch || 'Premium Silicon'}</p>
          </div>
        </div>

        {/* Balance Stats */}
        <div className="glass-panel p-4 rounded-xl bg-[#091024]/80 border border-slate-800 text-left">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Available Balance</span>
          <div className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-sans tracking-wide mt-1">
            ₹{balance.toLocaleString('en-IN')}.00
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-900 pt-1">
            <span>Ledger: ₹{account?.balance}</span>
            <span>Min: ₹1,000</span>
          </div>
        </div>
      </div>

      {/* 2. Grid Actions Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        
        {/* Cash Withdrawal */}
        <button
          onClick={() => navigate('/transactions?tab=withdraw')}
          className="glass-panel hover:bg-blue-900/10 border border-slate-800 hover:border-blue-500/40 p-4 rounded-xl text-left transition-all flex flex-col justify-between h-28 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all">
            <FiDollarSign />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Withdraw Cash</h4>
            <p className="text-[9px] text-slate-500">Fast cash dispenser</p>
          </div>
        </button>

        {/* Deposit Cash */}
        <button
          onClick={() => navigate('/transactions?tab=deposit')}
          className="glass-panel hover:bg-emerald-900/10 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all flex flex-col justify-between h-28 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
            <FiRepeat />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Deposit Cash</h4>
            <p className="text-[9px] text-slate-500">Deposit paper notes</p>
          </div>
        </button>

        {/* Fund Transfer */}
        <button
          onClick={() => navigate('/transactions?tab=transfer')}
          className="glass-panel hover:bg-purple-900/10 border border-slate-800 hover:border-purple-500/40 p-4 rounded-xl text-left transition-all flex flex-col justify-between h-28 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all">
            <FiTrendingUp />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Fund Transfer</h4>
            <p className="text-[9px] text-slate-500">UPI, IFSC, Accounts</p>
          </div>
        </button>

        {/* Mini Statement */}
        <button
          onClick={() => navigate('/statements')}
          className="glass-panel hover:bg-cyan-900/10 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl text-left transition-all flex flex-col justify-between h-28 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all">
            <FiFileText />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Statements</h4>
            <p className="text-[9px] text-slate-500">Download passbook</p>
          </div>
        </button>

      </div>

      {/* 3. Row Widgets (KYC, Exchange rates, Loan calculator) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Services / PIN change quick link */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-left flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Service Desk</span>
              <FiKey className="text-slate-500 text-xs" />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal mb-3">Update your documents, request cheque books, or change your secure ATM transaction PIN code with OTP validation.</p>
          </div>
          <button 
            onClick={() => navigate('/services')}
            className="w-full bg-slate-900 border border-slate-850 hover:border-blue-500 hover:text-white py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all"
          >
            Manage Services
          </button>
        </div>

        {/* Exchange rates simulator */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Forex Rates</span>
            <FiGlobe className="text-slate-500 text-xs" />
          </div>
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between text-slate-300">
              <span>USD / INR</span>
              <span className="font-bold text-slate-100">₹{rates.USD}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>EUR / INR</span>
              <span className="font-bold text-slate-100">₹{rates.EUR}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GBP / INR</span>
              <span className="font-bold text-slate-100">₹{rates.GBP}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>AED / INR</span>
              <span className="font-bold text-slate-100">₹{rates.AED}</span>
            </div>
          </div>
        </div>

        {/* Loan Calculator */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Loan EMI Calculator</span>
            <FiPercent className="text-slate-500 text-xs animate-bounce" />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Amount (₹)</label>
                <input 
                  type="number" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200" 
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">Tenure (months)</label>
                <input 
                  type="number" 
                  value={loanTenure} 
                  onChange={(e) => setLoanTenure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200" 
                />
              </div>
            </div>
            <div className="bg-[#040815] border border-slate-900 rounded p-2 text-center">
              <span className="text-[9px] uppercase font-mono text-slate-500">Monthly EMI</span>
              <p className="text-sm font-bold text-cyan-400 font-mono">₹{emi.toLocaleString('en-IN')}/mo</p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Footer Eject Button */}
      <div className="flex justify-between items-center border-t border-slate-850 pt-4 mt-2">
        <span className="text-[9px] font-mono text-slate-500">Last login: {new Date(user?.lastLogin || Date.now()).toLocaleString()}</span>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl font-bold bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white transition-all text-xs flex items-center gap-2"
        >
          <FiLogOut /> Eject Card
        </button>
      </div>

      {/* Floating AI Agent Support */}
      <ChatAssistant />

    </AtmBezel>
  );
};

export default Dashboard;
