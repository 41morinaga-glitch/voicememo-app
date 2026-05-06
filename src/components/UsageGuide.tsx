import { useI18n } from '../i18n/I18nContext';

type Props = {
  onClose: () => void;
};

export function UsageGuide({ onClose }: Props) {
  const { t } = useI18n();
  return (
    <div className="absolute inset-0 z-30 flex">
      <button
        type="button"
        onClick={onClose}
        aria-label={t.guide.close}
        className="absolute inset-0 bg-black/45"
      />
      <div className="relative w-full h-full bg-bg flex flex-col">
        <div className="flex items-center justify-between px-5 pt-9 pb-3 border-b border-border">
          <h2 className="text-[14px] font-bold text-text1">{t.guide.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.guide.close}
            className="text-text2 text-[14px] px-2 py-1 min-h-[28px]"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-area px-5 py-3 flex flex-col gap-4">
          {t.guide.sections.map((sec) => (
            <section key={sec.title} className="flex flex-col gap-1.5">
              <h3 className="text-[12px] font-bold text-text1">{sec.title}</h3>
              <ul className="flex flex-col gap-1">
                {sec.items.map((it, i) => (
                  <li
                    key={i}
                    className="text-[10px] leading-relaxed text-text2 flex gap-1.5"
                  >
                    <span className="text-accent flex-shrink-0">·</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="text-[9px] text-text3 mt-2 text-center">
            {t.guide.version}
          </div>
        </div>
      </div>
    </div>
  );
}
