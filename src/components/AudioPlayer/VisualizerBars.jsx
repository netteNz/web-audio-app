import { useRef, useEffect } from 'react';
import { getSource } from '../../utils/audioGraph';

const ACCENT = '#a78bfa';
const WAVE_FILL = 'rgba(167, 139, 250, 0.2)';

// Traces the frequency line across the visible bins (caller strokes it)
const tracePath = (ctx, data, count, step, height) => {
  for (let i = 0; i < count; i++) {
    const y = height - (data[i] / 255) * height;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * step, y);
  }
};

const VisualizerBars = ({
  wavesurferRef,
  animationStyle = 'simple',
  isPlaying = false,
  paused = false,
  className = 'h-20 sm:h-36',
}) => {
  const canvasRef = useRef(null);
  const animationStyleRef = useRef(animationStyle);

  // Mirror the prop into a ref — the rAF loop must never read the prop directly
  useEffect(() => {
    animationStyleRef.current = animationStyle;
  }, [animationStyle]);

  // Attach an analyser tap to the shared graph and run the draw loop.
  // Callers key this component by track id, so wavesurferRef.current is the
  // live instance for this mount.
  useEffect(() => {
    const ws = wavesurferRef.current;
    const canvas = canvasRef.current;
    if (!ws || !canvas || paused) return;

    let analyser = null;
    let source = null;
    let bufferLength = 128;
    let dataArray = new Uint8Array(bufferLength);

    try {
      source = getSource(ws.getMediaElement?.());
      if (source) {
        analyser = source.context.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
      }
    } catch (err) {
      // No audio tap — the loop falls back to drifting random data
      console.error('Visualizer audio connection failed:', err);
      analyser = null;
    }

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    // Size the backing store in device pixels, draw in CSS pixels
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frameId;
    const draw = () => {
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = dataArray[i] * 0.95 + Math.random() * 25;
        }
      }

      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / bufferLength) * 2.5;
      const step = barWidth + 1;
      // Bars are wider than width/bufferLength, so only the low bins fit
      const count = Math.min(bufferLength, Math.ceil(width / step) + 1);
      const style = animationStyleRef.current;

      if (style === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let i = 0; i < count; i++) {
          ctx.lineTo(i * step, height - (dataArray[i] / 255) * height);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = WAVE_FILL;
        ctx.fill();
      }

      if (style === 'wave' || style === 'minimal') {
        ctx.beginPath();
        tracePath(ctx, dataArray, count, step, height);
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // 'simple': HSL frequency bars
        for (let i = 0; i < count; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          ctx.fillStyle = `hsl(${250 + (i / bufferLength) * 80}, 75%, 65%)`;
          ctx.fillRect(i * step, height - barHeight, barWidth, barHeight);
        }
      }

      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      if (analyser) {
        try { source.disconnect(analyser); } catch { /* already disconnected */ }
      }
    };
  }, [wavesurferRef, paused]);

  return (
    <div className={`w-full ${className} transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-40'}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default VisualizerBars;
