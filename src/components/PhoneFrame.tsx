import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center md:p-8">
      <div className="relative w-full max-w-[420px] md:h-[820px] bg-surface flex flex-col overflow-hidden md:rounded-[2rem] md:shadow-2xl" style={{ height: '100dvh' }}>
        {children}
      </div>
    </div>
  );
}
