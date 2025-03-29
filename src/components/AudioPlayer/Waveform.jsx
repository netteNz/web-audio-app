import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const Waveform = ({ src, wavesurferRef, onReady }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#64748b',
      progressColor: '#0ea5e9',
      height: 100,
      responsive: true,
      url: src,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      console.log('[WaveSurfer] Ready');
      onReady?.();
    });

    ws.on('error', (e) => {
      console.error('[WaveSurfer] Error details:', e);
      // Try to provide more information about the error
      if (e.name === 'Error' && e.message.includes('load')) {
        console.error('[WaveSurfer] Failed to load audio. Source URL:', src);
      }
    });

    return () => ws.destroy();
  }, [src]);

  return <div ref={containerRef} className="w-full rounded overflow-hidden" />;
};

export default Waveform;
