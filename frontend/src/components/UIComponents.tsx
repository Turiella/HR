import React from 'react';

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ 
  score, 
  maxScore = 10, 
  label, 
  size = 'md',
  compact = false 
}) => {
  const percentage = (score / maxScore) * 100;
  const sizeClasses = {
    sm: 'h-2 text-xs',
    md: 'h-3 text-sm',
    lg: 'h-4 text-base'
  };

  const compactClasses = {
    sm: 'h-1.5 text-[10px]',
    md: 'h-2 text-xs',
    lg: 'h-2.5 text-xs'
  };

  const finalClasses = compact ? compactClasses[size] : sizeClasses[size];

  const getColorClass = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {label && !compact && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-300">{label}</span>
          <span className="text-xs font-bold text-white">{score.toFixed(2)}</span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${finalClasses}`}>
        <div
          className={`h-full ${getColorClass(percentage)} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface SkillTagProps {
  skill: string;
  type: 'required' | 'preferred' | 'matched' | 'unmatched';
  size?: 'sm' | 'md';
  compact?: boolean;
}

export const SkillTag: React.FC<SkillTagProps> = ({ 
  skill, 
  type, 
  size = 'md',
  compact = false
}) => {
  const typeClasses = {
    required: 'bg-green-500/20 text-green-300 border-green-500/50',
    preferred: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    matched: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    unmatched: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs'
  };

  const compactClasses = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-1.5 py-0.5 text-[10px]'
  };

  const finalClasses = compact ? compactClasses[size] : sizeClasses[size];

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${typeClasses[type]} 
      ${finalClasses}
    `}>
      {skill}
    </span>
  );
};

interface MatchIndicatorProps {
  requiredMatches: number;
  preferredMatches: number;
  jobDescriptionMatches: number;
  totalRequired: number;
  totalPreferred: number;
  compact?: boolean;
}

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({
  requiredMatches,
  preferredMatches,
  jobDescriptionMatches,
  totalRequired,
  totalPreferred,
  compact = false
}) => {
  const requiredPercentage = totalRequired > 0 ? (requiredMatches / totalRequired) * 100 : 0;
  const preferredPercentage = totalPreferred > 0 ? (preferredMatches / totalPreferred) * 100 : 0;

  const containerClasses = compact ? 'space-y-1' : 'space-y-2';
  const textClasses = compact ? 'text-[10px]' : 'text-xs';
  const barWidth = compact ? 'w-16' : 'w-20';
  const barHeight = compact ? 'h-1' : 'h-2';

  return (
    <div className={containerClasses}>
      <div className={`flex items-center justify-between ${textClasses}`}>
        <span className="text-green-300">R: {requiredMatches}/{totalRequired}</span>
        <ScoreBar score={requiredPercentage} maxScore={100} size="sm" compact={compact} />
      </div>
      <div className={`flex items-center justify-between ${textClasses}`}>
        <span className="text-yellow-300">P: {preferredMatches}/{totalPreferred}</span>
        <ScoreBar score={preferredPercentage} maxScore={100} size="sm" compact={compact} />
      </div>
      <div className={`flex items-center justify-between ${textClasses}`}>
        <span className="text-blue-300">JD: {jobDescriptionMatches}</span>
        <div className={`${barWidth} bg-gray-700 rounded-full ${barHeight}`}>
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${Math.min(jobDescriptionMatches * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  message?: string;
  progress?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Analizando candidatos...", 
  progress 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{progress}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-300 animate-pulse">{message}</p>
    </div>
  );
};
