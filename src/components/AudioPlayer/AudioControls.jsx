import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

const AudioControls = ({ isPlaying, onPlayPause, onSeekBackward, onSeekForward }) => (
  <div className="flex items-center gap-5">
    <button
      onClick={onSeekBackward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90"
    >
      <RotateCcw size={20} />
    </button>

    <button
      onClick={onPlayPause}
      className="p-4 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-zinc-950 rounded-full shadow-lg shadow-cyan-400/20 transition-all duration-150 active:scale-95"
    >
      {isPlaying ? <Pause size={28} /> : <Play size={28} />}
    </button>

    <button
      onClick={onSeekForward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90"
    >
      <RotateCw size={20} />
    </button>
  </div>
);

export default AudioControls;
