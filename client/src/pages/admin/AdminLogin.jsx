import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/common/SEO';

const AdminLogin = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Security PIN (2FA Step if enforced by backend)
  const [pin, setPin] = useState('');
  const [showPinScreen, setShowPinScreen] = useState(false);

  // UI Error & Loading States
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email Regex Validator
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password });

      if (res && res.requirePin) {
        toast.info('Please enter your security PIN to complete sign in.');
        setShowPinScreen(true);
      } else {
        toast.success('Welcome to Admin Portal!');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.';
      setServerError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!pin || pin.length < 4) {
      setErrors({ pin: 'Please enter a valid 4 to 6-digit security PIN' });
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password, pin });
      if (res && res.success) {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('PIN validation error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Invalid security PIN. Please try again.';
      setServerError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Forgot Password? Please contact system administrator to reset credentials.');
  };

  return (
    <>
      <SEO
        title="Admin Login | Makeup Studio Portal"
        description="Secure admin login portal for Makeup Artist studio management dashboard."
      />

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-sans">
        
        {/* Main Card Container */}
        <div className="w-full max-w-md bg-surface text-text border border-border rounded-3xl shadow-xl p-8 sm:p-10 space-y-6 transition-all duration-300">
          
          {/* Logo / Avatar Placeholder & Header */}
          <div className="text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-light border border-secondary text-primary mx-auto shadow-xs">
              <Sparkles size={28} />
            </div>
            
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-text tracking-tight">
                Admin Login
              </h1>
              <p className="text-xs sm:text-sm text-text-light mt-1 font-medium">
                Sign in to access the dashboard.
              </p>
            </div>
          </div>

          {/* Server Error Alert Box */}
          {serverError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block">Authentication Error</span>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          {!showPinScreen ? (
            
            /* Phase 1: Email & Password Form */
            <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      if (serverError) setServerError('');
                    }}
                    className={`w-full rounded-2xl bg-background border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      if (serverError) setServerError('');
                    }}
                    className={`w-full rounded-2xl bg-background border pl-10 pr-11 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-500">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-text-light cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white py-3.5 px-6 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            
            /* Phase 2: Security PIN Verification Form */
            <form onSubmit={handlePinSubmit} className="space-y-5" noValidate>
              
              <div className="text-center space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinScreen(false);
                    setPin('');
                    setServerError('');
                  }}
                  className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                >
                  ← Back to Email Sign In
                </button>
                <h3 className="font-playfair text-lg font-bold text-text pt-2">
                  Security PIN Verification
                </h3>
                <p className="text-xs text-text-light">
                  Enter your admin PIN to access the dashboard.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label htmlFor="admin-pin" className="block text-xs font-semibold uppercase tracking-wider text-text text-center">
                  Enter Security PIN
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    id="admin-pin"
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''));
                      if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
                      if (serverError) setServerError('');
                    }}
                    className="w-full text-center tracking-[0.5em] text-lg font-bold rounded-2xl bg-background border py-3 px-10 text-text focus:outline-none focus:border-primary transition-colors border-border"
                  />
                </div>
                {errors.pin && <p className="text-[11px] text-rose-500 text-center">{errors.pin}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white py-3.5 px-6 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying PIN...</span>
                  ) : (
                    <span>Open Dashboard</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminLogin;
