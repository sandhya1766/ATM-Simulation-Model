import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiCreditCard, FiLock, FiCheck, FiX, FiAlertOctagon, 
  FiFileText, FiLogOut, FiActivity, FiRefreshCw 
} from 'react-icons/fi';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout, triggerSpeech } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, customers, kyc, transactions
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticRes = await axios.get('/api/admin/analytics');
      setAnalytics(analyticRes.data.analytics);

      const customerRes = await axios.get('/api/admin/customers');
      setCustomers(customerRes.data.customers || []);

      const notifyRes = await axios.get('/api/admin/notifications');
      setNotifications(notifyRes.data.notifications || []);

      const txRes = await axios.get('/api/admin/transactions');
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error(err);
      triggerSpeech("Error loading admin system parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Approval KYC
  const handleKycReview = async (userId, docId, status) => {
    setActionLoading(true);
    try {
      await axios.post('/api/admin/kyc-review', { userId, docId, status });
      triggerSpeech(`KYC Document successfully ${status}.`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle freeze status
  const handleFreezeToggle = async (type, id, currentStatus) => {
    setActionLoading(true);
    const action = currentStatus === 'frozen' || currentStatus === 'locked' || currentStatus === 'blocked' ? 'unfreeze' : 'freeze';
    try {
      await axios.post('/api/admin/freeze-status', { type, id, action });
      triggerSpeech(`Account details successfully updated.`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark notification read
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/api/admin/notifications/${id}/read`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020512] text-slate-100 p-4 md:p-8 flex flex-col font-sans">
      
      {/* Admin Header */}
      <div className="w-full max-w-6xl mx-auto flex flex-wrap justify-between items-center bg-[#090f24] border border-slate-800 p-4 rounded-xl mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center font-black text-slate-900 text-lg">
            A
          </div>
          <div className="text-left">
            <h2 className="text-md font-bold text-slate-100 tracking-wider">APEX ADMINISTRATIVE PANEL</h2>
            <p className="text-[10px] text-slate-400 font-mono">OFFICER CONSOLE • {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Ledger"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          
          {user?.role === 'super-admin' && (
            <button
              onClick={() => navigate('/super')}
              className="bg-indigo-600 hover:bg-indigo-500 font-bold px-3 py-1.5 rounded-lg text-xs"
            >
              Super Console
            </button>
          )}

          <button
            onClick={logout}
            className="bg-rose-600 hover:bg-rose-500 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start flex-1">
        
        {/* Sidebar Nav */}
        <div className="col-span-1 bg-[#090f24] border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-2 px-2">Navigation</span>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiActivity /> Summary Stats
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiUsers /> Account Holder List
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'kyc' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiFileText /> KYC Document Approvals
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiCreditCard /> Audit System Ledger
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Summary stats Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#090f24] border border-slate-800 rounded-xl p-4 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Total Depositors</span>
                  <div className="text-xl font-bold mt-1 font-mono text-cyan-400">{analytics?.totalUsers || 0}</div>
                </div>

                <div className="bg-[#090f24] border border-slate-800 rounded-xl p-4 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Active Cards</span>
                  <div className="text-xl font-bold mt-1 font-mono text-emerald-400">{analytics?.activeCards || 0}</div>
                </div>

                <div className="bg-[#090f24] border border-slate-800 rounded-xl p-4 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Suspended Cards</span>
                  <div className="text-xl font-bold mt-1 font-mono text-rose-500">{analytics?.blockedCards || 0}</div>
                </div>

                <div className="bg-[#090f24] border border-slate-800 rounded-xl p-4 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Total Vault Sum</span>
                  <div className="text-xl font-bold mt-1 font-mono text-amber-400">₹{analytics?.totalBalance || 0}</div>
                </div>
              </div>

              {/* Notification Center */}
              <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <FiAlertOctagon className="text-amber-500" /> Security Alerts & Notifications
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No new alerts found on this sector.</p>
                ) : (
                  <div className="space-y-3 font-mono text-[10px]">
                    {notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        className={`flex items-start justify-between border-b border-slate-900 pb-3 gap-4 ${
                          notif.readBy.includes(user?.id) ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-slate-200 text-xs font-semibold">{notif.message}</p>
                          <p className="text-slate-500 text-[8px]">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        {!notif.readBy.includes(user?.id) && (
                          <button
                            onClick={() => handleMarkRead(notif._id)}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2 py-1 rounded transition-all"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account holders list Tab */}
          {activeTab === 'customers' && (
            <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Customer Accounts Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Account / Card Number</th>
                      <th className="px-4 py-2.5">Balance</th>
                      <th className="px-4 py-2.5">Card Status</th>
                      <th className="px-4 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((cust) => (
                      <tr key={cust.id} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-200">{cust.name}</div>
                          <div className="text-[8px] text-slate-500">{cust.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>Acc: {cust.account?.accountNumber}</div>
                          <div className="text-slate-500">Card: {cust.card?.cardNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-cyan-400 font-bold">₹{cust.account?.balance}</td>
                        <td className="px-4 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            cust.card?.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950 text-rose-400 border border-rose-900/30'
                          }`}>
                            {cust.card?.status || 'none'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {cust.card && (
                            <button
                              onClick={() => handleFreezeToggle('card', cust.card.id || cust.card._id, cust.card.status)}
                              disabled={actionLoading}
                              className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                cust.card.status === 'active' 
                                  ? 'bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900/30' 
                                  : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/30'
                              }`}
                            >
                              {cust.card.status === 'active' ? 'Freeze' : 'Unfreeze'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KYC approval Tab */}
          {activeTab === 'kyc' && (
            <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">KYC Approvals Desk</h3>
              
              {/* Filter pending KYC users */}
              {customers.filter(c => c.kycStatus === 'pending').length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No pending KYC approvals currently.</p>
              ) : (
                <div className="space-y-4">
                  {customers.filter(c => c.kycStatus === 'pending').map((cust) => (
                    <div key={cust.id} className="bg-slate-950/60 p-4 border border-slate-900 rounded-lg flex flex-col md:flex-row justify-between gap-4 font-mono text-[10px]">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200">{cust.name}</div>
                        <p className="text-slate-500">Email: {cust.email} | Phone: {cust.phone}</p>
                        <p className="text-slate-400">KYC Status: <span className="text-amber-500 uppercase font-bold">Pending</span></p>
                      </div>
                      
                      {/* Document Details Action */}
                      <div className="flex flex-col justify-center gap-2 items-end">
                        <span className="text-[9px] text-slate-500">Verification actions</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleKycReview(cust.id, cust.card ? cust.card._id : null, 'approved')}
                            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 px-3 py-1 rounded text-[9px] font-bold flex items-center gap-1 uppercase"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleKycReview(cust.id, cust.card ? cust.card._id : null, 'rejected')}
                            className="bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-400 px-3 py-1 rounded text-[9px] font-bold flex items-center gap-1 uppercase"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transactions Ledger Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Central Transaction Auditing Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400">
                      <th className="px-4 py-2.5">Timestamp</th>
                      <th className="px-4 py-2.5">User Profile</th>
                      <th className="px-4 py-2.5">Ref Details</th>
                      <th className="px-4 py-2.5">Action Type</th>
                      <th className="px-4 py-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                        <td className="px-4 py-3 text-slate-400 text-[9px]">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-300">{tx.user?.name}</div>
                          <div className="text-[8px] text-slate-500">{tx.account?.accountNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{tx.transactionId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            tx.type === 'deposit' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-200">
                          ₹{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
