import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AtmBezel from '../components/AtmBezel';
import CashDispenser from '../components/CashDispenser';
import ReceiptModal from '../components/ReceiptModal';
import ChatAssistant from '../components/ChatAssistant';
import { FiArrowLeft, FiCheckCircle, FiDollarSign, FiRepeat, FiSend, FiCpu, FiSmartphone } from 'react-icons/fi';
import axios from 'axios';

const Transactions = () => {
  const { account, refreshBalance, triggerSpeech, t } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'withdraw';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cash Dispense State
  const [showDispenser, setShowDispenser] = useState(false);
  const [dispenseAmount, setDispenseAmount] = useState(0);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // 1. Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // 2. Deposit Form State (Denominations count)
  const [denom100, setDenom100] = useState('0');
  const [denom500, setDenom500] = useState('0');

  // 3. Fund Transfer Form State
  const [transferType, setTransferType] = useState('account'); // account, upi, mobile
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [target, setTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferOtp, setTransferOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [showOtpAlert, setShowOtpAlert] = useState(false);

  // 4. QR Cash Withdrawal State
  const [qrAmount, setQrAmount] = useState('2000');
  const [qrStep, setQrStep] = useState('setup'); // setup -> qr-display -> dispensing

  // Reset errors on tab change
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // A. Cash Withdrawal handler
  const handleWithdrawal = async (amountVal) => {
    setError(null);
    setLoading(true);
    try {
      const amt = parseInt(amountVal, 10);
      if (isNaN(amt) || amt <= 0 || amt % 100 !== 0) {
        throw new Error("Amount must be a positive multiple of 100.");
      }

      const res = await axios.post('/api/account/withdraw', { amount: amt });
      
      // Update balance
      await refreshBalance();

      // Trigger cash dispensing animation
      setDispenseAmount(amt);
      setShowDispenser(true);
      triggerSpeech(`Dispensing ₹${amt}. Please collect cash.`);

      // Store receipt
      setReceiptData({
        ...res.data.transaction,
        type: 'withdrawal'
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Withdrawal failed.";
      setError(msg);
      triggerSpeech(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    handleWithdrawal(withdrawAmount);
  };

  // Collect cash action
  const handleCollectCash = () => {
    setShowDispenser(false);
    setShowReceipt(true);
  };

  // B. Cash Deposit handler
  const handleDeposit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const denominations = {
        100: parseInt(denom100, 10) || 0,
        500: parseInt(denom500, 10) || 0
      };

      const totalDep = denominations[100] * 100 + denominations[500] * 500;
      if (totalDep <= 0) {
        throw new Error("Please enter notes to deposit.");
      }

      const res = await axios.post('/api/account/deposit', { denominations });
      await refreshBalance();

      setReceiptData({
        ...res.data.transaction,
        type: 'deposit'
      });

      triggerSpeech(`Deposit of ₹${totalDep} completed successfully.`);
      setShowReceipt(true);

      // Reset
      setDenom100('0');
      setDenom500('0');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Deposit failed.";
      setError(msg);
      triggerSpeech(msg);
    } finally {
      setLoading(false);
    }
  };

  // C. Fund Transfer handler
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        type: transferType,
        amount: parseFloat(transferAmount),
        beneficiaryName,
        target
      };

      if (otpRequired) {
        payload.otp = transferOtp;
      }

      const res = await axios.post('/api/account/transfer', payload);

      if (res.data.otpRequired) {
        setOtpRequired(true);
        setDevOtp(res.data.devOtp || '');
        setShowOtpAlert(true);
        triggerSpeech("Enter OTP code sent to authorize your transfer.");
      } else {
        // Complete transfer
        await refreshBalance();
        setReceiptData({
          ...res.data.transaction,
          type: 'transfer'
        });
        triggerSpeech(`Transfer of ₹${transferAmount} to ${beneficiaryName} successful.`);
        setShowReceipt(true);

        // Reset
        setBeneficiaryName('');
        setTarget('');
        setTransferAmount('');
        setTransferOtp('');
        setOtpRequired(false);
        setDevOtp('');
        setShowOtpAlert(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Transfer failed.";
      setError(msg);
      triggerSpeech(msg);
    } finally {
      setLoading(false);
    }
  };

  // QR Withdrawal Flow trigger
  const handleQrStep2 = () => {
    setQrStep('qr-display');
    triggerSpeech(`Scan QR code with your mobile app to withdraw ₹${qrAmount}`);
  };

  const handleQrConfirm = async () => {
    setLoading(true);
    try {
      // Treat as standard withdrawal
      const res = await axios.post('/api/account/withdraw', { amount: parseInt(qrAmount, 10) });
      await refreshBalance();

      setDispenseAmount(parseInt(qrAmount, 10));
      setShowDispenser(true);
      setReceiptData(res.data.transaction);
      setQrStep('setup');
    } catch (err) {
      setError(err.response?.data?.message || "QR Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AtmBezel activeScreenTitle="ATM FINANCIAL ACTIONS">
      
      {/* Back button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
        <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
          Acc Bal: ₹{account?.balance}
        </span>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 mb-6 font-mono text-xs">
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 pb-3 font-bold uppercase transition-all tracking-wider ${
            activeTab === 'withdraw' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500'
          }`}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 pb-3 font-bold uppercase transition-all tracking-wider ${
            activeTab === 'deposit' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 pb-3 font-bold uppercase transition-all tracking-wider ${
            activeTab === 'transfer' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500'
          }`}
        >
          Transfer
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 pb-3 font-bold uppercase transition-all tracking-wider ${
            activeTab === 'qr' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500'
          }`}
        >
          QR Cash
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-3 text-xs mb-4 text-center font-mono">
          {error}
        </div>
      )}

      {/* View router depending on activeTab */}
      <div className="flex-1 flex flex-col justify-center">

        {/* Tab 1: CASH WITHDRAWAL */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Presets */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Fast Preset Options</span>
              <div className="grid grid-cols-2 gap-3">
                {[500, 1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleWithdrawal(amt)}
                    disabled={loading}
                    className="bg-[#0b1022] hover:bg-blue-600 border border-slate-800 hover:border-blue-500 text-slate-100 hover:text-white rounded-xl py-3 text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <FiDollarSign className="text-[10px]" /> ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Form */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mb-3 block">Enter Custom Amount</span>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    step="100"
                    placeholder="Enter multiples of 100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !withdrawAmount}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all hover:shadow-glow-cyan text-xs uppercase tracking-wider"
                >
                  {loading ? 'Dispensing...' : 'Dispense Cash'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 2: CASH DEPOSIT */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="max-w-md mx-auto w-full space-y-4 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mb-2 block">Feed Banknotes Into Slot</span>
            
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
              
              {/* Denomination 100 */}
              <div className="flex items-center justify-between gap-4">
                <div className="w-24 bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2 text-center text-emerald-400 font-mono font-bold text-xs">
                  ₹100 Bills
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={denom100}
                    onChange={(e) => setDenom100(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Denomination 500 */}
              <div className="flex items-center justify-between gap-4">
                <div className="w-24 bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2 text-center text-emerald-400 font-mono font-bold text-xs">
                  ₹500 Bills
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={denom500}
                    onChange={(e) => setDenom500(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

            </div>

            {/* Deposit Total Display */}
            <div className="bg-[#050f24] border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Total Deposit:</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                ₹{( (parseInt(denom100, 10) || 0) * 100 + (parseInt(denom500, 10) || 0) * 500 ).toLocaleString()}.00
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || ((parseInt(denom100, 10) || 0) <= 0 && (parseInt(denom500, 10) || 0) <= 0)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:shadow-glow-cyan text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <FiRepeat /> Confirm Cash Deposit
            </button>
          </form>
        )}

        {/* Tab 3: FUND TRANSFER */}
        {activeTab === 'transfer' && (
          <form onSubmit={handleTransfer} className="max-w-md mx-auto w-full space-y-4 text-left relative">
            
            {/* Direct OTP Alert banner */}
            <AnimatePresence>
              {showOtpAlert && devOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-glow-cyan flex items-start gap-2.5 text-left text-[10px] mb-4 cursor-pointer"
                  onClick={() => setTransferOtp(devOtp)}
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <FiSmartphone />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200">APEX SECURE SMS Alert</h5>
                    <p className="text-slate-400 mt-0.5">Use Transfer OTP code: <span className="text-cyan-400 font-extrabold text-xs font-mono">{devOtp}</span>. Click to autofill.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!otpRequired ? (
              <>
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  {['account', 'upi', 'mobile'].map((tType) => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => setTransferType(tType)}
                      className={`py-1.5 border rounded-lg font-bold uppercase transition-all ${
                        transferType === tType 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-sm' 
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {tType}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohit Sharma"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                    {transferType === 'account' ? 'Beneficiary Account Number' : transferType === 'upi' ? 'UPI Address ID' : 'Registered Mobile Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={transferType === 'account' ? '987654321098' : transferType === 'upi' ? 'mohit@upi' : '+91 99999 88888'}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3 bg-[#0a0f24] p-4 rounded-xl border border-slate-800">
                <div className="text-center">
                  <h4 className="text-xs font-bold text-slate-200 mb-1 uppercase tracking-wide">Enter OTP to Authorize Transfer</h4>
                  <p className="text-[9px] text-slate-500">A 6-digit code has been sent to confirm transfer of ₹{transferAmount}</p>
                </div>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={transferOtp}
                  onChange={(e) => setTransferOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center text-sm font-mono tracking-widest text-cyan-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all hover:shadow-glow-cyan text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <FiSend /> {loading ? 'Processing Transfer...' : otpRequired ? 'Confirm OTP & Send' : 'Request OTP Verification'}
            </button>
          </form>
        )}

        {/* Tab 4: QR CASH WITHDRAWAL */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto w-full text-center space-y-4">
            {qrStep === 'setup' ? (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mb-2 block">Choose QR Withdrawal Preset</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {['500', '1000', '2000', '5000'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQrAmount(val)}
                      className={`py-2 border rounded-lg font-bold ${
                        qrAmount === val ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      ₹{parseInt(val).toLocaleString()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleQrStep2}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FiCpu /> Generate QR Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-900">
                <h4 className="text-xs font-mono font-bold text-slate-200">SCAN QR USING BANK APP</h4>
                <div className="w-40 h-40 bg-white p-3 border border-slate-800 rounded shadow-md">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WITHDRAW_QR_APEX_${qrAmount}`} 
                    alt="ATM withdrawal QR" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Withdraw amount: <span className="text-cyan-400 font-bold">₹{qrAmount}</span>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleQrConfirm}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Simulate Mobile Approval
                  </button>
                  <button
                    onClick={() => setQrStep('setup')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 5. Custom overlays and modals */}
      <CashDispenser 
        amount={dispenseAmount} 
        show={showDispenser} 
        onCollect={handleCollectCash} 
      />

      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => {
          setShowReceipt(false);
          navigate('/dashboard');
        }}
        txDetails={receiptData}
      />

      <ChatAssistant />
    </AtmBezel>
  );
};

export default Transactions;
