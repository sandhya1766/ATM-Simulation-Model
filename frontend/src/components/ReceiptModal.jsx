import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPrinter } from 'react-icons/fi';

const ReceiptModal = ({ isOpen, onClose, txDetails }) => {
  const receiptRef = useRef();

  if (!txDetails) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Quick simple browser printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ATM Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; color: black; }
            .receipt { max-width: 300px; margin: 0 auto; border: 1px dashed black; padding: 10px; }
            .center { text-align: center; }
            .hr { border-top: 1px dashed black; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="receipt">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#1e293b] border-b border-slate-800 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-200">ATM TRANSACTION RECEIPT</span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Receipt Scroller Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center">
              
              {/* The Paper Slip */}
              <div 
                ref={receiptRef}
                className="w-full bg-white text-slate-900 p-6 rounded shadow-lg font-mono text-xs flex flex-col relative border-t-8 border-dashed border-slate-300"
              >
                <div className="text-center font-extrabold text-sm tracking-widest mb-1">
                  APEX BANK ATM
                </div>
                <div className="text-center text-[9px] text-slate-500 uppercase tracking-wider mb-4">
                  --- Customer Receipt ---
                </div>

                <div className="border-t border-dashed border-slate-400 my-2" />

                <div className="space-y-1 my-2">
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{new Date(txDetails.date || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME:</span>
                    <span>{new Date(txDetails.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TERMINAL ID:</span>
                    <span>APX-98822</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSACTION ID:</span>
                    <span>{txDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REF NUMBER:</span>
                    <span>{txDetails.refNumber}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 my-2" />

                <div className="space-y-1 my-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TYPE:</span>
                    <span className="uppercase">{txDetails.type || 'WITHDRAWAL'}</span>
                  </div>
                  {txDetails.beneficiaryName && (
                    <div className="flex justify-between">
                      <span>BENEFICIARY:</span>
                      <span>{txDetails.beneficiaryName}</span>
                    </div>
                  )}
                  {txDetails.target && (
                    <div className="flex justify-between">
                      <span>DESTINATION:</span>
                      <span>{txDetails.target}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-slate-950 mt-1">
                    <span>AMOUNT:</span>
                    <span>₹{txDetails.amount}.00</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 my-2" />

                <div className="space-y-1 my-2">
                  <div className="flex justify-between">
                    <span>LEDGER BAL:</span>
                    <span>₹{txDetails.balanceAfter}.00</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>AVAILABLE BAL:</span>
                    <span>₹{txDetails.balanceAfter}.00</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 my-2" />

                {/* Simulated QR Code & Barcode */}
                <div className="flex flex-col items-center mt-3 mb-1">
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center p-2 mb-2 border border-slate-300">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${txDetails.refNumber || 'APEXBANK'}`} 
                      alt="Verification QR" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[7px] text-slate-500 font-mono tracking-widest">VERIFY TRANSACTION ON APEX APP</span>
                </div>

                <div className="text-center font-bold text-[9px] text-slate-700 mt-4 uppercase">
                  Thank you for banking with APEX!
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-4 py-3 bg-[#1e293b] border-t border-slate-800 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md transition-all"
              >
                <FiPrinter /> Print Receipt
              </button>
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-lg text-sm transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiptModal;
