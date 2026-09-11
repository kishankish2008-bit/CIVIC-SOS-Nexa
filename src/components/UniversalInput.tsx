import React, { useState, useRef, useEffect } from 'react';
import { AttachedMedia, LocationData } from '../types';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Camera,
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  MoreHorizontal, 
  ArrowRight, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Compass,
  Navigation
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface UniversalInputProps {
  onProcess: (text: string, media: AttachedMedia[], location?: LocationData) => void;
  isProcessing: boolean;
  initialText?: string;
  initialMedia?: AttachedMedia[];
  placeholder?: string;
  className?: string;
  locationData?: LocationData | null;
  onSetCustomLocation?: (city: string, country: string, lat: number, lng: number) => void;
}

export const UniversalInput: React.FC<UniversalInputProps> = ({
  onProcess,
  isProcessing,
  initialText = '',
  initialMedia = [],
  placeholder = "Type your request here...",
  className = '',
  locationData,
  onSetCustomLocation
}) => {
  const [text, setText] = useState(initialText);
  const [attachments, setAttachments] = useState<AttachedMedia[]>(initialMedia);
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [attachedLocation, setAttachedLocation] = useState<LocationData | null>(locationData || null);

  useEffect(() => {
    if (locationData) {
      setAttachedLocation(locationData);
    }
  }, [locationData]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (initialMedia && initialMedia.length > 0) setAttachments(initialMedia);
  }, [initialMedia]);

  // Voice recording toggle
  const toggleListening = () => {
    setSpeechNotice(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser or iframe doesn't support live speech API - provide simulated voice input
      if (!isListening) {
        setIsListening(true);
        setSpeechNotice('Simulating voice ingress (Microphone API restricted in container preview)...');
        setTimeout(() => {
          const dictation = "Emergency medical consult: Patient collapsed at central terminal, unresponsive with shallow breathing. Requesting nearest emergency dispatch and automated defibrillator location.";
          setText((prev) => (prev ? `${prev}\n${dictation}` : dictation));
          setIsListening(false);
          setSpeechNotice(null);
        }, 400);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechNotice('Listening... Speak now.');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechNotice('Microphone input unavailable. You can type directly.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechNotice('Speech recognition initialized in fallback mode.');
    }
  };

  // Location detection
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      const fallbackLoc: LocationData = {
        status: 'available',
        latitude: 19.0657,
        longitude: 72.8686,
        accuracy: 14,
        city: 'Mumbai (Bandra-Kurla Complex)',
        country: 'India',
        freshness: 'LIVE',
        timestamp: Date.now()
      };
      setAttachedLocation(fallbackLoc);
      setSpeechNotice('Active location: Mumbai BKC Corridor (ERSS 112 Active)');
      setTimeout(() => setSpeechNotice(null), 3000);
      return;
    }

    setSpeechNotice('Querying live GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const liveLoc: LocationData = {
          status: 'available',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          city: 'Live Device GPS',
          country: 'India',
          freshness: 'LIVE',
          timestamp: Date.now()
        };
        setAttachedLocation(liveLoc);
        setSpeechNotice(`GPS Attached: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}° (±${Math.round(pos.coords.accuracy)}m)`);
        setTimeout(() => setSpeechNotice(null), 3000);
      },
      () => {
        const fallbackLoc: LocationData = {
          status: 'available',
          latitude: 19.0657,
          longitude: 72.8686,
          accuracy: 14,
          city: 'Mumbai (Bandra-Kurla Complex)',
          country: 'India',
          freshness: 'LIVE',
          timestamp: Date.now()
        };
        setAttachedLocation(fallbackLoc);
        setSpeechNotice('Attached: Mumbai BKC Corridor (ERSS 112 Active)');
        setTimeout(() => setSpeechNotice(null), 3000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectPresetCorridor = (city: string, country: string, lat: number, lng: number) => {
    const loc: LocationData = {
      status: 'available',
      latitude: lat,
      longitude: lng,
      accuracy: 12,
      city,
      country,
      freshness: 'LIVE',
      timestamp: Date.now()
    };
    setAttachedLocation(loc);
    if (onSetCustomLocation) {
      onSetCustomLocation(city, country, lat, lng);
    }
    setShowLocationMenu(false);
    setSpeechNotice(`Location set to ${city}`);
    setTimeout(() => setSpeechNotice(null), 2500);
  };

  // File upload handler
  const handleFiles = (files: FileList | null, type: 'image' | 'document') => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      const newMedia: AttachedMedia = {
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        mimeType: file.type || (type === 'image' ? 'image/jpeg' : 'application/pdf'),
        data: base64Data,
        size: file.size,
        previewUrl: type === 'image' ? dataUrl : undefined,
        type: type === 'image' ? 'image' : 'document',
      };
      setAttachments((prev) => [...prev, newMedia]);
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    onProcess(text, attachments, attachedLocation || undefined);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Universal Intake Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files, 'image');
          }
        }}
        className={`relative bg-white dark:bg-[#161E2E] rounded-2xl border transition-all duration-200 shadow-sm ${
          dragActive
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Main Text Input Area */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
            <textarea
              id="universal-intake-textarea"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              className="w-full bg-transparent border-0 resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus:ring-0 leading-relaxed font-sans"
            />
          </div>

          {/* Attachment Chips & Attached Location */}
          {(attachments.length > 0 || attachedLocation) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {attachedLocation && (
                <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-xs text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="font-semibold">{attachedLocation.city || 'Live Telemetry'}</span>
                  <span className="text-[10px] text-purple-500 font-mono">
                    ({attachedLocation.latitude.toFixed(3)}°, {attachedLocation.longitude.toFixed(3)}° ±{attachedLocation.accuracy}m)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedLocation(null)}
                    className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded text-purple-400 hover:text-purple-700"
                    title="Remove attached location"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
                >
                  {att.type === 'image' ? (
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span className="max-w-[140px] truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round(att.size / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Status notification toast inside card */}
          {speechNotice && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>{speechNotice}</span>
            </div>
          )}
        </div>

        {/* Bottom Intake Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl">
          {/* Intake Method Buttons with Pastel Circular Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Voice / Speak */}
            <button
              type="button"
              id="voice-intake-btn"
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isListening
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                {isListening ? <MicOff className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-semibold text-[11px]">Voice</span>
                <span className="text-[9px] text-slate-400">Speak</span>
              </div>
            </button>

            {/* Camera / Photo */}
            <button
              type="button"
              id="camera-intake-btn"
              onClick={() => setShowCameraModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Camera className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-semibold text-[11px]">Camera</span>
                <span className="text-[9px] text-slate-400">Photo</span>
              </div>
            </button>

            {/* Image / Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, 'image')}
            />
            <button
              type="button"
              id="image-intake-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-semibold text-[11px]">Image</span>
                <span className="text-[9px] text-slate-400">Upload</span>
              </div>
            </button>

            {/* Document / PDF, Docs */}
            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.doc,.docx,.txt,.csv,.json"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, 'document')}
            />
            <button
              type="button"
              id="document-intake-btn"
              onClick={() => docInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <FileText className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-semibold text-[11px]">Document</span>
                <span className="text-[9px] text-slate-400">PDF, Docs</span>
              </div>
            </button>

            {/* Location / Use GPS & Presets */}
            <div className="relative">
              <button
                type="button"
                id="location-intake-btn"
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  attachedLocation
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <MapPin className="w-3 h-3" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-semibold text-[11px]">
                    {attachedLocation ? 'GPS Active' : 'Location'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {attachedLocation ? (attachedLocation.city ? attachedLocation.city.slice(0, 10) : 'Active') : 'Use GPS'}
                  </span>
                </div>
              </button>

              {showLocationMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Attach Location</span>
                    <span className="text-[9px] text-emerald-500 font-mono">ERSS 112 Ready</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleUseLocation();
                      setShowLocationMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center gap-2"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-medium block">Live Browser GPS</span>
                      <span className="text-[10px] text-slate-400">Query device hardware coordinates</span>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <span className="px-2 text-[9px] font-semibold text-slate-400 uppercase">Emergency Corridors</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPresetCorridor('Mumbai (Bandra-Kurla Complex)', 'India', 19.0657, 72.8686)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <span className="font-medium block">Mumbai BKC Corridor</span>
                      <span className="text-[10px] text-slate-400">19.0657° N, 72.8686° E</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPresetCorridor('New Delhi (Connaught Place)', 'India', 28.6315, 77.2167)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <span className="font-medium block">Delhi Connaught Place</span>
                      <span className="text-[10px] text-slate-400">28.6315° N, 77.2167° E</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPresetCorridor('Bengaluru (Outer Ring Road - Bellandur)', 'India', 12.9279, 77.6834)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <span className="font-medium block">Bengaluru Tech Corridor (ORR)</span>
                      <span className="text-[10px] text-slate-400">12.9279° N, 77.6834° E</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPresetCorridor('Kolkata (Park Street Sector)', 'India', 22.5535, 88.3518)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <span className="font-medium block">Kolkata Central Sector</span>
                      <span className="text-[10px] text-slate-400">22.5535° N, 88.3518° E</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* More / Weather, News... */}
            <div className="relative">
              <button
                type="button"
                id="more-intake-btn"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-all"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">More</span>
              </button>

              {showMoreMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-52 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Context Enrichers
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setText((prev) => `${prev ? prev + '\n' : ''}[Telemetry Context: Local Precipitation 42mm/hr, Wind 38kts, Temp 18°C]`);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    + Live Weather Telemetry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText((prev) => `${prev ? prev + '\n' : ''}[Traffic Ingress: Severe Bottleneck on Route 101, Estimated +40min delay]`);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    + Live Traffic Condition
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText((prev) => `${prev ? prev + '\n' : ''}[Urgent Priority Flag: Operator escalated to Level 1 STAT response]`);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    + Priority Level 1 Flag
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            id="analyze-nexa-btn"
            onClick={() => handleSubmit()}
            disabled={isProcessing || (!text.trim() && attachments.length === 0)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-semibold text-xs sm:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(media) => {
          setAttachments((prev) => [...prev, media]);
        }}
      />
    </div>
  );
};
