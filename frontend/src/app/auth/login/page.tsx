'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schemas';
import { useLogin } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      contrasena: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync({
        correo: data.correo,
        contrasena: data.contrasena,
      });

      localStorage.setItem('access_token', result.accessToken);
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <AuthSplitLayout>
      <form
        className={cn('flex flex-col gap-6')}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Sistema de Gestión de Historias Clínicas
            </h1>
            <h2 className="text-lg font-semibold text-zinc-700 mt-2">
              Inicia sesión en tu cuenta
            </h2>
            <p className="text-zinc-500 text-sm">
              Ingresa tu correo electrónico para iniciar sesión
            </p>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
            <Input
              id="correo"
              type="email"
              placeholder="usuario@ejemplo.com"
              {...register('correo')}
              aria-invalid={errors.correo ? 'true' : 'false'}
            />
            {errors.correo && (
              <p className="text-sm text-red-700 mt-1">{errors.correo.message}</p>
            )}
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="pr-10"
                {...register('contrasena')}
                aria-invalid={errors.contrasena ? 'true' : 'false'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </Button>
            </div>
            {errors.contrasena && (
              <p className="text-sm text-red-700 mt-1">
                {errors.contrasena.message}
              </p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting || loginMutation.isPending}>
              {isSubmitting || loginMutation.isPending
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </Button>
          </Field>

          <div className="text-center text-sm text-zinc-600">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="font-medium hover:underline">
              Regístrate
            </Link>
          </div>
        </FieldGroup>
      </form>
    </AuthSplitLayout>
  );
}
