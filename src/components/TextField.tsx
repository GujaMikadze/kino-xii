import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Check, CircleAlert } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  valid?: boolean;
};

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, valid, className = "", ...rest },
  ref,
) {
  const id = useId();

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
          className={`h-12 w-full rounded-xl border bg-field px-4 pr-10 text-sm text-white outline-none placeholder:text-white/40 ${
            error
              ? "border-accent bg-accent/10"
              : "border-transparent focus:border-white/30"
          }`}
          {...rest}
        />
        {error && (
          <CircleAlert size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent" />
        )}
        {!error && valid && (
          <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  );
});

export default TextField;