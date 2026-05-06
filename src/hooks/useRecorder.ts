import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'recording' | 'stopped' | 'error';

type Options = {
  maxSec?: number;
  lang?: string;
};

type Result = {
  status: Status;
  elapsedSec: number;
  transcript: string;
  audioBase64: string | null;
  errorMessage: string | null;
  level: number;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function useRecorder({ maxSec = 30, lang = 'ja-JP' }: Options = {}): Result {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef('');
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setElapsedSec(0);
    setTranscript('');
    setAudioBase64(null);
    setErrorMessage(null);
    setLevel(0);
    finalTextRef.current = '';
    chunksRef.current = [];
  }, [cleanup]);

  const stop = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;
    return new Promise<void>((resolve) => {
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        try {
          const b64 = await blobToBase64(blob);
          setAudioBase64(b64);
        } catch {
          setAudioBase64(null);
        }
        cleanup();
        setStatus('stopped');
        resolve();
      };
      try {
        mr.stop();
      } catch {
        cleanup();
        setStatus('stopped');
        resolve();
      }
    });
  }, [cleanup]);

  const start = useCallback(async () => {
    reset();
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(data);
          let peak = 0;
          for (let i = 0; i < data.length; i++) {
            const v = Math.abs(data[i] - 128);
            if (v > peak) peak = v;
          }
          setLevel(Math.min(1, peak / 80));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      const mimeType = getSupportedMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start();

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = lang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const r = event.results[i];
            if (r.isFinal) finalTextRef.current += r[0].transcript;
            else interim += r[0].transcript;
          }
          setTranscript((finalTextRef.current + interim).trim());
        };
        rec.onerror = () => {};
        rec.onend = () => {};
        try {
          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }

      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSec(sec);
        if (sec >= maxSec) {
          stop();
        }
      }, 200);

      setStatus('recording');
    } catch (e) {
      setStatus('error');
      setErrorMessage(
        e instanceof Error ? e.message : 'マイクへのアクセスに失敗しました'
      );
      cleanup();
    }
  }, [lang, maxSec, reset, stop, cleanup]);

  return {
    status,
    elapsedSec,
    transcript,
    audioBase64,
    errorMessage,
    level,
    start,
    stop,
    reset,
  };
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
