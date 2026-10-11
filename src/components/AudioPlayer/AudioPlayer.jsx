import { useRef, useState, useEffect, useCallback } from 'react';
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
import { resumeAudio } from '../../utils/audioGraph';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useMediaSession } from '../../hooks/useMediaSession';

const EMPTY_METADATA = { title: '', artist: '', album: '', picture: null };
const LOADING_BAR_HEIGHTS = [45, 80, 30, 95, 60, 25, 70, 50];
const SEEK_STEP = 10;

// Some platforms report an empty MIME type for valid audio (e.g. .flac on Windows)
const AUDIO_EXT = /\.(mp3|wav|ogg|oga|opus|flac|m4a|aac|webm)$/i;
const isAudioFile = (file) => file.type.startsWith('audio/') || (!file.type && AUDIO_EXT.test(file.name));

const revokeTrackUrls = (track) => {
  if (track.src.startsWith('blob:')) URL.revokeObjectURL(track.src);
  if (track.metadata.picture?.startsWith('blob:')) URL.revokeObjectURL(track.metadata.picture);
};

const extractMetadata = async (blob, fallback) => {
  const { common } = await parseBlob(blob);
  const picture = common.picture?.[0];
  return {
    title: common.title || fallback.title,
    artist: common.artist || fallback.artist,
    album: common.album || '',
    picture: picture ? URL.createObjectURL(new Blob([picture.data], { type: picture.format })) : null,
  };
};

const AudioPlayer = () => {
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [volume, setVolume] = useState(0.15);
  const [animationStyle, setAnimationStyle] = useState('wave');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [playlist, setPlaylist] = useState(() => [{
    id: crypto.randomUUID(),
    src: `${import.meta.env.BASE_URL}example.mp3`,
    metadata: { title: 'Example Track', artist: 'Unknown Artist', album: '', picture: null },
    metadataLoaded: false,
    duration: 0,
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTrack = playlist[currentIndex] ?? null;
  const trackId = currentTrack?.id ?? null;
  const audioSrc = currentTrack?.src ?? null;
  const metadata = currentTrack?.metadata ?? EMPTY_METADATA;
  const duration = currentTrack?.duration ?? 0;
  const needsMetadata = !!currentTrack && !currentTrack.metadataLoaded;

  // Latest playlist for async handlers and unmount cleanup
  const playlistRef = useRef(playlist);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);

  // Revoke all blob URLs on unmount
  useEffect(() => () => playlistRef.current.forEach(revokeTrackUrls), []);

  // Fetch tags for tracks not parsed on add (the default example.mp3). Runs once
  // per track — metadataLoaded prevents re-fetching on every reselect.
  useEffect(() => {
    if (!needsMetadata) return;
    let cancelled = false;
    (async () => {
      try {
        const blob = await (await fetch(audioSrc)).blob();
        const meta = await extractMetadata(blob, { title: 'Unknown Title', artist: 'Unknown Artist' });
        if (cancelled || !playlistRef.current.some(t => t.id === trackId)) {
          if (meta.picture) URL.revokeObjectURL(meta.picture);
          return;
        }
        setPlaylist(prev => prev.map(t =>
          t.id === trackId ? { ...t, metadata: meta, metadataLoaded: true } : t
        ));
      } catch (err) {
        console.error('Failed to extract metadata:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [trackId, audioSrc, needsMetadata]);

  const handleFilesAdd = useCallback(async (files) => {
    const fileArray = Array.from(files).filter(isAudioFile);
    if (!fileArray.length) return;

    fileArray.forEach(file => {
      trackEvent('audio_load', {
        file_type: file.type,
        file_size: Math.round(file.size / 1024),
      });
    });

    const newTracks = await Promise.all(fileArray.map(async (file) => {
      const fallback = { title: file.name.replace(/\.[^/.]+$/, ''), artist: '' };
      let meta = { ...fallback, album: '', picture: null };
      try {
        meta = await extractMetadata(file, fallback);
      } catch {
        // Untagged or unparseable — keep the filename-based fallback
      }
      return { id: crypto.randomUUID(), src: URL.createObjectURL(file), metadata: meta, metadataLoaded: true, duration: 0 };
    }));

    const firstNewIndex = playlistRef.current.length;
    setPlaylist(prev => [...prev, ...newTracks]);
    setCurrentIndex(firstNewIndex);
    setIsPlaying(false);
    setIsWaveReady(false);
    setLoadError(null);
  }, []);

  const { dragging, dropProps } = useFileDrop(handleFilesAdd);

  const selectTrack = (index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const removeTrack = (index) => {
    const removed = playlist[index];
    if (!removed) return;
    revokeTrackUrls(removed);
    setPlaylist(prev => prev.filter(t => t.id !== removed.id));
    setCurrentIndex(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
    if (index === currentIndex) setIsPlaying(false);
  };

  const handleWaveReady = (ws) => {
    ws.setVolume(volume);
    const dur = ws.getDuration();
    setPlaylist(prev => prev.map(t => (t.id === trackId ? { ...t, duration: dur } : t)));
    setIsWaveReady(true);
    setLoadError(null);
  };

  const handleWaveError = () => {
    if (playlist.length > 1) {
      removeTrack(currentIndex);
      setIsWaveReady(true);
    } else if (!navigator.onLine && !audioSrc?.startsWith('blob:')) {
      setLoadError("You're offline — add a file from this device to play");
    } else {
      setLoadError(`Couldn't load "${metadata.title || 'this track'}"`);
    }
  };

  const togglePlay = useCallback(async () => {
    const ws = wavesurferRef.current;
    if (!ws || !isWaveReady) return;
    // The shared AudioContext must be running before playback, or audio
    // routed through it is silent. isPlaying is driven by ws play/pause events.
    try {
      await resumeAudio();
    } catch (err) {
      console.error('AudioContext resume error:', err);
    }
    const willPlay = !ws.isPlaying();
    ws.playPause().catch(err => console.error('Playback failed:', err));
    trackEvent(willPlay ? 'audio_play' : 'audio_pause', {
      title: metadata.title,
      current_time: Math.round(ws.getCurrentTime()),
      duration: Math.round(ws.getDuration()),
    });
  }, [isWaveReady, metadata.title]);

  const volumeRef = useRef(volume);
  const handleVolumeChange = useCallback((val) => {
    if (Math.abs(val - volumeRef.current) > 0.1) {
      trackEvent('volume_change', { value: Math.round(val * 10) / 10 });
    }
    volumeRef.current = val;
    setVolume(val);
    wavesurferRef.current?.setVolume(val);
  }, []);

  const seekBy = useCallback((delta) => {
    const ws = wavesurferRef.current;
    if (!ws || !isWaveReady) return;
    ws.setTime(Math.min(Math.max(ws.getCurrentTime() + delta, 0), ws.getDuration()));
  }, [isWaveReady]);
  const handleSeekForward = useCallback(() => seekBy(SEEK_STEP), [seekBy]);
  const handleSeekBackward = useCallback(() => seekBy(-SEEK_STEP), [seekBy]);

  // Queue navigation for OS media controls. Bounded (no wrap); like a queue
  // click, switching tracks doesn't auto-play.
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < playlist.length - 1;
  const selectPrev = () => { if (hasPrev) selectTrack(currentIndex - 1); };
  const selectNext = () => { if (hasNext) selectTrack(currentIndex + 1); };

  useMediaSession({
    wavesurferRef,
    trackId,
    isWaveReady,
    isPlaying,
    metadata,
    hasPrev,
    hasNext,
    onTogglePlay: togglePlay,
    onSeekBy: seekBy,
    onPrev: selectPrev,
    onNext: selectNext,
  });

  const handleStyleChange = (newStyle) => {
    trackEvent('visualization_change', { from: animationStyle, to: newStyle });
    setAnimationStyle(newStyle);
  };

  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  return (
    <>
      {isFullscreen && (
        <FullscreenPlayer
          onClose={closeFullscreen}
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
          trackId={trackId}
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
          {...dropProps}
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
                onPlayStateChange={setIsPlaying}
                onError={handleWaveError}
                duration={duration}
              />
            )}
          </div>

          {isWaveReady && (
            <>
              <div className={`rounded-xl overflow-hidden bg-zinc-900/40 ${isFullscreen ? 'invisible' : ''}`}>
                <VisualizerBars
                  key={trackId}
                  wavesurferRef={wavesurferRef}
                  animationStyle={animationStyle}
                  isPlaying={isPlaying}
                  paused={isFullscreen}
                  className="h-14 sm:h-36"
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
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm rounded-2xl z-10 transition-all duration-300 animate-fadein">
              <div className="flex flex-col items-center space-y-4 p-6 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700">
                {loadError ? (
                  <>
                    <span className="material-symbols-rounded leading-none select-none text-zinc-400" style={{ fontSize: 40 }}>error</span>
                    <div className="text-white text-lg font-medium">{loadError}</div>
                    <div className="text-zinc-400 text-sm">Try another file from the queue below</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-end h-12 space-x-1">
                      {LOADING_BAR_HEIGHTS.map((height, i) => (
                        <div
                          key={i}
                          className="w-2 bg-violet-400 rounded-full animate-eq"
                          style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <div className="text-white text-lg font-medium">Loading audio...</div>
                    <div className="text-zinc-400 text-sm">{metadata.title || 'Preparing your track'}</div>
                  </>
                )}
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
