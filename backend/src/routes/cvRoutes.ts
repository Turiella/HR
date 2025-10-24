import { Router } from 'express';
import { upload } from '../config/upload';
import { uploadCV, getCVAnalysis } from '../controllers/cvController';
import { auth } from '../middleware/auth'; // Middleware de autenticación existente

const router = Router();

// Ruta para subir y analizar CV
router.post('/upload', auth(['admin', 'reclutador', 'candidato']), upload.single('cv'), uploadCV);

// Ruta para obtener análisis de un CV específico
router.get('/:id', auth(['admin', 'reclutador', 'candidato']), getCVAnalysis);

export default router;