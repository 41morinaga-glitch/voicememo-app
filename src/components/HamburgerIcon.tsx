type Props = {
  onClick?: () => void;
};

export function HamburgerIcon({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="メニュー"
      onClick={onClick}
      className="flex flex-col gap-[3px] p-1"
    >
      <span className="block w-[18px] h-[2px] bg-text2 rounded-sm" />
      <span className="block w-[18px] h-[2px] bg-text2 rounded-sm" />
      <span className="block w-[18px] h-[2px] bg-text2 rounded-sm" />
    </button>
  );
}
