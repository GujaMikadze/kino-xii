import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  hideHeader?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  hideHeader,
  className = "w-[440px]",
  children,
}: Props) {
  const downOnOverlay = useRef(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const closeButton = (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="rounded-full p-1 text-white/80 hover:bg-white/10"
    >
      <X size={18} />
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101010]/30 backdrop-blur-[10px]"
      onMouseDown={(e) => {
        downOnOverlay.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (downOnOverlay.current && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-[1.75rem] bg-bg p-8 shadow-2xl ${className}`}
      >
        {hideHeader ? (
          <div className="absolute right-4 top-4">{closeButton}</div>
        ) : (
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold">{title}</h2>
              {subtitle && <p className="mt-2 text-xs text-[#A9A9A9]">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {headerExtra}
              {closeButton}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}