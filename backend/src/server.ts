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
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('public')); // Para servir archivos estáticos

// Rutas
// Aplica JSON parser solo a rutas que reciben JSON
app.use('/api/auth', express.json(), authRoutes);
app.use('/api', express.json(), protectedRoutes);
// Las rutas de CV usan multipart/form-data, no aplicar express.json() antes
app.use('/api/cvs', cvRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API HR Selector funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 3000;

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