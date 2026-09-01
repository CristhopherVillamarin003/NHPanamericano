import { api } from '@/lib/api';
import type { CategoriaPaciente } from '@/types';

export async function getPacientesByCategoria(categoriaId: number): Promise<CategoriaPaciente[]> {
  const res = await api.get('/categoria-paciente', {
    params: { categoriaId },
  });
  return res.data;
}

export async function addPacienteToCategoria(
  categoriaId: number, 
  pacienteId: number, 
  tipoPaciente?: string,
  diagnostico?: string,
  expedienteBaseId?: number
): Promise<CategoriaPaciente> {
  const res = await api.post('/categoria-paciente', { 
    categoriaId, 
    pacienteId, 
    tipoPaciente,
    diagnostico,
    expedienteBaseId
  });
  return res.data;
}

export async function updateCategoriaPaciente(id: number, data: { tipoPaciente?: string, diagnostico?: string, syncPacienteInfo?: boolean }): Promise<CategoriaPaciente> {
  const res = await api.patch(`/categoria-paciente/${id}`, data);
  return res.data;
}

export async function removePacienteFromCategoria(id: number): Promise<void> {
  await api.delete(`/categoria-paciente/${id}`);
}

export async function getAllExpedientes(): Promise<any[]> {
  const res = await api.get('/categoria-paciente/all-expedientes');
  return res.data;
}
