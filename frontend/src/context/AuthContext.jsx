import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://atm-simulation-model-3.onrender.com';

axios.defaults.baseURL = API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('atm_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Flow State
  const [loginStep, setLoginStep] = useState('welcome'); // welcome -> card-input -> pin-input -> otp-input -> dashboard
  const [tempCardData, setTempCardData] = useState(null); // stores validated card detail

  // Accessibility & Localization Settings
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [voiceAssistance, setVoiceAssistance] = useState(false);
  const [language, setLanguage] = useState('en'); // en, hi, es
  const [darkMode, setDarkMode] = useState(true);

  // Set Authorization Header for Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  // Voice Assistance Text-to-Speech
  const triggerSpeech = useCallback((text) => {
    if (!voiceAssistance) return;
    window.speechSynthesis.cancel();
    
    // Choose voice based on language
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'es') {
      utterance.lang = 'es-ES';
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [voiceAssistance, language]);

  // Auto Session Timeout Checker (Inactivity Auto-Logout: 2 mins)
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isAuthenticated) {
        inactivityTimer = setTimeout(() => {
          triggerSpeech('Session timed out due to inactivity.');
          logout();
        }, 120000); // 2 minutes
      }
    };

    // Listen to user activities
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    if (isAuthenticated) {
      resetTimer();
      events.forEach(event => window.addEventListener(event, resetTimer));
    }

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, triggerSpeech]);

  // Translate utility for simulation
  const t = (key) => {
    const translations = {
      en: {
        welcome: "Welcome to Apex Premium Bank ATM. Please insert your card to begin.",
        insertCard: "Insert Card",
        cardNumber: "Card Number",
        expiryDate: "Expiry Date",
        enterPin: "Enter 4-Digit Security PIN",
        enterOtp: "Enter 6-Digit Verification Code",
        otpSent: "OTP verification code sent to your registered details.",
        withdraw: "Withdraw Cash",
        deposit: "Deposit Cash",
        balance: "Balance Inquiry",
        transfer: "Fund Transfer",
        pinChange: "Change ATM PIN",
        services: "Services & KYC",
        miniStatement: "Mini Statement",
        fullStatement: "Full Statement",
        logout: "Eject Card & Logout",
        invalidCard: "Invalid card details. Please try again.",
        failedPin: "Incorrect PIN. Attempts remaining: ",
        errorOccurred: "An error occurred. Please try again."
      },
      hi: {
        welcome: "एपेक्स प्रीमियम बैंक एटीएम में आपका स्वागत है। शुरू करने के लिए अपना कार्ड डालें।",
        insertCard: "कार्ड डालें",
        cardNumber: "कार्ड नंबर",
        expiryDate: "समाप्ति तिथि",
        enterPin: "4-अंकीय सुरक्षा पिन दर्ज करें",
        enterOtp: "6-अंकीय सत्यापन कोड दर्ज करें",
        otpSent: "आपके पंजीकृत विवरण पर ओटीपी सत्यापन कोड भेजा गया है।",
        withdraw: "नकद निकासी",
        deposit: "नकद जमा",
        balance: "शेष राशि पूछताछ",
        transfer: "धन स्थानांतरण",
        pinChange: "पिन बदलें",
        services: "सेवाएं एवं केवाईसी",
        miniStatement: "मिनी स्टेटमेंट",
        fullStatement: "विस्तृत विवरण",
        logout: "कार्ड निकालें और लॉगआउट",
        invalidCard: "अमान्य कार्ड विवरण। कृपया पुनः प्रयास करें।",
        failedPin: "गलत पिन। शेष प्रयास: ",
        errorOccurred: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
      },
      es: {
        welcome: "Bienvenido al cajero automático de Apex Premium Bank. Inserte su tarjeta para comenzar.",
        insertCard: "Insertar Tarjeta",
        cardNumber: "Número de Tarjeta",
        expiryDate: "Fecha de caducidad",
        enterPin: "Ingrese PIN de seguridad de 4 dígitos",
        enterOtp: "Ingrese código de verificación de 6 dígitos",
        otpSent: "Código OTP enviado a sus detalles registrados.",
        withdraw: "Retirar Efectivo",
        deposit: "Depositar Efectivo",
        balance: "Consulta de Saldo",
        transfer: "Transferencia de Fondos",
        pinChange: "Cambiar PIN",
        services: "Servicios y KYC",
        miniStatement: "Mini Estado de Cuenta",
        fullStatement: "Estado de Cuenta Completo",
        logout: "Expulsar Tarjeta y Salir",
        invalidCard: "Detalles de tarjeta inválidos. Inténtelo de nuevo.",
        failedPin: "PIN incorrecto. Intentos restantes: ",
        errorOccurred: "Ocurrió un error. Inténtelo de nuevo."
      }
    };
    return translations[language][key] || key;
  };

  // Auth Operations
  const checkCard = async (cardNumber, expiryDate) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/check-card', { cardNumber, expiryDate });
      setTempCardData({ cardNumber, name: res.data.data.cardHolderName });
      setLoginStep('pin-input');
      triggerSpeech(t('enterPin'));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t('invalidCard');
      setError(msg);
      triggerSpeech(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (pin) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/verify-pin', {
        cardNumber: tempCardData.cardNumber,
        pin
      });
      
      // Store devOtp in local state if available (for easy testing popup)
      const devOtp = res.data.devOtp || null;
      setTempCardData(prev => ({ ...prev, devOtp }));
      setLoginStep('otp-input');
      triggerSpeech(t('enterOtp'));
      return { success: true, devOtp };
    } catch (err) {
      const msg = err.response?.data?.message || t('errorOccurred');
      setError(msg);
      triggerSpeech(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        cardNumber: tempCardData.cardNumber,
        otp
      });

      const { token, user: userData, account: accountData } = res.data;
      localStorage.setItem('atm_token', token);
      setToken(token);
      setUser(userData);
      setCard({ cardNumber: tempCardData.cardNumber });
      setAccount(accountData);
      setIsAuthenticated(true);
      setLoginStep('dashboard');
      triggerSpeech(`Welcome back, ${userData.name}. You are logged in.`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || t('errorOccurred');
      
      // Handle forced logout on max OTP failure attempts
      if (err.response?.data?.logout) {
        logout();
        triggerSpeech('Maximum verification attempts reached. Returning to start.');
      } else {
        setError(msg);
        triggerSpeech(msg);
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Direct Admin Login
  const adminLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/admin-login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('atm_token', token);
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      setLoginStep('dashboard');
      triggerSpeech(`Hello Admin ${userData.name}. Dashboard opened.`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed.';
      setError(msg);
      triggerSpeech(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('atm_token');
      setToken(null);
      setUser(null);
      setCard(null);
      setAccount(null);
      setTempCardData(null);
      setIsAuthenticated(false);
      setLoginStep('welcome');
      setError(null);
      setLoading(false);
      window.speechSynthesis.cancel();
    }
  };

  const refreshBalance = async () => {
    try {
      const res = await axios.get('/api/account/balance');
      setAccount(prev => ({
        ...prev,
        balance: res.data.balance,
        availableBalance: res.data.availableBalance
      }));
      return res.data;
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      card,
      account,
      token,
      isAuthenticated,
      loading,
      error,
      loginStep,
      tempCardData,
      setLoginStep,
      setTempCardData,
      checkCard,
      verifyPin,
      verifyOtp,
      adminLogin,
      logout,
      refreshBalance,
      
      // Accessibility states
      accessibilityMode,
      setAccessibilityMode,
      voiceAssistance,
      setVoiceAssistance,
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      triggerSpeech,
      t
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
