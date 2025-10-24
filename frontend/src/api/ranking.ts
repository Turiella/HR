import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export interface RankingRequest {
  jobDescription?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minExperience?: number;
}

export const getRanking = async (payload: RankingRequest, token: string) => {
  const res = await axios.post(
    `${API}/ranking`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data;
};
