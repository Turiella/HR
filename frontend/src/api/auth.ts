import axios from 'axios';

const API = '/api'; // Usar ruta relativa para que el proxy de Vite funcione
console.log('API URL:', API); // Debug: verificar que la URL sea correcta

const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const login = async (email: string, password: string) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (email: string, password: string, full_name: string, role: string) => {
  const res = await apiClient.post('/auth/register', { email, password, full_name, role });
  return res.data;
};
