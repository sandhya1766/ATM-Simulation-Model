import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages (To be created)
import Welcome from './pages/Welcome';
import CardInput from './pages/CardInput';
import PinInput from './pages/PinInput';
import OtpVerification from './pages/OtpVerification';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Statements from './pages/Statements';
import Services from './pages/Services';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminLogin from './pages/AdminLogin';

// Route guards
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, token } = useAuth();

  if (!token || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { loginStep, isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Root Welcome / Login Flow Router */}
      <Route path="/" element={
        isAuthenticated ? (
          user?.role === 'customer' ? (
            <Navigate to="/dashboard" replace />
          ) : user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/super" replace />
          )
        ) : (
          loginStep === 'welcome' ? <Welcome /> :
          loginStep === 'card-input' ? <CardInput /> :
          loginStep === 'pin-input' ? <PinInput /> :
          loginStep === 'otp-input' ? <OtpVerification /> :
          loginStep === 'admin-login-direct' ? <AdminLogin type="admin" /> :
          loginStep === 'super-login-direct' ? <AdminLogin type="super" /> :
          <Welcome />
        )
      } />

      {/* Customer Dash & Services */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/transactions" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Transactions />
        </ProtectedRoute>
      } />

      <Route path="/statements" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Statements />
        </ProtectedRoute>
      } />

      <Route path="/services" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Services />
        </ProtectedRoute>
      } />

      {/* Admin Operations */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Super Admin Operations */}
      <Route path="/super" element={
        <ProtectedRoute allowedRoles={['super-admin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
