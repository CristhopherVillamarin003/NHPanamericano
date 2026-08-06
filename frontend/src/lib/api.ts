import axios from 'axios';
import { getSessionCookie, setSessionCookie, deleteSessionCookie } from './utils';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getSessionCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado), no hemos reintentado, y no es la ruta de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      try {
        // Intentar renovar la sesión en segundo plano usando la cookie segura
        const res = await api.post('/auth/refresh');
        const newToken = res.data.accessToken;

        if (typeof window !== 'undefined') {
          setSessionCookie('access_token', newToken);
        }

        // Si funciona, reintentamos la petición original con la nueva llave
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si la renovación falla (ej: huella distinta, token viejo cerrado con la X)
        if (typeof window !== 'undefined') {
          deleteSessionCookie('access_token');
          try {
            const bc = new BroadcastChannel('auth_sync');
            bc.postMessage('logout');
            bc.close();
          } catch(e) {}
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
