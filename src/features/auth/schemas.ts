import { z } from "zod";

export const passwordSchema = z
  .string()
  .refine(
    (value) => new TextEncoder().encode(value).length >= 8,
    "Password must be at least 8 bytes",
  )
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be no more than 72 bytes",
  )
  .refine((value) => /\p{L}/u.test(value), "Password must contain a letter")
  .refine((value) => /\p{N}/u.test(value), "Password must contain a number");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: passwordSchema,
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or fewer"),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or fewer"),
  organization_name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(150, "Organization name must be 150 characters or fewer"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
