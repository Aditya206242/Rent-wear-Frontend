import { z } from "zod";

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter phone number in international format, e.g. +14155550100."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const otpSchema = z.object({
  phone: z.string().regex(phoneRegex, "Missing or invalid phone number."),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
