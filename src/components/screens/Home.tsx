import { useState, useMemo } from 'react';
import { HamburgerIcon } from '../HamburgerIcon';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Props = {
  memos: Memo[];
  tags: Tag[];
  onMenuTap: () => void;
  onEditMemo: (memoId: string) => void;
  onDeleteMemo: (memoId: string) => void;
};

export function Home({ memos, tags, onMenuTap, onEditMemo, onDeleteMemo }: Props) {
  const { t } = useI18n();

  const tagMap = useMemo(() => new Map(tags.map((tg) => [tg.id, tg])), [tags]);

  const recent = useMemo(() => {
    return memos
      .filter((m) => !m.deletedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 30);
  }, [memos]);

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <h1 className="text-[15px] font-bold text-text1">{t.app.name}</h1>
        <HamburgerIcon onClick={onMenuTap} />
      </div>

      <div className="px-5 pt-4 pb-2 flex-1 flex flex-col overflow-hidden">
        <div className="font-mono text-[9px] tracking-[2px] text-text3 uppercase mb-3">
          最近の録音
        </div>
        <div className="overflow-y-auto scroll-area flex flex-col gap-2 pr-1">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="text-[28px]">🎙</div>
              <div className="text-[10px] text-text3">まだ録音がありません</div>
            </div>
          ) : (
            recent.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                tag={tagMap.get(memo.tagId)}
                onEdit={() => onEditMemo(memo.id)}
                onDelete={() => onDeleteMemo(memo.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function MemoCard({
  memo,
  tag,
  onEdit,
  onDelete,
}: {
  memo: Memo;
  tag: Tag | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);

  const text = memo.body || memo.title || '';
  const preview = text.slice(0, 30) + (text.length > 30 ? '…' : '');

  const handleRead = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(memo.body || memo.title || '');
    utterance.lang = 'ja-JP';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = () => {
    if (confirm('このメモを削除しますか？')) onDelete();
  };

  return (
    <div className="bg-surface2 border border-border rounded-[10px] px-3 pt-2.5 pb-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[8px] text-accent2 truncate">
          {tag?.name ?? '—'}
        </span>
        <span className="font-mono text-[8px] text-text3 flex-shrink-0">
          {formatDateTime(memo.updatedAt)}
        </span>
      </div>

      <div className="text-[12px] text-text1 leading-relaxed">
        {preview || '（本文なし）'}
      </div>

      <div className="flex gap-1.5 pt-0.5">
        <ActionBtn onClick={handleRead} active={speaking}>
          {speaking ? '⏹ 停止' : '▶ 読む'}
        </ActionBtn>
        <ActionBtn onClick={onEdit}>✏ 編集</ActionBtn>
        <ActionBtn onClick={handleDelete} danger>🗑 削除</ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-[10px] py-1.5 rounded-lg border min-h-[34px] transition-colors font-medium
        ${danger
          ? 'border-accent/30 text-accent active:bg-accent/10'
          : active
            ? 'border-ok/40 text-ok bg-ok/10'
            : 'border-border text-text2 active:bg-border/30'
        }`}
    >
      {children}
    </button>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  if (isToday) return `${hh}:${mm}`;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${hh}:${mm}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatRelative(
  ts: number,
  labels: {
    today: string;
    yesterday: string;
    daysAgo: (n: number) => string;
    weeksAgo: (n: number) => string;
    monthsAgo: (n: number) => string;
  },
): string {
  const diff = Date.now() - ts;
  const day = 86400000;
  if (diff < day) return labels.today;
  if (diff < day * 2) return labels.yesterday;
  const days = Math.floor(diff / day);
  if (days < 7) return labels.daysAgo(days);
  if (days < 30) return labels.weeksAgo(Math.floor(days / 7));
  return labels.monthsAgo(Math.floor(days / 30));
}
