import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getCandidateProfile } from '../api/candidates';
import { setPrimary } from '../api/cv';
import LogoutButton from '../components/LogoutButton';
import type { CandidateProfileData, CV, SearchQueryParams } from '../types';

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CandidateProfileData | null>(null);
  const [openJsonIndex, setOpenJsonIndex] = useState<number | null>(null);
  const [activeCat, setActiveCat] = useState<string>('');
  const location = useLocation();
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const recommendedIdRef = useRef<number | null>(null);

  const queryParams = useMemo((): SearchQueryParams => {
    const sp = new URLSearchParams(location.search);
    const required = sp.get('required') || '';
    const preferred = sp.get('preferred') || '';
    const jd = sp.get('jd') || '';
    const params: SearchQueryParams = {};
    if (required) params.required = required;
    if (preferred) params.preferred = preferred;
    if (jd) params.jd = jd;
    return params;
  }, [location.search]);

  // Sets de filtros para resaltar skills
  const requiredSet = useMemo(() => {
    const raw = queryParams.required;
    if (!raw) return new Set<string>();
    return new Set(
      raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    );
  }, [queryParams]);

  const preferredSet = useMemo(() => {
    const raw = queryParams.preferred;
    if (!raw) return new Set<string>();
    return new Set(
      raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    );
  }, [queryParams]);

  const skillClass = (s: string, small?: boolean) => {
    const key = String(s).toLowerCase();
    const base = small ? 'px-2 py-1 text-[11px] rounded border' : 'px-2 py-1 text-xs rounded border';
    if (requiredSet.has(key)) return `${base} bg-emerald-600/10 text-emerald-300 border-emerald-500/30`;
    if (preferredSet.has(key)) return `${base} bg-amber-600/10 text-amber-300 border-amber-500/30`;
    return `${base} bg-white/5 text-gray-200 border-white/10`;
  };

  const handleDownload = async (cvId: number, suggestedName?: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const url = `/api/cvs/${cvId}/download`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        alert('No se pudo descargar el archivo');
        return;
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      const name = typeof suggestedName === 'string' && suggestedName ? suggestedName : 'cv.pdf';
      const newName = window.prompt('Nombre del archivo a descargar', name);
      if (newName === null) { // cancelado
        window.URL.revokeObjectURL(dlUrl);
        return;
      }
      a.download = newName || name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch {
      alert('Error descargando archivo');
    }
  };

  const countMatches = (skills: string[]) => {
    const lower = (skills || []).map(s => String(s).toLowerCase());
    let req = 0, pref = 0;
    lower.forEach(s => {
      if (requiredSet.has(s)) req += 1;
      else if (preferredSet.has(s)) pref += 1;
    });
    return { req, pref };
  };

  const fetchData = async () => {
    try {
      if (!id) return;
      const token = localStorage.getItem('token') || '';
      const res = await getCandidateProfile(id, token, queryParams);
      setData(res);
      const firstCat = (res.categories?.[0]?.name) || '';
      // Si hay recomendado, activar su categoría primero
      const recCat = res?.recommendedCv?.cv?.category;
      setActiveCat(prev => prev || recCat || firstCat);
      recommendedIdRef.current = res?.recommendedCv?.cv?.id ?? null;
    } catch (error) {
      console.error('Error loading candidate profile:', error);
      setError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const chunkSkills = (skills: string[], size: number) => {
    const chunks: string[][] = [];
    for (let i = 0; i < skills.length; i += size) {
      chunks.push(skills.slice(i, i + size));
    }
    return chunks;
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, queryParams]);

  // Scroll a recomendado cuando cambia la categoría activa o los datos
  useEffect(() => {
    const recId = recommendedIdRef.current;
    if (!recId) return;
    const key = String(recId);
    const el = cardRefs.current[key];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [activeCat, data]);

  if (loading) return (
    <div className="max-w-5xl px-4 py-8 mx-auto animate-pulse">
      <div className="h-7 w-56 bg-white/10 rounded mb-6" />
      <div className="p-4 mb-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="h-6 w-64 bg-white/10 rounded mb-2" />
        <div className="h-4 w-40 bg-white/10 rounded mb-2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-28 bg-white/10 rounded" />
          <div className="h-5 w-24 bg-white/10 rounded" />
          <div className="h-5 w-20 bg-white/10 rounded" />
        </div>
      </div>
      <div className="h-6 w-48 bg-white/10 rounded mb-3" />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-7 w-20 bg-white/10 rounded" />
        <div className="h-7 w-20 bg-white/10 rounded" />
        <div className="h-7 w-20 bg-white/10 rounded" />
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="h-4 w-24 bg-white/10 rounded mb-3" />
          <div className="h-5 w-72 bg-white/10 rounded mb-2" />
          <div className="h-3 w-full bg-white/10 rounded" />
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="h-5 w-28 bg-white/10 rounded mb-3" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 bg-white/10 rounded" />
            <div className="h-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="max-w-5xl px-4 py-8 mx-auto text-red-400">{error}</div>;
  if (!data) return null;

  const { user, categories, recommendedCv } = data || {};
  const hasCoords = user?.lat != null && user?.lon != null;

  const catList: Array<{ name: string; primaryCv: CV; latestCv: CV; versions: CV[] }> = categories || [];
  const active = catList.find(c => c.name === activeCat) || null;


  const handleSetPrimary = async (cvId: number) => {
    try {
      const token = localStorage.getItem('token') || '';
      await setPrimary(cvId, token);
      await fetchData();
    } catch {
      alert('No se pudo marcar como principal');
    }
  };
return (
  <div className="max-w-5xl px-4 py-8 mx-auto">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Perfil de candidato</h1>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="px-3 py-1 text-sm text-white bg-white/10 border border-white/20 rounded hover:bg-white/20"
        >
          Volver
        </button>
        <LogoutButton variant="header" />
      </div>
    </div>

    {/* Sección de perfil del usuario */}
    <div className="p-4 mb-6 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">{user?.full_name}</div>
          <div className="text-sm text-gray-300">{user?.email}</div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded">
              Género: <span className="font-medium">{user?.gender || '—'}</span>
            </span>
            <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded">
              Ciudad: <span className="font-medium">{user?.city || '—'}</span>
            </span>
            {user?.created_at && (
              <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded">
                Alta: {new Date(user.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        {hasCoords && (
          <div className="w-full sm:w-64 h-40 mt-4 sm:mt-0">
            <iframe
              title="Mapa"
              className="w-full h-full rounded border border-white/10"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(user?.lon || 0) - 0.02}%2C${(user?.lat || 0) - 0.02}%2C${(user?.lon || 0) + 0.02}%2C${(user?.lat || 0) + 0.02}&layer=mapnik&marker=${user?.lat || 0}%2C${user?.lon || 0}`}
            />
          </div>
        )}
      </div>
    </div>

    {/* CV recomendado */}
    {recommendedCv?.cv && (
      <div className="p-4 mt-6 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div>
            <div className="mb-1 text-xs text-indigo-300">Recomendado según filtros</div>
            <div className="font-medium text-gray-100 flex items-center gap-2">
              {recommendedCv.cv.filename}
              <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">
                {String(recommendedCv.cv.category || '')}
              </span>
              {recommendedCv.cv.version != null && (
                <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">
                  v{recommendedCv.cv.version}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-300">
              Score: <span className="font-semibold">
                {Number(recommendedCv.cv.classification_score ?? 0).toFixed(2)}
              </span>
              {' '}• Required: {recommendedCv.reasons?.requiredMatches ?? 0}
              {' '}• Preferred: {recommendedCv.reasons?.preferredMatches ?? 0}
              {' '}• JD: {recommendedCv.reasons?.jobDescriptionMatches ?? 0}
            </div>
          </div>
          <div className="w-full sm:w-64 mt-2 sm:mt-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-300">Puntaje combinado</span>
              <span className="font-medium">{Number(recommendedCv.score ?? 0).toFixed(2)}</span>
            </div>
            <div className="h-2 overflow-hidden bg-black/30 rounded">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                style={{ 
                  width: `${Math.min(100, 
                    ((Number(recommendedCv.cv.classification_score ?? 0) + 
                     (recommendedCv.reasons?.requiredMatches ?? 0) + 
                     (recommendedCv.reasons?.preferredMatches ?? 0)) * 10)
                  )}%` 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Resto del componente... */}
    <h2 className="mb-3 text-xl font-semibold">CVs por categoría</h2>
    {/* Tabs de categorías */}
    <div className="flex flex-wrap gap-2 mb-4">
      {catList.map(cat => (
        <button
          key={cat.name}
          onClick={() => setActiveCat(cat.name)}
          className={`px-3 py-1 text-sm rounded border ${
            activeCat === cat.name 
              ? 'bg-indigo-600 text-white border-indigo-500' 
              : 'bg-white/5 border-white/10 text-gray-200'
          }`}
        >
          {cat.name.toUpperCase()}
        </button>
      ))}
      {catList.length === 0 && (
        <span className="text-sm text-gray-400">Sin categorías aún</span>
      )}
    </div>

    {/* Contenido de la categoría activa */}
    {active && (
      <div className="space-y-4">
        {/* CV principal */}
        {active.primaryCv && (
          <div
            ref={(el) => {
              if (el && active.primaryCv?.id) cardRefs.current[String(active.primaryCv.id)] = el;
            }}
            className={`p-4 bg-white/5 border ${recommendedIdRef.current === active.primaryCv.id ? 'border-indigo-400 ring-1 ring-indigo-400/40' : 'border-white/15'} rounded-lg shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
              <span>Principal</span>
              <button onClick={() => handleDownload(active.primaryCv.id, active.primaryCv.filename)} className="px-2 py-1 text-[11px] text-white bg-white/10 border border-white/20 rounded hover:bg-white/20">Descargar PDF</button>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-400">Archivo</div>
                <div className="font-medium text-gray-200 flex items-center gap-2">
                  {active.primaryCv.filename}
                  <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">{String(active.primaryCv.category || active.name)}</span>
                  {active.primaryCv.version != null && (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">v{active.primaryCv.version}</span>
                  )}
                </div>
                {active.primaryCv.created_at && (
                  <div className="text-xs text-gray-400">{new Date(active.primaryCv.created_at).toLocaleString()}</div>
                )}
                {(() => {
                  const { req, pref } = countMatches(active.primaryCv.skills || []);
                  return (
                    <div className="mt-1 text-xs text-gray-300">Matches • Required: <span className="text-emerald-300 font-medium">{req}</span> • Preferred: <span className="text-amber-300 font-medium">{pref}</span></div>
                  );
                })()}
              </div>
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-300">Score</span>
                  <span className="font-medium">{Number(active.primaryCv.classification_score ?? 0).toFixed(2)}</span>
                </div>
                <div className="h-2 overflow-hidden bg-black/30 rounded">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, ((active.primaryCv.classification_score ?? 0) * 100))}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm text-gray-400">Skills</div>
              {(() => {
                const list: string[] = active.primaryCv.skills || [];
                if (list.length === 0) return <span className="text-sm">—</span>;
                const cols = Math.max(1, Math.ceil(list.length / 5));
                const groups = chunkSkills(list, 5);
                return (
                  <div className="mt-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {groups.map((col, idx) => (
                      <div key={idx} className="space-y-1">
                        {col.map((s) => (
                          <div key={s} className={skillClass(s)}>
                            {s}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Historial de versiones */}
        <div className="p-4 bg-white/5 border border-white/15 rounded-lg">
          <div className="mb-3 text-sm font-medium">Historial</div>
          <div className="grid gap-5 md:grid-cols-2">
            {active.versions.map((item: CV, idx: number) => (
              <div
                key={item.id}
                ref={(el) => { if (el) cardRefs.current[String(item.id)] = el; }}
                className={`p-4 bg-white/5 border ${recommendedIdRef.current === item.id ? 'border-indigo-400 ring-1 ring-indigo-400/40' : 'border-white/15'} rounded-lg shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Archivo</div>
                    <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                      {item.filename}
                      <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">{String(item.category || active.name)}</span>
                      {item.version != null && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">v{item.version}</span>
                      )}
                    </div>
                    {item.created_at && (
                      <div className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</div>
                    )}
                    {(() => {
                      const { req, pref } = countMatches(item.skills || []);
                      return (
                        <div className="mt-1 text-[11px] text-gray-300">Matches • Required: <span className="text-emerald-300 font-medium">{req}</span> • Preferred: <span className="text-amber-300 font-medium">{pref}</span></div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.is_primary ? (
                      <button
                        className="w-8 h-8 flex items-center justify-center text-yellow-400 bg-yellow-500/10 rounded-full border border-yellow-400/30 cursor-default"
                        title="CV principal"
                        aria-label="CV principal"
                        disabled
                      >
                        {/* Star solid */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l2.917 6.09L22 9.27l-5 4.87L18.834 22 12 18.56 5.166 22 7 14.14l-5-4.87 7.083-1.18L12 2z"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-indigo-300 bg-white/5 rounded-full border border-white/20 hover:bg-white/10 hover:text-white"
                        title="Marcar como principal"
                        aria-label="Marcar como principal"
                      >
                        {/* Star outline */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      </button>
                    )}
                    <button onClick={() => handleDownload(item.id, item.filename)} className="px-2 py-1 text-xs text-white bg-white/10 border border-white/20 rounded hover:bg-white/20">Descargar</button>
                    <button onClick={() => setOpenJsonIndex(idx)} className="px-2 py-1 text-xs text-white bg-white/10 border border-white/20 rounded hover:bg-white/20">Ver JSON</button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-300">Score: <span className="font-medium">{Number(item.classification_score ?? 0).toFixed(2)}</span></div>
                <div className="mt-2">
                  <div className="text-xs text-gray-400">Skills</div>
                  {(() => {
                    const list: string[] = item.skills || [];
                    if (list.length === 0) return <span className="text-xs">—</span>;
                    const cols = Math.max(1, Math.ceil(list.length / 5));
                    const groups = chunkSkills(list, 5);
                    return (
                      <div className="mt-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                        {groups.map((col, cidx) => (
                          <div key={cidx} className="space-y-1">
                            {col.map((s) => (
                              <div key={s} className={skillClass(s, true)}>
                                {s}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
            {active.versions.length === 0 && <div className="text-sm text-gray-400">Sin versiones</div>}
          </div>
        </div>
      </div>
    )}
    {catList.length === 0 && (
      <div className="p-6 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg">
        No hay CVs cargados para este candidato.
      </div>
    )}

    <div className="mt-8">
      <Link to="/recruiter" className="px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-500">Volver al ranking</Link>
    </div>

    {openJsonIndex != null && active?.versions?.[openJsonIndex] && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-3xl p-4 bg-neutral-900 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Análisis del CV</div>
            <button 
              onClick={() => setOpenJsonIndex(null)} 
              className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded"
            >
              Cerrar
            </button>
          </div>
          <pre className="p-3 overflow-auto text-xs leading-relaxed bg-black/40 border border-white/10 rounded max-h-[60vh]">
            {JSON.stringify(active?.versions?.[openJsonIndex]?.parsed_data ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    )}
  </div>
);
}