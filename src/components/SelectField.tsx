import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, error, className = "", children, ...rest },
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
        <select
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={`h-12 w-full appearance-none rounded-xl border bg-[#1E2031] px-4 pr-10 text-sm text-white outline-none ${
            error ? "border-accent bg-accent/10" : "border-transparent focus:border-white/30"
          }`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  );
});

export default SelectField;