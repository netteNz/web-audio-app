import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../../hooks/useClickOutside';

// One below Tailwind's sm breakpoint (min-width: 640px) so the two never overlap
const MOBILE_QUERY = '(max-width: 639.98px)';

const STYLES = [
  { id: 'simple', name: 'Bars' },
  { id: 'minimal', name: 'Line' },
  { id: 'wave', name: 'Wave' },
];

const AnimationStyleDropdown = ({ style, onChange, label = 'Style' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const containerRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Desktop list closes on outside click. The mobile sheet is portaled to
  // <body> and has its own backdrop, so it must not use this.
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close, isOpen && !isMobile);

  const selectedStyle = STYLES.find(s => s.id === style) || STYLES[0];

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
          {STYLES.map((styleOption) => (
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
    <div className="relative z-20" ref={containerRef}>
      {isMobile ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 transition-colors text-zinc-400"
          aria-label="Visualization style"
        >
          <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>graphic_eq</span>
        </button>
      ) : (
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
      )}

      {mobileDropdown}

      {isOpen && !isMobile && (
        <div className="absolute top-full left-0 mt-2 w-full bg-zinc-800 rounded-lg shadow-xl shadow-black/40 py-1.5 z-30 border border-zinc-700 animate-fadein origin-top">
          {STYLES.map((styleOption) => (
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