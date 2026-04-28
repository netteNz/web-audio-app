# Web Audio App — Directory Structure Map

> **Last Updated:** 2026-04-28  
> **Project:** React + Vite single-page audio player  
> **Tech Stack:** React 18, Vite, Tailwind CSS v3, WaveSurfer.js

---

## Root Directory

```
web-audio-app/
├── .claude/                          # Claude Code configuration & context
├── .gitignore                        # Git ignore rules
├── dist/                             # Vite build output (git-ignored)
├── node_modules/                     # Dependencies (git-ignored)
├── public/                           # Static assets served at BASE_URL
├── src/                              # Source code
├── eslint.config.js                  # ESLint configuration
├── index.html                        # Vite HTML template (root level)
├── package.json                      # Project dependencies & metadata
├── package-lock.json                 # Locked dependency versions
├── README.md                         # Project overview
├── STRUCTURE.md                      # This file — directory documentation
├── tailwind.config.js                # Tailwind CSS v3 configuration
└── vite.config.js                    # Vite build configuration
```

---

## `.claude/` — Claude Code Configuration

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **Context document (auto-read on session start)**. Complete codebase overview, component responsibilities, data flow, dev rules, changelog, and phase roadmap. Do not scan source files unless task requires it. |
| `claude-code-prompt.md` | Session prompt template for Claude Code integration |

---

## `public/` — Static Assets

| File | Purpose |
|------|---------|
| `example.mp3` | **Default track loaded on first render.** ID3 tags fetched on mount via parseBlob. Included in repo. Users can drag-drop or upload their own files. |

---

## `src/` — Source Code

### Root Entry Point

| File | Purpose |
|------|---------|
| `main.jsx` | **Vite entry point.** Defines App wrapper component; mounts Navbar + AudioPlayer + footer. Fires `initGA()` + `pageView()` on mount. **Do not modify unless task explicitly targets it.** |
| `index.css` | Global styles, Tailwind @import directives. Material Symbols icon font imported via CDN in `index.html`. |

### `src/components/AudioPlayer/` — Main Audio Player Components

Core audio player logic, state management, UI layout, and visualization.

#### State & Orchestration

| File | Purpose |
|------|---------|
| `AudioPlayer.jsx` | **State orchestrator — owns all meaningful app state.** Manages isPlaying, volume, animationStyle, playlist, currentIndex, isFullscreen, isWaveReady, dragging. Renders card with TrackInfo, Waveform, VisualizerBars, AudioControls, VolumeSlider. Passes state down to child components. Handles file uploads, track selection, volume changes, animation style switches. Keys VisualizerBars by currentIndex to force remount on track switch. |

#### UI Components — Card & Layout

| File | Purpose |
|------|---------|
| `TrackInfo.jsx` | **Metadata display row.** Always horizontal flex layout (mobile + desktop). Renders album artwork (tappable <button>), title, artist, album, duration. Artwork triggers fullscreen player on click. Fallback: gray placeholder with music_note icon. |
| `Waveform.jsx` | **WaveSurfer waveform renderer.** Creates WaveSurfer instance in containerRef. Displays waveform with violet progress color. Time pill overlay (top-left, absolute): "currentTime / totalDuration" in tabular-nums. Fires onReady() callback when WaveSurfer 'ready' event fires. Destroys instance on src change. |
| `VisualizerBars.jsx` | **Canvas FFT visualizer.** Analyzes audio via Web Audio API analyser. Draws bars/line/wave based on animationStyle prop. **Key rule:** always keyed by currentIndex (forces remount on track switch). Uses animationStyleRef to avoid stale closures in rAF loop. Implements __visualizerCache pattern to safely reuse MediaElementSource across multiple mounts (fullscreen toggle). Opacity 40% idle, 100% playing. |
| `PlaylistManager.jsx` | **Queue panel below card.** Shows all tracks in a list; highlights active track; shows animated equalizer bars while playing. Supports drag-drop file add, per-track remove button (hidden if only 1 track). Header shows "QUEUE · N" count. Empty state: centered music_note + "No tracks in queue". |

#### UI Components — Controls & Overlay

| File | Purpose |
|------|---------|
| `AudioControls.jsx` | **Playback controls — stateless.** Three buttons: replay_10 (seek -10s), play/pause (violet accent), forward_10 (seek +10s). No props management — parent coordinates all state. Used in both AudioPlayer card and FullscreenPlayer. |
| `VolumeSlider.jsx` | **Volume control — horizontal expanding slider.** Icon button opens collapsible w-24 range input to the left. Click icon: toggle mute/restore. Click outside: close. Shows icon state: volume_off / volume_mute / volume_down / volume_up based on current level. |
| `AnimationStyleDropdown.jsx` | **Visualization style selector.** Options: 'simple' (Bars), 'minimal' (Line), 'wave' (Wave). Mobile: bottom sheet (createPortal to document.body) with backdrop blur. Icon-only trigger (graphic_eq). Desktop: text label dropdown above card. |
| `FullscreenPlayer.jsx` | **Full-screen overlay player — Phase 2 [2].** Fixed z-50 slide-up animation. Features: drag handle + swipe-to-dismiss (80px threshold), hero artwork with play/pause scale, clickable progress bar, own VisualizerBars instance (keyed by currentIndex), "Now Playing" header with "N of M" playlist position. Shares WaveSurfer audio context with main card (reuses __visualizerCache). |

#### Top Navigation

| File | Purpose |
|------|---------|
| `Navbar.jsx` | **Static top navigation.** Title: "Web Audio Player", nav links: Home / Projects / Contact (hidden below md breakpoint). **Do not modify unless task explicitly targets it.** |

### `src/utils/` — Utilities

| File | Purpose |
|------|---------|
| `analytics.js` | **Google Analytics 4 integration.** Exports: `initGA()`, `pageView(title)`, `trackEvent(name, params)`. Events: audio_load, audio_play, audio_pause, volume_change, visualization_change. **Do not modify signatures — they match GA4 schema.** |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `index.html` | **Vite HTML template (at root, NOT in src/).** Root `<div id="root">` for React mount. Material Symbols Rounded icon font CDN link. Safe-area viewport meta tags for mobile. |
| `vite.config.js` | Vite build configuration. Defines React plugin, BASE_URL for GitHub Pages deployment. |
| `tailwind.config.js` | Tailwind CSS v3 config. Custom color palette: violet-400 primary, zinc color scale for surfaces/text. `sm:` breakpoint = 640px. |
| `package.json` | Dependencies: react, react-dom, vite, tailwindcss, wavesurfer.js, music-metadata. Dev dependencies: eslint, autoprefixer, postcss. |
| `eslint.config.js` | ESLint rules for code quality & consistency. |

---

## Build & Deployment

| Directory | Purpose |
|-----------|---------|
| `dist/` | **Vite build output (git-ignored).** Generated on `npm run build`. Deployed to GitHub Pages at nettenz.github.io/web-audio-app. |
| `node_modules/` | **npm dependencies (git-ignored).** Install via `npm install`. |

---

## Component Data Flow

```
main.jsx (App)
  ↓ initGA() + pageView()
  ├─ Navbar (static)
  ├─ AudioPlayer (state orchestrator)
  │  ├─ [Card Container]
  │  │  ├─ [Header Row]
  │  │  │  ├─ TrackInfo (artwork button + title/artist)
  │  │  │  └─ Upload label (self-start right)
  │  │  ├─ Waveform (WaveSurfer instance + time pill)
  │  │  ├─ VisualizerBars key={currentIndex} (opacity-40/100)
  │  │  ├─ [Separator]
  │  │  └─ [Controls Row]
  │  │     ├─ AnimationStyleDropdown (left slot / bottom sheet mobile)
  │  │     ├─ AudioControls (absolute center)
  │  │     └─ VolumeSlider (right slot)
  │  │
  │  ├─ PlaylistManager (queue below card)
  │  │  └─ [Track rows with equalizer bars]
  │  │
  │  └─ FullscreenPlayer (when isFullscreen=true)
  │     ├─ Drag handle
  │     ├─ Header ("Now Playing" + "N of M")
  │     ├─ Artwork (hero, scale on play state)
  │     ├─ Metadata (title, artist, album)
  │     ├─ Progress bar (clickable)
  │     ├─ VisualizerBars key={currentIndex} (own instance)
  │     ├─ AudioControls (reused)
  │     └─ VolumeSlider (reused)
  │
  └─ Footer (safe-area-inset-bottom aware)
```

---

## Key State & Props Patterns

### AudioPlayer State (Source of Truth)

```javascript
isPlaying      : bool       // mirrors WaveSurfer playback state
isWaveReady    : bool       // gates control render until WaveSurfer 'ready'
volume         : 0–1        // synced to WaveSurfer on change
animationStyle : 'wave'|'minimal'|'simple'
dragging       : bool       // drag-over visual feedback
isFullscreen   : bool       // FullscreenPlayer visibility
playlist       : Track[]    // array of track objects
currentIndex   : number     // index into playlist
```

### Track Object Schema

```javascript
{
  id       : string,           // randomUUID
  src      : string,           // blob URL or BASE_URL
  metadata : {
    title   : string,
    artist  : string,
    album   : string,
    picture : Blob | null      // from ID3 tags
  },
  duration : number            // seconds
}
```

---

## Critical Implementation Rules

### Audio & State Management
- **WaveSurfer:** Creates its own `<audio>` inside containerRef. Never add a separate `<audio>`.
- **audioContext.resume():** Must fire before `ws.playPause()` — already in togglePlay().
- **Volume sync:** Changed on every update, not debounced.
- **Track switch:** Calls `selectTrack(index)` — does NOT reset isWaveReady (no loading overlay on queue nav).

### Memory & Cleanup
- **Blob URLs:** Must be revoked in useEffect cleanup (already handled in removeTrack).
- **WaveSurfer destruction:** On src change via Waveform.jsx effect cleanup.
- **Analyser state:** Remounts via `key={currentIndex}` on VisualizerBars — forces isAnalyzerReady reset.

### Canvas & Visualization
- **animationStyleRef:** Intentional stale-closure workaround in VisualizerBars. Never read prop directly in rAF.
- **__visualizerCache:** Stores `{ audioContext, source }` on media element. Allows safe reuse of MediaElementSource across fullscreen toggle. Always check cache before calling createMediaElementSource().
- **invisible vs. hidden:** VisualizerBars uses `invisible` when fullscreen (keeps canvas & rAF alive). Still remounts on track switch.

### UI & Responsiveness
- **Tailwind only:** Layout, color, spacing. Inline styles only for fontVariationSettings + safe-area-inset env().
- **Breakpoint:** Mobile-first, `sm:` = 640px. Never xs: or custom.
- **TrackInfo:** Always flex-row (mobile + desktop).
- **Upload:** Always in AudioPlayer header row (self-start right).
- **Responsive pairs:** `h-20 sm:h-36`, `text-base sm:text-lg`, etc.

### Routing & Navigation
- **No routing library:** Single-page app. FullscreenPlayer is a visibility toggle, not a route.
- **URL hashes:** Handled for track/playlist state persistence (see git history).

### Analytics
- **GA4 integration:** initGA() on mount, pageView() once, trackEvent() for user actions.
- **Do not modify:** utils/analytics.js signatures — they match GA4 schema.

---

## Development Workflow

### Running the App
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

### Deployment
App deploys to GitHub Pages at **nettenz.github.io/web-audio-app** via CI/CD (see git history).
BASE_URL = `/web-audio-app/` in vite.config.js.

### Code Style
- **Hooks only:** No class components. Use useState, useEffect, useRef, useCallback.
- **Naming:** camelCase for variables/functions, PascalCase for components.
- **Comments:** Only for WHY (hidden constraints, workarounds). Never for WHAT — identifiers explain that.
- **Props:** Destructure in function signature. No prop drilling beyond 2 levels.

---

## Changelog Highlights

| Date | Phase | Changes |
|------|-------|---------|
| 2026-04-25 | Phase 1 — Mobile UX | Fixed duplicate controls, dead visualizer paused state, volume slider, mobile animation dropdown, artwork sizing |
| 2026-04-25 | Post-Phase 1 UI | Upload button moved to header row |
| 2026-04-26 | Phase 2 [2] — Fullscreen | FullscreenPlayer overlay, swipe-to-dismiss, clickable progress, own VisualizerBars |
| 2026-04-26 | Playlist + Card Redesign | Replaced single-track with playlist[], ambient glow, card surfaces, PlaylistManager queue |
| 2026-04-26 | Bug Fixes | Restored non-blob metadata parsing, fixed analyser dead connection on track switch (key=currentIndex), removed loading splash on queue nav |
| 2026-04-27 | Mobile Viewport Polish | Shrunk visualizer to 56px mobile, collapsed style picker to single left slot, tightened spacing |

---

## Remaining Roadmap (Phase 2 – Not Started)

### [1] Swipe Gesture Controls on Waveform
- Swipe left/right → ±10s seek (mirrors AudioControls buttons)
- Swipe down → minimize to compact bar
- Touch event handlers with ~50px horizontal / ~80px vertical threshold
- Visual hint on first load (auto-dismiss after 3s)

### [3] Draggable Playhead on Waveform
- Replace static time pill with draggable indicator
- Drag → show time tooltip above touch point
- Release → seek to position
- Works alongside WaveSurfer click-to-seek

---

## File Index by Category

### State & Orchestration
- `src/components/AudioPlayer/AudioPlayer.jsx` — Main state owner

### UI Display
- `src/components/AudioPlayer/TrackInfo.jsx` — Metadata row
- `src/components/AudioPlayer/Waveform.jsx` — WaveSurfer instance
- `src/components/AudioPlayer/VisualizerBars.jsx` — FFT visualizer
- `src/components/AudioPlayer/PlaylistManager.jsx` — Queue panel

### Controls & Interaction
- `src/components/AudioPlayer/AudioControls.jsx` — Play/pause/seek buttons
- `src/components/AudioPlayer/VolumeSlider.jsx` — Volume control
- `src/components/AudioPlayer/AnimationStyleDropdown.jsx` — Style picker

### Fullscreen
- `src/components/AudioPlayer/FullscreenPlayer.jsx` — Overlay player

### Navigation
- `src/components/AudioPlayer/Navbar.jsx` — Top nav (static)

### Utilities
- `src/utils/analytics.js` — GA4 integration
- `src/main.jsx` — React entry point
- `src/index.css` — Global styles

### Config
- `vite.config.js` — Build config
- `tailwind.config.js` — Tailwind config
- `package.json` — Dependencies
- `index.html` — HTML template

---

## Quick Reference — Common Tasks

| Task | Files to Touch |
|------|----------------|
| Add/modify a component | `src/components/AudioPlayer/*.jsx` + possibly `AudioPlayer.jsx` |
| Change styles or spacing | `tailwind.config.js` + target component `.jsx` + `src/index.css` |
| Add new state | `AudioPlayer.jsx` (source of truth) + pass to children |
| Fix visualizer connection | `VisualizerBars.jsx` (analyser setup) + `Waveform.jsx` (WaveSurfer lifecycle) |
| Add analytics event | `src/utils/analytics.js` (schema) + component calling `trackEvent()` |
| Deploy changes | Commit to `master` branch; CI/CD handles `npm run build` + GitHub Pages sync |

---

**End of Structure Map — Generated 2026-04-28**
