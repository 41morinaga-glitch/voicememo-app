type Props = {
  onClick?: () => void;
};

export function HamburgerIcon({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="メニュー"
      onClick={onClick}
      style={{ minWidth: 44, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
    >
      <svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-text1">
        <rect y="0" width="22" height="2.5" rx="1.25" />
        <rect y="6.75" width="22" height="2.5" rx="1.25" />
        <rect y="13.5" width="22" height="2.5" rx="1.25" />
      </svg>
    </button>
  );
}
