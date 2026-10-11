import { useEffect, useRef } from 'react';

const FALLBACK_ARTWORK = [
  { src: `${import.meta.env.BASE_URL}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
];

const supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

const setHandler = (action, handler) => {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Action not supported by this browser
  }
};

// OS media integration: lock screen / notification (Android), Now Playing (iOS),
// media keys + flyout (Windows). Handlers go through the same callbacks as the
// on-screen controls, so resumeAudio and analytics stay in one place.
export const useMediaSession = ({
  wavesurferRef,
  trackId,
  isWaveReady,
  isPlaying,
  metadata,
  hasPrev,
  hasNext,
  onTogglePlay,
  onSeekBy,
  onPrev,
  onNext,
}) => {
  // Latest-callback ref: handlers are registered once, not on every render
  const callbacksRef = useRef({ onTogglePlay, onSeekBy, onPrev, onNext });
  useEffect(() => {
    callbacksRef.current = { onTogglePlay, onSeekBy, onPrev, onNext };
  });

  const { title, artist, album, picture } = metadata;
  useEffect(() => {
    if (!supported) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Unknown Title',
      artist: artist || '',
      album: album || '',
      artwork: picture ? [{ src: picture }] : FALLBACK_ARTWORK,
    });
  }, [title, artist, album, picture]);

  useEffect(() => {
    if (!supported) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (!supported) return;
    const ws = () => wavesurferRef.current;
    setHandler('play', () => { if (!ws()?.isPlaying()) callbacksRef.current.onTogglePlay(); });
    setHandler('pause', () => { if (ws()?.isPlaying()) callbacksRef.current.onTogglePlay(); });
    setHandler('seekbackward', (d) => callbacksRef.current.onSeekBy(-(d.seekOffset || 10)));
    setHandler('seekforward', (d) => callbacksRef.current.onSeekBy(d.seekOffset || 10));
    setHandler('seekto', (d) => {
      const w = ws();
      if (w) w.setTime(Math.min(Math.max(d.seekTime, 0), w.getDuration()));
    });
    return () => {
      ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'].forEach(a => setHandler(a, null));
    };
  }, [wavesurferRef]);

  // Only register prev/next when there is somewhere to go — the OS greys out the rest
  useEffect(() => {
    if (!supported) return;
    setHandler('previoustrack', hasPrev ? () => callbacksRef.current.onPrev() : null);
    setHandler('nexttrack', hasNext ? () => callbacksRef.current.onNext() : null);
  }, [hasPrev, hasNext]);

  // Lock-screen scrubber: re-sync position on the media element's discrete
  // events (the OS extrapolates between them from playbackRate)
  useEffect(() => {
    if (!supported || !isWaveReady) return;
    const media = wavesurferRef.current?.getMediaElement();
    if (!media) return;
    const sync = () => {
      const { duration, currentTime, playbackRate } = media;
      if (!Number.isFinite(duration) || duration <= 0) return;
      try {
        navigator.mediaSession.setPositionState({
          duration,
          position: Math.min(currentTime, duration),
          playbackRate: playbackRate || 1,
        });
      } catch {
        // Invalid state during a source swap — next event re-syncs
      }
    };
    sync();
    const events = ['play', 'pause', 'seeked', 'ratechange', 'durationchange'];
    events.forEach(e => media.addEventListener(e, sync));
    return () => events.forEach(e => media.removeEventListener(e, sync));
  }, [wavesurferRef, trackId, isWaveReady]);

  // Clear the OS widget on unmount
  useEffect(() => () => {
    if (!supported) return;
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  }, []);
};
