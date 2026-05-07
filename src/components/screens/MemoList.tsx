import { useMemo } from 'react';
import type { Memo } from '../../types';

type Props = {
  memos: Memo[];
  onOpenMemo: (id: string) => void;
  onMenuTap: () => void;
};

export function MemoList({ memos, onOpenMemo, onMenuTap }: Props) {
  const sorted = useMemo(
    () =>
      memos
        .filter((m) => !m.deletedAt)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [memos],
  );

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <h1 className="text-[15px] font-bold text-text1">VoiceMemo</h1>
        <button
          type="button"
          onClick={onMenuTap}
          aria-label="メニュー"
          className="text-[20px] text-text2 p-1 leading-none"
        >
          ≡
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-1.5 pb-3">
        {sorted.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-8">
            メモはまだありません
          </div>
        )}
        {sorted.map((memo) => (
          <button
            key={memo.id}
            type="button"
            onClick={() => onOpenMemo(memo.id)}
            className="bg-surface2 border border-border rounded-[10px] px-3 py-2.5 flex flex-col gap-0.5 text-left min-h-[52px] active:bg-border/30"
          >
            <div className="text-[11px] text-text1 line-clamp-2 leading-relaxed">
              {memo.body || '（本文なし）'}
            </div>
            <div className="font-mono text-[8px] text-text3 mt-0.5">
              {formatDate(memo.updatedAt)}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
