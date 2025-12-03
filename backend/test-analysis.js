const { analyzePDF } = require('./dist/services/cvAnalysis.js');

async function testAnalysis() {
  try {
    console.log('🧪 Probando análisis de CV...');
    
    // Buscar un archivo PDF en uploads
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Directorio uploads no encontrado');
      return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('❌ No hay archivos PDF en uploads');
      return;
    }
    
    const testFile = path.join(uploadsDir, pdfFiles[0]);
    console.log(`📄 Analizando: ${testFile}`);
    
    const result = await analyzePDF(testFile);
    console.log('✅ Resultado:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testAnalysis();
