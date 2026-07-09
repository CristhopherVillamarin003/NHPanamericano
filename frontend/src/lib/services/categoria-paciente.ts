import { api } from '@/lib/api';
import type { CategoriaPaciente } from '@/types';

export async function getPacientesByCategoria(categoriaId: number): Promise<CategoriaPaciente[]> {
  const res = await api.get('/categoria-paciente', {
    params: { categoriaId },
  });
  return res.data;
}

export async function addPacienteToCategoria(categoriaId: number, pacienteId: number, tipoPaciente?: string): Promise<CategoriaPaciente> {
  const res = await api.post('/categoria-paciente', { categoriaId, pacienteId, tipoPaciente });
  return res.data;
}

export async function updateCategoriaPaciente(id: number, data: { tipoPaciente?: string }): Promise<CategoriaPaciente> {
  const res = await api.patch(`/categoria-paciente/${id}`, data);
  return res.data;
}

export async function removePacienteFromCategoria(id: number): Promise<void> {
  await api.delete(`/categoria-paciente/${id}`);
}
