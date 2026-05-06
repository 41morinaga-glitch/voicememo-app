import { useMemo } from 'react';
import { findSimilarGroups } from '../../lib/levenshtein';
import { applyAutoReadings, useTagReadings } from '../../hooks/useTagReadings';
import { useI18n } from '../../i18n/I18nContext';
import { formatRelative } from './Home';
import type { Memo, Tag } from '../../types';

type Props = {
  tags: Tag[];
  memos: Memo[];
  onTagTap: (tagId: string) => void;
  onMerge: (group: Tag[]) => void;
};

export function TagList({ tags, memos, onTagTap, onMerge }: Props) {
  const { t } = useI18n();
  const readings = useTagReadings(tags);
  const enriched = useMemo(() => applyAutoReadings(tags, readings), [tags, readings]);
  const sorted = useMemo(
    () => [...enriched].sort((a, b) => b.usageCount - a.usageCount),
    [enriched],
  );
  const groups = useMemo(() => findSimilarGroups(enriched), [enriched]);

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
        <h1 className="text-[15px] font-bold text-text1">{t.tagList.title}</h1>
        <span className="text-[9px] text-text3">
          {tags.length} {t.tagList.countSuffix}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-3 pb-3">
        {groups.map((group, i) => (
          <div
            key={i}
            className="bg-warn/[0.07] border border-warn/30 rounded-lg p-2.5"
          >
            <div className="text-[9px] text-warn tracking-[1px] mb-1.5">
              {t.tagList.similarFound}
            </div>
            <div className="flex gap-1 items-center flex-wrap mb-2">
              {group.map((tg, idx) => (
                <span key={tg.id} className="contents">
                  <span className="bg-surface2 border border-border rounded px-1.5 py-0.5 text-[9px] text-text1">
                    {tg.name}
                  </span>
                  {idx < group.length - 1 && (
                    <span className="text-[9px] text-text3">≈</span>
                  )}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onMerge(group)}
              className="bg-warn text-black rounded px-2.5 py-1 text-[9px] font-bold min-h-[28px]"
            >
              {t.tagList.mergeBtn}
            </button>
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          {sorted.map((tag) => {
            const lastTs = lastByTag.get(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagTap(tag.id)}
                className="bg-surface2 border border-border rounded-[10px] px-3 py-2.5 flex justify-between items-center min-h-[44px] active:bg-border/30"
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <div className="text-[12px] text-text1">{tag.name}</div>
                  <div className="font-mono text-[8px] text-text3">
                    {tag.usageCount} {t.home.memos}
                    {lastTs ? ` · ${formatRelative(lastTs, t.home)}` : ''}
                  </div>
                </div>
                <span className="text-[14px] text-text3">›</span>
              </button>
            );
          })}
          {tags.length === 0 && (
            <div className="text-center text-[10px] text-text3 py-8">
              {t.tagList.empty}
            </div>
          )}
        </div>
      </div>

    </>
  );
}
