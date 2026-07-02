import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AtmBezel from '../components/AtmBezel';
import { FiMail, FiLock, FiArrowLeft, FiShield } from 'react-icons/fi';

const AdminLogin = ({ type = 'admin' }) => {
  const { adminLogin, setLoginStep, loading, error } = useAuth();
  const [email, setEmail] = useState(type === 'admin' ? 'admin@banking.com' : 'super@banking.com');
  const [password, setPassword] = useState(type === 'admin' ? 'adminpassword' : 'superpassword');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminLogin(email, password);
  };

  return (
    <AtmBezel activeScreenTitle={`${type.toUpperCase()} WEB SECURITY LOGIN`}>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4">
        
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 text-blue-400">
            <FiShield className="text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">
            {type === 'admin' ? 'Bank Admin Portal' : 'Super Admin System'}
          </h3>
          <p className="text-[10px] text-slate-400">Enter bank database access credentials</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-3 text-xs mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Security Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@apex.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Database Passkey</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:shadow-glow-cyan text-xs uppercase tracking-wider flex items-center justify-center"
          >
            {loading ? 'Decrypting Access...' : 'Authenticate Access'}
          </button>
        </form>

        {/* Back Link */}
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

export default AdminLogin;
