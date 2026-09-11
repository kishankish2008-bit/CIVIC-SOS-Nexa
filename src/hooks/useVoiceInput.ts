import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(onTranscriptUpdate?: (text: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcriptPart + ' ';
        } else {
          interimStr += transcriptPart;
        }
      }

      const currentCombined = (finalStr + interimStr).trim();
      if (currentCombined) {
        setTranscript(currentCombined);
        if (onTranscriptUpdate) {
          onTranscriptUpdate(currentCombined);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[NEXA Voice Recognition] Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Enable permissions to use voice input.');
      } else if (event.error === 'network') {
        setErrorMessage('Network error during voice recognition.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isSupported, onTranscriptUpdate]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported in this environment.');
      return;
    }
    setErrorMessage(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.warn('[NEXA Voice] Error starting recognition:', e);
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setErrorMessage(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript
  };
}
