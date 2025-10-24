import { useState } from 'react';
import { getRanking } from '../api/ranking';
import type { RankingRequest } from '../api/ranking';

export default function RecruiterPanel() {
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('node, postgres');
  const [preferredSkills, setPreferredSkills] = useState('docker');
  const [minExperience, setMinExperience] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'name'>('score');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [gender, setGender] = useState('');
  const [cities, setCities] = useState('');
  const [jobLat, setJobLat] = useState<string>('');
  const [jobLon, setJobLon] = useState<string>('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>('');

  const handleRank = async () => {
    setLoading(true);
    try {
      const payload: RankingRequest & { gender?: string; cities?: string[]; jobLat?: number; jobLon?: number; maxDistanceKm?: number } = {
        jobDescription,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minExperience: Number(minExperience) || 0,
        gender: gender || undefined,
        cities: cities.split(',').map(s => s.trim()).filter(Boolean),
        jobLat: jobLat ? Number(jobLat) : undefined,
        jobLon: jobLon ? Number(jobLon) : undefined,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined
      };
      const token = localStorage.getItem('token') || '';
      const data = await getRanking(payload, token);
      setResult(data);
      setPage(1);
    } catch (e) {
      alert('Error generando ranking');
    } finally {
      setLoading(false);
    }
  };

  const parsedRequired = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const parsedPreferred = preferredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const jdTokens = jobDescription.toLowerCase().split(/[^a-zá-ú0-9+#\.]+/i).map(s => s.trim()).filter(Boolean);

  const sortedCandidates = (result?.candidates || []).slice().sort((a: any, b: any) => {
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
    const rows = [
      ['Nombre','Email','Score','Años','Skills','Required matches','Preferred matches','JD matches','Exp OK']
    ];
    for (const c of sortedCandidates) {
      rows.push([
        c.fullName,
        c.email,
        String(c.score),
        String(c.experienceYears),
        (c.skills || []).join(' '),
        String(c.reasons?.requiredMatches ?? ''),
        String(c.reasons?.preferredMatches ?? ''),
        String(c.reasons?.jobDescriptionMatches ?? ''),
        String(c.reasons?.experienceOK ?? '')
      ]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ranking.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel de Reclutador</h1>
        <p className="mt-1 text-sm text-gray-400">Filtrá candidatos y generá un ranking en base a skills, experiencia y descripción del puesto.</p>
      </div>

      <div className="p-4 mb-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Required skills (coma separadas)</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="node, postgres" />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Preferred skills (coma separadas)</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={preferredSkills} onChange={e => setPreferredSkills(e.target.value)} placeholder="docker" />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Años mínimos de experiencia</label>
            <input type="number" className="w-full p-2 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" value={minExperience} onChange={e => setMinExperience(Number(e.target.value))} min={0} />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Género</label>
            <select className="w-full p-2 bg-black/20 border border-white/10 rounded" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Ciudades (coma separadas)</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded" value={cities} onChange={e => setCities(e.target.value)} placeholder="Buenos Aires, Córdoba" />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Latitud del puesto</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded" value={jobLat} onChange={e => setJobLat(e.target.value)} placeholder="-34.6037" />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Longitud del puesto</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded" value={jobLon} onChange={e => setJobLon(e.target.value)} placeholder="-58.3816" />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1 text-sm font-medium">Distancia máx (km)</label>
            <input className="w-full p-2 bg-black/20 border border-white/10 rounded" value={maxDistanceKm} onChange={e => setMaxDistanceKm(e.target.value)} placeholder="20" />
          </div>
          <div className="md:col-span-3">
            <label className="block mb-1 text-sm font-medium">Descripción del puesto / Prompt</label>
            <textarea className="w-full p-3 bg-black/20 border border-white/10 rounded outline-none focus:ring-2 focus:ring-indigo-500" rows={4} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Breve descripción del puesto, responsabilidades y tecnologías clave" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleRank} disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50">
            {loading ? 'Generando...' : 'Generar ranking'}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <label>Ordenar por</label>
            <select className="p-1 bg-black/20 border border-white/10 rounded" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="score">Score</option>
              <option value="experience">Experiencia</option>
              <option value="name">Nombre</option>
            </select>
            <select className="p-1 bg-black/20 border border-white/10 rounded" value={sortDir} onChange={e => setSortDir(e.target.value as any)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          {result?.count > 0 && (
            <button onClick={downloadCSV} className="px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500">Exportar CSV</button>
          )}
          {result?.count !== undefined && (
            <span className="text-sm text-gray-300">Resultados: <strong>{result.count}</strong></span>
          )}
        </div>
      </div>

      {result && result.count > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400">
            Mostrando ranking para required: <span className="font-medium text-gray-200">{requiredSkills || '—'}</span>, preferred: <span className="font-medium text-gray-200">{preferredSkills || '—'}</span>, exp ≥ <span className="font-medium text-gray-200">{minExperience}</span>
            {gender && <> • género: <span className="font-medium text-gray-200">{gender}</span></>} 
            {cities && <> • ciudades: <span className="font-medium text-gray-200">{cities}</span></>}
            {(jobLat && jobLon && maxDistanceKm) && <> • radio: <span className="font-medium text-gray-200">{maxDistanceKm}km</span></>}
          </div>
          {pageItems.map((c: any) => (
            <div key={c.cvId} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{c.fullName}</div>
                  <div className="text-xs text-gray-400">{c.email}</div>
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">Score</span>
                    <span className="font-medium">{Number(c.score).toFixed(2)}</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-black/30 rounded">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, (c.score || 0) * 10)}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm">
                <span className="text-gray-400">Skills: </span>
                <span className="font-medium">
                  {(c.skills || []).map((s: string, idx: number) => {
                    const sl = s.toLowerCase();
                    const matched = parsedRequired.includes(sl) || parsedPreferred.includes(sl) || jdTokens.includes(sl);
                    return (
                      <span key={s} className={matched ? 'text-indigo-300' : ''}>
                        {s}{idx < (c.skills?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    );
                  })}
                </span>
              </div>

              <div className="grid gap-3 mt-3 text-sm md:grid-cols-3">
                <div className="p-2 bg-black/20 border border-white/10 rounded">
                  <div className="text-gray-400">Experiencia</div>
                  <div className="font-medium">{c.experienceYears} años</div>
                </div>
                <div className="p-2 bg-black/20 border border-white/10 rounded">
                  <div className="text-gray-400">Educación</div>
                  <div className="font-medium">{(c.education || []).join(', ') || '—'}</div>
                </div>
                <div className="p-2 bg-black/20 border border-white/10 rounded">
                  <div className="text-gray-400">Razones</div>
                  <ul className="pl-4 text-xs list-disc text-gray-300">
                    <li>Required matches: {c.reasons?.requiredMatches}</li>
                    <li>Preferred matches: {c.reasons?.preferredMatches}</li>
                    <li>Job description matches: {c.reasons?.jobDescriptionMatches}</li>
                    <li>Experiencia mínima cumplida: {String(c.reasons?.experienceOK)}</li>
                    {c.reasons?.distanceKm != null && (
                      <li>Distancia: {c.reasons.distanceKm} km</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-gray-400">
                <div>Ciudad: <span className="font-medium text-gray-200">{c.city || '—'}</span> • Género: <span className="font-medium text-gray-200">{c.gender || '—'}</span></div>
                <a href={`/candidate/${c.userId}`} className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-500">Ver perfil</a>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">Siguiente</button>
            </div>
            <div className="flex items-center gap-2">
              <span>Por página</span>
              <select className="p-1 bg-black/20 border border-white/10 rounded" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {result && result.count === 0 && (
        <div className="p-6 mt-4 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg">
          No se encontraron candidatos con los filtros actuales. Probá quitar alguna skill requerida o bajar el mínimo de experiencia.
        </div>
      )}
    </div>
  );
}
