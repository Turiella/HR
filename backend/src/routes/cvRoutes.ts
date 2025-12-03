import { Router } from 'express';
import { upload } from '../config/upload';
import { uploadCV, getCVAnalysis, getCVCount, setPrimaryCV, downloadCV } from '../controllers/cvController';
import { auth } from '../middleware/auth'; // Middleware de autenticación existente

const router = Router();

// Ruta para subir y analizar CV
router.post('/upload', auth(['admin', 'reclutador', 'candidato']), upload.single('cv'), uploadCV);

// Ruta para obtener análisis de un CV específico
router.get('/:id', auth(['admin', 'reclutador', 'candidato']), getCVAnalysis);

// Conteo total de CVs
router.get('/meta/count', auth(['admin', 'reclutador']), getCVCount);

// Marcar CV como principal dentro de su categoría
router.patch('/:id/primary', auth(['admin', 'reclutador', 'candidato']), setPrimaryCV);

// Descargar PDF original
router.get('/:id/download', auth(['admin', 'reclutador', 'candidato']), downloadCV);

export default router;