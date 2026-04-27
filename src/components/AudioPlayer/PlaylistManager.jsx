import React, { useState } from 'react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const PlaylistManager = ({ playlist, currentIndex, onSelect, onRemove, onFilesAdd, isPlaying }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) onFilesAdd(e.dataTransfer.files);
  };

  return (
    <div
      className={`w-full rounded-2xl bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden transition-all duration-150 ${
        dragging ? 'ring-2 ring-violet-400/50 bg-violet-400/5' : 'ring-1 ring-white/5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-semibold text-zinc-400 tracking-widest uppercase">Queue · {playlist.length}</span>
        <label
          className="cursor-pointer p-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700 transition-all duration-150 active:scale-90 text-white flex items-center justify-center"
          title="Add files"
        >
          <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 18 }}>add</span>
          <input
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => { onFilesAdd(e.target.files); e.target.value = ''; }}
          />
        </label>
      </div>

      {/* Track list */}
      {playlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-600">
          <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 32 }}>music_note</span>
          <span className="text-sm">No tracks in queue</span>
        </div>
      ) : (
        <ul>
          {playlist.map((track, index) => {
            const isActive = index === currentIndex;
            return (
              <li
                key={track.id}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                  isActive
                    ? 'bg-violet-500/10 border-l-2 border-violet-400'
                    : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
                onClick={() => onSelect(index)}
              >
                {/* Track number / playing indicator */}
                <div className="w-4 flex items-center justify-center flex-shrink-0">
                  {isActive && isPlaying ? (
                    <div className="w-4 flex items-end justify-center gap-px h-4">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-violet-400 rounded-full animate-pulse"
                          style={{ height: `${[60, 100, 40][i]}%`, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : isActive ? (
                    <span className="material-symbols-rounded leading-none select-none text-violet-400" style={{ fontSize: 14 }}>pause</span>
                  ) : (
                    <span className="text-xs text-zinc-600 tabular-nums w-4 text-center">{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail + metadata */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {track.metadata.picture ? (
                      <img
                        src={track.metadata.picture}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <span className="material-symbols-rounded leading-none select-none text-zinc-600" style={{ fontSize: 16 }}>music_note</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{track.metadata.title || 'Unknown Title'}</p>
                    <p className="text-xs text-zinc-500 truncate">{track.metadata.artist || ''}</p>
                  </div>
                  <span className="text-xs text-zinc-600 tabular-nums flex-shrink-0">
                    {formatTime(track.duration)}
                  </span>
                </div>

                {/* Remove button — always visible on mobile, hover-only on desktop */}
                {playlist.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    className="flex-shrink-0 p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors duration-150 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Remove track"
                  >
                    <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 16 }}>close</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlaylistManager;
