import { useEffect, useState } from 'react';
import { toReading } from '../lib/kanjiToKana';
import type { Tag } from '../types';

export function useTagReadings(tags: Tag[]): Map<string, string> {
  const [readings, setReadings] = useState<Map<string, string>>(() => {
    const initial = new Map<string, string>();
    for (const t of tags) {
      if (t.reading) initial.set(t.id, t.reading);
    }
    return initial;
  });

  useEffect(() => {
    let cancelled = false;
    const stripped = tags.map((t) => ({
      tag: t,
      key: t.name.replace(/^\p{Extended_Pictographic}+\s*/u, '').trim(),
    }));
    const needs = stripped.filter(({ tag, key }) => !tag.reading && /[一-鿿]/.test(key));
    if (needs.length === 0) return;
    Promise.all(
      needs.map(async ({ tag, key }) => ({ id: tag.id, reading: await toReading(key) })),
    ).then((results) => {
      if (cancelled) return;
      setReadings((prev) => {
        const next = new Map(prev);
        for (const t of tags) {
          if (t.reading) next.set(t.id, t.reading);
        }
        for (const r of results) {
          if (r.reading) next.set(r.id, r.reading);
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [tags]);

  return readings;
}

export function applyAutoReadings(tags: Tag[], readings: Map<string, string>): Tag[] {
  return tags.map((t) =>
    t.reading ? t : readings.has(t.id) ? { ...t, reading: readings.get(t.id) } : t,
  );
}
