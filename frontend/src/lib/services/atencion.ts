import { api } from '@/lib/api';
import type { Atencion, Consentimiento } from '@/types';

// ─── Expediente ───────────────────────────────────────────────────────────────

export async function getAtencion(categoriaPacienteId: number): Promise<Atencion> {
  const res = await api.get(`/atencion/${categoriaPacienteId}`);
  return res.data;
}

export async function findOrCreateAtencion(categoriaPacienteId: number): Promise<Atencion> {
  const res = await api.post(`/atencion/${categoriaPacienteId}`);
  return res.data;
}

// ─── Consentimientos ──────────────────────────────────────────────────────────

export async function createConsentimiento(
  atencionId: number,
  plantillaId: number,
  datos: Record<string, any> = {},
): Promise<Consentimiento> {
  const res = await api.post(`/atencion/${atencionId}/consentimientos`, {
    plantillaId,
    datos,
  });
  return res.data;
}

export async function updateConsentimiento(
  id: number,
  datos: Record<string, any>,
  estado?: string,
): Promise<Consentimiento> {
  const res = await api.put(`/atencion/consentimientos/${id}`, { datos, estado });
  return res.data;
}

export async function deleteConsentimiento(id: number): Promise<void> {
  await api.delete(`/atencion/consentimientos/${id}`);
}

// ─── Secciones únicas ─────────────────────────────────────────────────────────

type Seccion = 'historia-clinica' | 'protocolo' | 'cuidado' | 'epicrisis' | 'receta' | 'certificado';

export async function exportarConsentimiento(
  plantillaId: number,
  datos: Record<string, any>,
): Promise<void> {
  const res = await api.post(
    `/plantillas/${plantillaId}/exportar`,
    { datos },
    { responseType: 'blob' },
  );
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `consentimiento-${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportarSeccion(
  plantillaId: number,
  seccion: string,
  datos: Record<string, any>,
  extension: string = 'xlsx',
): Promise<void> {
  const res = await api.post(
    `/plantillas/${plantillaId}/exportar`,
    { datos },
    { responseType: 'blob' },
  );
  const url = URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${seccion}-${Date.now()}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function upsertSeccion(
  atencionId: number,
  seccion: Seccion,
  plantillaId: number,
  datos: Record<string, any> = {},
  estado?: string,
) {
  const res = await api.put(`/atencion/${atencionId}/${seccion}`, {
    plantillaId,
    datos,
    estado,
  });
  return res.data;
}

export async function deleteSeccion(atencionId: number, seccion: Seccion): Promise<void> {
  await api.delete(`/atencion/${atencionId}/${seccion}`);
}
