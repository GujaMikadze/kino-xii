import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Check, CircleAlert } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  valid?: boolean;
  hint?: string;
  icon?: React.ReactNode;
};

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, valid, hint, icon, className = "", ...rest },
  ref,
) {
  const id = useId();
  const iconClass = "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2";


  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-2 block text-xs font-semibold ${error ? "text-accent" : "text-white"}`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={`h-12 w-full rounded-xl border bg-[#1E2031] px-4 pr-10 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:text-white/50 ${
            error
              ? "border-accent bg-accent/10"
              : "border-transparent focus:border-white/30"
          }`}
          {...rest}
        />
        {icon ? (
          <span className={`${iconClass} ${error ? "text-accent" : "text-white/70"}`}>
            {icon}
          </span>
        ) : error ? (
          <CircleAlert size={16} className={`${iconClass} text-accent`} />
        ) : valid ? (
          <Check size={16} className={`${iconClass} text-success`} />
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-accent">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-white/50">{hint}</p>
      ) : null}
    </div>
  );
});

export default TextField;