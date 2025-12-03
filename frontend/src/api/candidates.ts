import axios from 'axios';

const API = '/api'; // Usar ruta relativa para que el proxy de Vite funcione

export const getCandidateProfile = async (id: string, token: string, params?: Record<string, any>) => {
  const res = await axios.get(`${API}/candidates/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return res.data;
};
