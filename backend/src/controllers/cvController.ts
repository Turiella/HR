import { Request, Response } from 'express';
import { analyzePDF } from '../services/cvAnalysis';
import pool from '../config/database';
import fs from 'fs/promises';

export const uploadCV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const userId = (req as any).user?.id; // Asumiendo que viene del middleware de auth
    const filters = req.body.filters ? JSON.parse(req.body.filters) : undefined;

    // Analizar el CV (con fallback si falla)
    let analysis;
    try {
      analysis = await analyzePDF(req.file.path, filters);
    } catch (e) {
      console.error('Fallo el análisis de PDF, se usa fallback:', e);
      analysis = {
        skills: [],
        experienceYears: 0,
        education: [],
        classificationScore: 0,
        parsedData: { error: 'analysis_failed' }
      };
    }

    // Guardar en la base de datos
    const result = await pool.query(
      `INSERT INTO cvs (
        user_id, filename, content_text, parsed_data, 
        skills, experience_years, education, classification_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id`,
      [
        userId,
        req.file.originalname,
        req.file.buffer?.toString() || '',
        analysis.parsedData,
        analysis.skills,
        analysis.experienceYears,
        analysis.education,
        analysis.classificationScore
      ]
    );

    // Limpiar archivo temporal
    await fs.unlink(req.file.path);

    res.status(201).json({
      message: 'CV analizado y guardado correctamente',
      cvId: result.rows[0].id,
      analysis
    });
  } catch (error) {
    console.error('Error procesando CV:', error);
    res.status(500).json({ error: 'Error procesando el CV' });
  }
};

export const getCVAnalysis = async (req: Request, res: Response) => {
  try {
    const cvId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM cvs WHERE id = $1',
      [cvId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo CV:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};