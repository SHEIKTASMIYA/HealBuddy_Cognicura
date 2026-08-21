import { useCallback, useRef, useState } from 'react';

const LANG_CODES = { en: 'en-IN', te: 'te-IN' };

// Thin wrapper around the browser's SpeechRecognition + speechSynthesis APIs.
// Every consumer must offer a typed fallback — this hook exposes `supported`
// so the UI knows whether to show the mic at all, but never blocks typing.
export function useSpeech(language) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognitionImpl =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = Boolean(SpeechRecognitionImpl);
  const synthSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const listenOnce = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!supported) {
          reject(new Error('not-supported'));
          return;
        }
        const recognition = new SpeechRecognitionImpl();
        recognitionRef.current = recognition;
        recognition.lang = LANG_CODES[language] || LANG_CODES.en;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = (event) => {
          setIsListening(false);
          reject(event.error || new Error('speech-error'));
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
          const text = event.results?.[0]?.[0]?.transcript || '';
          resolve(text);
        };
        try {
          recognition.start();
        } catch (err) {
          setIsListening(false);
          reject(err);
        }
      }),
    [supported, SpeechRecognitionImpl, language]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!synthSupported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_CODES[language] || LANG_CODES.en;
      window.speechSynthesis.speak(utterance);
    },
    [synthSupported, language]
  );

  return { supported, synthSupported, isListening, listenOnce, stopListening, speak };
}
