import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
    email: z.email('Introduce un correo válido').max(254).toLowerCase(),
    password: z
      .string()
      .min(10, 'La contraseña debe tener al menos 10 caracteres')
      .max(128, 'La contraseña no puede superar los 128 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email('Introduce un correo válido').max(254).toLowerCase(),
  password: z.string().min(1, 'Introduce tu contraseña'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
