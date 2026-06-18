import { useCallback, useState } from 'react';
import { api } from '@/lib/api';

export function useLogin() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (input: { correo: string; contrasena: string }) => {
      setIsPending(true);
      try {
        const res = await api.post('/auth/login', {
          email: input.correo,
          password: input.contrasena,
        });
        return res.data as { usuario: any; accessToken: string };
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, mutateAsync };
}

export function useRegister() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (input: {
      correo: string;
      contrasena: string;
      nombres?: string;
      apellidos?: string;
    }) => {
      setIsPending(true);
      try {
        const res = await api.post('/auth/register', {
          email: input.correo,
          password: input.contrasena,
          nombres: input.nombres,
          apellidos: input.apellidos,
        });
        return res.data as { usuario: any; accessToken: string };
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, mutateAsync };
}

export function useForgotPassword() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (correo: string) => {
    setIsPending(true);
    try {
      const res = await api.post('/auth/password/forgot', { email: correo });
      return res.data as { ok: true; token?: string };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, mutateAsync };
}

export function useResetPassword() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (input: { token: string; nuevaContrasena: string }) => {
      setIsPending(true);
      try {
        const res = await api.post('/auth/password/reset', {
          token: input.token,
          newPassword: input.nuevaContrasena,
        });
        return res.data as { ok: true };
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { isPending, mutateAsync };
}
