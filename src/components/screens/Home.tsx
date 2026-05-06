import { useMemo } from 'react';
import { HamburgerIcon } from '../HamburgerIcon';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Props = {
  tags: Tag[];
  memos: Memo[];
  onMenuTap: () => void;
  onTagTap: (tagId: string) => void;
};

export function Home({ tags, memos, onMenuTap, onTagTap }: Props) {
  const { t } = useI18n();
  const sorted = useMemo(() => {
    return [...tags].sort((a, b) => b.usageCount - a.usageCount);
  }, [tags]);

  const top = sorted.slice(0, 2);
  const rest = sorted.slice(2);

  const lastByTag = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of memos) {
      if (m.deletedAt) continue;
      const ts = new Date(m.updatedAt).getTime();
      const cur = map.get(m.tagId) ?? 0;
      if (ts > cur) map.set(m.tagId, ts);
    }
    return map;
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
          {t.home.frequentTags}
        </div>
        <div className="overflow-y-auto scroll-area flex flex-col gap-2 pr-1">
          {top.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              size="lg"

              lastTs={lastByTag.get(tag.id)}
              onClick={() => onTagTap(tag.id)}
            />
          ))}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {rest.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  size="sm"
    
                  lastTs={lastByTag.get(tag.id)}
                  onClick={() => onTagTap(tag.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  );
}

function TagCard({
  tag,
  size,
  lastTs,
  onClick,
}: {
  tag: Tag;
  size: 'lg' | 'sm';
  lastTs?: number;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const lastLabel = lastTs ? formatRelative(lastTs, t.home) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-surface2 border border-border rounded-[10px] p-3 flex flex-col gap-1 text-left active:bg-border/40 transition-colors min-h-[44px]"
    >
      <div
        className={`${size === 'lg' ? 'text-[13px]' : 'text-[10px]'} font-medium text-text1 truncate`}
      >
        {tag.name}
      </div>
      <div className="font-mono text-[8px] text-text3">
        {tag.usageCount} {t.home.memos}
        {lastLabel ? ` · ${t.home.last}: ${lastLabel}` : ''}
      </div>
    </button>
  );
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
