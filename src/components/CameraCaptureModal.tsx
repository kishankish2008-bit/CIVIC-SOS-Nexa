import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { AttachedMedia } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (media: AttachedMedia) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (facing: 'user' | 'environment') => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('unsupported');
      setErrorMessage('Camera access is not supported directly in this browser context.');
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setPermissionStatus('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[NEXA Camera] Error acquiring camera stream:', err);
      setPermissionStatus('denied');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access or use photo upload fallback.'
          : 'Could not access device camera. You can capture a photo via mobile upload fallback.'
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = dataUrl.split(',')[1] || dataUrl;

    const media: AttachedMedia = {
      id: `cam-${Date.now()}`,
      name: `Snapshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
      mimeType: 'image/jpeg',
      data: base64Data,
      size: Math.round(base64Data.length * 0.75),
      previewUrl: dataUrl,
      type: 'image',
    };

    onCapture(media);
    onClose();
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      const media: AttachedMedia = {
        id: `photo-${Date.now()}`,
        name: file.name || 'Device_Photo.jpg',
        mimeType: file.type || 'image/jpeg',
        data: base64Data,
        size: file.size,
        previewUrl: dataUrl,
        type: 'image',
      };
      onCapture(media);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Live Camera Intake</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800">
              {permissionStatus === 'granted' ? 'CAMERA ACTIVE' : 'PERMISSIONS REQUIRED'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {permissionStatus === 'granted' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viewfinder target crosshairs */}
              <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg" />
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">
                Camera Permission Needed
              </div>
              <p className="text-xs text-slate-400">
                {errorMessage || 'NEXA requires your explicit permission to activate the device camera.'}
              </p>

              {/* Mobile device camera file input fallback */}
              <input
                type="file"
                ref={fileFallbackRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackFile}
              />
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Capture Photo Using Device Camera
              </button>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Switch Camera Facing Mode"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {permissionStatus === 'granted' ? (
            <button
              type="button"
              onClick={handleCapture}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <div className="w-3 h-3 rounded-full bg-slate-950" />
              <span>Capture Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Request Camera Permission
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
