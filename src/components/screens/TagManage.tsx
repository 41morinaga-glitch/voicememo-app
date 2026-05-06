import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import type { Tag } from '../../types';

type Props = {
  tags: Tag[];
  onChange: (next: Tag[]) => void;
  onDelete: (tagId: string) => void;
  onBack: () => void;
};

const ACTION_WIDTH = 220;

export function TagManage({ tags, onChange, onDelete, onBack }: Props) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftReading, setDraftReading] = useState('');
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null);

  const startEdit = (tag: Tag) => {
    setSwipeOpenId(null);
    setEditingId(tag.id);
    setDraftName(tag.name);
    setDraftReading(tag.reading ?? '');
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmedName = draftName.trim();
    if (!trimmedName) { setEditingId(null); return; }
    onChange(
      tags.map((tag) =>
        tag.id === editingId
          ? { ...tag, name: trimmedName, reading: draftReading.trim() || undefined }
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
    setSwipeOpenId(null);
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

      <button type="button" onClick={onBack} className="text-[10px] text-text3 px-5 mt-2 text-left">
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

      <p className="px-5 mt-1 text-[9px] text-text3">← 左スワイプで操作</p>

      <div
        className="flex-1 overflow-y-auto scroll-area px-5 mt-2 flex flex-col gap-1.5 pb-3"
        onClick={() => setSwipeOpenId(null)}
      >
        {tags.length === 0 && (
          <div className="text-center text-[10px] text-text3 py-8">{t.tagList.empty}</div>
        )}
        {tags.map((tag, i) => {
          const isEditing = editingId === tag.id;
          return (
            <div key={tag.id} onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                <div className="bg-surface2 border border-accent/40 rounded-[10px] px-3 py-2.5 flex flex-col gap-1.5">
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                    placeholder={t.save.tagName}
                    className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-[12px] text-text1 outline-none focus:border-accent"
                  />
                  <input
                    value={draftReading}
                    onChange={(e) => setDraftReading(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
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
                </div>
              ) : (
                <SwipeCard
                  id={tag.id}
                  openId={swipeOpenId}
                  onOpenChange={setSwipeOpenId}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="flex-1 flex items-center justify-center text-[16px] text-text2 bg-surface disabled:opacity-30 active:brightness-125"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === tags.length - 1}
                        className="flex-1 flex items-center justify-center text-[16px] text-text2 bg-surface disabled:opacity-30 active:brightness-125"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        className="flex-1 flex items-center justify-center text-[16px] font-bold text-white bg-accent active:brightness-125"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(t.tagManage.deleteConfirm(tag.name))) {
                            setSwipeOpenId(null);
                            onDelete(tag.id);
                          }
                        }}
                        className="flex-1 flex items-center justify-center text-[16px] font-bold text-white bg-[#cc2200] active:brightness-125"
                      >
                        削除
                      </button>
                    </>
                  }
                >
                  <div className="bg-surface2 border border-border rounded-[10px] px-3 py-3 flex items-center min-h-[52px]">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="text-[13px] text-text1 truncate">{tag.name}</div>
                      <div className="font-mono text-[9px] text-text3">
                        {tag.usageCount} {t.home.memos}
                        {tag.reading ? ` · ${tag.reading}` : ''}
                      </div>
                    </div>
                    <span className="text-[11px] text-text3 ml-2 flex-shrink-0">≡</span>
                  </div>
                </SwipeCard>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

type SwipeCardProps = {
  id: string;
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  actions: React.ReactNode;
  children: React.ReactNode;
};

function SwipeCard({ id, openId, onOpenChange, actions, children }: SwipeCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  const isOpen = openId === id;

  useEffect(() => {
    if (!isOpen) setOffsetX(0);
    else setOffsetX(-ACTION_WIDTH);
  }, [isOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    startX.current = e.touches[0].clientX;
    startOffset.current = offsetX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const delta = e.touches[0].clientX - startX.current + startOffset.current;
    setOffsetX(Math.max(-ACTION_WIDTH, Math.min(0, delta)));
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (offsetX < -ACTION_WIDTH / 2) {
      setOffsetX(-ACTION_WIDTH);
      onOpenChange(id);
    } else {
      setOffsetX(0);
      if (isOpen) onOpenChange(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[10px]">
      <div
        className="absolute right-0 inset-y-0 flex"
        style={{ width: ACTION_WIDTH }}
      >
        {actions}
      </div>
      <div
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
