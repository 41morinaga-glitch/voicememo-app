export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

function sharedPrefixLen(a: string, b: string): number {
  const min = Math.min(a.length, b.length);
  let n = 0;
  while (n < min && a[n] === b[n]) n++;
  return n;
}

const KANA_MAP: Record<string, string> = {};
{
  for (let i = 0; i < 96; i++) {
    const hira = String.fromCharCode(0x3041 + i);
    const kata = String.fromCharCode(0x30a1 + i);
    KANA_MAP[kata] = hira;
  }
}

function normalizeKana(s: string): string {
  let out = '';
  for (const ch of s) out += KANA_MAP[ch] ?? ch;
  return out.toLowerCase();
}

function stripDecoration(name: string): string {
  return name.replace(/^\p{Extended_Pictographic}+\s*/u, '').trim();
}

type Keys = { name: string; reading: string };

function extractKeys(item: { name: string; reading?: string }): Keys {
  return {
    name: normalizeKana(stripDecoration(item.name)),
    reading: normalizeKana((item.reading ?? '').trim()),
  };
}

function pairLikely(a: Keys, b: Keys): boolean {
  if (a.name && b.name) {
    if (sharedPrefixLen(a.name, b.name) >= 2) return true;
    if (similarity(a.name, b.name) >= 0.5) return true;
  }
  if (a.reading && b.reading) {
    const short = a.reading.length < b.reading.length ? a.reading : b.reading;
    const long = a.reading.length < b.reading.length ? b.reading : a.reading;
    if (short.length >= 3 && long.startsWith(short)) return true;
    if (sharedPrefixLen(a.reading, b.reading) >= 3) return true;
    if (similarity(a.reading, b.reading) >= 0.55) return true;
  }
  const cross: [string, string][] = [];
  if (a.name && b.reading) cross.push([a.name, b.reading]);
  if (a.reading && b.name) cross.push([a.reading, b.name]);
  for (const [x, y] of cross) {
    if (similarity(x, y) >= 0.55) return true;
  }
  return false;
}

export function isLikelySimilar(
  a: { name: string; reading?: string },
  b: { name: string; reading?: string },
): boolean {
  return pairLikely(extractKeys(a), extractKeys(b));
}

export function findSimilarGroups<T extends { id: string; name: string; reading?: string }>(
  items: T[],
): T[][] {
  const normalized = items.map((it) => ({ item: it, keys: extractKeys(it) }));
  const visited = new Set<string>();
  const groups: T[][] = [];
  for (let i = 0; i < normalized.length; i++) {
    if (visited.has(normalized[i].item.id)) continue;
    const group = [normalized[i].item];
    visited.add(normalized[i].item.id);
    for (let j = i + 1; j < normalized.length; j++) {
      if (visited.has(normalized[j].item.id)) continue;
      if (pairLikely(normalized[i].keys, normalized[j].keys)) {
        group.push(normalized[j].item);
        visited.add(normalized[j].item.id);
      }
    }
    if (group.length >= 2) groups.push(group);
  }
  return groups;
}
