export type SpeechHandle = {
  cancel: () => void;
};

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(
  text: string,
  opts: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (e: SpeechSynthesisErrorEvent) => void;
  } = {},
): SpeechHandle {
  if (!isSpeechAvailable() || !text.trim()) {
    return { cancel: () => {} };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = opts.lang ?? 'ja-JP';
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;
  if (opts.onEnd) utter.onend = opts.onEnd;
  if (opts.onError) utter.onerror = opts.onError;
  const voices = synth.getVoices();
  const langPrefix = utter.lang.split('-')[0];
  const match = voices.find((v) => v.lang === utter.lang) ??
    voices.find((v) => v.lang.startsWith(langPrefix));
  if (match) utter.voice = match;
  synth.speak(utter);
  return {
    cancel: () => synth.cancel(),
  };
}

export function cancelSpeaking(): void {
  if (isSpeechAvailable()) window.speechSynthesis.cancel();
}
