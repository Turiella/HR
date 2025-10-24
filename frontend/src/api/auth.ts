import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data;
};

export const register = async (email: string, password: string, full_name: string, role: string) => {
  const res = await axios.post(`${API}/auth/register`, { email, password, full_name, role });
  return res.data;
};
