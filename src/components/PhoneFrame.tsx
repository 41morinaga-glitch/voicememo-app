import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col">
      {children}
    </div>
  );
}
