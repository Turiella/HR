"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const register = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        // Validaciones básicas
        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        if (!['admin', 'reclutador', 'candidato'].includes(role)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }
        // Verificar si el usuario ya existe
        const userExists = await database_1.default.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (userExists?.rowCount && userExists.rowCount > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        // Encriptar contraseña
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Crear usuario
        const result = await database_1.default.query(`INSERT INTO users (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, full_name`, [email, hashedPassword, full_name, role]);
        const user = result.rows[0];
        // Generar token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }
        // Buscar usuario
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Generar token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name
            },
            token
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
exports.login = login;
