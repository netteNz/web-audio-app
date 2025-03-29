import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import VisualizerBars from './VisualizerBars';

const Waveform = ({ src, wavesurferRef, onReady }) => {
    const waveformRef = useRef(null);
    const spectrogramRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [waveInstance, setWaveInstance] = useState(null); // local instance

    useEffect(() => {
        if (!waveformRef.current || !spectrogramRef.current) return;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#64748b',            // slate-500 for subtle look
            progressColor: '#0ea5e9',        // sky-500 for active section
            height: 100,
            barWidth: 0,                     // <--- disable bars
            barGap: 0,
            barRadius: 0,
            responsive: true,
            scrollParent: false, // prevents horizontal scroll
            url: src,
        });

        wavesurferRef.current = ws;


        ws.on('ready', async () => {
            try {
                // Try to resume AudioContext as it might be suspended
                const audioContext = ws.backend.getAudioContext();
                if (audioContext && audioContext.state === 'suspended') {
                    console.log('Resuming suspended AudioContext...');
                    await audioContext.resume();
                    console.log('AudioContext state after resume:', audioContext.state);
                }
            } catch (err) {
                console.error('Failed to resume AudioContext:', err);
            }
            
            setDuration(ws.getDuration());
            if(onReady) onReady();
        });

        ws.on('audioprocess', () => {
            setCurrentTime(ws.getCurrentTime());
        });

        ws.on('seek', () => {
            setCurrentTime(ws.getCurrentTime());
        });

        ws.on('error', (err) => {
            console.error('WaveSurfer error:', err);
        });

        // Spectrogram setup
        ws.registerPlugin(
            Spectrogram.create({
                container: spectrogramRef.current,
                labels: true,
                height: 250,
                splitChannels: false,
                fftSamples: 512,
                frequencyMax: 8000,
                scale: 'mel',
                labelsBackground: 'rgba(0,0,0,0.1)'
            })
        );

        return () => ws.destroy();
    }, [src]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="w-full space-y-6">
            <div className="relative w-full">
                {duration > 0 && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-cyan-300 bg-black/70 px-2 py-0.5 rounded shadow border border-cyan-500 backdrop-blur-sm z-10">
                        {formatTime(currentTime)}
                    </div>
                )}
                <div ref={waveformRef} className="rounded overflow-hidden" />
            </div>

            <div ref={spectrogramRef} className="rounded overflow-hidden" />

            {waveInstance && (
                <div className="w-full bg-black rounded-md overflow-hidden">
                    <VisualizerBars wavesurfer={waveInstance} />
                </div>
            )}
        </div>
    );
};

export default Waveform;
