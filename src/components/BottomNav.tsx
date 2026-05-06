import { useI18n } from '../i18n/I18nContext';

type NavKey = 'home' | 'tags' | 'trash';

type Props = {
  active: NavKey;
  onChange: (key: NavKey) => void;
};

export function BottomNav({ active, onChange }: Props) {
  const { t } = useI18n();
  const items: { key: NavKey; label: string; icon: string }[] = [
    { key: 'home', label: t.nav.home, icon: '⌂' },
    { key: 'tags', label: t.nav.tags, icon: '🏷' },
    { key: 'trash', label: t.nav.trash, icon: '🗑' },
  ];
  return (
    <nav className="flex justify-around border-t border-border pt-2 pb-2 flex-shrink-0">
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <span
              className={`text-base leading-none ${
                isActive ? 'text-accent' : 'text-text3'
              }`}
            >
              {it.icon}
            </span>
            <span
              className={`font-mono text-[8px] tracking-[1px] ${
                isActive ? 'text-accent' : 'text-text3'
              }`}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
