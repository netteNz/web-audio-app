import { useEffect } from 'react';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import Navbar from './components/AudioPlayer/Navbar';
import { initGA, pageView } from './utils/analytics';

const App = () => {
  useEffect(() => {
    initGA();
    pageView('Web Audio Player');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      {/* pt-20 accounts for the fixed navbar */}
      <main className="flex-grow flex items-center justify-center pt-20 p-4">
        <AudioPlayer />
      </main>

      <footer
        className="w-full px-4 pt-4 bg-zinc-900/50 text-center text-sm text-zinc-400 mt-auto"
        style={{ fontFamily: "'JetBrains Mono', monospace", paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <p>&copy; 2025 Emanuel Lugo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
