# web-audio-app 🎧

A modern, customizable web audio player built with React, Tailwind CSS, and the Web Audio API. Includes waveform rendering, metadata display, volume control, and real-time visualizations for an interactive listening experience.

##  Technologies Used

### ⚛️ React
- Frontend framework for building dynamic, component-based UI.
- Handles app state, timeline updates, and interaction logic.
  
### ⚡ Vite
- Lightning-fast dev server and optimized build tool.
- Used for rapid development and efficient bundling of React + Tailwind CSS.
  
### 🎨 Tailwind CSS v4
- Utility-first CSS framework for styling with minimal effort.
- Fully customized dark theme with responsive UI and smooth transitions.

### 🎧 Web Audio API
- Browser-native API for low-level audio processing and playback.
- Powers real-time spectrum analysis, waveform drawing, and volume control.

### 📦 music-metadata-browser
- Parses and displays audio metadata directly in the browser.
- Used to extract tags like title, artist, album, and duration from audio files.

---

##  Features

- 🔊 Audio playback with waveform + timeline scrubber
- 🎚️ Volume control slider
- 🖼️ Real-time audio spectrum and spectrogram visualizations
- 🏷️ Audio metadata display (title, artist, etc.)
- ⏱️ Animated timeline cursor during playback
- 🧩 Modular React component structure for extensibility

---

##  Getting Started

```bash
git clone https://github.com/nettenz/web-audio-app.git
cd web-audio-app
npm install
npm run dev
```

Make sure to configure your base path if deploying to GitHub Pages:

**vite.config.js**
```js
base: '/web-audio-app/', // Use your repo name here
```

---

## 📄 License

MIT

