import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiSliders, FiUserPlus, FiTrash2, FiFileText, FiDatabase, 
  FiLogOut, FiActivity, FiArrowLeft, FiShield 
} from 'react-icons/fi';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const { user, logout, triggerSpeech } = useAuth();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('admins'); // admins, logs, database
  const [loading, setLoading] = useState(true);

  // Database Backup States
  const [backupFilename, setBackupFilename] = useState('');
  const [restoreFilename, setRestoreFilename] = useState('');
  const [dbConsoleMsg, setDbConsoleMsg] = useState('System ready for database operations.');

  // Create Admin Form States
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    fetchSuperData();
  }, [activeTab]);

  const fetchSuperData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'admins') {
        const res = await axios.get('/api/super/admins');
        setAdmins(res.data.admins || []);
      } else if (activeTab === 'logs') {
        const res = await axios.get('/api/super/audit-logs');
        setAuditLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error(err);
      triggerSpeech("Error loading data ledger.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      await axios.post('/api/super/admins', {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword
      });
      setFormSuccess("Administrator created successfully.");
      triggerSpeech("New administrator account generated.");
      
      // Reset
      setAdminName('');
      setAdminEmail('');
      setAdminPhone('');
      setAdminPassword('');

      await fetchSuperData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create administrator.");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this administrator account?")) return;
    try {
      await axios.delete(`/api/super/admins/${id}`);
      triggerSpeech("Administrator account removed.");
      await fetchSuperData();
    } catch (err) {
      console.error(err);
    }
  };

  // DB Backup
  const handleBackup = async () => {
    setDbConsoleMsg('Initiating database dump...');
    try {
      const res = await axios.post('/api/super/db-backup');
      setBackupFilename(res.data.filename);
      setRestoreFilename(res.data.filename);
      setDbConsoleMsg(`Backup complete. File: ${res.data.filename}`);
      triggerSpeech("Database backup completed successfully.");
    } catch (err) {
      setDbConsoleMsg('Backup failed.');
    }
  };

  // DB Restore
  const handleRestore = async () => {
    if (!restoreFilename) {
      setDbConsoleMsg('Please input a backup filename to restore.');
      return;
    }
    setDbConsoleMsg('Restoring database schema...');
    try {
      const res = await axios.post('/api/super/db-restore', { filename: restoreFilename });
      setDbConsoleMsg(`Restoration successful. ${res.data.message}`);
      triggerSpeech("Database restoration complete.");
    } catch (err) {
      setDbConsoleMsg(`Restoration failed: ${err.response?.data?.message || 'Check filename'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020512] text-slate-100 p-4 md:p-8 flex flex-col font-sans">
      
      {/* Header Banner */}
      <div className="w-full max-w-6xl mx-auto flex flex-wrap justify-between items-center bg-[#090f24] border border-slate-800 p-4 rounded-xl mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center font-black text-slate-100 text-lg">
            S
          </div>
          <div className="text-left">
            <h2 className="text-md font-bold text-slate-100 tracking-wider">APEX SUPER-ADMIN SYSTEMS</h2>
            <p className="text-[10px] text-rose-400 font-mono">ROOT OPERATOR • {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <FiArrowLeft /> Admin Dashboard
          </button>
          
          <button
            onClick={logout}
            className="bg-rose-600 hover:bg-rose-500 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        
        {/* Navigation Sidebar */}
        <div className="col-span-1 bg-[#090f24] border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-2 px-2">Root Options</span>
          
          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'admins' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiShield /> Manage Admins
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'logs' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiFileText /> View Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 font-bold ${
              activeTab === 'database' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FiDatabase /> Database Utilities
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Tab 1: Manage Admins */}
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* Admin Registration Form */}
              <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <FiUserPlus /> Register New Bank Admin
                </h3>
                
                {formError && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-[10px] mb-3">{formError}</div>}
                {formSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-2.5 text-[10px] mb-3">{formSuccess}</div>}

                <form onSubmit={handleCreateAdmin} className="space-y-3 font-mono text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Admin Fullname</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Aditi Sharma"
                      value={adminName} 
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Secure Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="aditi@apex.com"
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Mobile Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+91 99999 77777"
                      value={adminPhone} 
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">Initial Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                  >
                    Generate Credentials
                  </button>
                </form>
              </div>

              {/* Admins Registry List */}
              <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Administrators Directory</h3>
                {admins.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No administrators found.</p>
                ) : (
                  <div className="space-y-3 font-mono text-[10px]">
                    {admins.map((adm) => (
                      <div key={adm._id} className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                        <div className="text-left">
                          <div className="font-bold text-slate-200">{adm.name}</div>
                          <div className="text-slate-500 text-[8px]">{adm.email}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteAdmin(adm._id)}
                          className="text-rose-500 hover:text-rose-400 p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800"
                          title="Revoke Permissions"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: System Audit logs */}
          {activeTab === 'logs' && (
            <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">System Security Audit Logs</h3>
              <div className="overflow-y-auto max-h-[500px]">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400">
                      <th className="px-4 py-2">Timestamp</th>
                      <th className="px-4 py-2">Operator IP</th>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="border-b border-slate-900/60 hover:bg-slate-900/10">
                        <td className="px-4 py-2 text-slate-400 text-[8px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-slate-500 font-mono text-[8px]">{log.ipAddress}</td>
                        <td className="px-4 py-2 font-bold text-slate-200">
                          {log.action}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                            log.category === 'security' ? 'bg-rose-950 text-rose-400' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`font-bold ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Database Utilities */}
          {activeTab === 'database' && (
            <div className="bg-[#090f24] border border-slate-800 rounded-xl p-5 text-left">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Database Backup & Recovery Console</h3>
              
              <div className="space-y-4 font-mono text-[10px]">
                
                {/* Console Output Display */}
                <div className="w-full bg-slate-950 rounded-xl border border-slate-900 p-4 h-28 text-cyan-400 flex flex-col justify-end">
                  <span className="text-slate-500 font-sans select-none block mb-auto border-b border-slate-900 pb-1 uppercase tracking-wider text-[8px]">Terminal Output</span>
                  <div className="text-xs font-semibold">{dbConsoleMsg}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Backup actions */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3">
                    <h5 className="font-bold text-slate-200">Generate DB Dump</h5>
                    <p className="text-slate-500 text-[9px]">Dumps collection snapshots into standard JSON payloads.</p>
                    <button
                      onClick={handleBackup}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      Backup Database
                    </button>
                    {backupFilename && (
                      <div className="bg-slate-900/60 p-2 border border-slate-850 rounded text-slate-300 font-bold">
                        File: {backupFilename}
                      </div>
                    )}
                  </div>

                  {/* Restore actions */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-3">
                    <h5 className="font-bold text-slate-200">Restore Snapshot</h5>
                    <p className="text-slate-500 text-[9px]">Loads backups to restore user, card, account, and log ledgers.</p>
                    <input
                      type="text"
                      placeholder="backup_171987654321.json"
                      value={restoreFilename}
                      onChange={(e) => setRestoreFilename(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <button
                      onClick={handleRestore}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      Restore Database
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
