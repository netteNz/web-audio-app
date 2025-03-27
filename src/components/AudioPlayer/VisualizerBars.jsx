import React, { useRef, useEffect } from 'react';

const VisualizerBars = ({ wavesurferRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationId;
    let analyser, dataArray, bufferLength;

    const setupVisualizer = () => {
      const ws = wavesurferRef.current;
      if (!ws || !ws.media) return;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(ws.media);
      analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 128;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      draw();
    };

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#0ea5e9');   // sky-500
      gradient.addColorStop(0.5, '#a855f7'); // purple-500
      gradient.addColorStop(1, '#f472b6');   // pink-400
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;

      // Begin drawing curve
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        const x = i * sliceWidth;
        const y = canvas.height - (dataArray[i] / 255) * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    setupVisualizer();

    return () => cancelAnimationFrame(animationId);
  }, [wavesurferRef]);

  return (
    <div className="w-full bg-black rounded-md overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-32" />
    </div>
  );
};

export default VisualizerBars;
