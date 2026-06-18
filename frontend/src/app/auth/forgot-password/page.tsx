'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/schemas/auth.schemas';
import { useForgotPassword } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      correo: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await forgotPasswordMutation.mutateAsync(data.correo);

      // Para pruebas, el backend puede devolver token. En prod se enviaría por email.
      if (result.token) {
        setValue('correo', data.correo);
        router.push(`/auth/reset-password?token=${result.token}`);
      }
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
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
            <p className="text-zinc-500 text-sm text-balance">
              Te enviaremos instrucciones para recuperar tu cuenta
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
            <Button
              type="submit"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
            >
              {isSubmitting || forgotPasswordMutation.isPending
                ? 'Enviando...'
                : 'Enviar'}
            </Button>
          </Field>

          <div className="text-center text-sm text-zinc-600">
            <Link href="/auth/login" className="font-medium hover:underline">
              Volver al login
            </Link>
          </div>
        </FieldGroup>
      </form>
    </AuthSplitLayout>
  );
}
