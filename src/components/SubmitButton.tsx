import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

export default function SubmitButton({
  disabled,
  loading,
  className = "w-full",
  children,
}: Props) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition ${className} ${
        disabled
          ? "cursor-not-allowed bg-[#4a4c63] text-white/60"
          : "bg-accent text-white hover:bg-accent-hover"
      } ${loading ? "cursor-wait opacity-80" : ""}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}