'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/schemas/auth.schemas';
import { useResetPassword } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      nuevaContrasena: '',
      confirmarContrasena: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'No se encontró un token válido en la URL',
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        nuevaContrasena: data.nuevaContrasena,
      });
      
      // Mostrar algo o redirigir en 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  if (!token && !isSubmitSuccessful) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Enlace inválido</h1>
        <p className="text-zinc-500 text-sm">
          Este enlace de recuperación no es válido o ha expirado.
        </p>
        <Link href="/auth/forgot-password">
          <Button variant="outline">Volver a intentar</Button>
        </Link>
      </div>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-green-600">¡Contraseña actualizada!</h1>
        <p className="text-zinc-500 text-sm">
          Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.
        </p>
        <Link href="/auth/login">
          <Button>Ir al login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form className={cn('flex flex-col gap-6')} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
          <p className="text-zinc-500 text-sm text-balance">
            Ingresa tu nueva contraseña para tu cuenta
          </p>
        </div>

        {errors.root && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="nuevaContrasena">Nueva contraseña</FieldLabel>
          <Input
            id="nuevaContrasena"
            type="password"
            placeholder="********"
            {...register('nuevaContrasena')}
            aria-invalid={errors.nuevaContrasena ? 'true' : 'false'}
          />
          {errors.nuevaContrasena && (
            <p className="text-sm text-red-700 mt-1">{errors.nuevaContrasena.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmarContrasena">Confirmar contraseña</FieldLabel>
          <Input
            id="confirmarContrasena"
            type="password"
            placeholder="********"
            {...register('confirmarContrasena')}
            aria-invalid={errors.confirmarContrasena ? 'true' : 'false'}
          />
          {errors.confirmarContrasena && (
            <p className="text-sm text-red-700 mt-1">{errors.confirmarContrasena.message}</p>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isSubmitting || resetPasswordMutation.isPending}
          >
            {isSubmitting || resetPasswordMutation.isPending
              ? 'Guardando...'
              : 'Guardar cambios'}
          </Button>
        </Field>

        <div className="text-center text-sm text-zinc-600">
          <Link href="/auth/login" className="font-medium hover:underline">
            Volver al login
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<div className="text-center text-zinc-500">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
