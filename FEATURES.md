# Web Audio App — Feature Proposals

> **Created:** 2026-04-28  
> **Status:** Proposal — not yet scheduled  
> **Context:** Built on React 18 + WaveSurfer.js + Web Audio API. All new features must respect the existing signal chain and component architecture defined in `.claude/CLAUDE.md`.

---

## Priority Tiers

| Tier | Meaning |
|------|---------|
| **P0 — Already Planned** | In the Phase 2 backlog (CLAUDE.md). Ship these first. |
| **P1 — High Value** | Small scope, high user impact. Good next candidates. |
| **P2 — Medium Value** | Meaningful features with moderate complexity. |
| **P3 — Big Bets** | High complexity, high payoff. Plan carefully before starting. |

---

## P0 — Already Planned (Phase 2 Backlog)

### [P0-1] Swipe Gesture Controls on Waveform
**What:** Swipe left/right on the waveform → ±10s seek. Swipe down on the player card → minimize to compact bar.  
**Why:** Mirrors physical media player interactions. Especially useful on mobile.  
**How:**
- `touchstart` + `touchend` on waveform container
- ~50px horizontal threshold for seek, ~80px vertical for minimize
- Show visual hint (arrow indicators) on first load, auto-dismiss after 3s  
**Files:** `Waveform.jsx`, `AudioPlayer.jsx`

---

### [P0-3] Draggable Playhead on Waveform
**What:** Replace static time pill with a draggable indicator that tracks touch across the waveform. Tooltip shows time above touch point. On release, seek to position.  
**Why:** More precise seeking than click-to-seek, especially on small screens.  
**How:**
- Track `touchmove` position on the waveform canvas
- Compute `ratio = touchX / canvasWidth`, call `ws.seekTo(ratio)`
- Render floating time tooltip via absolute-positioned div  
**Files:** `Waveform.jsx`

---

## P1 — High Value

### [P1-1] Keyboard Shortcuts
**What:** Global keyboard bindings for common actions.

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Seek −10s / +10s |
| `↑` / `↓` | Volume +10% / −10% |
| `M` | Mute toggle |
| `F` | Toggle fullscreen player |
| `N` / `P` | Next / Previous track in queue |

**Why:** Power users expect keyboard control. Zero visual complexity.  
**How:** `useEffect` with `window.addEventListener('keydown', ...)` in `AudioPlayer.jsx`. Guard against firing inside `<input>` elements.  
**Files:** `AudioPlayer.jsx`

---

### [P1-2] Shuffle & Repeat Modes
**What:** Three modes cycled by a button in the controls row:
- **No repeat** (default)
- **Repeat queue** — loops back to track 0 after last
- **Repeat one** — loops current track indefinitely
- **Shuffle** — randomizes next-track selection without repeating

**Why:** Core feature users expect from any music player. Currently the queue just stops at the end.  
**How:**
- Add `repeatMode: 'none' | 'queue' | 'one'` and `shuffle: bool` to `AudioPlayer` state
- On WaveSurfer `finish` event, apply logic before calling `selectTrack`
- UI: two icon buttons (`shuffle`, `repeat` / `repeat_one`) in controls row left slot (currently just `AnimationStyleDropdown`)  
**Files:** `AudioPlayer.jsx`, `AudioControls.jsx` (or new `PlaybackModeControls.jsx`)

---

### [P1-3] Playback Speed Control
**What:** Speed selector: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2×.  
**Why:** Common in podcast/audiobook players. Straightforward WaveSurfer API.  
**How:**
- `ws.setPlaybackRate(rate)` — WaveSurfer exposes this natively
- Small dropdown or segmented button group in controls area
- Persist selected rate to `localStorage` across sessions  
**Files:** `AudioPlayer.jsx` + new `PlaybackRateControl.jsx`  
**Constraint:** WaveSurfer `setPlaybackRate` affects pitch by default — acceptable; pitch-corrected speed requires `AudioWorklet` which is P3 scope.

---

### [P1-4] MediaSession API Integration
**What:** Wire up the browser's `navigator.mediaSession` API so the OS/browser chrome shows track info and media controls (lock screen on mobile, macOS media HUD, browser toolbar).

```js
navigator.mediaSession.metadata = new MediaMetadata({
  title, artist, album,
  artwork: [{ src: coverUrl, sizes: '512x512', type: 'image/jpeg' }]
});
navigator.mediaSession.setActionHandler('play', togglePlay);
navigator.mediaSession.setActionHandler('pause', togglePlay);
navigator.mediaSession.setActionHandler('previoustrack', () => selectTrack(currentIndex - 1));
navigator.mediaSession.setActionHandler('nexttrack', () => selectTrack(currentIndex + 1));
navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => ws.seekTo(seekTime / duration));
```

**Why:** Feels native. Works with headphone hardware buttons and car Bluetooth. Zero UI surface needed — pure API.  
**Files:** `AudioPlayer.jsx` (single `useEffect` watching `metadata` + `currentIndex`)

---

### [P1-5] Playlist Reordering (Drag to Reorder)
**What:** Drag tracks within the queue panel to reorder them. Active track follows its new position.  
**Why:** Users who load multiple files expect to rearrange the queue.  
**How:**
- Use HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) on `<li>` rows in `PlaylistManager`
- On drop, reorder `playlist[]` array, update `currentIndex` if needed
- Visual: ghost row + drag handle icon (`drag_indicator`) on left edge of each row  
**Files:** `PlaylistManager.jsx`, `AudioPlayer.jsx` (new `reorderTracks` handler)

---

## P2 — Medium Value

### [P2-1] 5-Band Equalizer
**What:** A panel with 5 `BiquadFilterNode` sliders: Sub-bass (60Hz), Bass (250Hz), Mid (1kHz), High-mid (4kHz), Treble (12kHz). Each ±12dB range. Preset picker: Flat, Bass Boost, Vocal, Electronic.

**Why:** Power-user feature. Web Audio API makes this straightforward; the hard part is UI.  
**How:**
- Insert 5 `BiquadFilterNode` instances between `source` and `gainNode`
- New `Equalizer.jsx` component — 5 vertical range sliders + preset dropdown
- `AudioEffects.js` utility: `createEqChain(ctx)` returns `{ nodes, setGain(band, db) }`  
**Files:** new `src/utils/audioEffects.js`, new `src/components/AudioPlayer/Equalizer.jsx`, `AudioPlayer.jsx`  
**UI risk:** 5 sliders need careful layout on mobile. Consider collapsible panel.

---

### [P2-2] Persistent Playlist (LocalStorage)
**What:** Save the current queue to `localStorage` on every change. On next load, restore the playlist (blob URLs expire — only non-blob tracks like the default example.mp3 can be restored; blob tracks show a "file unavailable" state).  
**Why:** Users lose their queue on page refresh. Frustrating.  
**How:**
- Serialize `playlist[]` to localStorage (exclude `src` for blob tracks, keep metadata)
- On mount, hydrate playlist from storage; re-prompt for missing blob files
- Show recovery UI: grayed-out track row with "Re-add file" button  
**Files:** `AudioPlayer.jsx` (new `useEffect` watchers on `playlist`)  
**Constraint:** Blob URL expiration means only the default track survives refresh fully. Document this limitation clearly in the UI.

---

### [P2-3] Sleep Timer
**What:** Timer dropdown in controls: Off / 15min / 30min / 45min / 1hr. When the timer elapses, fade out and pause.  
**Why:** Great for listening while falling asleep. Simple to implement.  
**How:**
- `setTimeout` → `gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 5)` → `ws.pause()`
- Small clock icon button that opens a dropdown; shows countdown when active  
**Files:** new `SleepTimer.jsx`, `AudioPlayer.jsx`

---

### [P2-4] New Visualization Modes
**What:** Add two new draw modes to `VisualizerBars.jsx`:

**Circular / Radial Bars**
- Frequency bars drawn radially outward from a center point
- Album art renders in the center circle
- Rotates slowly while playing

**Spectrogram (scrolling heatmap)**
- Horizontal scroll: time left → right
- Vertical axis: frequency low → high  
- Color: heatmap from `rgba(0,0,0,0)` to violet at high amplitude

**How:** Both are new branches in the existing `draw()` switch inside `VisualizerBars.jsx`. Add two new options to `AnimationStyleDropdown`.  
**Files:** `VisualizerBars.jsx`, `AnimationStyleDropdown.jsx`

---

### [P2-5] A-B Loop (Loop Section)
**What:** Set a start (A) and end (B) point on the waveform. Playback loops between A and B indefinitely until cleared.  
**Why:** Practice tool for musicians / students learning from audio. Unique differentiator.  
**How:**
- Two buttons on the waveform overlay: `[A]` sets loop start, `[B]` sets loop end
- WaveSurfer `audioprocess` event: if `currentTime >= B`, `ws.seekTo(A / duration)`
- Visual: shaded region on waveform between A and B markers  
**Files:** `Waveform.jsx`, `AudioPlayer.jsx`

---

### [P2-6] Search & Filter in Queue
**What:** Search input in the `PlaylistManager` header that filters visible tracks by title or artist.  
**Why:** Once a queue grows beyond ~10 tracks, finding a specific track becomes annoying.  
**How:**
- Local `query` state in `PlaylistManager`
- Filter `playlist` array on render — no changes to parent state
- Clear button (×) when query is non-empty  
**Files:** `PlaylistManager.jsx` only

---

## P3 — Big Bets

### [P3-1] PWA (Installable + Offline Support)
**What:** Make the app installable via browser "Add to Home Screen" and functional offline.  
**Why:** Removes friction for regular users on mobile. Feels native.  
**How:**
- `vite-plugin-pwa` → generates `manifest.json` + service worker
- Cache shell (HTML, JS, CSS) for offline; audio files are user-uploaded blobs, so they're inherently offline
- Add `manifest.json`: name, icons (192px, 512px), `display: standalone`, `theme_color`  
**Files:** `vite.config.js`, `index.html`, new `public/manifest.json`, new icons in `public/`  
**Risk:** Service worker lifecycle and cache invalidation on deploy. Test carefully.

---

### [P3-2] Waveform Minimap / Overview Strip
**What:** A thin secondary waveform strip below the main waveform showing the full track. A viewport window slides over it as playback progresses. Click anywhere on the minimap to jump.  
**Why:** For long tracks (1hr+ podcasts), the main waveform zoomed in loses context. The minimap restores global awareness.  
**How:**
- WaveSurfer has a built-in `Minimap` plugin — evaluate if it still fits the current setup
- Alternatively, render a second lower-resolution WaveSurfer instance (read-only, fixed zoom)  
**Files:** `Waveform.jsx`  
**Risk:** Two WaveSurfer instances sharing the same audio element — needs the same `__visualizerCache` pattern used in `VisualizerBars.jsx`.

---

### [P3-3] Audio Recording
**What:** Capture microphone input via `getUserMedia`, visualize it live, and save the recording as a WAV blob that lands in the playlist.  
**Why:** Turns the app into a lightweight voice memo / audio sketch tool.  
**How:**
- `navigator.mediaDevices.getUserMedia({ audio: true })` → `MediaStreamSource`
- Feed into existing `AnalyserNode` for live visualization
- `MediaRecorder` API → record chunks → `Blob` → add to `playlist[]`
- New `RecordButton.jsx` with record/stop/preview controls  
**Files:** new `RecordButton.jsx`, `AudioPlayer.jsx`  
**Risk:** Browser permission prompt UX. Recording large files in memory. WAV encoding in the browser requires a utility (e.g., `audiobuffer-to-wav`).

---

### [P3-4] Pitch-Corrected Speed Control (AudioWorklet)
**What:** Playback speed control that adjusts tempo without affecting pitch (like podcast apps).  
**Why:** Complement to [P1-3]. The native `setPlaybackRate` shifts pitch — this doesn't.  
**How:**
- Requires a phase-vocoder `AudioWorklet` (e.g., `soundtouch-js`)
- Wire as a node between source and gainNode
- UI identical to [P1-3] speed control  
**Risk:** AudioWorklet cross-origin isolation requirements (`COOP`/`COEP` headers) may conflict with GitHub Pages. Test on GH Pages environment first.

---

### [P3-5] Last.fm Scrobbling
**What:** Optionally authenticate with Last.fm and scrobble tracks as they play (title + artist required). Show "Now Scrobbling" indicator.  
**Why:** Niche but valuable for Last.fm users who want listening history tracked.  
**How:**
- Last.fm API: `track.scrobble` endpoint (POST, requires API key + session token)
- OAuth flow via Last.fm auth URL → callback → store session token in `localStorage`
- Scrobble when: track has played >30s AND >50% of its duration  
**Files:** new `src/utils/lastfm.js`, settings panel  
**Risk:** API key must be public (client-side app) — use Last.fm's allowed public key approach. Rate limiting.

---

## Implementation Notes

### Signal Chain (All Audio Features Must Respect This)
```
source → [EQ nodes] → gainNode → analyserNode → destination
```
Insert new DSP nodes between `source` and `gainNode`. Never after `analyserNode`.

### State Ownership
All new state lives in `AudioPlayer.jsx` and flows down via props. No new state management library.

### Mobile First
Every new UI component must work at 375px viewport width. Test fullscreen player too — it has its own layout context.

### Token Budget for Features
Estimated implementation order by value/effort ratio:
1. [P1-4] MediaSession API — 1–2 hours, zero UI
2. [P1-1] Keyboard Shortcuts — 1–2 hours, zero UI
3. [P1-2] Shuffle & Repeat — 3–4 hours, small UI
4. [P0-1] Swipe Gestures — 2–3 hours (already specced)
5. [P1-3] Playback Speed — 2–3 hours, small UI
6. [P1-5] Playlist Reorder — 3–4 hours, drag-drop
7. [P0-3] Draggable Playhead — 3–4 hours (already specced)

---

**End of Feature Proposals — 2026-04-28**
