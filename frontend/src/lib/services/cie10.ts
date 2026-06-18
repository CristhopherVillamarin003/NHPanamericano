import { api } from '@/lib/api';

export interface Cie10Item {
  codigo: string;
  descripcion: string;
}

/**
 * Busca códigos CIE-10 por código (prefijo) o descripción.
 * Devuelve hasta 20 resultados.
 */
export async function buscarCie10(q: string): Promise<Cie10Item[]> {
  if (!q || q.trim().length < 1) return [];
  const res = await api.get<Cie10Item[]>('/cie10/buscar', { params: { q: q.trim() } });
  return res.data;
}
