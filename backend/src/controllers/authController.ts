import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export const register = async (req: Request, res: Response) => {
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
    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

   if (userExists?.rowCount && userExists.rowCount > 0) {

      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, full_name`,
      [email, hashedPassword, full_name, role]
    );

    const user = result.rows[0];

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
