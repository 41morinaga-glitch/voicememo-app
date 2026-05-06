import { useMemo } from 'react';
import { HamburgerIcon } from '../HamburgerIcon';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Props = {
  tags: Tag[];
  memos: Memo[];
  onRecordTap: () => void;
  onMenuTap: () => void;
  onSearchTap: () => void;
  onTagTap: (tagId: string) => void;
};

export function Home({
  tags,
  memos,
  onRecordTap,
  onMenuTap,
  onSearchTap,
  onTagTap,
}: Props) {
  const { t } = useI18n();
  const sorted = useMemo(() => {
    return [...tags].sort((a, b) => b.usageCount - a.usageCount);
  }, [tags]);

  const top = sorted.slice(0, 2);
  const rest = sorted.slice(2);
  const maxUsage = Math.max(1, ...sorted.map((t) => t.usageCount));

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
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSearchTap}
            aria-label={t.search.title}
            className="text-text2 text-[14px] p-1.5 min-h-[28px] min-w-[28px]"
          >
            🔍
          </button>
          <HamburgerIcon onClick={onMenuTap} />
        </div>
      </div>

      <div className="flex flex-col items-center mt-4 px-5">
        <div className="font-mono text-[10px] tracking-[2px] text-text3 mb-3">
          {t.home.tapToRecord}
        </div>
        <button
          type="button"
          onClick={onRecordTap}
          className="w-[92px] h-[92px] rounded-full bg-accent flex items-center justify-center shadow-recring active:scale-95 transition-transform"
          aria-label={t.voiceCommands.rowStart}
        >
          <span className="block w-[28px] h-[28px] rounded-full bg-white" />
        </button>
        <div className="text-[9px] text-text3 tracking-[1px] mt-3 text-center">
          {t.home.voiceHint}
        </div>
      </div>

      <div className="h-px bg-border mx-5 mt-5" />

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
              ratio={tag.usageCount / maxUsage}
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
                  ratio={tag.usageCount / maxUsage}
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
  ratio,
  lastTs,
  onClick,
}: {
  tag: Tag;
  size: 'lg' | 'sm';
  ratio: number;
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
      <div
        className="h-[2px] bg-accent rounded-sm"
        style={{ width: `${Math.max(8, ratio * 100)}%` }}
      />
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
