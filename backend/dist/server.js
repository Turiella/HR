"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const cvRoutes_1 = __importDefault(require("./routes/cvRoutes"));
// Configuración de variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware adicional para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    next();
});
app.use(express_1.default.json()); // Aplicar JSON parser globalmente
app.use(express_1.default.static('public')); // Para servir archivos estáticos
// Rutas
app.use('/api/auth', authRoutes_1.default);
app.use('/api', protectedRoutes_1.default);
// Las rutas de CV usan multipart/form-data, no aplicar express.json() antes
app.use('/api/cvs', cvRoutes_1.default);
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API HR Selector funcionando correctamente' });
});
// Puerto
const PORT = process.env.PORT || 3000;
// Inicializar base de datos y servidor
const startServer = async () => {
    try {
        await (0, database_1.initDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Error iniciando el servidor:', error);
        process.exit(1);
    }
};
startServer();
