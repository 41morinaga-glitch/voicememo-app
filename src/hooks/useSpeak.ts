import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelSpeaking, isSpeechAvailable, speak } from '../lib/speech';

type Result = {
  available: boolean;
  speaking: boolean;
  toggle: (text: string, lang?: string) => void;
  stop: () => void;
};

export function useSpeak(): Result {
  const [speaking, setSpeaking] = useState(false);
  const handleRef = useRef<{ cancel: () => void } | null>(null);

  const stop = useCallback(() => {
    handleRef.current?.cancel();
    handleRef.current = null;
    cancelSpeaking();
    setSpeaking(false);
  }, []);

  const toggle = useCallback(
    (text: string, lang?: string) => {
      if (speaking) {
        stop();
        return;
      }
      const trimmed = text.trim();
      if (!trimmed) return;
      const handle = speak(trimmed, {
        lang,
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
      handleRef.current = handle;
      setSpeaking(true);
    },
    [speaking, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return {
    available: isSpeechAvailable(),
    speaking,
    toggle,
    stop,
  };
}
