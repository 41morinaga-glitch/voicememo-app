import { useI18n } from '../../i18n/I18nContext';

type MenuItem = {
  key: string;
  icon: string;
  label: string;
  action?: () => void;
  muted?: boolean;
  separatorAfter?: boolean;
};

type Props = {
  onClose: () => void;
  onNavigate: (target: 'voiceCommands' | 'settings' | 'cloud' | 'trash') => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenGuide?: () => void;
};

export function Menu({ onClose, onNavigate, theme, onToggleTheme, onOpenGuide }: Props) {
  const { t } = useI18n();
  const themeName = theme === 'light' ? t.settings.light : t.settings.dark;
  const items: MenuItem[] = [
    {
      key: 'voiceCommands',
      icon: '🎙',
      label: t.menu.voiceCommands,
      action: () => onNavigate('voiceCommands'),
    },
    {
      key: 'recTime',
      icon: '⏱',
      label: t.menu.recordingTime,
      action: () => onNavigate('settings'),
    },
    {
      key: 'cloud',
      icon: '☁️',
      label: t.menu.cloud,
      action: () => onNavigate('cloud'),
      separatorAfter: true,
    },
    {
      key: 'lang',
      icon: '🌐',
      label: t.menu.language,
      action: () => onNavigate('settings'),
    },
    {
      key: 'notify',
      icon: '🔔',
      label: t.menu.notify,
      action: () => onNavigate('settings'),
      separatorAfter: true,
    },
    {
      key: 'trash',
      icon: '🗑',
      label: t.nav.trash,
      action: () => onNavigate('trash'),
    },
    {
      key: 'pdfSettings',
      icon: '📄',
      label: t.menu.pdf,
      action: () => onNavigate('settings'),
      separatorAfter: true,
    },
    {
      key: 'theme',
      icon: theme === 'light' ? '☀️' : '🌙',
      label: t.menu.theme(themeName),
      action: onToggleTheme,
    },
    {
      key: 'guide',
      icon: '📖',
      label: t.menu.guide,
      action: onOpenGuide,
      separatorAfter: true,
    },
    {
      key: 'version',
      icon: 'ℹ',
      label: t.menu.version,
      muted: true,
    },
  ];

  return (
    <div className="absolute inset-0 z-30 flex">
      <button
        type="button"
        onClick={onClose}
        aria-label={t.guide.close}
        className="flex-1 bg-black/45"
      />
      <aside className="w-[78%] h-full bg-surface border-l border-border flex flex-col px-4 pt-11 pb-5 gap-0.5">
        <div className="text-[11px] font-bold text-text1 mb-2 pb-2.5 border-b border-border">
          🎙 {t.app.name}
        </div>
        {items.map((it) => (
          <div key={it.key}>
            <button
              type="button"
              onClick={it.action}
              className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-[11px] text-left min-h-[44px] active:bg-border/40 ${
                it.muted ? 'text-text3' : 'text-text2'
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-surface2 border border-border flex items-center justify-center text-[12px] flex-shrink-0">
                {it.icon}
              </span>
              {it.label}
            </button>
            {it.separatorAfter && <div className="h-px bg-border my-1.5" />}
          </div>
        ))}
      </aside>
    </div>
  );
}
