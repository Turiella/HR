import axios from 'axios';

const API = '/api'; // Usar ruta relativa para que el proxy de Vite funcione

export interface RankingRequest {
  jobDescription?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minExperience?: number;
}

export const getRanking = async (payload: RankingRequest, token: string) => {
  const res = await axios.post(`${API}/ranking`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getCvCount = async (token: string) => {
  const res = await axios.get(`${API}/cvs/meta/count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data as { count: number };
};
