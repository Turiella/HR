import { Router } from 'express';
import { auth } from '../middleware/auth';

const router = Router();

// Ruta protegida solo para admin
router.get('/admin-panel', auth(['admin']), (req, res) => {
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
router.get('/recruiter-panel', auth(['reclutador']), (req, res) => {
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

// Ruta protegida solo para candidatos
router.get('/candidate-panel', auth(['candidato']), (req, res) => {
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

export default router;