import React from 'react';
import { Music } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TrackInfo = ({ metadata, duration = 0 }) => {
  const { title, artist, album, picture } = metadata;

  return (
    <div className="flex items-center space-x-4">
      {picture ? (
        <img
          src={picture}
          alt="Album Cover"
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl shadow-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-1 rounded-xl shadow-lg bg-zinc-800 flex-shrink-0">
          <Music size={30} className="text-zinc-600" />
          <span className="text-xs text-zinc-600">No Artwork</span>
        </div>
      )}

      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-white leading-tight truncate">{title || 'Unknown Title'}</h2>
        <p className="text-sm text-zinc-300 mt-0.5 truncate">{artist || 'Unknown Artist'}</p>
        <div className="flex items-center gap-2 mt-1">
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
