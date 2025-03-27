// src/components/AudioPlayer/VolumeSlider.jsx

import React from 'react';

const VolumeSlider = ({ volume, onChange }) => {
  return (
    <div className="w-full max-w-xs px-4">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
};

export default VolumeSlider;
