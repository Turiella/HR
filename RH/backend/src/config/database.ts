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

        // Crear tabla de CVs
        await pool.query(`
        CREATE TABLE IF NOT EXISTS cvs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            filename VARCHAR(255) NOT NULL,
            content_text TEXT,
            parsed_data JSONB,
            skills TEXT[],
            experience_years INTEGER,
            education TEXT[],
            classification_score FLOAT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        `);
        
        console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
        throw error;
    }
    };

    export default pool;