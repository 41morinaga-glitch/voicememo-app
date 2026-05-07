import { useI18n } from '../../i18n/I18nContext';
import type { Locale } from '../../i18n/strings';
import type { Settings as SettingsType } from '../../types';

type Props = {
  settings: SettingsType;
  onChange: (next: SettingsType) => void;
  onBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
};

const REC_TIMES = [15, 30, 60, 120];
const PURGE_DAYS = [7, 14, 30, 60];

export function Settings({ settings, onChange, onBack, theme, onToggleTheme }: Props) {
  const { t, locale, setLocale } = useI18n();

  const transcriptLangs = [
    { code: 'ja-JP', label: locale === 'ja' ? '日本語' : 'Japanese' },
    { code: 'en-US', label: locale === 'ja' ? '英語' : 'English' },
    { code: 'zh-CN', label: locale === 'ja' ? '中国語' : 'Chinese' },
  ];

  const cycle = <T,>(current: T, options: T[]): T => {
    const i = options.indexOf(current);
    return options[(i + 1) % options.length];
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

      <div className="px-5 mt-2 text-[13px] font-bold text-text1">{t.settings.title}</div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-3 flex flex-col gap-1.5 pb-4">
        <SectionLabel>{t.settings.secRecording}</SectionLabel>
        <Row
          name={t.settings.recTime}
          value={t.settings.secs(settings.maxRecordingSec)}
          onTap={() =>
            onChange({
              ...settings,
              maxRecordingSec: cycle(settings.maxRecordingSec, REC_TIMES),
            })
          }
        />
        <Row
          name={t.settings.transcriptLang}
          value={transcriptLangs.find((l) => l.code === settings.language)?.label ?? settings.language}
          onTap={() =>
            onChange({
              ...settings,
              language: cycle(
                settings.language,
                transcriptLangs.map((l) => l.code),
              ),
            })
          }
        />

        <SectionLabel>{t.settings.secNotify}</SectionLabel>
        <ToggleRow
          name={t.settings.soundOnDone}
          value={settings.notifySound ? t.settings.on : t.settings.off}
          on={settings.notifySound}
          onToggle={() => onChange({ ...settings, notifySound: !settings.notifySound })}
        />
        <ToggleRow
          name={t.settings.vibrate}
          value={settings.vibrate ? t.settings.on : t.settings.off}
          on={settings.vibrate}
          onToggle={() => onChange({ ...settings, vibrate: !settings.vibrate })}
        />

        <SectionLabel>{t.settings.secDisplay}</SectionLabel>
        <Row
          name={t.settings.theme}
          value={theme === 'light' ? t.settings.light : t.settings.dark}
          onTap={onToggleTheme}
        />
        <Row
          name="UI Language"
          value={locale === 'ja' ? '日本語' : 'English'}
          onTap={() => setLocale((locale === 'ja' ? 'en' : 'ja') as Locale)}
        />

        <SectionLabel>{t.settings.secData}</SectionLabel>
        <Row
          name={t.settings.trashDays}
          value={t.settings.days(settings.trashAutoDeleteDays)}
          onTap={() =>
            onChange({
              ...settings,
              trashAutoDeleteDays: cycle(settings.trashAutoDeleteDays, PURGE_DAYS),
            })
          }
        />
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[8px] tracking-[2px] text-text3 uppercase mt-3 mb-0.5">
      {children}
    </div>
  );
}

function Row({
  name,
  value,
  onTap,
}: {
  name: string;
  value: string;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex items-center justify-between px-3 py-2.5 bg-surface2 border border-border rounded-lg min-h-[44px] active:bg-border/40"
    >
      <div className="flex flex-col gap-0.5 text-left">
        <div className="text-[11px] text-text1">{name}</div>
        <div className="font-mono text-[8px] text-text3">{value}</div>
      </div>
      <span className="text-[12px] text-text3">›</span>
    </button>
  );
}

function ToggleRow({
  name,
  value,
  on,
  onToggle,
}: {
  name: string;
  value: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between px-3 py-2.5 bg-surface2 border border-border rounded-lg min-h-[44px] active:bg-border/40"
    >
      <div className="flex flex-col gap-0.5 text-left">
        <div className="text-[11px] text-text1">{name}</div>
        <div className="font-mono text-[8px] text-text3">{value}</div>
      </div>
      <span
        className={`relative w-7 h-[15px] rounded-full transition-colors flex-shrink-0 ${
          on ? 'bg-accent' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-[2px] w-[11px] h-[11px] bg-white rounded-full transition-all ${
            on ? 'right-[2px]' : 'left-[2px]'
          }`}
        />
      </span>
    </button>
  );
}
