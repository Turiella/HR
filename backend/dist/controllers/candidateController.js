"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateProfile = void 0;
const database_1 = __importDefault(require("../config/database"));
const getCandidateProfile = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ error: 'ID inválido' });
        const userRes = await database_1.default.query(`SELECT id, email, full_name, role, gender, city, lat, lon, created_at
       FROM users WHERE id = $1`, [id]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ error: 'Candidato no encontrado' });
        // Traer todos los CVs del usuario para agrupar por categoría (limitamos a 50 versiones totales por seguridad)
        const allRes = await database_1.default.query(`SELECT id, filename, stored_filename, category, is_primary, version,
              skills, experience_years, education, classification_score, created_at, parsed_data
       FROM cvs
       WHERE user_id = $1
       ORDER BY category, created_at DESC
       LIMIT 50`, [id]);
        // Agrupar por categoría en memoria
        const map = {};
        for (const row of allRes.rows) {
            const cat = row.category || 'otro';
            if (!map[cat]) {
                map[cat] = { name: cat, primaryCv: null, latestCv: null, versions: [] };
            }
            map[cat].versions.push(row);
            if (row.is_primary)
                map[cat].primaryCv = row;
            if (!map[cat].latestCv)
                map[cat].latestCv = row; // primero por created_at desc
        }
        // Compat: array cvs = principales por categoría (o latest si no hay principal)
        const cvsCompat = [];
        Object.values(map).forEach((cat) => {
            cvsCompat.push(cat.primaryCv || cat.latestCv);
        });
        // Calcular recomendado según filtros opcionales en querystring
        // required, preferred, jd (comma separated)
        const reqQ = String(req.query.required || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        const prefQ = String(req.query.preferred || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        const jdQ = String(req.query.jd || '').toLowerCase();
        let recommended = null;
        if (reqQ.length > 0 || prefQ.length > 0 || jdQ) {
            const allCVs = allRes.rows;
            let best = -1;
            let bestItem = null;
            let bestReasons = null;
            for (const cv of allCVs) {
                const skills = (cv.skills || []).map((s) => String(s).toLowerCase());
                const text = String((cv.parsed_data?.text) || '').toLowerCase();
                const requiredMatches = reqQ.filter(s => skills.includes(s) || text.includes(s)).length;
                const preferredMatches = prefQ.filter(s => skills.includes(s) || text.includes(s)).length;
                const jdMatches = jdQ ? (jdQ.split(/[^a-zá-ú0-9+#\.]+/i).filter(tok => tok && (skills.includes(tok) || text.includes(tok))).length) : 0;
                const baseScore = Number(cv.classification_score || 0);
                // Heurística simple: pesos 2x required, 1x preferred, 0.5x jd tokens, + baseScore
                const score = (requiredMatches * 2) + (preferredMatches * 1) + (jdMatches * 0.5) + baseScore;
                if (score > best) {
                    best = score;
                    bestItem = cv;
                    bestReasons = { requiredMatches, preferredMatches, jdMatches, baseScore };
                }
            }
            if (bestItem) {
                recommended = { cv: bestItem, reasons: bestReasons, score: best };
            }
        }
        res.json({ user: userRes.rows[0], categories: Object.values(map), cvs: cvsCompat, recommendedCv: recommended });
    }
    catch (e) {
        console.error('Error obteniendo perfil de candidato:', e);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getCandidateProfile = getCandidateProfile;
