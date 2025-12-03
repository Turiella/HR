"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCVCount = exports.getCVAnalysis = exports.setPrimaryCV = exports.downloadCV = exports.uploadCV = void 0;
const cvAnalysis_1 = require("../services/cvAnalysis");
const database_1 = __importDefault(require("../config/database"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uploadCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        const userId = req.user?.id; // Asumiendo que viene del middleware de auth
        const filters = req.body.filters ? JSON.parse(req.body.filters) : undefined;
        const allowedCategories = ['it', 'ventas', 'atencion', 'contable', 'operario', 'otro'];
        const rawCategory = String(req.body.category || 'otro').toLowerCase();
        const category = allowedCategories.includes(rawCategory) ? rawCategory : 'otro';
        const setPrimary = String(req.body.setPrimary || '').toLowerCase() === 'true';
        // Analizar el CV (con fallback si falla)
        let analysis;
        try {
            analysis = await (0, cvAnalysis_1.analyzePDF)(req.file.path, filters);
        }
        catch (e) {
            console.error('Fallo el análisis de PDF, se usa fallback:', e);
            analysis = {
                skills: [],
                experienceYears: 0,
                education: [],
                classificationScore: 0,
                parsedData: { error: 'analysis_failed' }
            };
        }
        // Guardar en la base de datos con control de principal por categoría
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // calcular próxima versión dentro de la categoría (simple)
            const verRes = await client.query('SELECT COALESCE(MAX(version),0)+1 AS next FROM cvs WHERE user_id = $1 AND category = $2', [userId, category]);
            const nextVersion = verRes.rows[0]?.next ?? 1;
            const result = await client.query(`INSERT INTO cvs (
          user_id, filename, stored_filename, content_text, parsed_data,
          skills, experience_years, education, classification_score, category, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`, [
                userId,
                req.file.originalname,
                req.file?.filename || req.file.filename,
                req.file.buffer?.toString() || '',
                analysis.parsedData,
                analysis.skills,
                analysis.experienceYears,
                analysis.education,
                analysis.classificationScore,
                category,
                nextVersion
            ]);
            const newId = result.rows[0].id;
            if (setPrimary) {
                await client.query('UPDATE cvs SET is_primary = false WHERE user_id = $1 AND category = $2', [userId, category]);
                await client.query('UPDATE cvs SET is_primary = true WHERE id = $1', [newId]);
            }
            else {
                // si no hay principal aún en esta categoría, marcar este como principal por defecto
                const hasPrimary = await client.query('SELECT 1 FROM cvs WHERE user_id = $1 AND category = $2 AND is_primary = true LIMIT 1', [userId, category]);
                if (hasPrimary.rowCount === 0) {
                    await client.query('UPDATE cvs SET is_primary = true WHERE id = $1', [newId]);
                }
            }
            await client.query('COMMIT');
            // Mantener archivo en uploads/ para permitir descargas posteriores
            res.status(201).json({
                message: 'CV analizado y guardado correctamente',
                cvId: newId,
                analysis
            });
            return;
        }
        catch (txErr) {
            await client.query('ROLLBACK');
            throw txErr;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error procesando CV:', error);
        res.status(500).json({ error: 'Error procesando el CV' });
    }
};
exports.uploadCV = uploadCV;
const downloadCV = async (req, res) => {
    try {
        const cvId = Number(req.params.id);
        if (!cvId)
            return res.status(400).json({ error: 'ID inválido' });
        const result = await database_1.default.query('SELECT filename, stored_filename FROM cvs WHERE id = $1', [cvId]);
        if (result.rowCount === 0)
            return res.status(404).json({ error: 'CV no encontrado' });
        const { filename, stored_filename } = result.rows[0];
        if (!stored_filename)
            return res.status(404).json({ error: 'Archivo no disponible' });
        const filePath = path_1.default.resolve('uploads', stored_filename);
        try {
            await promises_1.default.access(filePath);
        }
        catch {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        res.download(filePath, filename);
    }
    catch (error) {
        console.error('Error descargando CV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.downloadCV = downloadCV;
const setPrimaryCV = async (req, res) => {
    try {
        const cvId = Number(req.params.id);
        if (!cvId)
            return res.status(400).json({ error: 'ID inválido' });
        // Obtener CV para conocer usuario y categoría
        const cvRes = await database_1.default.query('SELECT id, user_id, category FROM cvs WHERE id = $1', [cvId]);
        if (cvRes.rowCount === 0)
            return res.status(404).json({ error: 'CV no encontrado' });
        const { user_id, category } = cvRes.rows[0];
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE cvs SET is_primary = false WHERE user_id = $1 AND category = $2', [user_id, category]);
            await client.query('UPDATE cvs SET is_primary = true WHERE id = $1', [cvId]);
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
        res.json({ message: 'CV marcado como principal' });
    }
    catch (error) {
        console.error('Error marcando CV como principal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.setPrimaryCV = setPrimaryCV;
const getCVAnalysis = async (req, res) => {
    try {
        const cvId = req.params.id;
        const result = await database_1.default.query('SELECT * FROM cvs WHERE id = $1', [cvId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'CV no encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error obteniendo CV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCVAnalysis = getCVAnalysis;
const getCVCount = async (_req, res) => {
    try {
        const result = await database_1.default.query('SELECT COUNT(*)::int AS count FROM cvs');
        res.json({ count: result.rows[0]?.count ?? 0 });
    }
    catch (error) {
        console.error('Error obteniendo conteo de CVs:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCVCount = getCVCount;
