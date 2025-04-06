import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const AnimationStyleDropdown = ({ style, onChange, label = 'Style' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const styles = [
    { id: 'simple', name: 'Bar Graph' },
    { id: 'minimal', name: 'Line' },
    { id: 'wave', name: 'Wave Effect' }
  ];

  const selectedStyle = styles.find(s => s.id === style) || styles[0];

  const handleSelect = (styleId) => {
    onChange(styleId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-zinc-800 rounded-md"
      >
        <span className="text-zinc-400">{label}:</span>
        <div className="flex items-center">
          <span className="mr-2 text-white">{selectedStyle.name}</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-zinc-800 rounded-md shadow-lg py-1 border border-zinc-700">
          {styles.map((styleOption) => (
            <button
              key={styleOption.id}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 ${
                styleOption.id === style ? 'bg-zinc-700 text-cyan-400' : 'text-white'
              }`}
              onClick={() => handleSelect(styleOption.id)}
            >
              {styleOption.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimationStyleDropdown;