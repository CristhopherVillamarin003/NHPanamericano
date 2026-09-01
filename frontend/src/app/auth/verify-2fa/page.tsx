'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useVerifyMfa } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { setSessionCookie } from '@/lib/utils';

const verifyMfaSchema = z.object({
  code: z.string().length(6, 'El código debe tener exactamente 6 dígitos'),
});

type VerifyMfaFormData = z.infer<typeof verifyMfaSchema>;

function VerifyMfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [selectedRole, setSelectedRole] = useState<string>('hospitalizacion');
  const verifyMfaMutation = useVerifyMfa();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VerifyMfaFormData>({
    resolver: zodResolver(verifyMfaSchema),
    defaultValues: {
      code: '',
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Token no proporcionado</h1>
        <p className="text-zinc-500 text-sm">Por favor, inicia sesión de nuevo.</p>
        <Link 
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-zinc-800 h-10 py-2 px-4"
        >
          Volver al login
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: VerifyMfaFormData) => {
    try {
      const result = await verifyMfaMutation.mutateAsync({
        token,
        code: data.code,
        ...(email === 'laboratorio.nhp@gmail.com' ? { role: selectedRole } : {})
      });

      setSessionCookie('access_token', result.accessToken);
      if (result.usuario && result.usuario.email) {
        setSessionCookie('user_email', result.usuario.email);
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
    <form className={cn('flex flex-col gap-6')} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verificación de seguridad</h1>
          <p className="text-zinc-500 text-sm text-balance">
            Hemos enviado un código de 6 dígitos a tu correo electrónico.
          </p>
        </div>

        {errors.root && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        {email === 'laboratorio.nhp@gmail.com' && (
          <Field>
            <FieldLabel>Área de acceso</FieldLabel>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="hospitalizacion" 
                  checked={selectedRole === 'hospitalizacion'} 
                  onChange={(e) => setSelectedRole(e.target.value)} 
                />
                Hospitalización
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="consultaexterna" 
                  checked={selectedRole === 'consultaexterna'} 
                  onChange={(e) => setSelectedRole(e.target.value)} 
                />
                Consulta Externa
              </label>
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="code">Código de verificación</FieldLabel>
          <Input
            id="code"
            type="text"
            placeholder="Ej: 123456"
            maxLength={6}
            className="text-center text-lg tracking-[0.5em] font-mono"
            {...register('code')}
            aria-invalid={errors.code ? 'true' : 'false'}
          />
          {errors.code && (
            <p className="text-sm text-red-700 mt-1">{errors.code.message}</p>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isSubmitting || verifyMfaMutation.isPending}
          >
            {isSubmitting || verifyMfaMutation.isPending
              ? 'Verificando...'
              : 'Confirmar código'}
          </Button>
        </Field>

        <div className="text-center text-sm text-zinc-600">
          <Link href="/auth/login" className="font-medium hover:underline">
            Cancelar e intentar con otra cuenta
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}

export default function VerifyMfaPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <VerifyMfaForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
