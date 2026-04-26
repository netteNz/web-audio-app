import React, { useEffect, useRef, useState } from 'react';
import AudioControls from './AudioControls';
import VisualizerBars from './VisualizerBars';
import VolumeSlider from './VolumeSlider';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SLIDE_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const ANIM_MS = 300;
const DISMISS_THRESHOLD = 80;

const FullscreenPlayer = ({
  onClose,
  metadata,
  duration,
  wavesurferRef,
  animationStyle,
  isPlaying,
  volume,
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  onVolumeChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const progressRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const update = () => {
      setCurrentTime(ws.getCurrentTime());
    };

    update();
    ws.on('audioprocess', update);
    ws.on('seek', update);

    return () => {
      ws.un('audioprocess', update);
      ws.un('seek', update);
    };
  }, [wavesurferRef]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, ANIM_MS);
  };

  const handleTouchStart = (e) => {
    dragStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - dragStartYRef.current;
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > DISMISS_THRESHOLD) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  const handleProgressClick = (e) => {
    const ws = wavesurferRef.current;
    if (!ws || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    ws.seekTo(ratio);
    setCurrentTime(ratio * duration);
  };

  const translateY = visible ? dragY : window.innerHeight;
  const overlayStyle = {
    transform: `translateY(${translateY}px)`,
    transition: isDragging ? 'none' : `transform ${ANIM_MS}ms ${SLIDE_EASE}`,
  };

  const { title, artist, album, picture } = metadata;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col"
      style={{
        ...overlayStyle,
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Full screen player"
    >
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 rounded-full bg-zinc-700" />
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs uppercase tracking-widest text-zinc-400">Now Playing</span>
        <button
          onClick={handleClose}
          aria-label="Close full screen player"
          className="p-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700 transition-all duration-150 active:scale-90 flex items-center justify-center"
        >
          <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>keyboard_arrow_down</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-8 gap-4 sm:gap-6 overflow-y-auto">
        <div className="w-full flex justify-center pt-2">
          {picture ? (
            <img
              src={picture}
              alt="Album Cover"
              className={`w-full max-w-sm aspect-square rounded-2xl shadow-2xl object-cover transition-transform duration-500 ${isPlaying ? 'scale-100' : 'scale-90'}`}
            />
          ) : (
            <div className={`w-full max-w-sm aspect-square rounded-2xl shadow-2xl bg-zinc-800 flex items-center justify-center transition-transform duration-500 ${isPlaying ? 'scale-100' : 'scale-90'}`}>
              <span
                className="material-symbols-rounded leading-none select-none text-zinc-600"
                style={{ fontSize: 96, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
              >
                music_note
              </span>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm text-center min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{title || 'Unknown Title'}</h2>
          <p className="text-sm sm:text-base text-zinc-300 truncate mt-1">{artist || 'Unknown Artist'}</p>
          {album && <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">{album}</p>}
        </div>

        <div className="w-full max-w-sm">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration || 0)}
            aria-valuenow={Math.round(currentTime)}
          >
            <div
              className="h-full bg-violet-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-400 tabular-nums mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <VisualizerBars
            wavesurferRef={wavesurferRef}
            animationStyle={animationStyle}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-4 pt-4">
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onSeekForward={onSeekForward}
          onSeekBackward={onSeekBackward}
        />
        <VolumeSlider volume={volume} onChange={onVolumeChange} />
      </div>
    </div>
  );
};

export default FullscreenPlayer;
