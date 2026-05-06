import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  return (
    <div className="h-screen w-full bg-surface flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
