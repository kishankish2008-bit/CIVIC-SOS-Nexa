import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Smartphone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  PhoneCall, 
  Eye, 
  EyeOff, 
  KeyRound,
  X
} from 'lucide-react';
import { useAuth } from '../../security/authContext';

export const AuthScreen: React.FC = () => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    loginWithPhoneSendOtp, 
    verifyPhoneOtp 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);

  // Phone form state
  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStage, setOtpStage] = useState<'idle' | 'sending' | 'sent' | 'verifying'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Error & loading state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Emergency SOS Modal for Unauthenticated Users (Requirement 72)
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Timer for OTP cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Handle Google Sign-In
  const handleGoogleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email Sign-In / Sign-Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        const result = await signupWithEmail(email, password, displayName || undefined);
        if (result.verificationEmailSent) {
          setEmailSuccessMessage(`Account created! A verification link has been sent to ${email}.`);
        }
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Phone OTP Send
  const handlePhoneSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 7) {
      setErrorMessage('Please enter a valid phone number (minimum 7 digits).');
      return;
    }

    setOtpStage('sending');
    const fullPhone = `${selectedCountry} ${cleanNumber}`;

    try {
      const result = await loginWithPhoneSendOtp(fullPhone);
      if (result.success) {
        setOtpStage('sent');
        setOtpCooldown(result.cooldownSeconds || 60);
      } else {
        setOtpStage('idle');
        setErrorMessage(result.message || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setOtpStage('idle');
      setErrorMessage(err.message || 'Network error while sending OTP.');
    }
  };

  // Handle Phone OTP Verification
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setOtpStage('verifying');
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${selectedCountry} ${cleanNumber}`;

    try {
      const result = await verifyPhoneOtp(fullPhone, cleanOtp);
      if (!result.success || !result.verified) {
        setOtpStage('sent');
        setErrorMessage(result.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setOtpStage('sent');
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Accent Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            NEXA
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Zero-Trust
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Universal Action Bridge & Supervised AI Operations
          </p>
        </div>

        {/* Mode Switcher: Sign In vs Sign Up */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            id="auth-tab-signin"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setEmailSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Welcome Back (Sign In)
          </button>
          <button
            type="button"
            id="auth-tab-signup"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setEmailSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {emailSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{emailSuccessMessage}</span>
          </div>
        )}

        {/* 1. Continue with Google */}
        <button
          type="button"
          id="auth-google-button"
          onClick={handleGoogleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-slate-600 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
              Or Choose Method
            </span>
          </div>
        </div>

        {/* Method Switcher: Email vs Phone */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            id="auth-method-email"
            onClick={() => {
              setAuthMethod('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-slate-800 border-blue-500/50 text-blue-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>
          <button
            type="button"
            id="auth-method-phone"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'phone'
                ? 'bg-slate-800 border-blue-500/50 text-blue-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
        </div>

        {/* METHOD A: Email Form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="auth-fullname-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@nexa-bridge.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-confirm-password-input"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="auth-email-submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-4 cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to NEXA' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD B: Phone OTP Form */}
        {authMethod === 'phone' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  id="auth-phone-country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={otpStage === 'sent' || otpStage === 'verifying'}
                  aria-label="Country Calling Code"
                  className="px-2.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+61">🇦🇺 +61 (AU)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+81">🇯🇵 +81 (JP)</option>
                </select>

                <div className="relative flex-1">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    id="auth-phone-input"
                    value={phoneNumber}
                    disabled={otpStage === 'sent' || otpStage === 'verifying'}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Stage 1: Send OTP button */}
            {otpStage !== 'sent' && otpStage !== 'verifying' && (
              <button
                type="button"
                id="auth-send-otp-btn"
                onClick={handlePhoneSendOtp}
                disabled={otpStage === 'sending' || !phoneNumber}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {otpStage === 'sending' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Stage 2: Verify OTP input and submit */}
            {(otpStage === 'sent' || otpStage === 'verifying') && (
              <form onSubmit={handlePhoneVerifyOtp} className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300">
                  Verification code dispatched to{' '}
                  <strong className="text-white">
                    {selectedCountry} {phoneNumber.replace(/\D/g, '').slice(-4).padStart(phoneNumber.length, '•')}
                  </strong>
                  . Please enter the 6-digit code.
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    6-Digit Security OTP
                  </label>
                  <input
                    type="text"
                    id="auth-otp-input"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.4em] font-mono text-base py-2.5 rounded-xl bg-slate-950 border border-blue-500/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStage('idle');
                      setOtpCode('');
                    }}
                    className="text-slate-400 hover:text-slate-200 underline"
                  >
                    Change phone number
                  </button>

                  <button
                    type="button"
                    disabled={otpCooldown > 0}
                    onClick={() => handlePhoneSendOtp()}
                    className="text-blue-400 hover:text-blue-300 disabled:text-slate-600"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  id="auth-verify-otp-btn"
                  disabled={otpStage === 'verifying' || otpCode.length !== 6}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {otpStage === 'verifying' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Code & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Emergency SOS Access (Requirement 72) */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            id="auth-emergency-bypass-btn"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-red-950/30"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency SOS Direct 112 Access</span>
          </button>
          <div className="text-[10px] text-slate-500 mt-1">
            Official emergency hotlines are accessible without account creation.
          </div>
        </div>
      </div>

      {/* Security Invariant Footer */}
      <div className="mt-6 text-center text-xs text-slate-500 max-w-sm">
        <span className="font-semibold text-slate-400">Zero-Trust Architecture:</span> All authentication tokens and telemetry are cryptographically verified by Cloud Run and Firebase Security Rules.
      </div>

      {/* Emergency Hotline Modal for Unauthenticated Users */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Hotline Protocols</h3>
                <p className="text-xs text-slate-400">Immediate Direct Dial Contacts</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 transition-colors group"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>112</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                      ERSS Universal Single Emergency
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Police, Fire & Medical Response</div>
                </div>
                <span className="text-xs font-bold text-red-400 group-hover:text-red-300">Call Now →</span>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>108</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      Ambulance
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Emergency Medical Dispatch (NHM)</div>
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Call Now →</span>
              </a>

              <a
                href="tel:100"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>100</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      Police
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Police Control Room (PCR)</div>
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Call Now →</span>
              </a>

              <a
                href="tel:101"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>101</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                      Fire
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Fire & Disaster Rescue Services</div>
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Call Now →</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
