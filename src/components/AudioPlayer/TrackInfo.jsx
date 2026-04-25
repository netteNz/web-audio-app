import React from 'react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TrackInfo = ({ metadata, duration = 0 }) => {
  const { title, artist, album, picture } = metadata;

  return (
    <div className="flex flex-row items-center gap-3 text-left w-full min-w-0">
      {picture ? (
        <img
          src={picture}
          alt="Album Cover"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center gap-1 rounded-xl shadow-lg bg-zinc-800 flex-shrink-0">
          <span className="material-symbols-rounded leading-none select-none text-zinc-600" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>music_note</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="text-base sm:text-lg font-bold text-white truncate">{title || 'Unknown Title'}</h2>
        <p className="text-sm text-zinc-300 truncate">{artist || 'Unknown Artist'}</p>
        {(album || duration > 0) && (
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {[album, duration > 0 ? formatTime(duration) : null].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackInfo;
