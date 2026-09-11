import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Camera, 
  Mic, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Sun, 
  Moon, 
  Sparkles, 
  Trash2, 
  Download, 
  Layers, 
  Search, 
  HardDrive, 
  ExternalLink,
  Lock,
  ChevronRight,
  Phone,
  Mail,
  LogOut,
  LogIn,
  RefreshCw,
  Edit2,
  Check,
  X,
  Upload,
  Sliders,
  Volume2,
  Shield,
  Info,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { ScreenView } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../security/authContext';
import { useDevicePermissions } from '../../hooks/useDevicePermissions';
import { auditLogger } from '../../security/auditLogger';
import { AuditLogEntry } from '../../security/securityTypes';

export type SettingsSection = 
  | 'main' 
  | 'account' 
  | 'permissions' 
  | 'ai' 
  | 'google' 
  | 'privacy' 
  | 'data' 
  | 'general' 
  | 'about';

interface SettingsViewProps {
  onNavigate: (view: ScreenView) => void;
  historyCount: number;
  onClearHistory: () => void;
  initialSection?: SettingsSection;
  onOpenShortcuts?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  historyCount,
  onClearHistory,
  initialSection = 'main',
  onOpenShortcuts,
}) => {
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const { theme, setTheme } = useTheme();
  const { 
    user, 
    isAuthenticated, 
    loginWithGoogle, 
    loginWithPhoneSendOtp, 
    verifyPhoneOtp, 
    updateProfile, 
    setProfilePhoto, 
    logout 
  } = useAuth();
  const { 
    permissions, 
    requestCamera, 
    requestMicrophone, 
    requestNotifications, 
    setPermissionToggle 
  } = useDevicePermissions();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(user.fullName || '');
  const [editDisplayName, setEditDisplayName] = useState(user.displayName || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editBio, setEditBio] = useState(user.bio || '');

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Phone OTP Sign-In State
  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [otpStage, setOtpStage] = useState<'input' | 'sending' | 'otp_sent' | 'verifying' | 'verified'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  // AI & Voice Preferences
  const [responseStyle, setResponseStyle] = useState<'balanced' | 'precise' | 'fast'>('balanced');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('Google Assistant - Natural');
  const [liveLocationSync, setLiveLocationSync] = useState(true);

  // Privacy & Security Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  useEffect(() => {
    setAuditLogs(auditLogger.getLogs());
  }, [section]);

  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Sync edits when user changes
  useEffect(() => {
    setEditFullName(user.fullName || '');
    setEditDisplayName(user.displayName || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditBio(user.bio || '');
  }, [user]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Profile Save
  const handleSaveProfile = () => {
    updateProfile({
      fullName: editFullName.trim(),
      displayName: editDisplayName.trim() || editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      bio: editBio.trim(),
    });
    setIsEditingProfile(false);
    showStatus('Profile updated successfully!');
  };

  // Camera capture modal logic
  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStreamActive(true);
    } catch (e) {
      showStatus('Unable to access camera for photo capture.');
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStreamActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setProfilePhoto(dataUrl);
      stopCameraStream();
      setIsPhotoModalOpen(false);
      showStatus('Profile photo captured and updated!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showStatus('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfilePhoto(dataUrl);
      setIsPhotoModalOpen(false);
      showStatus('Profile photo uploaded and updated!');
    };
    reader.readAsDataURL(file);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      showStatus('Successfully signed in with Google account.');
    } catch (e: any) {
      showStatus(e.message || 'Failed to authenticate with Google.');
    }
  };

  // Send Phone OTP
  const handleSendOtp = async () => {
    if (!rawPhoneNumber || rawPhoneNumber.replace(/\D/g, '').length < 7) {
      setOtpError('Please enter a valid phone number.');
      return;
    }
    setOtpError(null);
    setOtpStage('sending');

    const fullPhone = `${selectedCountry} ${rawPhoneNumber.trim()}`;
    const result = await loginWithPhoneSendOtp(fullPhone);

    if (result.success) {
      setOtpStage('otp_sent');
      setOtpCooldown(result.cooldownSeconds || 60);
      showStatus('One-time verification code dispatched!');
    } else {
      setOtpStage('input');
      setOtpError(result.message);
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }
    setOtpError(null);
    setOtpStage('verifying');

    const fullPhone = `${selectedCountry} ${rawPhoneNumber.trim()}`;
    const result = await verifyPhoneOtp(fullPhone, otpCode.trim());

    if (result.success) {
      setOtpStage('verified');
      showStatus('Phone number verified successfully!');
      setTimeout(() => {
        setOtpStage('input');
        setOtpCode('');
      }, 2000);
    } else {
      setOtpStage('otp_sent');
      setOtpError(result.message);
    }
  };

  // Hardware permission toggles
  const handleToggleHardware = async (type: 'camera' | 'microphone' | 'location' | 'notifications') => {
    if (type === 'camera') {
      if (permissions.camera === 'granted') {
        setPermissionToggle('camera', 'prompt');
        showStatus('Camera permission reset.');
      } else {
        const ok = await requestCamera();
        showStatus(ok ? 'Camera access verified and active.' : 'Camera permission denied or unsupported.');
      }
    } else if (type === 'microphone') {
      if (permissions.microphone === 'granted') {
        setPermissionToggle('microphone', 'prompt');
        showStatus('Microphone permission reset.');
      } else {
        const ok = await requestMicrophone();
        showStatus(ok ? 'Microphone access verified and active.' : 'Microphone permission denied or unsupported.');
      }
    } else if (type === 'notifications') {
      if (permissions.notifications === 'granted') {
        setPermissionToggle('notifications', 'prompt');
        showStatus('Notifications toggled off.');
      } else {
        const ok = await requestNotifications();
        showStatus(ok ? 'Notification alerts enabled.' : 'Notifications not granted.');
      }
    } else if (type === 'location') {
      if (permissions.location === 'granted') {
        setPermissionToggle('location', 'prompt');
        showStatus('Location tracking paused.');
      } else {
        setPermissionToggle('location', 'granted');
        showStatus('Location tracking active.');
      }
    }
  };

  // Test Speech Synthesis
  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance('NEXA intelligence is operational. All verified systems green.');
      utter.rate = voiceSpeed;
      window.speechSynthesis.speak(utter);
      showStatus('Playing test voice output.');
    } else {
      showStatus('Speech synthesis is not supported on this browser.');
    }
  };

  // Export audit logs
  const handleExportData = () => {
    const exportPayload = {
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        provider: user.provider,
        createdAt: user.createdAt,
      },
      auditLogs: auditLogger.getLogs(),
      historyCount,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa-profile-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Data export downloaded.');
  };

  const displayName = user.displayName || user.fullName || 'Guest';
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* Toast message */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN SETTINGS OVERVIEW VIEW                                              */}
      {/* ========================================================================= */}
      {section === 'main' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your preferences, account, permissions, and connected services.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Overview Card matching reference image */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {user.fullName || displayName}
                  </h2>
                  {(user.emailVerified || user.phoneVerified) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{user.emailVerified && user.phoneVerified ? 'Fully Verified' : user.emailVerified ? 'Email Verified' : 'Phone Verified'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user.email || 'No email linked'} {user.phone ? `• ${user.phone}` : ''}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {user.bio || (isAuthenticated ? 'Authenticated Operator' : 'Guest Mode')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSection('account')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Manage
            </button>
          </div>

          {/* Primary Settings Categories List */}
          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {/* 1. Account & Profile */}
            <button
              type="button"
              onClick={() => setSection('account')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Account & Profile
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Profile photo, editable name, phone authentication, Google sign in
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 2. Permissions */}
            <button
              type="button"
              onClick={() => setSection('permissions')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Permissions
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Camera, Microphone, Live GPS Location, Notifications, File Access
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 3. AI & Assistant */}
            <button
              type="button"
              onClick={() => setSection('ai')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    AI & Assistant
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gemini 3.8 Flash, Voice synthesis, Response styles, Guardrails
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 4. Google Services */}
            <button
              type="button"
              onClick={() => setSection('google')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Google Services
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Maps, Search grounding, Routes, Cloud Run, Firebase
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 5. Privacy & Security */}
            <button
              type="button"
              onClick={() => setSection('privacy')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Privacy & Security
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    App Check protection, Ephemeral location, Action Gatekeeper, Audit log
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 6. Data & Storage */}
            <button
              type="button"
              onClick={() => setSection('data')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Data & Storage
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {historyCount} action records, Clear local data, Export JSON archive
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 7. General */}
            <button
              type="button"
              onClick={() => setSection('general')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    General
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Appearance (Theme: {theme}), Language, Keyboard shortcuts
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* 8. About */}
            <button
              type="button"
              onClick={() => setSection('about')}
              className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    About NEXA
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Version 2.5.0 • “From Intent to Impact” • Google Cloud Architecture
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACCOUNT & PROFILE SUB-VIEW                                            */}
      {/* ========================================================================= */}
      {section === 'account' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSection('main')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Back to Settings"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Account & Profile
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage your personal identity, avatar photo, and authentication credentials.
                </p>
              </div>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  showStatus('Signed out successfully.');
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Profile Identity Card */}
          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      className="w-18 h-18 rounded-full object-cover ring-4 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                      {initial}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors shadow-md border-2 border-white dark:border-slate-900 cursor-pointer"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {user.fullName || displayName}
                    </h2>
                    {(user.emailVerified || user.phoneVerified) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {user.emailVerified && user.phoneVerified ? 'Verified Identity' : user.emailVerified ? 'Email Verified' : 'Phone Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Verification Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Provider: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{user.provider || 'Guest'}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Profile Photo</span>
                  </button>
                </div>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile Details</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fields List */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal / Official Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                      {user.fullName || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                      {user.displayName || 'Operator'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. operator@nexa-bridge.org"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{user.email || 'No email attached'}</span>
                      {user.email && (
                        <span className={`text-[10px] font-bold ${user.emailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                          {user.emailVerified ? 'Verified' : 'Verification Required'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{user.phone || 'No phone attached'}</span>
                      {user.phone && (
                        <span className={`text-[10px] font-bold ${user.phoneVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                          {user.phoneVerified ? 'Verified' : 'Verification Required'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Role Description
                </label>
                {isEditingProfile ? (
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. Student | AI Enthusiast | Building a Safer Tomorrow"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {user.bio || 'No bio added yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Authentication & Sign In Methods Card */}
          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Sign In & Account Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authenticate with Google or your mobile phone to synchronize situational briefs and audit records.
              </p>
            </div>

            {/* Method A: Google Sign-In */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Continue with Google
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user.provider === 'google' ? `Connected as ${user.email}` : 'Instant one-click synchronization'}
                  </div>
                </div>
              </div>

              {user.provider === 'google' ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Account Linked</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Connect Google Account</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#161E2E] px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Or Phone Verification
              </span>
            </div>

            {/* Method B: Phone Number + OTP */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Phone Number Authentication (OTP)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verify mobile number with a one-time security passcode
                  </div>
                </div>
              </div>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpStage === 'input' || otpStage === 'sending' ? (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={rawPhoneNumber}
                    onChange={(e) => setRawPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    disabled={otpStage === 'sending'}
                    onClick={handleSendOtp}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {otpStage === 'sending' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>
                </div>
              ) : (
                /* OTP Entry Screen */
                <div className="space-y-3 pt-1">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    Enter the 6-digit verification code sent to <span className="font-bold">{selectedCountry} {rawPhoneNumber}</span>:
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-36 tracking-widest text-center font-mono text-sm py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      disabled={otpStage === 'verifying' || otpCode.length !== 6}
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {otpStage === 'verifying' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Bind</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={otpCooldown > 0}
                      onClick={handleSendOtp}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                    >
                      {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PERMISSIONS SUB-VIEW                                                   */}
      {/* ========================================================================= */}
      {section === 'permissions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSection('main')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Back to Settings"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Device Permissions
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Grant hardware and platform access for multimodal intake, live location, and alerts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('location')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View Live Map</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {/* Location */}
            <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Location (GPS)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      permissions.location === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {permissions.location === 'granted' ? 'Enabled (±12 m)' : 'Permission Required'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for live location, nearby emergency services, traffic, and situational telemetry.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleHardware('location')}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  permissions.location === 'granted' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle location permission"
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  permissions.location === 'granted' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Camera */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Camera</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      permissions.camera === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {permissions.camera === 'granted' ? 'Enabled' : 'Permission Required'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for real-time camera inspection, document capture, and multimodal situation analysis.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Test Camera
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleHardware('camera')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                    permissions.camera === 'granted' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle camera permission"
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    permissions.camera === 'granted' ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Microphone */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Microphone</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      permissions.microphone === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {permissions.microphone === 'granted' ? 'Enabled' : 'Permission Required'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for hands-free voice intake, dictation, and speech conversation.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleHardware('microphone')}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  permissions.microphone === 'granted' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle microphone permission"
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  permissions.microphone === 'granted' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Notifications */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      permissions.notifications === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {permissions.notifications === 'granted' ? 'Enabled' : 'Permission Required'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for critical safety alerts, traffic changes, and dispatched action status updates.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleHardware('notifications')}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  permissions.notifications === 'granted' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle notifications permission"
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  permissions.notifications === 'granted' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Local File Access */}
            <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">File & Document Ingress</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                      Active (Browser Sandboxed)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Used for analyzing PDF briefs, CSV sheets, and local photos drag-and-dropped into Universal Intake.
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AI & ASSISTANT SUB-VIEW                                               */}
      {/* ========================================================================= */}
      {section === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSection('main')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                AI & Assistant Preferences
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure reasoning models, voice behavior, and automated safety gatekeepers.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Primary Engine */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Primary Intelligence Model
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Gemini 3.8 Flash</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      High-frequency multimodal reasoning with structured schema enforcement
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
            </div>

            {/* Response Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reasoning Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'balanced', label: 'Balanced', desc: 'Standard clarity & speed' },
                  { id: 'precise', label: 'Precise', desc: 'Maximum factual rigor' },
                  { id: 'fast', label: 'Fast Response', desc: 'Ultra low latency' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResponseStyle(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      responseStyle === item.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice & Speech Synthesis */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Voice Synthesis & Output
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Controls speech cadence for voice answers and situation briefings
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestSpeech}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Test Voice</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Voice Profile
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option>Google Assistant - Natural</option>
                    <option>Standard English (Female)</option>
                    <option>Standard English (Male)</option>
                    <option>Multilingual Neutral</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Speech Rate</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{voiceSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Behavior */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Real-Time Telemetry & Safety
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Live Situation Synchronization
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically refresh traffic, location context, and nearby emergency data during intake
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveLocationSync(!liveLocationSync)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                    liveLocationSync ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    liveLocationSync ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Action Gatekeeper Policy Enforced:</strong> All high-impact actions (emergency dispatch, notifications) require explicit human confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GOOGLE SERVICES SUB-VIEW                                              */}
      {/* ========================================================================= */}
      {section === 'google' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSection('main')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Connected Google Services
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                First-party Google Cloud and Maps integrations powering ground-truth verification.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {/* Maps */}
            <div className="py-4 first:pt-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Google Maps & Routes</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Live route computation, detour calculation, and geolocation lookup
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Connected</span>
              </span>
            </div>

            {/* Search Grounding */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Google Search Grounding</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time web verification to eliminate hallucination in critical situations
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>

            {/* Cloud Run & Express Backend */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Google Cloud Run (Container Ingress)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Port 3000 reverse-proxied with zero client secret leakage
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Healthy</span>
              </span>
            </div>

            {/* Firebase */}
            <div className="py-4 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Firebase App Check & Storage</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Attestation token enforcement, security rules, and user profile persistence
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Enforced</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PRIVACY & SECURITY SUB-VIEW (Integrates Security Console)              */}
      {/* ========================================================================= */}
      {section === 'privacy' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSection('main')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Back to Settings"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Privacy & Security Console
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  App Check attestation, ephemeral telemetry, prompt shielding, and real-time audit ledger.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('security')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Status Report</span>
            </button>
          </div>

          {/* Security Architecture Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Zero Secret Exposure Enforced</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                All Gemini API keys, Maps tokens, and Google Cloud credentials execute exclusively on the Express backend. No tokens are visible in client network inspection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Firebase App Check Attestation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Protected endpoints require cryptographically signed App Check tokens, blocking replay attacks, unauthorized crawlers, and API spoofing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span>Ephemeral Location Privacy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                GPS telemetry is stored only in local component memory and never persisted into permanent database logs without explicit user consent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Human Action Gatekeeper</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Autonomous AI execution cannot trigger calls to emergency services or external notifications without two-step user confirmation.
              </p>
            </div>
          </div>

          {/* Real-Time Security Audit Log Table */}
          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Live Audit Ledger ({auditLogs.length} Events)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immutable client & server event trail tracking auth, permissions, and pipeline triggers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {auditLogs
                .filter((l) => auditFilter === 'all' || l.severity === auditFilter)
                .filter((l) => !auditSearch || l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.details.toLowerCase().includes(auditSearch.toLowerCase()))
                .slice(-15)
                .reverse()
                .map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          log.severity === 'critical' || log.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : log.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {log.severity}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-sans">
                        {log.details}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DATA & STORAGE SUB-VIEW                                                */}
      {/* ========================================================================= */}
      {section === 'data' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSection('main')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Data & Storage Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export session briefs, manage browser storage, or wipe local application state.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Historical Situation Briefs ({historyCount} records)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Stored securely in local storage and mirrored in cloud session.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                {historyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all history records?')) {
                        onClearHistory();
                        showStatus('All situation history cleared.');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Local Storage Footprint
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Browser caching, device permissions preference, and active operator profile.
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                ~24 KB used
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. GENERAL SUB-VIEW                                                      */}
      {/* ========================================================================= */}
      {section === 'general' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSection('main')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                General Preferences
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Display appearance theme, language localization, and productivity shortcuts.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Interface Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Theme</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-950/60 text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Dark Theme</span>
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Language & Localization
              </label>
              <select className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none">
                <option>English (United States)</option>
                <option>English (India)</option>
                <option>English (United Kingdom)</option>
                <option>Hindi (हिन्दी)</option>
                <option>Spanish (Español)</option>
                <option>French (Français)</option>
                <option>German (Deutsch)</option>
                <option>Japanese (日本語)</option>
              </select>
            </div>

            {/* Shortcuts */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick hotkeys for universal search, speech intake, and navigation
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenShortcuts) onOpenShortcuts();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>View Shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ABOUT SUB-VIEW                                                        */}
      {/* ========================================================================= */}
      {section === 'about' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSection('main')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                About NEXA
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Architecture, mission, and system engineering details.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                N
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  NEXA — Universal Action Bridge
                </h2>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  Version 2.5.0 • Production Build
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              NEXA transforms raw, ambiguous, multimodal input into verified situational intelligence and audited real-world actions. Designed to eliminate friction in life-critical emergencies, complex urban operations, and everyday dilemmas.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Built with Google Technologies:
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <li>• <strong>Gemini 3.8 Flash:</strong> Real-time reasoning, vision parsing, and structured execution.</li>
                <li>• <strong>Google Maps Platform:</strong> Traffic awareness, routing, and reverse-geocoding.</li>
                <li>• <strong>Google Search Grounding:</strong> Fact-checking and live authoritative cross-referencing.</li>
                <li>• <strong>Firebase:</strong> App Check attestation, user profile state, and security rules.</li>
                <li>• <strong>Google Cloud Run:</strong> Secure full-stack server running containerized reverse proxy.</li>
              </ul>
            </div>

            <div className="text-center pt-2 text-xs font-semibold text-slate-400 italic">
              “Real Problems. Real Impact.”
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO CAPTURE & UPLOAD MODAL                                             */}
      {/* ========================================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#161E2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Update Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsPhotoModalOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Camera Stream if active */}
            {cameraStreamActive ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600/80 text-white text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Options */
              <div className="space-y-3">
                <div className="flex justify-center py-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Current avatar"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCameraStream}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Take with Camera</div>
                      <div className="text-[10px] text-slate-400">Capture using webcam</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Upload File</div>
                      <div className="text-[10px] text-slate-400">JPEG, PNG, WebP</div>
                    </div>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {user.photoURL && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePhoto(null);
                      setIsPhotoModalOpen(false);
                      showStatus('Profile photo removed.');
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Profile Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
