import React, { useRef, useEffect, useState } from 'react';

const VisualizerBars = ({ wavesurferRef }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // First useEffect just to monitor when WaveSurfer becomes ready
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    // Check if already ready
    if (ws.isReady) {
      console.log('WaveSurfer is already ready');
      setIsReady(true);
      return;
    }

    // Listen for ready event
    const handleReady = () => {
      console.log('WaveSurfer ready event received in VisualizerBars');
      setIsReady(true);
    };

    ws.on('ready', handleReady);

    return () => {
      ws.un('ready', handleReady);
    };
  }, [wavesurferRef.current]);

  // Main effect that runs after WaveSurfer is confirmed ready
  useEffect(() => {
    if (!isReady) return;
    
    const ws = wavesurferRef.current;
    if (!ws) {
      console.error('WaveSurfer reference lost');
      return;
    }

    console.log('Setting up visualizer with ready WaveSurfer');

    // Create analyzer with more reliable approach
    let analyser;
    let audioContext;
    let source;
    
    try {
      // First try: Create our own AudioContext to use with WaveSurfer's media element
      const mediaElement = ws.getMediaElement?.();
      console.log('Media element available:', !!mediaElement);
      
      if (mediaElement) {
        try {
          // Create a new AudioContext - this should be more reliable
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          console.log('Created new AudioContext, state:', audioContext.state);
          
          // This might throw an error if the media element is already connected
          try {
            source = audioContext.createMediaElementSource(mediaElement);
            analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            console.log('Successfully connected media element to new AudioContext');
          } catch (connectError) {
            console.log('Error connecting to media element, trying alternative:', connectError);
            
            // If we can't create a new MediaElementSource, try to get WaveSurfer's
            if (ws.backend?.getAudioContext) {
              audioContext = ws.backend.getAudioContext();
              analyser = audioContext.createAnalyser();
              // Try to tap into existing audio pipeline
              if (ws.backend?.source) {
                ws.backend.source.connect(analyser);
                analyser.connect(audioContext.destination);
                console.log('Connected to existing WaveSurfer audio pipeline');
              } else {
                throw new Error('Could not connect to audio source');
              }
            }
          }
        } catch (audioContextError) {
          console.error('Error setting up AudioContext:', audioContextError);
          return;
        }
      } else {
        console.error('No media element available from WaveSurfer');
        return;
      }
      
      // Set analyzer properties
      analyser.fftSize = 256;
      
      // Rest of visualization code...
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Handle canvas resize
      const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const draw = () => {
        try {
          analyser.getByteFrequencyData(dataArray);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = canvas.width / bufferLength;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const x = i * barWidth;
            const y = canvas.height - barHeight;

            ctx.fillStyle = `hsl(${i * 4}, 70%, 60%)`;
            ctx.fillRect(x, y, barWidth, barHeight);
          }
          
          animationRef.current = requestAnimationFrame(draw);
        } catch (err) {
          console.error('Visualization error:', err);
        }
      };

      // Start animation after ensuring everything is ready
      setTimeout(() => {
        // Make sure audio context is resumed (important for Chrome)
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('AudioContext resumed');
            animationRef.current = requestAnimationFrame(draw);
          });
        } else {
          animationRef.current = requestAnimationFrame(draw);
        }
      }, 500);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Clean up audio connections
        if (analyser) {
          try {
            analyser.disconnect();
          } catch (e) {
            console.log('Failed to disconnect audio nodes:', e);
          }
        }
      };
    } catch (err) {
      console.error('Failed to create analyzer:', err);
      return () => {};
    }
  }, [isReady, wavesurferRef.current]);

  return (
    <div className="w-full bg-black rounded-md overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-32" />
    </div>
  );
};

export default VisualizerBars;
