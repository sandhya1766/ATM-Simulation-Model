import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Apex AI Assistant. How can I assist you with your banking simulation today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response matching standard banking rules
    setTimeout(() => {
      let botResponse = "I'm sorry, I'm still learning. For support, please contact the branch manager.";
      const cleanMsg = userMsg.toLowerCase();

      if (cleanMsg.includes('withdraw') || cleanMsg.includes('cash out')) {
        botResponse = "To withdraw cash: Go to 'Withdraw Cash' on the dashboard, select one of the fast cash amounts or write a custom multiple of 100 up to ₹20,000 per transaction.";
      } else if (cleanMsg.includes('limit') || cleanMsg.includes('max')) {
        botResponse = "The daily ATM withdrawal limit for your card is ₹50,000. Each transaction has a cap of ₹20,000.";
      } else if (cleanMsg.includes('pin') || cleanMsg.includes('change pin')) {
        botResponse = "To change your PIN: Go to 'Services & KYC' -> 'Change ATM PIN'. You will need to enter your current PIN, verify a 6-digit OTP sent to your phone, and enter your new PIN.";
      } else if (cleanMsg.includes('kyc') || cleanMsg.includes('upload')) {
        botResponse = "To update KYC details: Select 'Services & KYC' -> 'Update KYC Document', select document type (Aadhar, PAN, Passport, Driving License) and click submit. Admin approval is required to activate pending states.";
      } else if (cleanMsg.includes('cheque') || cleanMsg.includes('checkbook')) {
        botResponse = "You can request a new Cheque Book in the 'Services & KYC' tab. It will be dispatched to your registered address in 3 business days.";
      } else if (cleanMsg.includes('lock') || cleanMsg.includes('lost card')) {
        botResponse = "If you lost your card, choose 'Temporary Lock' or 'Permanent Block' under 'Services' immediately to prevent unauthorized transactions.";
      } else if (cleanMsg.includes('balance') || cleanMsg.includes('inquiry')) {
        botResponse = "Select 'Balance Inquiry' on the dashboard to view your Current Balance, Ledger Balance, and Available Balance after deducting the minimum balance of ₹1,000.";
      } else if (cleanMsg.includes('transfer')) {
        botResponse = "To transfer funds: Go to 'Fund Transfer', choose target mode (Account number, UPI ID, or Mobile), fill in target details, and verify the OTP sent to your registered phone.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            className="w-80 h-96 bg-[#0c122c] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiCpu className="text-cyan-400 animate-pulse text-lg" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Apex AI Agent</h4>
                  <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">Online Support</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FiX />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] bg-slate-950/40">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-2.5 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600/30 border border-blue-500/50 text-slate-200 text-right' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Inputs */}
            <div className="p-3 bg-[#080d24] border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask standard ATM steps..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-sm transition-all"
              >
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
      >
        <FiMessageSquare className="text-xl" />
      </button>
    </div>
  );
};

export default ChatAssistant;
