import { OpenAI } from 'openai';
import fs from 'fs/promises';
// Usamos pdf.js-extract para extracción determinística
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PdfExtract } = require('pdf.js-extract');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface CVAnalysis {
  skills: string[];
  experienceYears: number;
  education: string[];
  classificationScore: number;
  parsedData: any;
}

export async function analyzePDF(filePath: string, filters?: string[]): Promise<CVAnalysis> {
  try {
    // Safe mode para desarrollo: evita dependencias externas
    if (process.env.ANALYZE_DISABLED === '1') {
      return {
        skills: [],
        experienceYears: 0,
        education: [],
        classificationScore: 0,
        parsedData: { mode: 'safe', note: 'analysis disabled in dev', text: '' }
      };
    }

    // Extraer texto con pdf.js-extract
    const extractor = new PdfExtract();
    const data = await extractor.extract(filePath, {});
    const text = (data?.pages || [])
      .map((p: any) => (p.content || []).map((c: any) => c.str).join(' '))
      .join('\n');
    
    // Construir el prompt con los filtros si existen
    const filtersText = filters ? `\nEvalúa el CV según estos filtros: ${filters.join(', ')}` : '';
    
    const prompt = `Analiza el siguiente CV y extrae la información relevante. Devuelve un JSON con:
    - skills: array de habilidades técnicas y blandas
    - experienceYears: número total de años de experiencia
    - education: array de títulos/certificaciones
    - classificationScore: puntuación de 0 a 1 basada en la relevancia${filtersText}
    
    CV:
    ${text}`;

    // Heurísticas simples para MVP
    const lower = text.toLowerCase();
    const skillDict = [
      'javascript','typescript','react','node','express','postgres','sql','docker','aws','python','java','git','css','html','redux','vite','tailwind','nextjs'
    ];
    const skills = Array.from(new Set(skillDict.filter(s => lower.includes(s))));
    const expMatch = lower.match(/(\d{1,2})\s*(años|year|years)/);
    const experienceYears = expMatch ? Math.min(40, parseInt(expMatch[1], 10)) : 0;
    const educationKeywords = ['licenciado','ingeniero','bachelor','master','maestría','doctor','phd','técnico','certificado','certificación'];
    const education = educationKeywords.filter(k => lower.includes(k));
    const classificationScore = Math.min(1, (skills.length / 10) + (experienceYears >= 3 ? 0.2 : 0));
    const result = { skills, experienceYears, education, classificationScore };
    
    return {
      skills: result.skills,
      experienceYears: result.experienceYears,
      education: result.education,
      classificationScore: result.classificationScore,
      parsedData: { ...result, text }
    };
  } catch (error) {
    console.error('Error analizando PDF:', error);
    throw error;
  }
}