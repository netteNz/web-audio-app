import React, { useRef, useState, useEffect } from 'react';
import { parseBlob } from 'music-metadata';
import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Waveform from './Waveform';
import VolumeSlider from './VolumeSlider';
import VisualizerBars from './VisualizerBars';
import AnimationStyleDropdown from './AnimationStyleDropdown';
import FullscreenPlayer from './FullscreenPlayer';
import PlaylistManager from './PlaylistManager';
import { trackEvent } from '../../utils/analytics';

const AudioPlayer = () => {
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [animationStyle, setAnimationStyle] = useState('wave');
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [playlist, setPlaylist] = useState([{
    id: crypto.randomUUID(),
    src: `${import.meta.env.BASE_URL}example.mp3`,
    metadata: { title: 'Example Track', artist: 'Unknown Artist', album: '', picture: null },
    duration: 0,
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTrack = playlist[currentIndex] ?? null;
  const audioSrc = currentTrack?.src ?? null;
  const metadata = currentTrack?.metadata ?? { title: '', artist: '', album: '', picture: null };
  const duration = currentTrack?.duration ?? 0;

  // Fetch metadata for non-blob tracks (e.g. the default example.mp3)
  useEffect(() => {
    if (!audioSrc || audioSrc.startsWith('blob:')) return;
    const idx = currentIndex;
    const fetchMetadata = async () => {
      try {
        const response = await fetch(audioSrc);
        const blob = await response.blob();
        const parsed = await parseBlob(blob);
        const pictureData = parsed.common.picture?.[0];
        const pictureUrl = pictureData
          ? URL.createObjectURL(new Blob([pictureData.data]))
          : null;
        setPlaylist(prev => prev.map((t, i) =>
          i === idx ? {
            ...t,
            metadata: {
              title: parsed.common.title || 'Unknown Title',
              artist: parsed.common.artist || 'Unknown Artist',
              album: parsed.common.album || '',
              picture: pictureUrl,
            },
          } : t
        ));
      } catch (err) {
        console.error('Failed to extract metadata:', err);
      }
    };
    fetchMetadata();
  }, [audioSrc]);

  // Revoke all blob URLs on unmount
  const playlistRef = useRef(playlist);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => {
    return () => {
      playlistRef.current.forEach(t => {
        if (t.src.startsWith('blob:')) URL.revokeObjectURL(t.src);
        if (t.metadata.picture?.startsWith('blob:')) URL.revokeObjectURL(t.metadata.picture);
      });
    };
  }, []);

  const handleFilesAdd = async (files) => {
    const fileArray = Array.from(files).filter(f => f.type.includes('audio/'));
    if (!fileArray.length) return;

    fileArray.forEach(file => {
      trackEvent('audio_load', {
        file_type: file.type,
        file_size: Math.round(file.size / 1024),
        file_name: file.name,
      });
    });

    const newTracks = await Promise.all(fileArray.map(async (file) => {
      const src = URL.createObjectURL(file);
      let meta = { title: file.name.replace(/\.[^/.]+$/, ''), artist: '', album: '', picture: null };
      try {
        const parsed = await parseBlob(file);
        meta = {
          title: parsed.common.title || meta.title,
          artist: parsed.common.artist || '',
          album: parsed.common.album || '',
          picture: parsed.common.picture?.[0]
            ? URL.createObjectURL(new Blob([parsed.common.picture[0].data], { type: parsed.common.picture[0].format }))
            : null,
        };
      } catch {}
      return { id: crypto.randomUUID(), src, metadata: meta, duration: 0 };
    }));

    setPlaylist(prev => {
      const updated = [...prev, ...newTracks];
      setCurrentIndex(updated.length - newTracks.length);
      return updated;
    });
    setIsPlaying(false);
    setIsWaveReady(false);
  };

  const selectTrack = (index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const removeTrack = (index) => {
    setPlaylist(prev => {
      const removed = prev[index];
      if (removed.src.startsWith('blob:')) URL.revokeObjectURL(removed.src);
      if (removed.metadata.picture?.startsWith('blob:')) URL.revokeObjectURL(removed.metadata.picture);
      return prev.filter((_, i) => i !== index);
    });
    setCurrentIndex(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
    if (index === currentIndex) {
      setIsPlaying(false);
    }
  };

  const handleWaveReady = () => {
    const ws = wavesurferRef.current;
    if (ws) {
      ws.setVolume(volume);
      const dur = ws.getDuration();
      setPlaylist(prev => prev.map((t, i) =>
        i === currentIndex ? { ...t, duration: dur } : t
      ));
    }
    setIsWaveReady(true);
  };

  // Drag and drop on card
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFilesAdd(e.dataTransfer.files);
  };

  const togglePlay = async () => {
    const ws = wavesurferRef.current;
    if (ws && isWaveReady) {
      try {
        const audioContext = ws.getAudioContext?.() || ws.backend?.ac;
        if (audioContext?.state === 'suspended') await audioContext.resume();
      } catch (err) {
        console.error('AudioContext resume error:', err);
      }
      ws.playPause();
      const isNowPlaying = ws.isPlaying();
      setIsPlaying(isNowPlaying);
      trackEvent(isNowPlaying ? 'audio_play' : 'audio_pause', {
        title: metadata.title,
        current_time: Math.round(ws.getCurrentTime()),
        duration: Math.round(ws.getDuration()),
      });
    }
  };

  const handleVolumeChange = (val) => {
    setVolume(val);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(val);
      if (Math.abs(val - volume) > 0.1) {
        trackEvent('volume_change', { value: Math.round(val * 10) / 10 });
      }
    }
  };

  const handleSeekForward = () => {
    const ws = wavesurferRef.current;
    if (ws && isWaveReady) ws.seekTo(Math.min((ws.getCurrentTime() + 10) / ws.getDuration(), 1));
  };

  const handleSeekBackward = () => {
    const ws = wavesurferRef.current;
    if (ws && isWaveReady) ws.seekTo(Math.max((ws.getCurrentTime() - 10) / ws.getDuration(), 0));
  };

  const handleStyleChange = (newStyle) => {
    trackEvent('visualization_change', { from: animationStyle, to: newStyle });
    setAnimationStyle(newStyle);
  };

  return (
    <>
      {isFullscreen && (
        <FullscreenPlayer
          onClose={() => setIsFullscreen(false)}
          metadata={metadata}
          duration={duration}
          wavesurferRef={wavesurferRef}
          animationStyle={animationStyle}
          isPlaying={isPlaying}
          volume={volume}
          onPlayPause={togglePlay}
          onSeekForward={handleSeekForward}
          onSeekBackward={handleSeekBackward}
          onVolumeChange={handleVolumeChange}
          currentIndex={currentIndex}
          playlistLength={playlist.length}
        />
      )}

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-1.5 sm:gap-3">
        {/* Main card */}
        <div
          className={`relative p-3 sm:p-6 rounded-2xl bg-zinc-950 text-white space-y-3 sm:space-y-6 shadow-2xl shadow-black/60 transition-colors ${
            dragging
              ? 'ring-2 ring-violet-400/50 bg-violet-400/5'
              : 'ring-1 ring-white/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Ambient glow layer */}
          <div
            className={`absolute -inset-px -z-10 blur-2xl rounded-2xl opacity-30 transition-all duration-700 ${
              isPlaying ? 'bg-violet-900/40' : 'bg-transparent'
            }`}
          />

          <div className="flex items-center justify-between gap-3 w-full">
            <TrackInfo metadata={metadata} duration={duration} onArtworkClick={() => setIsFullscreen(true)} />
            <label
              className="cursor-pointer self-start p-3 rounded-full bg-zinc-800/70 hover:bg-zinc-700 transition-all duration-150 active:scale-90 text-white flex items-center justify-center flex-shrink-0"
              title="Load Audio"
            >
              <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>upload_file</span>
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFilesAdd(e.target.files); e.target.value = ''; }}
              />
            </label>
          </div>

          <div className="bg-zinc-900/60 rounded-xl px-2 pt-2 pb-1 ring-1 ring-white/5">
            {audioSrc && (
              <Waveform
                src={audioSrc}
                wavesurferRef={wavesurferRef}
                onReady={handleWaveReady}
                duration={duration}
              />
            )}
          </div>

          {isWaveReady && (
            <>
              <div className={`rounded-xl overflow-hidden bg-zinc-900/40 [&>div]:h-14 sm:[&>div]:h-36 ${isFullscreen ? 'invisible' : ''}`}>
                <VisualizerBars
                  key={currentIndex}
                  wavesurferRef={wavesurferRef}
                  animationStyle={animationStyle}
                  isPlaying={isPlaying}
                />
              </div>

              <div className="border-t border-white/5" />

              <div className="flex flex-col gap-3 sm:gap-4 pt-2 px-1 sm:pt-3 md:px-6">
                <div className="relative flex items-center w-full">
                  <div className="flex-1 flex justify-start pl-1 sm:pl-0 min-w-0">
                    <AnimationStyleDropdown
                      style={animationStyle}
                      onChange={handleStyleChange}
                      label="Style"
                    />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <AudioControls
                      isPlaying={isPlaying}
                      onPlayPause={togglePlay}
                      onSeekForward={handleSeekForward}
                      onSeekBackward={handleSeekBackward}
                    />
                  </div>
                  <div className="flex-1 flex justify-end pr-1 sm:pr-0 min-w-0">
                    <VolumeSlider volume={volume} onChange={handleVolumeChange} />
                  </div>
                </div>
              </div>
            </>
          )}

          {!isWaveReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-80 backdrop-blur-sm rounded-2xl z-10 transition-all duration-300 animate-fadein">
              <div className="flex flex-col items-center space-y-4 p-6 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700">
                <div className="flex items-end h-12 space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-violet-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s',
                      }}
                    />
                  ))}
                </div>
                <div className="text-white text-lg font-medium">Loading audio...</div>
                <div className="text-zinc-400 text-sm">{metadata.title || 'Preparing your track'}</div>
              </div>
            </div>
          )}
        </div>

        <PlaylistManager
          playlist={playlist}
          currentIndex={currentIndex}
          onSelect={selectTrack}
          onRemove={removeTrack}
          onFilesAdd={handleFilesAdd}
          isPlaying={isPlaying}
        />
      </div>
    </>
  );
};

export default AudioPlayer;
