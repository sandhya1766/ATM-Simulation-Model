import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AtmBezel from '../components/AtmBezel';
import ChatAssistant from '../components/ChatAssistant';
import { FiArrowLeft, FiSearch, FiFilter, FiDownload, FiPrinter } from 'react-icons/fi';
import axios from 'axios';

const Statements = () => {
  const { account, triggerSpeech } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search / Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    fetchStatement();
  }, [type, month]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (month) params.month = month;
      if (search) params.search = search;

      const res = await axios.get('/api/account/history', { params });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
      triggerSpeech("Failed to load statements.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStatement();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Time,Transaction ID,Ref Number,Type,Amount,Balance After,Description,Status\n";
    
    // Rows
    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      csvContent += `"${dateStr}","${timeStr}","${tx.transactionId}","${tx.refNumber}","${tx.type.toUpperCase()}",${tx.amount},${tx.balanceAfter},"${tx.description}","${tx.status.toUpperCase()}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apex_statement_${account?.accountNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSpeech("Statement downloaded successfully.");
  };

  // Direct statement print simulation
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank');
    let rowsHtml = '';
    
    transactions.forEach(tx => {
      rowsHtml += `
        <tr>
          <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
          <td>${tx.transactionId}</td>
          <td style="text-transform:uppercase;">${tx.type}</td>
          <td>₹${tx.amount}</td>
          <td>₹${tx.balanceAfter}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Apex Bank Account Statement</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            h2 { text-align: center; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <h2>APEX BANK STATEMENT LOG</h2>
          <p>Account Number: ${account?.accountNumber}</p>
          <p>Branch: ${account?.branch}</p>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AtmBezel activeScreenTitle="STATEMENT LOGS">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            <FiDownload /> Export Excel
          </button>
          <button
            onClick={handlePrintStatement}
            disabled={transactions.length === 0}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            <FiPrinter /> Print Passbook
          </button>
        </div>
      </div>

      {/* Filters Form Panel */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/80 mb-6 flex flex-wrap gap-4 items-center">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference numbers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-200 placeholder-slate-655 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 rounded-lg text-xs font-mono"
          >
            Go
          </button>
        </form>

        {/* Type Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <FiFilter className="text-slate-500" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none text-[11px]"
          >
            <option value="">All Types</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
            <option value="pin_change">PIN Update</option>
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none text-[11px]"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

      </div>

      {/* Transactions Data Table */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Balance After</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">
                    Decrypting transaction ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">
                    No transactions found matching search query.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-900/20 transition-all">
                    <td className="px-4 py-3 text-slate-300">
                      <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-[8px] text-slate-500">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono font-semibold">{tx.transactionId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] ${
                        tx.type === 'deposit' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                        tx.type === 'withdrawal' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' :
                        tx.type === 'transfer' ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-slate-200">₹{tx.balanceAfter}</td>
                    <td className="px-4 py-3 text-emerald-400 uppercase font-bold text-[8px]">Success</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ChatAssistant />

    </AtmBezel>
  );
};

export default Statements;
