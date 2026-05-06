import { useEffect } from 'react';

type Props = {
  message: string;
  kind?: 'success' | 'info' | 'warn';
  durationMs?: number;
  onClose: () => void;
};

export function Toast({ message, kind = 'success', durationMs = 2200, onClose }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onClose]);

  const palette = {
    success: 'bg-ok/15 border-ok/40 text-ok',
    info: 'bg-info/15 border-info/40 text-info',
    warn: 'bg-warn/15 border-warn/40 text-warn',
  }[kind];

  return (
    <div className="absolute top-12 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div
        className={`${palette} border rounded-full px-4 py-2 text-[11px] font-medium shadow-lg pointer-events-auto`}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
