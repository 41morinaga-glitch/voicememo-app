import { useMemo } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Props = {
  memos: Memo[];
  tags: Tag[];
  query: string;
  onOpenMemo: (memoId: string) => void;
};

export function Search({ memos, tags, query, onOpenMemo }: Props) {
  const { t } = useI18n();
  const tagMap = useMemo(() => new Map(tags.map((tg) => [tg.id, tg])), [tags]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as { memo: Memo; tag: Tag | null; snippet: string }[];
    return memos
      .filter((m) => !m.deletedAt)
      .map((m) => {
        const tag = tagMap.get(m.tagId) ?? null;
        const haystack = [m.title, m.body, tag?.name ?? '', tag?.reading ?? '']
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return null;
        return { memo: m, tag, snippet: makeSnippet(m.body || m.title, q) };
      })
      .filter((x): x is { memo: Memo; tag: Tag | null; snippet: string } => !!x)
      .sort(
        (a, b) =>
          new Date(b.memo.updatedAt).getTime() - new Date(a.memo.updatedAt).getTime(),
      );
  }, [query, memos, tagMap]);

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="px-5 mt-3 font-mono text-[9px] text-text3">
        {query.trim() ? t.search.hits(results.length) : t.search.typeHint}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-2 flex flex-col gap-2 pb-3">
        {results.map(({ memo, tag, snippet }) => (
          <button
            key={memo.id}
            type="button"
            onClick={() => onOpenMemo(memo.id)}
            className="bg-surface2 border border-border rounded-[10px] px-3 py-2.5 flex flex-col gap-1 text-left active:bg-border/40 min-h-[44px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[8px] text-text3 flex-shrink-0">
                {formatDate(memo.createdAt)}
              </span>
            </div>
            {tag && (
              <span className="text-[8px] text-accent2 truncate">
                {tag.name}
              </span>
            )}
            <Snippet text={snippet} query={query.trim()} />
          </button>
        ))}
        {!query.trim() && (
          <div className="text-center text-[10px] text-text3 py-12">
            {t.search.initialHelp}
          </div>
        )}
        {query.trim() && results.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-12">
            {t.search.noResults}
          </div>
        )}
      </div>
    </>
  );
}

function Snippet({ text, query }: { text: string; query: string }) {
  if (!query) {
    return <div className="text-[10px] leading-relaxed text-text2 line-clamp-2">{text}</div>;
  }
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) {
    return <div className="text-[10px] leading-relaxed text-text2 line-clamp-2">{text}</div>;
  }
  return (
    <div className="text-[10px] leading-relaxed text-text2 line-clamp-2">
      {text.slice(0, idx)}
      <span className="bg-accent/20 text-accent2 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </div>
  );
}

function makeSnippet(text: string, query: string): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text.slice(0, 100);
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + query.length + 60);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
