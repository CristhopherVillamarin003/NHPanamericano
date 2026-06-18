import { api } from '@/lib/api';
import type { Paciente } from '@/types';
import type { PacienteFormData } from '@/schemas/paciente.schemas';

export async function getPacientes(): Promise<Paciente[]> {
  const res = await api.get('/pacientes');
  return res.data;
}

export async function getPacienteById(id: number): Promise<Paciente> {
  const res = await api.get(`/pacientes/${id}`);
  return res.data;
}

export async function createPaciente(data: PacienteFormData): Promise<Paciente> {
  const res = await api.post('/pacientes', data);
  return res.data;
}

export async function updatePaciente(id: number, data: Partial<PacienteFormData>): Promise<Paciente> {
  const res = await api.put(`/pacientes/${id}`, data);
  return res.data;
}

export async function deletePaciente(id: number): Promise<void> {
  await api.delete(`/pacientes/${id}`);
}
