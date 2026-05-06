import { useI18n } from '../i18n/I18nContext';

type NavKey = 'home' | 'tags';

type Props = {
  active: NavKey;
  onChange: (key: NavKey) => void;
  recordButton: React.ReactNode;
};

export function BottomNav({ active, onChange, recordButton }: Props) {
  const { t } = useI18n();

  const navBtn = (key: NavKey, icon: string, label: string) => {
    const isActive = key === active;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className="flex flex-col items-center gap-1 px-6 py-1 flex-1"
      >
        <span className={`text-base leading-none ${isActive ? 'text-accent' : 'text-text3'}`}>
          {icon}
        </span>
        <span className={`font-mono text-[16px] tracking-[1px] ${isActive ? 'text-accent' : 'text-text3'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="flex items-center border-t border-border pt-2 pb-4 flex-shrink-0 min-h-[88px]">
      <div className="flex-1 flex justify-center">{navBtn('home', '⌂', t.nav.home)}</div>
      <div className="flex-1 flex justify-center">{navBtn('tags', '🏷', t.nav.tags)}</div>
      <div className="flex-1 flex items-center justify-center">{recordButton}</div>
    </nav>
  );
}
