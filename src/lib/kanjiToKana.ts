const KUROMOJI_SRC = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js';
const DICT_CDN = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';

let tokenizerPromise: Promise<any> | null = null;
let scriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    kuromoji?: any;
  }
}

const KATA_TO_HIRA: Record<string, string> = {};
for (let i = 0; i < 96; i++) {
  KATA_TO_HIRA[String.fromCharCode(0x30a1 + i)] = String.fromCharCode(0x3041 + i);
}

function kataToHira(s: string): string {
  let out = '';
  for (const ch of s) out += KATA_TO_HIRA[ch] ?? ch;
  return out;
}

function hasKanji(s: string): boolean {
  return /[一-鿿]/.test(s);
}

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.kuromoji) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${KUROMOJI_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('kuromoji script failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = KUROMOJI_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('kuromoji script failed'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function loadTokenizer(): Promise<any> {
  if (tokenizerPromise) return tokenizerPromise;
  tokenizerPromise = (async () => {
    await loadScript();
    if (!window.kuromoji) throw new Error('kuromoji not loaded');
    return new Promise<any>((resolve, reject) => {
      window.kuromoji.builder({ dicPath: DICT_CDN }).build((err: any, tokenizer: any) => {
        if (err) {
          tokenizerPromise = null;
          reject(err);
          return;
        }
        resolve(tokenizer);
      });
    });
  })();
  return tokenizerPromise;
}

const cache = new Map<string, string>();

export async function toReading(text: string): Promise<string> {
  if (!text) return '';
  if (cache.has(text)) return cache.get(text)!;
  if (!hasKanji(text)) {
    const lower = text.toLowerCase();
    cache.set(text, lower);
    return lower;
  }
  try {
    const tokenizer = await loadTokenizer();
    const tokens: { reading?: string; surface_form: string }[] = tokenizer.tokenize(text);
    const reading = tokens
      .map((tk) => kataToHira(tk.reading ?? tk.surface_form))
      .join('');
    cache.set(text, reading);
    return reading;
  } catch (e) {
    console.warn('toReading failed for', text, e);
    cache.set(text, text);
    return text;
  }
}

export function getCachedReading(text: string): string | undefined {
  return cache.get(text);
}
