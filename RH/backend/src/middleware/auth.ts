import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const auth = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        throw new Error();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
        email: string;
        role: string;
      };

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Por favor autentícate' });
    }
  };
};