import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a number');

export const registerBodySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
    password: passwordSchema,
    confirmPassword: z.string(),
    age: z.number({ error: 'Age must be a number' }).int().min(13, 'You must be at least 13').max(120),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
});

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const registerSchema = z.object({ body: registerBodySchema });
export const loginSchema = z.object({ body: loginBodySchema });
export const forgotPasswordSchema = z.object({ body: forgotPasswordBodySchema });
export const resetPasswordSchema = z.object({ body: resetPasswordBodySchema });

// Types inferred from the schemas: single source of truth for runtime + compile time.
export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;
