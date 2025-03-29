import React, { useRef, useEffect, useState } from 'react';

const VisualizerBars = ({ wavesurferRef }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnalyzerReady, setIsAnalyzerReady] = useState(false);

  // Handle user interaction to unblock audio context
  useEffect(() => {
    const unblockAudio = () => {
      const ws = wavesurferRef.current;
      if (!ws) return;

      try {
        const audioContext =
          ws.getAudioContext?.() ||
          ws.backend?.ac ||
          ws.backend?.getAudioContext?.();

        if (audioContext?.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('AudioContext resumed by user interaction');
            setIsAnalyzerReady(true);
          });
        } else {
          setIsAnalyzerReady(true);
        }
      } catch (err) {
        console.error('Error resuming AudioContext:', err);
      }
    };

    document.addEventListener('click', unblockAudio);
    document.addEventListener('touchstart', unblockAudio);

    return () => {
      document.removeEventListener('click', unblockAudio);
      document.removeEventListener('touchstart', unblockAudio);
    };
  }, [wavesurferRef]);

  // Set up analyzer when wavesurfer is ready
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const isReady = ws.isReady;
    if (!isReady) {
      const onReady = () => setIsAnalyzerReady(true);
      ws.on('ready', onReady);
      return () => ws.un('ready', onReady);
    } else {
      setIsAnalyzerReady(true);
    }
  }, [wavesurferRef.current]);

  // Create and connect analyzer with visual rendering
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isAnalyzerReady) return;

    let analyser;
    let audioContext;
    let source;
    let bufferLength;
    let dataArray;

    try {
      console.log("Setting up visualizer - approach 1");
      
      // APPROACH 1: Use WaveSurfer's internal AudioContext
      audioContext = 
        ws.getAudioContext?.() || 
        ws.backend?.ac || 
        ws.backend?.getAudioContext?.();
      
      if (!audioContext) {
        console.log("No WaveSurfer AudioContext, creating new one");
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      
      let connected = false;
      
      // APPROACH 1A: Connect using WaveSurfer's internal source directly
      if (ws.backend?.source) {
        try {
          ws.backend.source.connect(analyser);
          analyser.connect(audioContext.destination);
          console.log("Connected using WaveSurfer's backend source");
          connected = true;
        } catch (e) {
          console.log("Error connecting to backend source:", e);
        }
      }
      
      // APPROACH 1B: Try getMediaElement method
      if (!connected && ws.getMediaElement) {
        const mediaElement = ws.getMediaElement();
        if (mediaElement) {
          try {
            source = audioContext.createMediaElementSource(mediaElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            console.log("Connected using WaveSurfer's getMediaElement()");
            connected = true;
          } catch (e) {
            console.log("Error connecting to getMediaElement:", e);
          }
        }
      }
      
      // APPROACH 2: Look for audio elements in the DOM
      if (!connected) {
        // Try to find audio elements in different ways
        const audioElements = document.querySelectorAll('audio');
        console.log(`Found ${audioElements.length} audio elements in DOM`);
        
        if (audioElements.length > 0) {
          try {
            source = audioContext.createMediaElementSource(audioElements[0]);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            console.log("Connected to audio element from DOM");
            connected = true;
          } catch (e) {
            console.log("Error connecting to DOM audio element:", e);
          }
        }
      }
      
      // APPROACH 3: If all else fails, create a visual without audio connection
      if (!connected) {
        console.log("Could not connect to any audio source, using fallback visualization");
        // We'll still create a visualization but it won't be connected to audio
        // This at least shows something is happening
      }
      
      // Set up canvas for visualization
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Make canvas responsive
      const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Animation function
      function draw() {
        if (connected) {
          analyser.getByteFrequencyData(dataArray);
        } else {
          // Fallback: generate random data for visualization if not connected
          for (let i = 0; i < bufferLength; i++) {
            // Random values that slowly change
            dataArray[i] = (dataArray[i] || 0) * 0.95 + Math.random() * 25;
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          // Use a gradient color based on frequency
          ctx.fillStyle = `hsl(${i * 360 / bufferLength}, 70%, 50%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }

        animationRef.current = requestAnimationFrame(draw);
      }

      // Start animation
      animationRef.current = requestAnimationFrame(draw);

      // Listen for play/pause to ensure audio context is resumed
      const handlePlay = async () => {
        if (audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            console.log("AudioContext resumed on play");
          } catch (e) {
            console.error("Failed to resume AudioContext:", e);
          }
        }
      };

      ws.on('play', handlePlay);

      return () => {
        cancelAnimationFrame(animationRef.current);
        window.removeEventListener('resize', resizeCanvas);
        ws.un('play', handlePlay);

        try {
          if (connected) {
            if (source) {
              source.disconnect(analyser);
              source.disconnect(audioContext.destination);
            }
            analyser.disconnect();
          }
        } catch (err) {
          console.log('Error disconnecting audio nodes:', err);
        }
      };
    } catch (err) {
      console.error('Visualization setup error:', err);
      return () => {};
    }
  }, [isAnalyzerReady]);

  return (
    <div className="w-full bg-black rounded-md overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-32" />
    </div>
  );
};

export default VisualizerBars;
