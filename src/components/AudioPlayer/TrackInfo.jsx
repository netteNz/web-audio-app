import React from 'react';

const TrackInfo = ({ metadata }) => {
  const { title, artist, album, picture } = metadata;

  return (
    <div className="flex items-center space-x-4">
      {picture ? (
        <img
          src={picture}
          alt="Album Cover"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shadow-md object-cover"
        />
      ) : (
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-lg shadow-md bg-zinc-800 text-sm text-zinc-400">
          No Cover Art
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold">{title || 'Unknown Title'}</h2>
        <p className="text-sm text-gray-400">{artist || 'Unknown Artist'}</p>
        <p className="text-sm text-gray-600">{album || 'Unknown Album'}</p>
      </div>
    </div>
  );
};

export default TrackInfo;
