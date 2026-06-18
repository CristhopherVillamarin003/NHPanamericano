import type { AxiosError } from 'axios';

export function getErrorMessage(error: unknown) {
  const maybeAxios = error as AxiosError<any>;

  const dataMessage = maybeAxios?.response?.data?.message;
  if (typeof dataMessage === 'string') return dataMessage;
  if (Array.isArray(dataMessage)) return dataMessage.join(', ');

  if (maybeAxios?.message) return maybeAxios.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error';
}
