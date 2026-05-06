import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center p-4 sm:p-8">
      <div
        className="relative bg-surface rounded-[38px] border-2 border-border overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        style={{ width: 'min(100vw, 360px)', height: 'min(100vh, 760px)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-bg rounded-b-2xl z-20"
          aria-hidden
        />
        <div className="w-full h-full flex flex-col">{children}</div>
      </div>
    </div>
  );
}
