import React, { useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '',
  showValue = true,
  className = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  // Apply custom styles on mount
  useEffect(() => {
    const styleId = 'slider-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = sliderStyles;
      document.head.appendChild(style);
    }
  }, []);

  const getColorClass = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {showValue && (
            <span className="text-sm font-bold text-white">
              {value}{unit && ` ${unit}`}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${getColorClass(percentage)} 0%, ${getColorClass(percentage)} ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

// Custom styles for the slider thumb
export const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border: 3px solid #ffffff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
    position: relative;
    z-index: 10;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 12px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, #4f46e5, #4338ca);
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border: 3px solid #ffffff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
    position: relative;
    z-index: 10;
  }
  
  .slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 12px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, #4f46e5, #4338ca);
  }

  .slider::-webkit-slider-runnable-track {
    height: 12px;
    border-radius: 6px;
    background: #374151;
  }

  .slider::-moz-range-track {
    height: 12px;
    border-radius: 6px;
    background: #374151;
  }
`;
