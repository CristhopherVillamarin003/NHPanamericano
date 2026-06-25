import { api } from '../api';

export const getPlantillas = async (seccion?: string) => {
  const url = seccion ? `/plantillas?seccion=${seccion}` : '/plantillas';
  const response = await api.get(url);
  return response.data;
};

export const getPlantilla = async (id: number) => {
  const response = await api.get(`/plantillas/${id}`);
  return response.data;
};

export const createPlantilla = async (data: { nombre: string; seccion: string; tipoArchivo: string; esPlantillaFija: boolean; datos?: any }) => {
  const response = await api.post('/plantillas', data);
  return response.data;
};

export const updatePlantilla = async (id: number, data: { nombre?: string; activo?: boolean; datos?: any }) => {
  const response = await api.put(`/plantillas/${id}`, data);
  return response.data;
};

export const deletePlantilla = async (id: number) => {
  const response = await api.delete(`/plantillas/${id}`);
  return response.data;
};
