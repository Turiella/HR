import { Request, Response } from 'express';
import pool from '../config/database';

export const getCandidateProfile = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const userRes = await pool.query(
      `SELECT id, email, full_name, role, gender, city, lat, lon, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Candidato no encontrado' });

    const cvsRes = await pool.query(
      `SELECT id, filename, skills, experience_years, education, classification_score, created_at
       FROM cvs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    res.json({ user: userRes.rows[0], cvs: cvsRes.rows });
  } catch (e) {
    console.error('Error obteniendo perfil de candidato:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
