// src/components/AudioPlayer/VolumeSlider.jsx

import React, { useState } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';

const VolumeSlider = ({ volume, onChange }) => {
  const [isHovering, setIsHovering] = useState(false);

  // Choose appropriate volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.3) return <Volume size={20} />;
    if (volume < 0.7) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Volume icon button that also toggles mute */}
      <button 
        onClick={() => onChange(volume > 0 ? 0 : 1)}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full z-10"
      >
        {getVolumeIcon()}
      </button>

      {/* Vertical slider that appears on hover */}
      <div 
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-800 p-3 rounded-lg transition-all duration-200 ${
          isHovering ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-24 appearance-none bg-gray-700 rounded-lg cursor-pointer accent-cyan-500"
          style={{
            writingMode: 'bt-lr', /* IE */
            WebkitAppearance: 'slider-vertical', /* WebKit */
            width: '8px',
            padding: '0 5px'
          }}
          orient="vertical" /* Firefox legacy */
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
