import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import cvRoutes from './routes/cvRoutes';

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://hr-frontend-phi.vercel.app',
    'https://hr-frontend.vercel.app',
    'https://hr-frontend-8nqs7m56v-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-git-main-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-fgk1pazy6-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-8nqs7m56v-martin-s-projects-b092de55.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware adicional para CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://hr-frontend-phi.vercel.app',
    'https://hr-frontend.vercel.app',
    'https://hr-frontend-8nqs7m56v-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-git-main-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-fgk1pazy6-martin-s-projects-b092de55.vercel.app',
    'https://hr-frontend-8nqs7m56v-martin-s-projects-b092de55.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.status(200).send();
    return;
  }
  
  next();
});

app.use(express.json()); // Aplicar JSON parser globalmente
app.use(express.static('public')); // Para servir archivos estáticos

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
// Las rutas de CV usan multipart/form-data, no aplicar express.json() antes
app.use('/api/cvs', cvRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API HR Selector funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 8080;

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();