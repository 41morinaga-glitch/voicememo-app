import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { DEFAULT_VOICE_COMMANDS } from '../../types';
import type { VoiceCommands as VC } from '../../types';

type Props = {
  commands: VC;
  onChange: (next: VC) => void;
  onBack: () => void;
};

export function VoiceCommands({ commands, onChange, onBack }: Props) {
  const { t } = useI18n();
  const [editingKey, setEditingKey] = useState<keyof VC | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const ROWS: { key: keyof VC; label: string }[] = [
    { key: 'startRecording', label: t.voiceCommands.rowStart },
    { key: 'setTitle', label: t.voiceCommands.rowTitle },
    { key: 'setTag', label: t.voiceCommands.rowTag },
    { key: 'save', label: t.voiceCommands.rowSave },
    { key: 'cancel', label: t.voiceCommands.rowCancel },
    { key: 'readAloud', label: t.voiceCommands.rowRead },
  ];

  const startEdit = (key: keyof VC) => {
    setEditingKey(key);
    setDraftValue(commands[key]);
  };

  const commit = () => {
    if (!editingKey) return;
    const trimmed = draftValue.trim();
    if (trimmed) {
      onChange({ ...commands, [editingKey]: trimmed });
    }
    setEditingKey(null);
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
        {t.settings.backToMenu}
      </button>

      <div className="px-5 mt-2 text-[13px] font-bold text-text1">{t.voiceCommands.title}</div>
      <div className="px-5 text-[9px] text-text3 mt-1">
        {t.voiceCommands.hint}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-1.5 pb-3">
        {ROWS.map((row) => {
          const isEditing = editingKey === row.key;
          return (
            <div
              key={row.key}
              className="bg-surface2 border border-border rounded-lg px-3 py-2.5 flex items-center justify-between min-h-[44px]"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="text-[9px] text-text3 tracking-[1px]">{row.label}</div>
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commit();
                      if (e.key === 'Escape') setEditingKey(null);
                    }}
                    className="bg-transparent text-[12px] text-accent font-mono font-bold outline-none border-b border-accent/40"
                  />
                ) : (
                  <div className="text-[12px] text-accent font-mono font-bold truncate">
                    「{commands[row.key]}」
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => (isEditing ? commit() : startEdit(row.key))}
                className="text-[9px] text-text3 px-2 py-1 border border-border rounded ml-2 flex-shrink-0 min-h-[28px]"
              >
                {isEditing ? t.voiceCommands.done : t.voiceCommands.change}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(DEFAULT_VOICE_COMMANDS)}
          className="text-[9px] text-text3 mt-2 underline"
        >
          {t.voiceCommands.resetDefaults}
        </button>
      </div>

      <div className="px-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full bg-accent/10 border border-accent/30 text-accent rounded-lg py-2.5 text-[10px] font-bold flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          {t.voiceCommands.testRec}
        </button>
      </div>
    </>
  );
}
