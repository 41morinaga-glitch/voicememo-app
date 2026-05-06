import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import type { Draft, Tag } from '../../types';

type Props = {
  draft: Draft;
  tags: Tag[];
  onSave: (memo: { title: string; body: string; tagId: string }) => void;
  onRetake: () => void;
  onCancel: () => void;
};

export function SaveConfirm({ draft, tags, onSave, onRetake, onCancel }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tagId, setTagId] = useState<string>(draft.suggestedTagId ?? tags[0]?.id ?? '');
  const [newTagName, setNewTagName] = useState('');
  const [newTagReading, setNewTagReading] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  const handleSave = () => {
    let finalTagId = tagId;
    if (creatingTag && newTagName.trim()) {
      const reading = newTagReading.trim();
      finalTagId = reading
        ? `__new__:${newTagName.trim()}|${reading}`
        : `__new__:${newTagName.trim()}`;
    }
    if (!finalTagId && tags[0]) finalTagId = tags[0].id;
    onSave({ title: title.trim() || t.app.untitled, body, tagId: finalTagId });
  };

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <button
          type="button"
          className="text-text3 text-[10px]"
          onClick={onCancel}
          aria-label={t.voiceCommands.rowCancel}
        >
          {t.save.back}
        </button>
        <h1 className="text-[15px] font-bold text-text1">{t.save.title}</h1>
        <span className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-4 flex flex-col gap-4 pb-3">
        <div>
          <div className="text-[9px] text-text3 tracking-[1px] mb-1">
            {t.save.titleField}
          </div>
          <div className="bg-surface2 border border-border rounded-lg px-3 py-2.5 flex items-center justify-between">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className="bg-transparent flex-1 text-[11px] text-text1 outline-none"
              />
            ) : (
              <>
                <span className="text-[11px] text-text1 truncate">{title || t.app.untitled}</span>
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="text-text3 text-[12px] ml-2"
                  aria-label={t.edit.titlePh}
                >
                  ✎
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-text3 tracking-[1px] mb-1">
            {t.save.tagField}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((t) => {
              const selected = !creatingTag && tagId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTagId(t.id);
                    setCreatingTag(false);
                  }}
                  className={`rounded-full px-2.5 py-1 text-[9px] border transition-colors ${
                    selected
                      ? 'bg-accent/15 border-accent text-accent2'
                      : 'bg-surface2 border-border text-text2'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCreatingTag(true)}
              className={`rounded-full px-2.5 py-1 text-[9px] border ${
                creatingTag ? 'bg-accent/15 border-accent text-accent2' : 'bg-surface2 border-border text-text2'
              }`}
            >
              {t.save.newTag}
            </button>
          </div>
          {creatingTag && (
            <div className="mt-2 flex flex-col gap-1.5">
              <input
                autoFocus
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t.save.tagName}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-[11px] text-text1 outline-none focus:border-accent"
              />
              <input
                value={newTagReading}
                onChange={(e) => setNewTagReading(e.target.value)}
                placeholder={t.save.tagReading}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-[10px] text-text1 outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        <div>
          <div className="text-[9px] text-text3 tracking-[1px] mb-1">{t.save.transcript}</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.save.transcriptEmpty}
            rows={5}
            className="w-full bg-surface2 border border-border focus:border-accent rounded-xl p-3 text-[11px] leading-[1.7] text-text1 outline-none resize-none scroll-area transition-colors"
          />
        </div>

        <div>
          <div className="text-[9px] text-text3 tracking-[1px] mb-1">{t.save.destination}</div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="rounded-md px-2 py-1 text-[9px] bg-ok/10 border border-ok/30 text-ok">
              {t.save.local}
            </span>
          </div>
        </div>

        <div className="font-mono text-[10px] text-text3">
          {formatNow()} · {formatDuration(draft.durationSec)}
        </div>
      </div>

      <div className="px-5 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleSave}
          className="bg-accent text-white rounded-[10px] py-3 text-[11px] font-bold tracking-[1px] min-h-[44px] active:scale-[0.99]"
        >
          {t.save.saveBtn}
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="bg-surface2 text-text2 border border-border rounded-[10px] py-2.5 text-[10px] min-h-[44px]"
        >
          {t.save.retake}
        </button>
      </div>
    </>
  );
}

function formatNow(): string {
  const d = new Date();
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDuration(sec: number): string {
  return `${sec}秒`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
