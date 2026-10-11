const Navbar = () => {
  return (
    <nav
      className="w-full px-4 py-3 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 fixed top-0 left-0 z-10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={`${import.meta.env.BASE_URL}audio-equalizer-device.svg`} 
            alt="Audio Equalizer" 
            className="w-6 h-6"
          />
          <span className="text-xl text-white">Web Audio Player</span>
        </div>
        
        {/* Portfolio links leave the PWA's scope — hidden when installed (standalone) */}
        <div className="hidden md:flex [@media(display-mode:standalone)]:hidden space-x-6">
          <a href="https://nettenz.github.io" className="text-white hover:text-violet-400 transition-colors">Home</a>
          <a href="https://nettenz.github.io?open=projects" className="text-white hover:text-violet-400 transition-colors">Projects</a>
          <a href="https://nettenz.github.io?open=about" className="text-white hover:text-violet-400 transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;