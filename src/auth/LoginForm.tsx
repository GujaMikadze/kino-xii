import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextField from "../components/TextField";
import SubmitButton from "../components/SubmitButton";
import { applyApiError } from "../lib/FormErrors";
import { useAuth } from "./useAuth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(3, "At least 3 characters"),
});

type Values = z.infer<typeof schema>;

export default function LoginForm() {
  const { login, switchAuthModal } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched", // შეცდომა ჩანს ველის დატოვებისას (blur)
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    try {
      await login(values.email, values.password);
    } catch (e) {
      applyApiError(e, setError, ["email", "password"]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        label="Email"
        type="email"
        placeholder="example@gmail.com"
        autoComplete="email"
        error={errors.email?.message}
        valid={touchedFields.email && !errors.email}
        {...register("email")}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        valid={touchedFields.password && !errors.password}
        {...register("password")}
      />

      {errors.root?.server && (
        <p className="text-xs text-accent">{errors.root.server.message}</p>
      )}

      <SubmitButton disabled={!isValid} loading={isSubmitting}>
        Log in
      </SubmitButton>

      <p className="text-center text-xs text-white/70">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => switchAuthModal("register")}
          className="font-bold text-accent"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}