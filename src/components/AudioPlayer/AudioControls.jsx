import Icon from '../Icon';

const AudioControls = ({ isPlaying, onPlayPause, onSeekBackward, onSeekForward }) => (
  <div className="flex items-center gap-5">
    <button
      onClick={onSeekBackward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90"
    >
      <Icon name="replay_10" size={22} />
    </button>

    <button
      onClick={onPlayPause}
      className="p-4 bg-violet-400 hover:bg-violet-300 active:bg-violet-500 text-zinc-950 rounded-full shadow-md transition-all duration-150 active:scale-95"
    >
      <Icon name={isPlaying ? 'pause' : 'play_arrow'} size={28} fill />
    </button>

    <button
      onClick={onSeekForward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90"
    >
      <Icon name="forward_10" size={22} />
    </button>
  </div>
);

export default AudioControls;
