import { z } from "zod";

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must not exceed 50 characters");

export const mobileSchema = z.string().superRefine((raw, ctx) => {
  const v = raw.replace(/\s/g, "");
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });

  if (!v) return fail("Mobile number is required");
  if (!/^\d+$/.test(v))
    return fail("Please enter a valid Georgian mobile number (9 digits starting with 5)");
  if (!v.startsWith("5")) return fail("Georgian mobile numbers must start with 5");
  if (v.length !== 9) return fail("Mobile number must be exactly 9 digits");
});