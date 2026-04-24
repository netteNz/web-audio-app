# Web Audio Player

A mobile-first web audio player built with React and the Web Audio API. Load any local audio file, view real-time frequency visualizations, and control playback — all in the browser with no backend required.

**Live:** https://nettenz.github.io/web-audio-app

---

## Features

- **Playback** — Play/pause, seek forward/backward ±10s, waveform scrubber
- **File loading** — File picker and drag-and-drop, any browser-supported audio format
- **Metadata** — Extracts and displays title, artist, album, artwork, and duration from file tags
- **Visualizations** — Three real-time canvas visualizers: Bars, Line, Wave (Web Audio API AnalyserNode)
- **Volume control** — Slider with mute toggle and memory of previous level
- **Responsive** — Mobile-first layout, stacked now-playing view on small screens, safe-area support for notched devices
- **Design** — Material 3 Expressive-influenced dark theme, violet accent palette, 44px+ touch targets

---

## Stack

| | |
|---|---|
| React 19 | Component UI and state |
| Vite 6 | Dev server and build |
| Tailwind CSS v4 | Styling |
| WaveSurfer.js 7 | Waveform rendering and seek |
| Web Audio API | Real-time frequency analysis |
| music-metadata | In-browser audio tag extraction |
| Lucide React | Icons |
| react-ga4 | Google Analytics 4 |

---

## Getting Started

```bash
git clone https://github.com/nettenz/web-audio-app.git
cd web-audio-app
npm install
npm run dev
```

> If running locally outside of GitHub Pages, remove the `base` option from `vite.config.js`.

## Deploy

```bash
npm run deploy
```

Builds and pushes to the `gh-pages` branch via the `gh-pages` package.

---

## License

MIT
