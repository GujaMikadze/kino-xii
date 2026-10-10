import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { SeatHold, Session, User } from "../../api/types";
import TextField from "../../components/TextField";
import { applyApiError } from "../../lib/FormErrors";
import { money } from "../../lib/money";
import { fullNameSchema, mobileSchema } from "../../lib/validation";
import StepTabs from "./StepTabs";
import { shortLine, ticketSummary } from "./utils";

const schema = z.object({
  fullName: fullNameSchema,
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  mobileNumber: mobileSchema,
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine((v) => v.replace(/\s/g, "").length === 16, "Card number must be 16 digits"),
  expiry: z
    .string()
    .min(1, "Expiry is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use the MM/YY format")
    .refine((v) => {
      const [mm, yy] = v.split("/").map(Number);
      const now = new Date();
      return 2000 + yy > now.getFullYear() ||
        (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1);
    }, "This card has expired"),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3}$/, "CVV must be 3 digits"),
});

export type CheckoutValues = z.infer<typeof schema>;

const formatCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const FIELDS = ["fullName", "email", "mobileNumber", "cardNumber", "expiry", "cvv"] as const;

type Props = {
  session: Session;
  hold: SeatHold;
  user: User;
  onBack: () => void;
  onPay: (values: CheckoutValues) => Promise<void>;
};

export default function CheckoutStep({ session, hold, user, onBack, onPay }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: user.fullName ?? "",
      email: user.email,
      mobileNumber: user.mobileNumber ?? "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const values = watch();
  const ok = (name: keyof CheckoutValues) => schema.shape[name].safeParse(values[name]).success;

  // ტექსტის მასკირება (ბარათი და ვადა) RHF-ის onChange-მდე
  const masked = (name: "cardNumber" | "expiry", format: (v: string) => string) => {
    const field = register(name);
    return {
      ...field,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = format(e.target.value);
        return field.onChange(e);
      },
    };
  };

  const submit = async (v: CheckoutValues) => {
    try {
      await onPay(v);
    } catch (e) {
      applyApiError(e, setError, [...FIELDS]);
    }
  };

  const disabled = !isValid || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid grid-cols-[minmax(0,1fr)_340px] gap-8"
    >
      <div>
        <StepTabs step="checkout" onSeats={onBack} />

        <div className="mt-5 space-y-4">
          <TextField
            label="Full Name"
            autoComplete="name"
            placeholder="e.g. Text"
            error={errors.fullName?.message}
            valid={ok("fullName")}
            {...register("fullName")}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="e.g. Text"
              error={errors.email?.message}
              valid={ok("email")}
              {...register("email")}
            />
            <TextField
              label="Mobile Number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="5XX XXX XXX"
              error={errors.mobileNumber?.message}
              valid={ok("mobileNumber")}
              {...register("mobileNumber")}
            />
          </div>

          <div className="border-t border-white/10 pt-4">
            <TextField
              label="Card Number"
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
              placeholder="e.g. 1234 4567 8901 2345"
              error={errors.cardNumber?.message}
              {...masked("cardNumber", formatCard)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              placeholder="e.g. 12/34"
              error={errors.expiry?.message}
              {...masked("expiry", formatExpiry)}
            />
            <TextField
              label="CVV"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={3}
              placeholder="e.g. 123"
              error={errors.cvv?.message}
              {...register("cvv")}
            />
          </div>

          {errors.root?.server && (
            <p role="alert" className="text-xs text-accent">
              {errors.root.server.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-[440px] flex-col">
        <h3 className="text-sm font-bold">Summary</h3>

        <div className="mt-3 rounded-xl bg-field/70 p-4 text-xs">
          <p className="text-sm font-extrabold">{session.movie.title}</p>
          <p className="mt-1 text-white/50">{shortLine(session)}</p>
          <dl className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Seats</dt>
              <dd className="font-bold">{hold.seats.map((s) => s.code).join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Tickets</dt>
              <dd className="font-bold">
                {ticketSummary(hold.seats.map((s) => s.ticketType.name))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[11px] font-bold tracking-wider text-white/50">SUBTOTAL</span>
          <span className="text-2xl font-extrabold">{money(hold.subtotal)}</span>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={`mt-3 flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
            disabled
              ? "cursor-not-allowed bg-[#4a4c63] text-white/60"
              : "bg-accent text-white hover:bg-accent-hover"
          } ${isSubmitting ? "cursor-wait" : ""}`}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Pay: Complete order
        </button>
      </div>
    </form>
  );
}