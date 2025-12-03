import React, { useState } from 'react';

interface SearchPreset {
  name: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  jobDescription: string;
  icon: string;
}

import { searchPresets } from '../constants/presets';

interface SearchPresetsProps {
  onApplyPreset: (preset: SearchPreset) => void;
}

export const SearchPresets: React.FC<SearchPresetsProps> = ({ onApplyPreset }) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
        <span className="mr-2 text-xs">🚀</span>
        Búsquedas Rápidas (Presets)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {searchPresets.map((preset) => (
          <div
            key={preset.name}
            className={`
              p-4 rounded-xl border cursor-pointer transition-all duration-200 group
              ${selectedPreset === preset.name 
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-lg shadow-indigo-500/20' 
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50 hover:shadow-md hover:shadow-gray-900/20'
              }
            `}
            onClick={() => {
              setSelectedPreset(preset.name);
              onApplyPreset(preset);
            }}
          >
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2 group-hover:scale-110 transition-transform">{preset.icon}</span>
              <span className="font-semibold text-white text-sm">{preset.name}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{preset.description}</p>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {preset.requiredSkills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
                {preset.requiredSkills.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">+{preset.requiredSkills.length - 3}</span>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1">⏱️</span>
                <span>{preset.minExperience}+ años exp.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-10 ${positionClasses[position]} w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg border border-gray-700`}>
          <div className="relative">
            {content}
            <div className={`
              absolute w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45
              ${position === 'top' ? 'bottom-full -mb-1' : ''}
              ${position === 'bottom' ? 'top-full -mt-1' : ''}
              ${position === 'left' ? 'right-full -mr-1' : ''}
              ${position === 'right' ? 'left-full -ml-1' : ''}
            `} />
          </div>
        </div>
      )}
    </div>
  );
};

interface FieldHelpProps {
  field: string;
  example?: string;
  tip?: string;
}

export const FieldHelp: React.FC<FieldHelpProps> = ({ field, example, tip }) => {
  const helpContent = (
    <div>
      <p className="font-semibold mb-1">{field}</p>
      {example && (
        <p className="mb-1">
          <span className="text-yellow-300">Ejemplo:</span> {example}
        </p>
      )}
      {tip && (
        <p className="text-gray-300 text-xs">{tip}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={helpContent} position="top">
      <span className="ml-1 text-gray-400 cursor-help hover:text-gray-300 text-[10px] leading-none">?</span>
    </Tooltip>
  );
};
