import React, { useRef, useState, useEffect } from 'react';
import { parseBlob } from 'music-metadata';
import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Waveform from './Waveform';
import VolumeSlider from './VolumeSlider';
import VisualizerBars from './VisualizerBars';

const AudioPlayer = () => {
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const [volume, setVolume] = useState(1);

  const [metadata, setMetadata] = useState({
    title: 'Neuro Pulse',
    artist: 'You',
    album: '',
    picture: null,
  });

  const audioSrc = import.meta.env.BASE_URL + 'example.mp3';

  useEffect(() => {
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
    <div className="w-full max-w-4xl mx-auto mt-10 p-6 rounded-xl bg-zinc-900 text-white space-y-8 shadow-lg">
      <TrackInfo metadata={metadata} />

      <Waveform
        src={audioSrc}
        wavesurferRef={wavesurferRef}
        onReady={() => setIsWaveReady(true)}
      />

      {isWaveReady && <VisualizerBars wavesurferRef={wavesurferRef} />}

      <div className="flex justify-center items-center gap-6 pt-2">
        <AudioControls isPlaying={isPlaying} onPlayPause={togglePlay} />
        <div className="w-full max-w-xs">
          <VolumeSlider volume={volume} onChange={handleVolumeChange} />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
