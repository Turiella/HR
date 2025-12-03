"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../config/upload");
const cvController_1 = require("../controllers/cvController");
const auth_1 = require("../middleware/auth"); // Middleware de autenticación existente
const router = (0, express_1.Router)();
// Ruta para subir y analizar CV
router.post('/upload', (0, auth_1.auth)(['admin', 'reclutador', 'candidato']), upload_1.upload.single('cv'), cvController_1.uploadCV);
// Ruta para obtener análisis de un CV específico
router.get('/:id', (0, auth_1.auth)(['admin', 'reclutador', 'candidato']), cvController_1.getCVAnalysis);
// Conteo total de CVs
router.get('/meta/count', (0, auth_1.auth)(['admin', 'reclutador']), cvController_1.getCVCount);
// Marcar CV como principal dentro de su categoría
router.patch('/:id/primary', (0, auth_1.auth)(['admin', 'reclutador', 'candidato']), cvController_1.setPrimaryCV);
// Descargar PDF original
router.get('/:id/download', (0, auth_1.auth)(['admin', 'reclutador', 'candidato']), cvController_1.downloadCV);
exports.default = router;
