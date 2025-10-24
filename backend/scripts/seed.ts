import dotenv from 'dotenv';
import pool from '../src/config/database';

dotenv.config();

const candidateEmails = Array.from({ length: 5 }).map((_, i) => `candidate${i + 1}@example.com`);

const skillsPool = [
  'javascript','typescript','react','node','express','postgres','sql','docker','aws','python','java','git','css','html','redux','vite','tailwind','nextjs'
];
const educationPool = ['licenciado','ingeniero','bachelor','master','maestría','doctor','phd','técnico','certificado'];
const genders = ['masculino','femenino','otro'];
const cities = [
  { city: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { city: 'Córdoba', lat: -31.4201, lon: -64.1888 },
  { city: 'Rosario', lat: -32.9587, lon: -60.6939 },
  { city: 'Mendoza', lat: -32.8895, lon: -68.8458 },
  { city: 'La Plata', lat: -34.9214, lon: -57.9545 }
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function ensureUsers() {
  const ids: number[] = [];
  for (const email of candidateEmails) {
    // create user with default password hash placeholder, since app uses register normally
    // For seed, just insert minimal fields
    const res = await pool.query(
      `INSERT INTO users (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [email, '$2b$10$seedseedseedseedseedseedseedseedseedse', `Candidate ${email.split('@')[0]}`, 'candidato']
    );
    ids.push(res.rows[0].id);
  }
  // Populate profile fields
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const g = genders[i % genders.length];
    const c = cities[i % cities.length];
    await pool.query(
      `UPDATE users SET gender=$1, city=$2, lat=$3, lon=$4 WHERE id=$5`,
      [g, c.city, c.lat, c.lon, id]
    );
  }
  return ids;
}

async function seedCVs(userIds: number[]) {
  const total = 20;
  for (let i = 0; i < total; i++) {
    const userId = userIds[i % userIds.length];
    const skills = pick(skillsPool, 3 + Math.floor(Math.random() * 5));
    const exp = 1 + Math.floor(Math.random() * 10);
    const edu = pick(educationPool, 1 + Math.floor(Math.random() * 2));
    const score = Math.min(1, skills.length / 10 + (exp >= 3 ? 0.2 : 0));
    const filename = `cv_${userId}_${Date.now()}_${i}.pdf`;

    await pool.query(
      `INSERT INTO cvs (
        user_id, filename, content_text, parsed_data,
        skills, experience_years, education, classification_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        filename,
        `Seeded CV content for user ${userId} with ${skills.join(', ')}`,
        JSON.stringify({ seeded: true, skills, exp, edu }),
        skills,
        exp,
        edu,
        score,
      ]
    );
  }
}

async function main() {
  try {
    const ids = await ensureUsers();
    await seedCVs(ids);
    console.log('✅ Seed completado: usuarios y 20 CVs insertados');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  }
}

main();
