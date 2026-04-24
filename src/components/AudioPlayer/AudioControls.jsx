const AudioControls = ({ isPlaying, onPlayPause, onSeekBackward, onSeekForward }) => (
  <div className="flex items-center gap-5">
    <button
      onClick={onSeekBackward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90 flex items-center justify-center"
    >
      <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>replay_10</span>
    </button>

    <button
      onClick={onPlayPause}
      className="p-4 bg-violet-400 hover:bg-violet-300 active:bg-violet-500 text-zinc-950 rounded-full shadow-md transition-all duration-150 active:scale-95 flex items-center justify-center"
    >
      <span
        className="material-symbols-rounded leading-none select-none"
        style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 28" }}
      >
        {isPlaying ? 'pause' : 'play_arrow'}
      </span>
    </button>

    <button
      onClick={onSeekForward}
      className="p-3 bg-zinc-800/70 hover:bg-zinc-700 rounded-full transition-all duration-150 active:scale-90 flex items-center justify-center"
    >
      <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 22 }}>forward_10</span>
    </button>
  </div>
);

export default AudioControls;
