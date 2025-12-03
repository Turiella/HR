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
    console.log('🔍 Iniciando análisis de PDF:', filePath);
    
    // Safe mode para desarrollo: evita dependencias externas
    if (process.env.ANALYZE_DISABLED === '1') {
      console.log('⚠️ Análisis deshabilitado (safe mode)');
      return {
        skills: [],
        experienceYears: 0,
        education: [],
        classificationScore: 0,
        parsedData: { mode: 'safe', note: 'analysis disabled in dev', text: '' }
      };
    }

    // Extraer texto con pdf.js-extract
    console.log('📄 Extrayendo texto del PDF...');
    const extractor = new PdfExtract();
    const data = await extractor.extract(filePath, {});
    
    if (!data || !data.pages || data.pages.length === 0) {
      console.error('❌ No se pudo extraer texto del PDF');
      throw new Error('No se pudo extraer texto del PDF');
    }
    
    const text = (data?.pages || [])
      .map((p: any) => (p.content || []).map((c: any) => c.str).join(' '))
      .join('\n');
    
    console.log('✅ Texto extraído:', text.length, 'caracteres');
    
    if (text.trim().length === 0) {
      console.error('❌ El PDF no contiene texto extraíble');
      throw new Error('El PDF no contiene texto extraíble');
    }

    // Heurísticas mejoradas para MVP
    console.log('🧠 Aplicando heurísticas de análisis...');
    const lower = text.toLowerCase();
    
    // Skills más completas
    const skillDict = [
      'javascript','typescript','react','node','express','postgres','sql','docker','aws','python','java','git','css','html','redux','vite','tailwind','nextjs',
      'angular','vue','mongodb','mysql','redis','kubernetes','terraform','jenkins','github','gitlab','linux','ubuntu','windows','bash','php','ruby','go','rust',
      'csharp','dotnet','spring','django','flask','laravel','rails','sass','bootstrap','material-ui','firebase','graphql','rest','api','microservices',
      'agile','scrum','jira','testing','jest','cypress','selenium','unit','e2e','security','authentication','jwt','oauth','performance','optimization'
    ];
    
    const skills = Array.from(new Set(skillDict.filter(s => lower.includes(s))));
    console.log('💻 Skills detectadas:', skills.length, skills);
    
    // Experiencia mejorada
    const expPatterns = [
      /(\d{1,2})\s*(años|year|years)/i,
      /(\d{1,2})\s*(años|year|years)\s*de\s*experiencia/i,
      /experiencia\s*de\s*(\d{1,2})\s*(años|year|years)/i,
      /(\d{1,2})\s*\+\s*(años|year|years)/i
    ];
    
    let experienceYears = 0;
    for (const pattern of expPatterns) {
      const match = lower.match(pattern);
      if (match) {
        experienceYears = Math.min(40, parseInt(match[1], 10));
        break;
      }
    }
    console.log('💼 Experiencia detectada:', experienceYears, 'años');
    
    // Educación mejorada
    const educationKeywords = [
      'licenciado','ingeniero','bachelor','master','maestría','doctor','phd','técnico','certificado','certificación',
      'universidad','university','degree','diploma','curso','course','workshop','seminar','congreso','conference'
    ];
    const education = educationKeywords.filter(k => lower.includes(k));
    console.log('🎓 Educación detectada:', education.length, education);
    
    // Score mejorado
    const skillScore = Math.min(1, skills.length / 15);
    const expScore = Math.min(1, experienceYears / 10);
    const eduScore = Math.min(1, education.length / 5);
    const classificationScore = (skillScore * 0.5) + (expScore * 0.3) + (eduScore * 0.2);
    
    console.log('📊 Score final:', classificationScore.toFixed(2));
    
    const result = { skills, experienceYears, education, classificationScore };
    
    return {
      skills: result.skills,
      experienceYears: result.experienceYears,
      education: result.education,
      classificationScore: result.classificationScore,
      parsedData: { ...result, text, analysisMethod: 'heuristics' }
    };
  } catch (error) {
    console.error('❌ Error analizando PDF:', error);
    // En lugar de lanzar el error, devolver un resultado con información del error
    return {
      skills: [],
      experienceYears: 0,
      education: [],
      classificationScore: 0,
      parsedData: { 
        error: 'analysis_failed',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        text: ''
      }
    };
  }
}