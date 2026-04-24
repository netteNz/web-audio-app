import React from 'react';
import Icon from '../Icon';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TrackInfo = ({ metadata, duration = 0 }) => {
  const { title, artist, album, picture } = metadata;

  return (
    <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left sm:gap-4">
      {picture ? (
        <img
          src={picture}
          alt="Album Cover"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl shadow-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-1 rounded-xl shadow-lg bg-zinc-800 flex-shrink-0">
          <Icon name="music_note" size={28} fill className="text-zinc-600" />
          <span className="text-xs text-zinc-600">No Artwork</span>
        </div>
      )}

      <div className="min-w-0 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight truncate">{title || 'Unknown Title'}</h2>
        <p className="text-sm text-zinc-300 mt-0.5 truncate">{artist || 'Unknown Artist'}</p>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
          {album && <p className="text-sm text-zinc-400 truncate">{album}</p>}
          {duration > 0 && album && <span className="text-xs text-zinc-600">•</span>}
          {duration > 0 && (
            <p className="text-sm text-zinc-400 flex-shrink-0">{formatTime(duration)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackInfo;
