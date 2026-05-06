import { useMemo } from 'react';
import { BottomNav } from '../BottomNav';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type NavKey = 'home' | 'tags' | 'trash';

type Props = {
  memos: Memo[];
  tags: Tag[];
  autoDeleteDays: number;
  activeNav: NavKey;
  onNavigate: (key: NavKey) => void;
  onRestore: (id: string) => void;
  onPurgeAll: () => void;
};

export function Trash({
  memos,
  tags,
  autoDeleteDays,
  activeNav,
  onNavigate,
  onRestore,
  onPurgeAll,
}: Props) {
  const { t } = useI18n();
  const tagMap = useMemo(() => new Map(tags.map((tg) => [tg.id, tg])), [tags]);
  const trashed = useMemo(() => {
    return memos
      .filter((m) => !!m.deletedAt)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }, [memos]);

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <h1 className="text-[15px] font-bold text-text1">{t.trash.title}</h1>
        <span className="text-[9px] text-text3">{t.trash.autoDeleteSuffix(autoDeleteDays)}</span>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-1.5 pb-3">
        {trashed.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-12">
            {t.trash.empty}
          </div>
        )}
        {trashed.map((m) => {
          const tag = tagMap.get(m.tagId);
          const remaining = remainingDays(m.deletedAt!, autoDeleteDays);
          return (
            <div
              key={m.id}
              className="bg-surface2 border border-border rounded-[10px] px-3 py-2.5 flex justify-between items-center opacity-70 min-h-[44px]"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="text-[10px] text-text1 truncate">
                  {tag ? `${tag.name} · ` : ''}
                  {m.title || t.app.untitled}
                </div>
                <div className="font-mono text-[8px] text-text3">
                  {t.trash.deleted}: {formatShortDate(m.deletedAt!)} · {t.trash.daysLeft(remaining)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRestore(m.id)}
                className="text-[8px] text-ok px-2 py-1 border border-ok/30 rounded min-h-[28px] flex-shrink-0 ml-2"
              >
                {t.trash.restore}
              </button>
            </div>
          );
        })}
      </div>

      {trashed.length > 0 && (
        <div className="px-5 pb-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(t.trash.confirmPurge)) onPurgeAll();
            }}
            className="w-full bg-accent/[0.07] border border-accent/20 rounded-lg px-2 py-2 text-[9px] text-text3 active:bg-accent/15"
          >
            {t.trash.purgeAll}
          </button>
        </div>
      )}

      <BottomNav active={activeNav} onChange={onNavigate} />
    </>
  );
}

function remainingDays(deletedIso: string, totalDays: number): number {
  const elapsed = (Date.now() - new Date(deletedIso).getTime()) / 86400000;
  return Math.max(0, Math.ceil(totalDays - elapsed));
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
