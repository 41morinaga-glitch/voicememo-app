import type { Tag } from '../types';

const KATA_TO_HIRA: Record<string, string> = {};
for (let i = 0; i < 96; i++) {
  KATA_TO_HIRA[String.fromCharCode(0x30a1 + i)] = String.fromCharCode(0x3041 + i);
}

function normalize(s: string): string {
  let out = '';
  for (const ch of (s || '')) out += KATA_TO_HIRA[ch] ?? ch;
  return out
    .replace(/^\p{Extended_Pictographic}+\s*/u, '')
    .trim()
    .toLowerCase();
}

export function findBestTag(
  phrase: string,
  tags: Tag[],
  cachedReadings: Map<string, string>,
): Tag | null {
  if (!phrase || tags.length === 0) return null;
  const target = normalize(phrase);
  if (!target) return null;

  let best: Tag | null = null;
  let bestScore = 0;

  for (const tag of tags) {
    const candidates = [
      normalize(tag.name),
      normalize(tag.reading ?? ''),
      normalize(cachedReadings.get(tag.id) ?? ''),
    ].filter(Boolean);

    for (const c of candidates) {
      let score = 0;
      if (c === target) score = 1.0;
      else if (c.startsWith(target) || target.startsWith(c)) score = 0.85;
      else if (c.includes(target) || target.includes(c)) score = 0.7;
      else continue;

      if (score > bestScore) {
        bestScore = score;
        best = tag;
      }
    }
  }

  return bestScore >= 0.7 ? best : null;
}
