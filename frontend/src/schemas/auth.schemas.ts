import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    correo: z.string().email('Ingresa un correo válido'),
    contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarContrasena: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    path: ['confirmarContrasena'],
    message: 'Las contraseñas no coinciden',
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    nuevaContrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarContrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
    path: ['confirmarContrasena'],
    message: 'Las contraseñas no coinciden',
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
