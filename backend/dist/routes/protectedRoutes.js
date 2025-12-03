"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rankingController_1 = require("../controllers/rankingController");
const candidateController_1 = require("../controllers/candidateController");
const router = (0, express_1.Router)();
// Ruta protegida solo para admin
router.get('/admin-panel', (0, auth_1.auth)(['admin']), (req, res) => {
    res.json({
        message: 'Panel de Administrador',
        data: {
            stats: {
                totalUsers: 10,
                activeRecruitments: 5
            }
        }
    });
});
// Ruta protegida solo para reclutadores
router.get('/recruiter-panel', (0, auth_1.auth)(['reclutador']), (req, res) => {
    res.json({
        message: 'Panel de Reclutador',
        data: {
            activeJobs: [
                { id: 1, title: 'Desarrollador Full Stack', candidates: 15 },
                { id: 2, title: 'DevOps Engineer', candidates: 8 }
            ]
        }
    });
});
// Ranking de candidatos por filtros/prompt (MVP sin IA)
router.post('/ranking', (0, auth_1.auth)(['reclutador']), rankingController_1.getRanking);
// Perfil de candidato
router.get('/candidates/:id', (0, auth_1.auth)(['reclutador']), candidateController_1.getCandidateProfile);
// Ruta protegida solo para candidatos
router.get('/candidate-panel', (0, auth_1.auth)(['candidato']), (req, res) => {
    res.json({
        message: 'Panel de Candidato',
        data: {
            applications: [
                { jobId: 1, status: 'En revisión' },
                { jobId: 2, status: 'Pendiente' }
            ]
        }
    });
});
exports.default = router;
