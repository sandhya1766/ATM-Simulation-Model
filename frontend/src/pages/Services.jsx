import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AtmBezel from '../components/AtmBezel';
import ChatAssistant from '../components/ChatAssistant';
import { FiArrowLeft, FiKey, FiLock, FiBookOpen, FiCheckCircle, FiSmartphone } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Services = () => {
  const { card, user, refreshBalance, triggerSpeech } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. PIN Change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinOtp, setPinOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [showOtpAlert, setShowOtpAlert] = useState(false);

  // 2. Card Lock/Unlock state
  const [cardStatus, setCardStatus] = useState(card?.status || 'active');

  // 3. Cheque book request state
  const [chequeStatus, setChequeStatus] = useState('');
  const [chequeId, setChequeId] = useState('');

  // 4. KYC upload state
  const [docType, setDocType] = useState('PAN');
  const [docNumber, setDocNumber] = useState('');
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'pending');

  const handlePinChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = { currentPin, newPin };
      if (otpRequired) {
        payload.otp = pinOtp;
      }

      const res = await axios.post('/api/account/change-pin', payload);
      
      if (res.data.otpRequired) {
        setOtpRequired(true);
        setDevOtp(res.data.devOtp || '');
        setShowOtpAlert(true);
        triggerSpeech("Enter verification code sent to authorize PIN modification.");
      } else {
        setSuccess("ATM PIN changed successfully.");
        triggerSpeech("ATM PIN has been updated successfully.");
        
        // Reset
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setPinOtp('');
        setOtpRequired(false);
        setDevOtp('');
        setShowOtpAlert(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "PIN modification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLockUnlockCard = async (action) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/account/lock-card', { action });
      setCardStatus(res.data.status);
      setSuccess(`Card successfully updated to ${res.data.status}`);
      triggerSpeech(`Card status updated to ${action}`);
    } catch (err) {
      setError(err.response?.data?.message || "Card modification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChequeRequest = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/account/cheque-request');
      setChequeId(res.data.requestId);
      setChequeStatus('requested');
      setSuccess(`Cheque Book requested successfully. ID: ${res.data.requestId}`);
      triggerSpeech("Cheque book requested successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Cheque request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/account/update-kyc', { docType, docNumber });
      setKycStatus(res.data.kycStatus);
      setSuccess("KYC documents uploaded successfully. Status: PENDING APPROVAL.");
      triggerSpeech("KYC document uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "KYC upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AtmBezel activeScreenTitle="ATM SERVICES DESK">
      
      {/* Back button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-3 text-xs mb-4 text-center font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-3 text-xs mb-4 text-center font-mono">
          {success}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Service 1: PIN Change Form */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-sans text-xs uppercase tracking-wider">
              <FiKey /> Change ATM PIN
            </div>

            {/* Direct OTP Alert banner */}
            <AnimatePresence>
              {showOtpAlert && devOtp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-cyan-500/40 rounded-xl p-2.5 shadow-glow-cyan flex items-start gap-2 text-[10px] cursor-pointer"
                  onClick={() => setPinOtp(devOtp)}
                >
                  <FiSmartphone className="text-cyan-400 text-sm mt-0.5" />
                  <div>
                    <h6 className="font-bold text-slate-200">APEX SECURE SMS Alert</h6>
                    <p className="text-slate-400 mt-0.5">Use PIN Change OTP: <span className="text-cyan-400 font-extrabold font-mono text-xs">{devOtp}</span>. Click to autofill.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handlePinChange} className="space-y-3 font-mono text-[10px]">
              {!otpRequired ? (
                <>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Current PIN</label>
                    <input
                      type="password"
                      maxLength="4"
                      required
                      placeholder="••••"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">New PIN</label>
                    <input
                      type="password"
                      maxLength="4"
                      required
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Confirm New PIN</label>
                    <input
                      type="password"
                      maxLength="4"
                      required
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-slate-400 block mb-0.5 text-center font-bold">Verification OTP Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={pinOtp}
                    onChange={(e) => setPinOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-center text-xs tracking-widest focus:outline-none focus:border-cyan-500 text-cyan-400 font-bold"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all tracking-wider"
              >
                {loading ? 'Processing...' : otpRequired ? 'Confirm PIN Change' : 'Authorize PIN Change'}
              </button>
            </form>
          </div>
        </div>

        {/* Service 2: Card Lock / Unlock Block */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-sans text-xs uppercase tracking-wider">
              <FiLock /> Card Status Security
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Instantly lock or permanently block your card to protect your account balance.
            </p>
            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Card Number:</span>
                <span>•••• •••• •••• 5678</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Current Status:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  cardStatus === 'active' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                }`}>
                  {cardStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 font-mono text-[10px]">
            {cardStatus === 'active' ? (
              <button
                onClick={() => handleLockUnlockCard('lock')}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all"
              >
                Lock Card
              </button>
            ) : (
              <button
                onClick={() => handleLockUnlockCard('unlock')}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all"
              >
                Unlock Card
              </button>
            )}
            <button
              onClick={() => handleLockUnlockCard('block')}
              disabled={loading || cardStatus === 'blocked'}
              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all"
            >
              Block Lost Card
            </button>
          </div>
        </div>

        {/* Service 3: Cheque Book Request */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-sans text-xs uppercase tracking-wider">
              <FiBookOpen /> Cheque Book Request
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Submit requests for a new physical cheque book. Delivered to your registered home branch in 3 business days.
            </p>
            {chequeStatus && (
              <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 font-mono text-[9px] space-y-1.5">
                <div className="flex justify-between">
                  <span>Request ID:</span>
                  <span className="text-cyan-400 font-bold">{chequeId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Track Status:</span>
                  <span className="text-amber-400 font-bold uppercase">Requested</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleChequeRequest}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all tracking-wider font-mono mt-4"
          >
            {loading ? 'Submitting...' : 'Request Cheque Book'}
          </button>
        </div>

        {/* Service 4: Update KYC Details */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans text-xs uppercase tracking-wider">
              <FiCheckCircle /> Update KYC Status
            </div>
            <form onSubmit={handleKycSubmit} className="space-y-3 font-mono text-[10px]">
              <div>
                <label className="text-slate-400 block mb-0.5">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="PAN">PAN Card</option>
                  <option value="Aadhar">Aadhar UID</option>
                  <option value="Passport">Passport Details</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">Document Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCDE1234F"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-between items-center font-mono text-[9px] bg-slate-950 rounded-lg p-2 mt-1">
                <span>Verification State:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                  kycStatus === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'
                }`}>
                  {kycStatus}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs uppercase transition-all tracking-wider"
              >
                {loading ? 'Uploading...' : 'Submit KYC Details'}
              </button>
            </form>
          </div>
        </div>

      </div>

      <ChatAssistant />
    </AtmBezel>
  );
};

export default Services;
