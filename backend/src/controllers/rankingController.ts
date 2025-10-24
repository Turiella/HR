import { Request, Response } from 'express';
import pool from '../config/database';

export const getRanking = async (req: Request, res: Response) => {
  try {
    const {
      jobDescription = '',
      requiredSkills = [],
      preferredSkills = [],
      minExperience = 0,
      limit = 20,
      gender,
      cities = [],
      jobLat,
      jobLon,
      maxDistanceKm
    } = req.body || {};

    const result = await pool.query(
      `SELECT 
         cvs.id AS cv_id,
         users.id AS user_id,
         users.full_name,
         users.email,
         users.gender,
         users.city,
         users.lat,
         users.lon,
         cvs.skills,
         cvs.experience_years,
         cvs.education
       FROM cvs
       LEFT JOIN users ON users.id = cvs.user_id`
    );

    const rows = result.rows || [];

    const normalize = (arr: any) => Array.isArray(arr)
      ? Array.from(new Set(arr.map((s) => String(s).trim().toLowerCase()).filter(Boolean)))
      : [];
    const reqSkills = normalize(requiredSkills);
    const prefSkills = normalize(preferredSkills);
    const jobTokens = String(jobDescription)
      .toLowerCase()
      .split(/[^a-zá-ú0-9+#\.]+/i)
      .map(s => s.trim())
      .filter(Boolean);

    const toRad = (v: number) => (v * Math.PI) / 180;
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      if ([lat1, lon1, lat2, lon2].some((x) => x === null || x === undefined)) return undefined;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const scored = rows.map((r) => {
      const skills = normalize(r.skills);
      const exp = Number(r.experience_years) || 0;
      const education = normalize(r.education);
      const city = (r.city || '').toLowerCase();
      const genderVal = (r.gender || '').toLowerCase();
      const lat = r.lat as number | null;
      const lon = r.lon as number | null;

      const reqMatches = reqSkills.filter((s) => skills.includes(s)).length;
      const prefMatches = prefSkills.filter((s) => skills.includes(s)).length;
      const jdMatches = jobTokens.filter((t) => skills.includes(t)).length;
      const expOk = exp >= Number(minExperience);
      const expScore = Math.min(2, Math.max(0, (exp - Number(minExperience)) * 0.25));
      const eduBonus = education.some(e => ['master','maestría','phd','doctor','ingeniero','engineer','licenciado','bachelor'].includes(e)) ? 0.5 : 0;
      const dist = (jobLat!=null && jobLon!=null) ? haversine(Number(jobLat), Number(jobLon), Number(lat), Number(lon)) : undefined;
      const distanceOk = (maxDistanceKm!=null && dist!=null) ? dist <= Number(maxDistanceKm) : true;

      let score = 0;
      score += reqMatches * 3;
      score += prefMatches * 1;
      score += jdMatches * 0.5;
      score += (expOk ? 1 : 0) + expScore;
      score += eduBonus;
      if (distanceOk && dist!=null) {
        // pequeño bonus si está más cerca (hasta 1 punto)
        const d = Math.max(0, Math.min(50, dist));
        score += (1 - d/50);
      }

      return {
        userId: r.user_id,
        cvId: r.cv_id,
        fullName: r.full_name,
        email: r.email,
        gender: genderVal,
        city,
        lat,
        lon,
        skills,
        experienceYears: exp,
        education,
        score: Number(score.toFixed(2)),
        reasons: {
          requiredMatches: reqMatches,
          preferredMatches: prefMatches,
          jobDescriptionMatches: jdMatches,
          experienceOK: expOk,
          experienceScore: Number(expScore.toFixed(2)),
          educationBonus: Number(eduBonus.toFixed(2)),
          distanceKm: dist != null ? Number(dist.toFixed(1)) : undefined
        }
      };
    });

    const genderFilter = typeof gender === 'string' && gender.trim() ? String(gender).toLowerCase() : undefined;
    const cityList = normalize(cities);

    const filtered = scored
      .filter((c) => reqSkills.every((s) => c.skills.includes(s)))
      .filter((c) => c.experienceYears >= Number(minExperience))
      .filter((c) => !genderFilter || c.gender === genderFilter)
      .filter((c) => cityList.length === 0 || cityList.includes(c.city))
      .filter((c) => {
        if (maxDistanceKm==null || jobLat==null || jobLon==null) return true;
        const dk = c.reasons.distanceKm;
        return dk == null ? false : dk <= Number(maxDistanceKm);
      });

    const ranked = (filtered.length ? filtered : scored)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(Number(limit) || 20, 100)));

    res.json({ count: ranked.length, candidates: ranked });
  } catch (error) {
    console.error('Error generando ranking:', error);
    res.status(500).json({ error: 'Error generando ranking' });
  }
};
