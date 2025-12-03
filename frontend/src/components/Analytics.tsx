import React from 'react';
import type { Candidate } from '../types';

interface AnalyticsProps {
  candidates: Candidate[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ candidates }) => {
  if (!candidates.length) return null;

  // Calculate statistics
  const totalCandidates = candidates.length;
  const avgScore = candidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates;
  const avgExperience = candidates.reduce((sum, c) => sum + c.experienceYears, 0) / totalCandidates;
  
  // Skill distribution
  const skillFrequency: Record<string, number> = {};
  candidates.forEach(candidate => {
    (candidate.skills || []).forEach((skill: string) => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
  });

  // Top skills
  const topSkills = Object.entries(skillFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Experience distribution
  const experienceRanges = {
    '0-2 años': candidates.filter(c => c.experienceYears <= 2).length,
    '3-5 años': candidates.filter(c => c.experienceYears >= 3 && c.experienceYears <= 5).length,
    '6-10 años': candidates.filter(c => c.experienceYears >= 6 && c.experienceYears <= 10).length,
    '10+ años': candidates.filter(c => c.experienceYears > 10).length,
  };

  // Location distribution
  const locationDistribution: Record<string, number> = {};
  candidates.forEach(candidate => {
    if (candidate.city) {
      locationDistribution[candidate.city] = (locationDistribution[candidate.city] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <span className="mr-2">📈</span>
        Analytics de Candidatos
      </h3>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Total Candidatos</p>
              <p className="text-2xl font-bold text-white">{totalCandidates}</p>
            </div>
            <span className="text-lg">👥</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Score Promedio</p>
              <p className="text-2xl font-bold text-white">{avgScore.toFixed(2)}</p>
            </div>
            <span className="text-lg">⭐</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300">Exp. Promedio</p>
              <p className="text-2xl font-bold text-white">{avgExperience.toFixed(1)} años</p>
            </div>
            <span className="text-lg">💼</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300">Skills Únicas</p>
              <p className="text-2xl font-bold text-white">{Object.keys(skillFrequency).length}</p>
            </div>
            <span className="text-lg">🛠️</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Skills */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Top Skills Más Comunes</h4>
          <div className="space-y-2">
            {topSkills.map(([skill, count]) => {
              const percentage = (count / totalCandidates) * 100;
              return (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate mr-2">{skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Distribution */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Distribución de Experiencia</h4>
          <div className="space-y-2">
            {Object.entries(experienceRanges).map(([range, count]) => {
              const percentage = (count / totalCandidates) * 100;
              return (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Locations */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Top Ubicaciones</h4>
          <div className="space-y-2">
            {topLocations.map(([city, count]) => {
              const percentage = (count / totalCandidates) * 100;
              return (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate mr-2">{city}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Quality */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Calidad del Match</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Score ≥ 8.0</span>
                <span className="text-green-400 font-medium">
                  {candidates.filter(c => c.score >= 8).length} candidatos
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(candidates.filter(c => c.score >= 8).length / totalCandidates) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Score 6.0 - 7.9</span>
                <span className="text-yellow-400 font-medium">
                  {candidates.filter(c => c.score >= 6 && c.score < 8).length} candidatos
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${(candidates.filter(c => c.score >= 6 && c.score < 8).length / totalCandidates) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Score &lt; 6.0</span>
                <span className="text-red-400 font-medium">
                  {candidates.filter(c => c.score < 6).length} candidatos
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(candidates.filter(c => c.score < 6).length / totalCandidates) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
