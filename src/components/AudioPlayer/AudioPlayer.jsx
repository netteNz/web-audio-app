import React, { useRef, useState, useEffect } from 'react';
import { parseBlob } from 'music-metadata';
import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Waveform from './Waveform';
import VolumeSlider from './VolumeSlider';
import VisualizerBars from './VisualizerBars';
import AnimationStyleDropdown from './AnimationStyleDropdown';
import { Upload } from 'lucide-react';

const AudioPlayer = () => {
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const [volume, setVolume] = useState(1);
  const [animationStyle, setAnimationStyle] = useState('minimal');
  const [dragging, setDragging] = useState(false);
  const [audioSrc, setAudioSrc] = useState(import.meta.env.BASE_URL + 'example.mp3');

  const [metadata, setMetadata] = useState({
    title: 'Neuro Pulse',
    artist: 'You',
    album: '',
    picture: null,
  });

  const handleAudioLoad = (file) => {
    if (!file) return;
    
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    setAudioSrc(objectUrl);
    setIsWaveReady(false);
    
    // Clean up previous wavesurfer instance if needed
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    
    // Extract metadata
    const fetchMetadata = async () => {
      try {
        const meta = await parseBlob(file);
        
        const pictureData = meta.common.picture?.[0];
        const pictureUrl = pictureData
          ? URL.createObjectURL(new Blob([pictureData.data]))
          : null;
          
        setMetadata({
          title: meta.common.title || file.name || 'Unknown Title',
          artist: meta.common.artist || 'Unknown Artist',
          album: meta.common.album || '',
          picture: pictureUrl,
        });
      } catch (err) {
        console.error('Failed to extract metadata:', err);
        setMetadata({
          title: file.name || 'Unknown Title',
          artist: 'Unknown Artist',
          album: '',
          picture: null,
        });
      }
    };
    
    fetchMetadata();
  };

  // Drag and drop handling
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('audio/')) {
      handleAudioLoad(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleAudioLoad(file);
    }
  };

  useEffect(() => {
    if (!audioSrc.startsWith('blob:')) {
      const fetchMetadata = async () => {
        try {
          const response = await fetch(audioSrc);
          const blob = await response.blob();
          const meta = await parseBlob(blob);

          const pictureData = meta.common.picture?.[0];
          const pictureUrl = pictureData
            ? URL.createObjectURL(new Blob([pictureData.data]))
            : null;

          setMetadata({
            title: meta.common.title || 'Unknown Title',
            artist: meta.common.artist || 'Unknown Artist',
            album: meta.common.album || '',
            picture: pictureUrl,
          });
        } catch (err) {
          console.error('Failed to extract metadata:', err);
        }
      };

      fetchMetadata();
    }
    
    // Clean up object URLs when component unmounts
    return () => {
      if (audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
      }
      if (metadata.picture?.startsWith('blob:')) {
        URL.revokeObjectURL(metadata.picture);
      }
    };
  }, [audioSrc]);

  const togglePlay = async () => {
    const ws = wavesurferRef.current;

    if (ws && isWaveReady) {
      try {
        const audioContext = ws.getAudioContext?.() || ws.backend?.ac;
        if (audioContext?.state === 'suspended') {
          await audioContext.resume();
        }
      } catch (err) {
        console.error('AudioContext resume error:', err);
      }

      ws.playPause();
      setIsPlaying(ws.isPlaying());
    }
  };

  const handleVolumeChange = (val) => {
    setVolume(val);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(val);
    }
  };

  return (
    <div 
      className={`w-full max-w-4xl mx-auto mt-10 p-6 rounded-xl bg-zinc-900 text-white space-y-8 shadow-lg transition-colors ${dragging ? 'bg-zinc-800 border-2 border-dashed border-cyan-400' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center">
        <TrackInfo metadata={metadata} />
        
        <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors flex items-center gap-2">
          <Upload size={16} />
          <span>Load Audio</span>
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <Waveform
        src={audioSrc}
        wavesurferRef={wavesurferRef}
        onReady={() => setIsWaveReady(true)}
      />

      {isWaveReady && <VisualizerBars 
        wavesurferRef={wavesurferRef}
        animationStyle={animationStyle}
      />}

      <div className="flex items-center justify-between gap-6 pt-2 px-6">
        <div className="w-40">
          <AnimationStyleDropdown 
            style={animationStyle} 
            onChange={setAnimationStyle} 
            label="Style"
          />
        </div>
        <AudioControls isPlaying={isPlaying} onPlayPause={togglePlay} />
        <div className="w-full max-w-xs">
          <VolumeSlider volume={volume} onChange={handleVolumeChange} />
        </div>
      </div>

      {!isWaveReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-xl">
          <div className="text-white text-lg">Loading audio...</div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;