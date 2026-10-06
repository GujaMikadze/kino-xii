import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import { ApiError } from "../api/client";
import TextField from "../components/TextField";
import SubmitButton from "../components/SubmitButton";
import { applyApiError } from "../lib/FormErrors";
import { useAuth } from "./useAuth";

const schema = z
  .object({
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(3, "At least 3 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export default function RegisterForm() {
  const { register: registerUser, switchAuthModal } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const onPickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Use a JPG, PNG or WEBP image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setAvatarError("Image must be 2MB or smaller");
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setAvatarError(undefined);
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: Values) => {
    const form = new FormData();
    form.append("username", values.username);
    form.append("email", values.email);
    form.append("password", values.password);
    form.append("password_confirmation", values.confirmPassword);
    if (avatar) form.append("avatar", avatar);

    try {
      await registerUser(form);
    } catch (e) {
      if (e instanceof ApiError && e.errors?.avatar) {
        setAvatarError(e.errors.avatar[0]);
      }
      applyApiError(e, setError, ["username", "email", "password"]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Upload avatar"
          onClick={() => fileRef.current?.click()}
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-field text-white/70 hover:bg-white/10"
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <Upload size={16} />
          )}
        </button>
        <div>
          <p className="text-sm font-bold">Upload avatar (optional)</p>
          <p className="text-xs text-white/60">JPG, PNG or WEBP</p>
          {avatarError && <p className="text-xs text-accent">{avatarError}</p>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onPickAvatar}
        />
      </div>

      <TextField
        label="Username"
        placeholder="User"
        autoComplete="username"
        error={errors.username?.message}
        valid={touchedFields.username && !errors.username}
        {...register("username")}
      />
      <TextField
        label="Email"
        type="email"
        placeholder="example@gmail.com"
        autoComplete="email"
        error={errors.email?.message}
        valid={touchedFields.email && !errors.email}
        {...register("email")}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          valid={touchedFields.password && !errors.password}
          {...register("password")}
        />
        <TextField
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          valid={touchedFields.confirmPassword && !errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </div>

      {errors.root?.server && (
        <p className="text-xs text-accent">{errors.root.server.message}</p>
      )}

      <SubmitButton disabled={!isValid} loading={isSubmitting}>
        Sign up
      </SubmitButton>

      <p className="text-center text-xs text-white/70">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => switchAuthModal("login")}
          className="font-bold text-accent"
        >
          Log in
        </button>
      </p>
    </form>
  );
}