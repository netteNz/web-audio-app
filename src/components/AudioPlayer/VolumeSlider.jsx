import React, { useState, useEffect, useRef } from 'react';

const VolumeSlider = ({ volume, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sliderRef = useRef(null);
  const previousVolumeRef = useRef(1);

  const getVolumeIcon = () => {
    const name = volume === 0 ? 'volume_off' : volume < 0.3 ? 'volume_mute' : volume < 0.7 ? 'volume_down' : 'volume_up';
    return <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>{name}</span>;
  };

  useEffect(() => {
    if (volume > 0) {
      previousVolumeRef.current = volume;
    }
  }, [volume]);

  const handleVolumeButtonClick = (e) => {
    e.preventDefault();
    if (isOpen) {
      onChange(volume === 0 ? previousVolumeRef.current : 0);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex items-center gap-2" ref={sliderRef}>
      {/* Horizontal slider expands to the left */}
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-24 appearance-none bg-zinc-700 rounded-lg cursor-pointer accent-violet-400 h-1.5"
        />
      </div>

      <button
        onClick={handleVolumeButtonClick}
        className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full z-10 transition-all duration-150 active:scale-90 flex items-center justify-center"
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};

export default VolumeSlider;
