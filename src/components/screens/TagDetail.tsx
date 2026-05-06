import { useMemo } from 'react';
import { useSpeak } from '../../hooks/useSpeak';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Props = {
  tag: Tag;
  memos: Memo[];
  onBack: () => void;
  onEditMemo: (id: string) => void;
  onDeleteMemo: (id: string) => void;
  onAddRecord: () => void;
  onPdfExport: () => void;
};

export function TagDetail({
  tag,
  memos,
  onBack,
  onEditMemo,
  onDeleteMemo,
  onAddRecord,
  onPdfExport,
}: Props) {
  const speak = useSpeak();
  const { t } = useI18n();

  const list = useMemo(() => {
    return memos
      .filter((m) => m.tagId === tag.id && !m.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [memos, tag.id]);

  const totalChars = useMemo(
    () => list.reduce((acc, m) => acc + m.body.length, 0),
    [list],
  );

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-[10px] text-text3 px-5 mt-2 text-left"
      >
        {t.tagDetail.backToTagList}
      </button>

      <div className="px-5 mt-2">
        <div className="text-[16px] font-bold text-text1">{tag.name}</div>
        <div className="font-mono text-[9px] text-text3">
          {list.length} {t.home.memos} · {totalChars.toLocaleString()} {t.tagDetail.chars}
        </div>
      </div>

      <div className="flex gap-1.5 px-5 mt-3">
        <button
          type="button"
          className="rounded-full px-2.5 py-1 text-[9px] bg-accent/10 border border-accent/30 text-accent2 min-h-[28px]"
          onClick={onPdfExport}
        >
          {t.tagDetail.pdf}
        </button>
        <button
          type="button"
          onClick={onAddRecord}
          className="rounded-full px-2.5 py-1 text-[9px] bg-surface2 border border-border text-text2 min-h-[28px]"
        >
          {t.tagDetail.addRecord}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-2 pb-3">
        {list.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-8">
            {t.tagDetail.empty}
          </div>
        )}
        {list.map((m) => (
          <div
            key={m.id}
            className="bg-surface2 border border-border rounded-[10px] p-2.5 flex flex-col gap-1.5"
          >
            <div className="font-mono text-[8px] text-text3">
              {formatDateTime(m.createdAt)}
            </div>
            {m.title && (
              <div className="text-[11px] font-medium text-text1">{m.title}</div>
            )}
            <div className="text-[10px] leading-[1.6] text-text1 whitespace-pre-wrap line-clamp-3">
              {m.body}
            </div>
            <div className="flex gap-2 justify-end mt-1">
              {speak.available && (
                <button
                  type="button"
                  onClick={() =>
                    speak.toggle([m.title, m.body].filter(Boolean).join('。'))
                  }
                  aria-label="読み上げ"
                  className="text-[8px] text-text3 px-2 py-0.5 border border-border rounded min-h-[28px]"
                >
                  🔊
                </button>
              )}
              <button
                type="button"
                onClick={() => onEditMemo(m.id)}
                className="text-[8px] text-text3 px-2 py-0.5 border border-border rounded min-h-[28px]"
              >
                {t.tagDetail.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.tagDetail.confirmDelete)) onDeleteMemo(m.id);
                }}
                className="text-[8px] text-accent px-2 py-0.5 border border-accent/30 rounded min-h-[28px]"
              >
                {t.tagDetail.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
