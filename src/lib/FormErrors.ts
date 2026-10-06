import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "../api/client";

export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
) {
  if (error instanceof ApiError) {
    if (error.errors) {
      let matched = false;
      for (const [key, messages] of Object.entries(error.errors)) {
        if ((fields as string[]).includes(key)) {
          setError(key as Path<T>, { type: "server", message: messages[0] });
          matched = true;
        }
      }
      if (matched) return;
    }
    setError("root.server", { message: error.message });
    return;
  }
  setError("root.server", { message: "Network error. Please try again." });
}