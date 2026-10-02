import { z } from "zod";
const required = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters.")
  .max(120);
export const contactSchema = z.object({
  name: required,
  company: z.string().max(120),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  type: z.enum([
    "General enquiry",
    "Product enquiry",
    "Service & maintenance",
    "Partnership",
  ]),
  location: required,
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (10 characters minimum).")
    .max(3000),
});
export type ContactValues = z.infer<typeof contactSchema>;
export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});
export const signupSchema = loginSchema.extend({
  fullName: required,
  company: required,
  phone: z.string().min(7).max(30),
  businessType: required,
  location: required,
  terms: z.boolean().refine((v) => v, "Please accept the terms to continue."),
});
