    import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
connectionString: process.env.DATABASE_URL
});

export const initDatabase = async () => {
  try {
      // Crear tabla de usuarios
      await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'reclutador', 'candidato')),
          full_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      `);

      // Asegurar columnas adicionales en users para filtros avanzados
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(120);`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lat FLOAT;`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lon FLOAT;`);

      // Crear tabla de CVs
      await pool.query(`
      CREATE TABLE IF NOT EXISTS cvs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          filename VARCHAR(255) NOT NULL,
          stored_filename VARCHAR(255),
          content_text TEXT,
          parsed_data JSONB,
          skills TEXT[],
          experience_years INTEGER,
          education TEXT[],
          classification_score FLOAT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      `);
      await pool.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS stored_filename VARCHAR(255);`);
      await pool.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS category VARCHAR(60) DEFAULT 'otro';`);
      await pool.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;`);
      await pool.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;`);

      // Índice único parcial: un solo principal por usuario y categoría
      await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_primary_per_user_category'
        ) THEN
          CREATE UNIQUE INDEX uniq_primary_per_user_category
            ON cvs (user_id, category)
            WHERE is_primary;
        END IF;
      END $$;
      `);

      // Marks de CV por reclutador
      await pool.query(`
      CREATE TABLE IF NOT EXISTS cv_marks (
        id SERIAL PRIMARY KEY,
        cv_id INTEGER REFERENCES cvs(id) ON DELETE CASCADE,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cv_id, recruiter_id)
      );
      `);
      
      console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
      console.error('Error inicializando la base de datos:', error);
      throw error;
  }
};

export default pool;