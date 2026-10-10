import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { api } from "../../api/client";
import type { ApiResponse, User } from "../../api/types";
import { useAuth } from "../../auth/useAuth";
import ErrorState from "../../components/ErrorState";
import SelectField from "../../components/SelectField";
import Skeleton from "../../components/Skeleton";
import SubmitButton from "../../components/SubmitButton";
import TextField from "../../components/TextField";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { applyApiError } from "../../lib/FormErrors";
import CalendarIcon from "../../components/icons/CalendarIcon";


const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),

  mobileNumber: z.string().superRefine((raw, ctx) => {
    const v = raw.replace(/\s/g, ""); // "555 123 456" და "555123456" ორივე მისაღებია
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });

    if (!v) return fail("Mobile number is required");
    if (!/^\d+$/.test(v))
      return fail("Please enter a valid Georgian mobile number (9 digits starting with 5)");
    if (!v.startsWith("5")) return fail("Georgian mobile numbers must start with 5");
    if (v.length !== 9) return fail("Mobile number must be exactly 9 digits");
  }),

  dateOfBirth: z.string().superRefine((v, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });

    if (!v) return fail("Date of birth is required");
    const dob = new Date(`${v}T00:00:00`);
    if (Number.isNaN(dob.getTime()) || dob > new Date())
      return fail("Please enter a valid date of birth");

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 12);
    if (dob > cutoff) fail("You must be at least 12 years old to create an account");
  }),

  preferredVenueId: z.string(),
});

type Values = z.infer<typeof schema>;

const toValues = (u: User): Values => ({
  fullName: u.fullName ?? "",
  mobileNumber: u.mobileNumber ?? "",
  dateOfBirth: u.dateOfBirth ?? "",
  preferredVenueId: u.preferredVenue ? String(u.preferredVenue.id) : "",
});

function EligibilityNotice({ age }: { age: number | null }) {
  if (age === null) return null;

  const text =
    age < 16
      ? "you cannot buy tickets for 16+ or 18+ titles"
      : age < 18
        ? "you cannot buy tickets for 18+ titles"
        : "you can buy tickets for all age ratings";

  return (
    <p className="rounded-xl bg-white/5 px-4 py-3 text-xs text-white/70">
      You are {age}, {text}.
    </p>
  );
}

export default function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const { data: options, isLoading, isError, refetch } = useFilterOptions();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, touchedFields, isDirty, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: toValues(user),
  });

  const onSubmit = async (values: Values) => {
    const form = new FormData();
    form.append("fullName", values.fullName.trim());
    form.append("mobileNumber", values.mobileNumber.replace(/\s/g, ""));
    form.append("dateOfBirth", values.dateOfBirth);
    form.append("preferredVenueId", values.preferredVenueId);

    try {
      const res = await api<ApiResponse<User>>("/profile", {
        method: "PUT",
        body: form,
      });
      setUser(res.data);
      reset(toValues(res.data));
      setSaved(true);
    } catch (e) {
      setSaved(false);
      applyApiError(e, setError, [
        "fullName",
        "mobileNumber",
        "dateOfBirth",
        "preferredVenueId",
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[620px] space-y-5" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <ErrorState message="Couldn't load the form" onRetry={refetch} />;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-220 space-y-5"
    >
      {user.profileComplete ? (
        <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3 text-sm font-bold text-success">
          Profile Complete <Check size={16} />
        </div>
      ) : (
        <div className="rounded-xl bg-warning/10 px-4 py-3 text-sm font-bold text-warning">
          Please complete your profile to enable booking.
        </div>
      )}

      <TextField
        label="Full name"
        autoComplete="name"
        placeholder="e.g. Text"
        error={errors.fullName?.message}
        valid={touchedFields.fullName && !errors.fullName}
        {...register("fullName")}
      />

      <TextField
        label="Email"
        type="email"
        value={user.email}
        disabled
        readOnly
        hint="Set at registration and cannot be changed"
      />

      <TextField
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="5XX XXX XXX"
        error={errors.mobileNumber?.message}
        valid={touchedFields.mobileNumber && !errors.mobileNumber}
        {...register("mobileNumber")}
      />

      <TextField
        label="Date of birth"
        type="date"
        max={today}
        icon={<CalendarIcon />}
        error={errors.dateOfBirth?.message}
        {...register("dateOfBirth")}
      />

      <SelectField
        label="Preferred Venue (Optional)"
        error={errors.preferredVenueId?.message}
        {...register("preferredVenueId")}
      >
        <option value="">None</option>
        {options?.venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}, {v.city}
          </option>
        ))}
      </SelectField>

      <EligibilityNotice age={user.age} />

      {errors.root?.server && (
        <p className="text-xs text-accent">{errors.root.server.message}</p>
      )}

      <div className="flex items-center gap-4">
        <SubmitButton
          disabled={!isDirty || !isValid}
          loading={isSubmitting}
          className="px-8"
        >
          Save changes
        </SubmitButton>
        {saved && !isDirty && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-success">
            <Check size={14} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}