type Props = {
  recordButton: React.ReactNode;
};

export function BottomNav({ recordButton }: Props) {
  return (
    <nav
      className="flex items-center justify-center border-t border-border pt-2 flex-shrink-0"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-center pb-2">{recordButton}</div>
    </nav>
  );
}
