import { api } from '@/lib/api';
import type { Categoria } from '@/types';

export async function getCategorias(): Promise<Categoria[]> {
  const res = await api.get('/categorias');
  return res.data;
}

export async function createCategoria(nombre: string): Promise<Categoria> {
  const res = await api.post('/categorias', { nombre });
  return res.data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
