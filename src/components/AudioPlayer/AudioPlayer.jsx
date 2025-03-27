import React, { useRef, useState, useEffect } from 'react';
import { parseBlob } from 'music-metadata';
import TrackInfo from './TrackInfo';
import AudioControls from './AudioControls';
import Waveform from './Waveform';
import VolumeSlider from './VolumeSlider';
import VisualizerBars from './VisualizerBars';


const AudioPlayer = () => {
    const wavesurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    const [metadata, setMetadata] = useState({
        title: 'Neuro Pulse',
        artist: 'You',
        album: '',
        picture: null,
    });

    const audioSrc = '/example.mp3';

    // Fetch metadata on load
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch(audioSrc);
                const blob = await response.blob();
                const meta = await parseBlob(blob);

                const pictureData = meta.common.picture?.[0];
                const pictureUrl = pictureData
                    ? URL.createObjectURL(new Blob([pictureData.data]))
                    : null;

                setMetadata({
                    title: meta.common.title || 'Unknown Title',
                    artist: meta.common.artist || 'Unknown Artist',
                    album: meta.common.album || '',
                    picture: pictureUrl,
                });
            } catch (err) {
                console.error('Failed to extract metadata:', err);
            }
        };

        fetchMetadata();
    }, [audioSrc]);

    const handleVolumeChange = (value) => {
        setVolume(value);
        if (wavesurferRef.current) {
            wavesurferRef.current.setVolume(value);
        }
    };

    const togglePlay = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
            setIsPlaying(wavesurferRef.current.isPlaying());
        }
    };
    console.log('Parsed metadata:', metadata);

    return (
        <div className="w-full max-w-7xl mx-auto mt-10 bg-zinc-900 text-white p-8 rounded-2xl shadow-lg space-y-8">
            <TrackInfo metadata={metadata} />

            <div className="w-full">
                <Waveform src={audioSrc} wavesurferRef={wavesurferRef} />
            </div>

            <VisualizerBars wavesurferRef={wavesurferRef} />

            <div className="flex justify-center items-center space-x-6 pt-2">
                <AudioControls isPlaying={isPlaying} onPlayPause={togglePlay} />
                <div className="w-full max-w-xs">
                    <VolumeSlider volume={volume} onChange={handleVolumeChange} />
                </div>
            </div>
        </div>
    );
};


export default AudioPlayer;
