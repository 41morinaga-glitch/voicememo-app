import { useEffect, useRef, useState } from 'react';
import { useSpeak } from '../../hooks/useSpeak';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo } from '../../types';

type Props = {
  memo: Memo;
  onBack: () => void;
  onSave: (patch: { title: string; body: string }) => void;
};

export function MemoEdit({ memo, onBack, onSave }: Props) {
  const [body, setBody] = useState(memo.body);
  const speak = useSpeak();
  const { t } = useI18n();
  const historyRef = useRef<string[]>([memo.body]);
  const futureRef = useRef<string[]>([]);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const last = historyRef.current[historyRef.current.length - 1];
      if (last === body) return;
      historyRef.current.push(body);
      futureRef.current = [];
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [body]);

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop()!;
    futureRef.current.push(current);
    setBody(historyRef.current[historyRef.current.length - 1]);
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    setBody(next);
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
        ← {t.app.name}
      </button>

      <div className="px-5 mt-2 text-[12px] font-bold text-text1">
        {formatDateTime(memo.createdAt)}
      </div>

      <div className="flex gap-1.5 px-5 mt-2 items-center">
        <button
          type="button"
          onClick={undo}
          disabled={historyRef.current.length <= 1}
          className="bg-surface2 border border-border rounded px-2 py-1 text-[9px] text-text2 min-h-[28px] disabled:opacity-40"
        >
          {t.edit.undo}
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={futureRef.current.length === 0}
          className="bg-surface2 border border-border rounded px-2 py-1 text-[9px] text-text2 min-h-[28px] disabled:opacity-40"
        >
          {t.edit.redo}
        </button>
        {speak.available && (
          <button
            type="button"
            onClick={() => speak.toggle(body)}
            aria-label={speak.speaking ? t.edit.speakStop : t.edit.speak}
            className={`bg-surface2 border rounded px-2 py-1 text-[9px] min-h-[28px] ${
              speak.speaking
                ? 'border-accent/40 text-accent'
                : 'border-border text-text2'
            }`}
          >
            {speak.speaking ? t.edit.speakStop : t.edit.speak}
          </button>
        )}
        <div className="ml-auto" />
        <button
          type="button"
          onClick={() => onSave({ title: memo.title, body })}
          className="border border-accent/30 rounded px-2 py-1 text-[9px] text-accent min-h-[28px]"
        >
          {t.edit.done}
        </button>
      </div>

      <div className="px-5 mt-2 flex-1 overflow-hidden flex flex-col">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.edit.bodyPh}
          className="flex-1 bg-surface2 border border-accent rounded-xl p-3 text-[11px] leading-[1.8] text-text1 outline-none resize-none scroll-area"
        />
      </div>

      <div className="px-5 pt-3 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onSave({ title: memo.title, body })}
          className="bg-accent text-white rounded-[10px] py-3 text-[11px] font-bold tracking-[1px] min-h-[44px] active:scale-[0.99]"
        >
          {t.edit.save}
        </button>
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
