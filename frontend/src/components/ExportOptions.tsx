import React from 'react';

interface ExportOptionsProps {
  candidates: any[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  candidates,
  onExportCSV,
  onExportPDF
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onExportCSV}
        className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-500 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
      >
        <span className="flex items-center">
          <span className="mr-2">📊</span>
          Exportar CSV
          <span className="ml-2 text-xs bg-green-700 px-2 py-0.5 rounded">
            {candidates.length} candidatos
          </span>
        </span>
      </button>
      
      <button
        onClick={onExportPDF}
        className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-500 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
      >
        <span className="flex items-center">
          <span className="mr-2">📄</span>
          Exportar PDF
          <span className="ml-2 text-xs bg-red-700 px-2 py-0.5 rounded">
            {candidates.length} candidatos
          </span>
        </span>
      </button>
    </div>
  );
};

// Enhanced CSV export with more data
export const exportEnhancedCSV = (candidates: any[], searchParams: any) => {
  const headers = [
    'Ranking',
    'Nombre Completo',
    'Email',
    'Score',
    'Experiencia (años)',
    'Skills',
    'Required Matches',
    'Preferred Matches',
    'Job Description Matches',
    'Experiencia OK',
    'Ciudad',
    'Género',
    'Educación',
    'Distancia (km)',
    'CV ID',
    'User ID'
  ];

  const rows = candidates.map((candidate, index) => [
    index + 1,
    candidate.fullName || '',
    candidate.email || '',
    candidate.score?.toFixed(2) || '0',
    candidate.experienceYears || 0,
    (candidate.skills || []).join('; '),
    candidate.reasons?.requiredMatches || 0,
    candidate.reasons?.preferredMatches || 0,
    candidate.reasons?.jobDescriptionMatches || 0,
    candidate.reasons?.experienceOK ? 'Sí' : 'No',
    candidate.city || '',
    candidate.gender || '',
    (candidate.education || []).join('; '),
    candidate.reasons?.distanceKm || '',
    candidate.cvId || '',
    candidate.userId || ''
  ]);

  // Add search parameters as metadata
  const metadata = [
    ['Parámetros de Búsqueda', ''],
    ['Required Skills', searchParams.requiredSkills || ''],
    ['Preferred Skills', searchParams.preferredSkills || ''],
    ['Experiencia Mínima', searchParams.minExperience || ''],
    ['Género', searchParams.gender || 'Cualquiera'],
    ['Ciudades', searchParams.cities || ''],
    ['Distancia Máxima', searchParams.maxDistanceKm || ''],
    ['Descripción del Puesto', searchParams.jobDescription || ''],
    ['Fecha de Exportación', new Date().toLocaleString('es-AR')],
    ['Total Candidatos', candidates.length],
    ['', ''],
    ...headers
  ];

  const csvContent = [
    ...metadata,
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`))
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hr-ranking-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// PDF export using jsPDF (would need to install jsPDF)
export const exportPDF = (candidates: any[], searchParams: any) => {
  // This is a placeholder for PDF export
  // In a real implementation, you would use a library like jsPDF
  alert('Exportación PDF coming soon! Por ahora usa CSV.');
};

// Share functionality
export const shareResults = (candidates: any[], searchParams: any) => {
  const shareData = {
    title: 'Resultados de Búsqueda - HR Selector',
    text: `Encontré ${candidates.length} candidatos con los siguientes filtros:\n` +
          `• Required: ${searchParams.requiredSkills || 'N/A'}\n` +
          `• Preferred: ${searchParams.preferredSkills || 'N/A'}\n` +
          `• Experiencia: ${searchParams.minExperience || '0'}+ años\n` +
          `• Score promedio: ${(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length).toFixed(2)}`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    const text = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('¡Resultados copiados al portapapeles!');
    });
  }
};
