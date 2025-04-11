// src/components/AudioPlayer/VolumeSlider.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';

const VolumeSlider = ({ volume, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sliderRef = useRef(null);
  const timeoutRef = useRef(null); // Reference to store our timeout
  
  // Choose appropriate volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.3) return <Volume size={20} />;
    if (volume < 0.7) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  // Start auto-hide timer
  const startAutoHideTimer = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout - hide after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 3000); // 3 seconds
  };

  // Handle opening the slider
  const handleOpenSlider = () => {
    setIsOpen(true);
    startAutoHideTimer();
  };

  // Toggle slider and handle timeouts
  const toggleSlider = () => {
    if (!isOpen) {
      setIsOpen(true);
      startAutoHideTimer();
    } else {
      setIsOpen(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  // Reset timer when user interacts with slider
  const handleSliderInteraction = () => {
    if (isOpen) {
      startAutoHideTimer();
    }
  };

  // Handle click outside to close the slider
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setIsOpen(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    // Add touch and mouse events to handle both mobile and desktop
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      // Clean up timeout when component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center" ref={sliderRef}>
      {/* Volume icon button that toggles mute and the slider */}
      <button 
        onClick={() => onChange(volume > 0 ? 0 : 1)}
        onMouseEnter={handleOpenSlider}
        onTouchStart={(e) => {
          e.stopPropagation();
          toggleSlider();
        }}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full z-10"
      >
        {getVolumeIcon()}
      </button>

      {/* Vertical slider that appears when open */}
      <div 
        onMouseMove={handleSliderInteraction} // Reset timer when mouse moves over slider
        onTouchMove={handleSliderInteraction} // Reset timer on touch interactions
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-800 p-3 rounded-lg transition-all duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            onChange(parseFloat(e.target.value));
            handleSliderInteraction(); // Reset timer when value changes
          }}
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
