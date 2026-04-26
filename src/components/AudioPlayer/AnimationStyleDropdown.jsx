import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const AnimationStyleDropdown = ({ style, onChange, label = 'Style' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const styles = [
    { id: 'simple', name: 'Bars' },
    { id: 'minimal', name: 'Line' },
    { id: 'wave', name: 'Wave' }
  ];

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedStyle = styles.find(s => s.id === style) || styles[0];

  const handleSelect = (styleId) => {
    onChange(styleId);
    setIsOpen(false);
  };

  const mobileDropdown = isMobile && isOpen ? createPortal(
    <div className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      <div 
        className="fixed inset-x-0 bottom-0 bg-zinc-900 rounded-t-2xl p-4 border-t border-zinc-700 shadow-2xl transform transition-transform"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Select {label}</span>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-zinc-300 transition-colors p-1">
            <span className="material-symbols-rounded leading-none" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>
        <div className="space-y-1">
          {styles.map((styleOption) => (
            <button
              key={styleOption.id}
              className={
                `block w-full text-left px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                  styleOption.id === style
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-white hover:bg-zinc-800'
                }`
              }
              onClick={() => handleSelect(styleOption.id)}
            >
              {styleOption.name}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-md border border-zinc-700/50"
      >
        <span className="text-zinc-400">{label}:</span>
        <div className="flex items-center">
          <span className="mr-2 text-white">{selectedStyle.name}</span>
          <span className={`material-symbols-rounded leading-none select-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ fontSize: 20 }}>expand_more</span>
        </div>
      </button>

      {mobileDropdown}

      {isOpen && !isMobile && (
        <div className="absolute top-full left-0 mt-2 w-full bg-zinc-800 rounded-lg shadow-xl shadow-black/40 py-1.5 z-30 border border-zinc-700 animate-fadein origin-top">
          {styles.map((styleOption) => (
            <button
              key={styleOption.id}
              className={
                `block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  styleOption.id === style
                    ? 'bg-zinc-700 text-violet-400 font-medium'
                    : 'text-white hover:bg-zinc-700/50'
                }`
              }
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