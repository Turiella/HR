import { OpenAI } from 'openai';
import fs from 'fs/promises';
import * as pdf from 'pdf-parse';

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
    // Leer el archivo PDF
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await (pdf as any)(dataBuffer);
    const text = pdfData.text;
    
    // Construir el prompt con los filtros si existen
    const filtersText = filters ? `\nEvalúa el CV según estos filtros: ${filters.join(', ')}` : '';
    
    const prompt = `Analiza el siguiente CV y extrae la información relevante. Devuelve un JSON con:
    - skills: array de habilidades técnicas y blandas
    - experienceYears: número total de años de experiencia
    - education: array de títulos/certificaciones
    - classificationScore: puntuación de 0 a 1 basada en la relevancia${filtersText}
    
    CV:
    ${text}`;

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "Eres un experto en recursos humanos que analiza CVs y extrae información relevante de manera precisa." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const result = JSON.parse(content);
    
    return {
      skills: result.skills || [],
      experienceYears: result.experienceYears || 0,
      education: result.education || [],
      classificationScore: result.classificationScore || 0,
      parsedData: result
    };
  } catch (error) {
    console.error('Error analizando PDF:', error);
    throw error;
  }
}