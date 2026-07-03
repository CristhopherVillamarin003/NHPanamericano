'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schemas';
import { useRegister } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      nombres: '',
      apellidos: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync({
        correo: data.correo,
        contrasena: data.contrasena,
        nombres: data.nombres,
        apellidos: data.apellidos,
      });

      localStorage.setItem('access_token', result.accessToken);
      if (result.usuario && result.usuario.email) {
        localStorage.setItem('user_email', result.usuario.email);
      }
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
      <form className={cn('flex flex-col gap-6')} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Sistema de Gestión de Historias Clínicas
            </h1>
            <h2 className="text-lg font-semibold text-zinc-700 mt-2">
              Crea tu cuenta
            </h2>
            <p className="text-zinc-500 text-sm">
              Regístrate con tu correo y una contraseña
            </p>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="nombres">Nombres</FieldLabel>
              <Input id="nombres" type="text" {...register('nombres')} />
              {errors.nombres && (
                <p className="text-sm text-red-700 mt-1">{errors.nombres.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="apellidos">Apellidos</FieldLabel>
              <Input id="apellidos" type="text" {...register('apellidos')} />
              {errors.apellidos && (
                <p className="text-sm text-red-700 mt-1">
                  {errors.apellidos.message}
                </p>
              )}
            </Field>
          </div>

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
            <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
            <Input
              id="contrasena"
              type="password"
              autoComplete="new-password"
              {...register('contrasena')}
              aria-invalid={errors.contrasena ? 'true' : 'false'}
            />
            {errors.contrasena && (
              <p className="text-sm text-red-700 mt-1">
                {errors.contrasena.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmarContrasena">Confirmar contraseña</FieldLabel>
            <Input
              id="confirmarContrasena"
              type="password"
              autoComplete="new-password"
              {...register('confirmarContrasena')}
              aria-invalid={errors.confirmarContrasena ? 'true' : 'false'}
            />
            {errors.confirmarContrasena && (
              <p className="text-sm text-red-700 mt-1">
                {errors.confirmarContrasena.message}
              </p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting || registerMutation.isPending}>
              {isSubmitting || registerMutation.isPending
                ? 'Creando cuenta...'
                : 'Registrarme'}
            </Button>
          </Field>

          <div className="text-center text-sm text-zinc-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>
        </FieldGroup>
      </form>
    </AuthSplitLayout>
  );
}
