import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import type { Tag } from '../../types';

type Props = {
  tags: Tag[];
  onChange: (next: Tag[]) => void;
  onDelete: (tagId: string) => void;
  onBack: () => void;
};

export function TagManage({ tags, onChange, onDelete, onBack }: Props) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftReading, setDraftReading] = useState('');

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setDraftName(tag.name);
    setDraftReading(tag.reading ?? '');
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setEditingId(null);
      return;
    }
    const reading = draftReading.trim();
    onChange(
      tags.map((tag) =>
        tag.id === editingId
          ? { ...tag, name: trimmedName, reading: reading || undefined }
          : tag,
      ),
    );
    setEditingId(null);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= tags.length) return;
    const next = [...tags];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addTag = () => {
    const name = prompt(t.save.tagName);
    if (!name || !name.trim()) return;
    const reading = prompt(t.save.tagReading) ?? '';
    const newTag: Tag = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      name: name.trim(),
      ...(reading.trim() ? { reading: reading.trim() } : {}),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    onChange([...tags, newTag]);
  };

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
        {t.tagManage.backToMenu}
      </button>

      <div className="px-5 mt-2 flex items-center justify-between">
        <h1 className="text-[13px] font-bold text-text1">{t.tagManage.title}</h1>
        <button
          type="button"
          onClick={addTag}
          className="text-[9px] text-info border border-info/40 rounded px-2 py-1 min-h-[28px]"
        >
          {t.tagManage.addTag}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-1.5 pb-3">
        {tags.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-8">
            {t.tagList.empty}
          </div>
        )}
        {tags.map((tag, i) => {
          const isEditing = editingId === tag.id;
          return (
            <div
              key={tag.id}
              className="bg-surface2 border border-border rounded-[10px] px-3 py-2.5 flex flex-col gap-1.5 min-h-[44px]"
            >
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder={t.save.tagName}
                    className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-[12px] text-text1 outline-none focus:border-accent"
                  />
                  <input
                    value={draftReading}
                    onChange={(e) => setDraftReading(e.target.value)}
                    placeholder={t.save.tagReading}
                    className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-[10px] text-text1 outline-none focus:border-accent"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-[11px] text-text2 px-3 py-1.5 border border-border rounded min-h-[36px]"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={commitEdit}
                      className="text-[11px] font-bold text-white bg-accent rounded px-4 py-1.5 min-h-[36px]"
                    >
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="text-[12px] text-text1 truncate">{tag.name}</div>
                    <div className="font-mono text-[8px] text-text3">
                      {tag.usageCount} {t.home.memos}
                      {tag.reading ? ` · ${tag.reading}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={t.tagManage.moveBefore}
                      className="text-[10px] text-text3 px-1.5 py-1 border border-border rounded min-h-[28px] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === tags.length - 1}
                      aria-label={t.tagManage.moveAfter}
                      className="text-[10px] text-text3 px-1.5 py-1 border border-border rounded min-h-[28px] disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="text-[11px] text-accent2 px-3 py-1 border border-accent/40 rounded min-h-[36px]"
                    >
                      {t.tagDetail.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t.tagManage.deleteConfirm(tag.name))) onDelete(tag.id);
                      }}
                      className="text-[9px] text-accent border border-accent/30 rounded px-2 py-1 min-h-[28px]"
                    >
                      {t.tagDetail.delete}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
