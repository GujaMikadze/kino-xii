import type { ReactNode } from "react";

type Props = { title: string; text?: string; children?: ReactNode };

export default function EmptyState({ title, text, children }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <p className="text-sm font-bold">{title}</p>
      {text && <p className="mt-1 text-xs text-white/60">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}