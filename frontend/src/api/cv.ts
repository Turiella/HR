import axios from 'axios';

const API = '/api'; // Usar ruta relativa para que el proxy de Vite funcione

export const setPrimary = async (cvId: number, token: string) => {
  const res = await axios.patch(`${API}/cvs/${cvId}/primary`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const uploadCv = async (file: File, opts: { category?: string; setPrimary?: boolean }, token: string) => {
  const formData = new FormData();
  formData.append('cv', file);
  if (opts.category) formData.append('category', opts.category);
  if (opts.setPrimary) formData.append('setPrimary', 'true');

  const res = await axios.post(`${API}/cvs/upload`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data as { cvId: number; analysis: any };
};

