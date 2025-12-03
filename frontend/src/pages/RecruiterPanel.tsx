import { useEffect, useState } from 'react';
import { getRanking, getCvCount } from '../api/ranking';
import type { RankingRequest } from '../api/ranking';
import type { Candidate, RankingResult, SearchParams } from '../types';
import { ScoreBar, SkillTag, MatchIndicator, LoadingSpinner } from '../components/UIComponents';
import { SearchPresets, FieldHelp } from '../components/SearchHelpers';
import { searchPresets } from '../constants/presets';
import { Autocomplete } from '../components/Autocomplete';
import { techSkills, cities as citySuggestions } from '../constants/suggestions';
import { Slider } from '../components/Slider';
import { Analytics } from '../components/Analytics';
import { ExportOptions, exportEnhancedCSV } from '../components/ExportOptions';
import LogoutButton from '../components/LogoutButton';

export default function RecruiterPanel() {
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('node, postgres');
  const [preferredSkills, setPreferredSkills] = useState('docker');
  const [minExperience, setMinExperience] = useState(2);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>();
  const [loadingMessage, setLoadingMessage] = useState('Analizando candidatos...');
  const [result, setResult] = useState<RankingResult | null>(null);
  const [cvCount, setCvCount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'name'>('score');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [gender, setGender] = useState('');
  const [cities, setCities] = useState('');
  // lat/lon removed from filter UI
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>('');

  // Inject slider styles
  useEffect(() => {
    const styleId = 'slider-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Load CV count once on mount
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const data = await getCvCount(token);
        setCvCount(data.count);
      } catch (error) {
      console.error('Error loading CV count:', error);
    }
    };
    run();
  }, []);

  const handleRank = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Preparando búsqueda...');
    
    try {
      // Simular progreso
      const progressSteps = [
        { progress: 25, message: 'Analizando requisitos...' },
        { progress: 50, message: 'Buscando candidatos...' },
        { progress: 75, message: 'Calculando scores...' },
        { progress: 90, message: 'Ordenando resultados...' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoadingProgress(step.progress);
        setLoadingMessage(step.message);
      }

      const payload: RankingRequest & { gender?: string; cities?: string[]; maxDistanceKm?: number } = {
        jobDescription,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: Number(minExperience) || 0,
        gender: gender || undefined,
        cities: cities.split(',').map(s => s.trim()).filter(Boolean),
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined
      };
      const token = localStorage.getItem('token') || '';
      const data = await getRanking(payload, token);
      
      setLoadingProgress(100);
      setLoadingMessage('¡Búsqueda completada!');
      
      setTimeout(() => {
        setResult(data);
        setPage(1);
        setLoading(false);
        setLoadingProgress(undefined);
      }, 500);
    } catch (error) {
      console.error('Error generating ranking:', error);
      alert('Error generando ranking');
      setLoading(false);
      setLoadingProgress(undefined);
    }
  };

  const applyPreset = (preset: typeof searchPresets[0]) => {
    const requiredSkillsStr = preset.requiredSkills.join(', ');
    const preferredSkillsStr = preset.preferredSkills.join(', ');
    
    console.log('Applying preset:', {
      name: preset.name,
      requiredSkills: requiredSkillsStr,
      preferredSkills: preferredSkillsStr
    });
    
    setRequiredSkills(requiredSkillsStr);
    setPreferredSkills(preferredSkillsStr);
    setMinExperience(preset.minExperience);
    setJobDescription(preset.jobDescription);
  };

  const parsedRequired = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const parsedPreferred = preferredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const jdTokens = jobDescription.toLowerCase().split(/[^a-zá-ú0-9+#.]+/i).map(s => s.trim()).filter(Boolean);

  const sortedCandidates = (result?.candidates || []).slice().sort((a: Candidate, b: Candidate) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'score') return (a.score - b.score) * dir;
    if (sortBy === 'experience') return (a.experienceYears - b.experienceYears) * dir;
    return String(a.fullName).localeCompare(String(b.fullName)) * (sortDir === 'asc' ? 1 : -1);
  });
  const total = sortedCandidates.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = sortedCandidates.slice(start, start + pageSize);

  const downloadCSV = () => {
    const searchParams: SearchParams = {
      requiredSkills,
      preferredSkills,
      minExperience,
      gender,
      cities,
      maxDistanceKm,
      jobDescription
    };
    exportEnhancedCSV(sortedCandidates, searchParams);
  };

  const downloadPDF = () => {
    // Placeholder for PDF export
    alert('Exportación PDF coming soon! Por ahora usa CSV.');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl pl-[calc(1.5rem+20px)] pr-6 py-6 mx-auto">
      {/* Header Compacto */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="text-sm mr-2">🎯</span>
              Panel de Reclutador
            </h1>
            <p className="mt-1 text-sm text-gray-400">Filtrá candidatos y generá un ranking basado en skills, experiencia y descripción del puesto.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {cvCount != null && (
              <div className="inline-flex items-center px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-green-300">
                  <span className="font-medium">{cvCount}</span> CVs en base
                </span>
              </div>
            )}
            <LogoutButton variant="header" />
          </div>
        </div>
      </div>

      {/* Presets Section */}
      <SearchPresets onApplyPreset={applyPreset} />

      {/* Filtros de Búsqueda */}
      <div className="p-6 mb-6 bg-white/5 border border-white/10 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <span className="text-xs mr-2">🔍</span>
          Filtros de Búsqueda
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Required skills (coma separadas)
              <FieldHelp 
                field="Habilidades Requeridas" 
                example="node, postgres, typescript" 
                tip="Estas habilidades son obligatorias. Los candidatos deben tenerlas para ser considerados."
              />
            </label>
            <Autocomplete 
              value={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="node, postgres"
              suggestions={techSkills}
              className="w-full"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Preferred skills (coma separadas)
              <FieldHelp 
                field="Habilidades Preferidas" 
                example="docker, aws, react" 
                tip="Habilidades deseables pero no obligatorias. Dan puntos extra al candidato."
              />
            </label>
            <Autocomplete 
              value={preferredSkills}
              onChange={setPreferredSkills}
              placeholder="docker"
              suggestions={techSkills}
              className="w-full"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Años mínimos de experiencia
              <FieldHelp 
                field="Experiencia Mínima" 
                example="2, 5, 10" 
                tip="Experiencia mínima requerida en años. Los candidatos con menos experiencia serán filtrados."
              />
            </label>
            <Slider 
              value={minExperience}
              onChange={setMinExperience}
              min={0}
              max={20}
              step={1}
              label="Años mínimos de experiencia"
              unit="años"
              className="w-full"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Género</label>
            <select className="w-full p-2 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Ciudades (coma separadas)
              <FieldHelp 
                field="Ubicación" 
                example="Buenos Aires, Córdoba, Rosario" 
                tip="Ciudades donde buscar candidatos. Aplica filtro de distancia si se especifica."
              />
            </label>
            <Autocomplete 
              value={cities}
              onChange={setCities}
              placeholder="Buenos Aires, Córdoba"
              suggestions={citySuggestions}
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Distancia máx (km)
              <FieldHelp 
                field="Distancia Máxima" 
                example="20, 50, 100" 
                tip="Distancia máxima en kilómetros desde las ciudades especificadas."
              />
            </label>
            <Slider 
              value={Number(maxDistanceKm) || 0}
              onChange={(value) => setMaxDistanceKm(value.toString())}
              min={0}
              max={200}
              step={5}
              label="Distancia máx (km)"
              unit="km"
              className="w-full"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block mb-1 text-sm font-medium flex items-center">
              Descripción del puesto / Prompt
              <FieldHelp 
                field="Descripción del Puesto" 
                example="Buscamos desarrollador senior para proyecto e-commerce..." 
                tip="Descripción detallada del puesto. El sistema buscará coincidencias semánticas con los CVs."
              />
            </label>
            <textarea className="w-full p-3 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" rows={4} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Breve descripción del puesto, responsabilidades y tecnologías clave" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button 
              onClick={handleRank} 
              disabled={loading} 
              className={`
                px-5 py-2.5 rounded-lg font-medium transition-all text-sm
                ${loading 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
                } text-white shadow-lg
              `}
            >
              <span className="flex items-center">
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <span className="mr-1.5 text-xs">🚀</span>
                    Generar ranking
                  </>
                )}
              </span>
            </button>
            
            <div className="flex items-center gap-2 text-xs bg-black/20 px-3 py-2 rounded-lg">
              <label className="text-gray-300">Ordenar</label>
              <select className="p-1 bg-black/40 border border-white/10 rounded text-xs text-white" value={sortBy} onChange={e => setSortBy(e.target.value as 'score' | 'experience' | 'name')}>
                <option value="score">Score</option>
                <option value="experience">Experiencia</option>
                <option value="name">Nombre</option>
              </select>
              <select className="p-1 bg-black/40 border border-white/10 rounded text-xs text-white" value={sortDir} onChange={e => setSortDir(e.target.value as 'desc' | 'asc')}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
          
          {result && result.count > 0 && (
            <ExportOptions 
              candidates={sortedCandidates}
              onExportCSV={downloadCSV}
              onExportPDF={downloadPDF}
            />
          )}
          
          {result?.count !== undefined && (
            <div className="flex items-center bg-indigo-500/20 px-3 py-2 rounded-lg border border-indigo-500/30">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm text-indigo-300 font-medium">
                Resultados: <strong className="text-white">{result.count}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-8">
          <LoadingSpinner message={loadingMessage} progress={loadingProgress} />
        </div>
      )}

      {result && result.count > 0 && !loading && (
        <div className="space-y-4">
          {/* Search Summary */}
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center">
              <span className="mr-2">📊</span>
              Resumen de Búsqueda
            </h3>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="bg-white/10 px-2 py-1 rounded">
                <span className="text-gray-400">Required:</span> 
                <span className="ml-1 font-medium text-white">{requiredSkills || '—'}</span>
              </span>
              <span className="bg-white/10 px-2 py-1 rounded">
                <span className="text-gray-400">Preferred:</span> 
                <span className="ml-1 font-medium text-white">{preferredSkills || '—'}</span>
              </span>
              <span className="bg-white/10 px-2 py-1 rounded">
                <span className="text-gray-400">Exp ≥</span> 
                <span className="ml-1 font-medium text-white">{minExperience}</span>
              </span>
              {gender && (
                <span className="bg-white/10 px-2 py-1 rounded">
                  <span className="text-gray-400">Género:</span> 
                  <span className="ml-1 font-medium text-white">{gender}</span>
                </span>
              )}
              {cities && (
                <span className="bg-white/10 px-2 py-1 rounded">
                  <span className="text-gray-400">Ciudades:</span> 
                  <span className="ml-1 font-medium text-white">{cities}</span>
                </span>
              )}
            </div>
          </div>

          {/* Candidates */}
          {pageItems.map((c: Candidate, index: number) => (
            <div key={c.cvId} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 transition-all">
              {/* Header with Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{c.fullName}</h3>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                </div>
                <div className="sm:w-64">
                  <ScoreBar score={c.score} maxScore={10} label="Score" compact={true} />
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {(c.skills || []).slice(0, 8).map((skill: string) => {
                    const skillLower = skill.toLowerCase();
                    let type: 'required' | 'preferred' | 'matched' | 'unmatched' = 'unmatched';
                    
                    if (parsedRequired.includes(skillLower)) type = 'required';
                    else if (parsedPreferred.includes(skillLower)) type = 'preferred';
                    else if (jdTokens.some(token => skillLower.includes(token))) type = 'matched';
                    
                    return <SkillTag key={skill} skill={skill} type={type} compact={true} />;
                  })}
                  {(c.skills || []).length > 8 && (
                    <span className="text-xs text-gray-400 px-2 py-1">+{(c.skills || []).length - 8} más</span>
                  )}
                </div>
              </div>

              {/* Match Indicators */}
              <div className="mb-3">
                <MatchIndicator
                  requiredMatches={c.reasons?.requiredMatches || 0}
                  preferredMatches={c.reasons?.preferredMatches || 0}
                  jobDescriptionMatches={c.reasons?.jobDescriptionMatches || 0}
                  totalRequired={parsedRequired.length}
                  totalPreferred={parsedPreferred.length}
                  compact={true}
                />
              </div>

              {/* Details Grid */}
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                <div className="p-2 bg-black/30 border border-white/10 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-1">
                    <span className="text-[10px] mr-1">💼</span>
                    <span className="text-xs">Exp.</span>
                  </div>
                  <div className="font-semibold text-white text-sm">{c.experienceYears}a</div>
                </div>
                <div className="p-2 bg-black/30 border border-white/10 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-1">
                    <span className="text-[10px] mr-1">🎓</span>
                    <span className="text-xs">Educ.</span>
                  </div>
                  <div className="font-medium text-white text-xs truncate">
                    {(c.education || [])[0] || '—'}
                  </div>
                </div>
                <div className="p-2 bg-black/30 border border-white/10 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-1">
                    <span className="text-[10px] mr-1">📍</span>
                    <span className="text-xs">Ubic.</span>
                  </div>
                  <div className="font-medium text-white text-xs truncate">
                    {c.city || '—'}
                  </div>
                </div>
                <div className="p-2 bg-black/30 border border-white/10 rounded-lg">
                  <div className="flex items-center text-gray-400 mb-1">
                    <span className="text-[10px] mr-1">⚧</span>
                    <span className="text-xs">Género</span>
                  </div>
                  <div className="font-medium text-white text-xs">
                    {c.gender || '—'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <a
                  href={`/candidate/${c.userId}?required=${encodeURIComponent(requiredSkills)}&preferred=${encodeURIComponent(preferredSkills)}&jd=${encodeURIComponent(jobDescription)}`}
                  className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-500 transition-all"
                >
                  <span className="flex items-center">
                    <span className="mr-1 text-[10px]">👤</span>
                    Ver perfil
                  </span>
                </a>
              </div>
            </div>
          ))}

          {/* Enhanced Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/30 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="px-2 py-1.5 bg-white/10 rounded disabled:opacity-40 hover:bg-white/20 transition-all"
              >
                ←
              </button>
              <span className="px-2 py-1.5 bg-indigo-500/20 rounded border border-indigo-500/30">
                <span className="font-bold text-white">{currentPage}</span>/{totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                className="px-2 py-1.5 bg-white/10 rounded disabled:opacity-40 hover:bg-white/20 transition-all"
              >
                →
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-300">Por pág:</span>
              <select 
                className="p-1 bg-black/40 border border-white/10 rounded text-xs text-white" 
                value={pageSize} 
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {result && result.count > 0 && !loading && (
        <div className="mt-8 p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-lg">
          <Analytics 
            candidates={sortedCandidates}
          />
        </div>
      )}

      {result && result.count === 0 && !loading && (
        <div className="p-6 mt-4 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg">
          No se encontraron candidatos con los filtros actuales. Probá quitar alguna skill requerida o bajar el mínimo de experiencia.
        </div>
      )}
      </div>
    </div>
  );
}
