import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { releaseSource, resumeAudio } from '../../utils/audioGraph';
import { formatTime } from '../../utils/formatTime';

const Waveform = ({ src, wavesurferRef, onReady, onPlayStateChange, onError, duration = 0 }) => {
  const containerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Latest-callback refs: the WaveSurfer instance lives across renders, so its
  // listeners must not capture stale parent closures.
  const callbacksRef = useRef({ onReady, onPlayStateChange, onError });
  useEffect(() => {
    callbacksRef.current = { onReady, onPlayStateChange, onError };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#52525b',
      progressColor: '#a78bfa',
      height: 100,
      url: src,
    });

    wavesurferRef.current = ws;
    setCurrentTime(0);

    ws.on('ready', () => callbacksRef.current.onReady?.(ws));

    // 'timeupdate' fires during playback AND on seeks while paused
    ws.on('timeupdate', (time) => setCurrentTime(time));

    ws.on('play', () => {
      // Media is routed through the shared AudioContext once a visualizer
      // attaches; a suspended context would make playback silent.
      resumeAudio().catch(() => {});
      callbacksRef.current.onPlayStateChange?.(true);
    });
    ws.on('pause', () => callbacksRef.current.onPlayStateChange?.(false));
    ws.on('finish', () => callbacksRef.current.onPlayStateChange?.(false));

    ws.on('error', (e) => {
      console.error('[WaveSurfer] Failed to load audio:', src, e);
      callbacksRef.current.onError?.(e);
    });

    return () => {
      // destroy() aborts an in-flight fetch, and the rejected load still emits
      // 'error' on this instance — detach our listeners first so a stale
      // instance can't report into the next track's state.
      ws.unAll();
      releaseSource(ws.getMediaElement());
      ws.destroy();
    };
  }, [src, wavesurferRef]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full rounded overflow-hidden" />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-800/70 px-2 py-1 rounded text-xs tabular-nums text-white z-10">
        {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : formatTime(currentTime)}
      </div>
    </div>
  );
};

export default Waveform;
