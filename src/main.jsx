import React from 'react';
import ReactDOM from 'react-dom/client';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <AudioPlayer />
    </main>
  </React.StrictMode>
);
