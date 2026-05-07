import { useEffect, useMemo, useRef } from 'react';
import { useRecorder } from '../../hooks/useRecorder';
import { parseTranscript } from '../../lib/voiceParse';
import { useI18n } from '../../i18n/I18nContext';
import type { Draft, VoiceCommands } from '../../types';

type Props = {
  maxSec: number;
  commands: VoiceCommands;
  autoSave?: boolean;
  stopRef?: React.MutableRefObject<(() => void) | null>;
  onComplete: (draft: Draft) => void;
  onCancel: () => void;
};

const BAR_COUNT = 18;

export function Recording({ maxSec, commands, autoSave, stopRef, onComplete, onCancel }: Props) {
  const { t, locale } = useI18n();
  const recorder = useRecorder({ maxSec, lang: locale === 'en' ? 'en-US' : 'ja-JP' });

  useEffect(() => {
    if (stopRef) stopRef.current = () => recorder.stop();
    return () => { if (stopRef) stopRef.current = null; };
  }, [stopRef, recorder]);

  useEffect(() => {
    recorder.start().catch(() => {});
    // recorder.start is stable (memoized); run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(
    () => parseTranscript(recorder.transcript, commands),
    [recorder.transcript, commands],
  );

  useEffect(() => {
    if (recorder.status === 'stopped') {
      onComplete({
        title: parsed.title || autoTitle(parsed.body),
        body: parsed.body,
        durationSec: recorder.elapsedSec,
        tagPhrase: parsed.tagPhrase || undefined,
        autoSave,
      });
    }
  }, [recorder.status, recorder.elapsedSec, parsed, autoSave, onComplete]);

  useEffect(() => {
    if (parsed.saveTriggered && recorder.status === 'recording') {
      recorder.stop();
    }
    if (parsed.cancelTriggered && recorder.status === 'recording') {
      recorder.stop();
      onCancel();
    }
  }, [parsed.saveTriggered, parsed.cancelTriggered, recorder, onCancel]);

  const remaining = Math.max(0, maxSec - recorder.elapsedSec);
  const progress = Math.min(1, recorder.elapsedSec / maxSec);

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <div className="flex justify-between items-center px-5 mt-2">
        <div className="flex items-center gap-1.5 bg-accent/10 border border-accent rounded-full px-2.5 py-1">
          <span className="block w-1.5 h-1.5 rounded-full bg-accent rec-dot" />
          <span className="font-mono text-[9px] text-accent">{t.recording.rec}</span>
        </div>
        <div className="font-mono text-[11px] text-text2">
          {formatTime(recorder.elapsedSec)}
        </div>
      </div>

      <div className="text-center mt-3 px-5">
        <div className="font-mono text-[36px] font-bold text-accent leading-none">
          {remaining}
        </div>
        <div className="font-mono text-[9px] text-text3 tracking-[2px] mt-1">
          {t.recording.secondsLeft}
        </div>
      </div>

      <div className="px-5 mt-3">
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-[3px] h-[44px] px-5 mt-2">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <Bar key={i} index={i} level={recorder.level} active={recorder.status === 'recording'} />
        ))}
      </div>

      {parsed.title && (
        <div className="mx-5 bg-accent/10 border border-accent/30 rounded-lg px-3 py-1.5 text-[9px] text-accent">
          {t.recording.titleSet(parsed.title)}
        </div>
      )}
      {parsed.tagPhrase && (
        <div className="mx-5 bg-info/10 border border-info/30 rounded-lg px-3 py-1.5 text-[9px] text-info">
          🏷 {parsed.tagPhrase}
        </div>
      )}

      <div className="mx-5 mt-2 flex-1 bg-surface2 border border-border rounded-xl p-3 overflow-hidden flex flex-col">
        <AutoScroll>
          <div className="text-[11px] leading-[1.75] text-text1">
            {parsed.title && (
              <div className="mb-2">
                <span className="text-text3 text-[9px]">{t.recording.titleLabel}</span>
                {parsed.title}
              </div>
            )}
            {parsed.body || (
              <span className="text-text3">
                {t.recording.speakStart}{' '}
                <span className="text-[9px]">
                  {t.recording.titleTrigger(commands.setTitle)}
                </span>
              </span>
            )}
            {recorder.status === 'recording' && (
              <span className="inline-block w-[2px] h-3 bg-accent ml-1 align-middle animate-pulse" />
            )}
          </div>
        </AutoScroll>
      </div>

      {recorder.errorMessage && (
        <div className="mx-5 mt-2 text-[9px] text-accent">
          ⚠ {recorder.errorMessage}
        </div>
      )}

      <div className="text-[9px] text-text3 tracking-[1px] text-center pb-3">
        {t.recording.saveTrigger(commands.save)}
      </div>
    </>
  );
}

function Bar({ index, level, active }: { index: number; level: number; active: boolean }) {
  const phase = (Math.sin(Date.now() / 200 + index) + 1) / 2;
  const baseHeight = 8 + (active ? level * 36 * phase : 4);
  const height = Math.max(6, Math.min(42, baseHeight));
  return (
    <span
      className={`block w-[3px] rounded-sm bg-accent ${active ? 'wave-bar' : 'opacity-40'}`}
      style={{
        height: `${height}px`,
        animationDelay: `${index * 0.06}s`,
        opacity: active ? 0.5 + level * 0.5 : 0.3,
      }}
    />
  );
}

function AutoScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  });
  return (
    <div ref={ref} className="flex-1 overflow-y-auto scroll-area">
      {children}
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad(m)}:${pad(s)}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
function autoTitle(body: string): string {
  if (!body) return '無題のメモ';
  const first = body.split(/[。.！!？?\n]/)[0].trim();
  return first ? first.slice(0, 20) : '無題のメモ';
}
