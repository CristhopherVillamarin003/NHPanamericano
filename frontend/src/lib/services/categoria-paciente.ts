import { api } from '@/lib/api';
import type { CategoriaPaciente } from '@/types';

export async function getPacientesByCategoria(categoriaId: number): Promise<CategoriaPaciente[]> {
  const res = await api.get('/categoria-paciente', {
    params: { categoriaId },
  });
  return res.data;
}

export async function addPacienteToCategoria(categoriaId: number, pacienteId: number): Promise<CategoriaPaciente> {
  const res = await api.post('/categoria-paciente', { categoriaId, pacienteId });
  return res.data;
}

export async function removePacienteFromCategoria(id: number): Promise<void> {
  await api.delete(`/categoria-paciente/${id}`);
}
