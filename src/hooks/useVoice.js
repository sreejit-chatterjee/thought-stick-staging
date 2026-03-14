import { useState, useRef, useCallback } from 'react';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported] = useState(() =>
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // stable ref for async callbacks

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Voice not supported. Try Chrome or Safari.');
      return;
    }

    setError(null);
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full.trim());
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        setError('Mic blocked — allow microphone access in your browser settings.');
      } else if (e.error === 'network') {
        setError('Network error — voice needs an internet connection.');
      } else if (e.error === 'no-speech') {
        // Not fatal — just no speech detected yet, keep listening
        return;
      } else if (e.error !== 'aborted') {
        setError(`Voice error: ${e.error}. Try again.`);
      }
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      // Chrome stops after silence — auto-restart to feel truly continuous
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          isListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setError('Could not start microphone. Tap the mic button again.');
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch (e) {}
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(''), []);
  const clearError = useCallback(() => setError(null), []);

  return { isListening, transcript, error, isSupported, startListening, stopListening, clearTranscript, clearError };
}
