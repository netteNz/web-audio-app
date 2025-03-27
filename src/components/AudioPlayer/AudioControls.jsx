import { Play, Pause } from 'lucide-react';

const AudioControls = ({ isPlaying, onPlayPause }) => (
  <div className="flex justify-center">
    <button onClick={onPlayPause} className="p-3 bg-zinc-800 rounded-full hover:bg-zinc-700">
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  </div>
);

export default AudioControls;
