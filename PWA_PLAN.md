# Plan: turn web-audio-app into an installable PWA

## Context
You chose a PWA over a native Windows or mobile build. A PWA keeps one codebase and the existing GitHub Pages deploy, and adds:
- installing to the home screen or desktop (Android, iOS "Add to Home Screen", Chrome/Edge on Windows),
- offline launch,
- lock-screen and media-key controls.

The app is already mobile-first: safe-area insets, a bottom sheet, swipe-to-dismiss. So most of the work is plumbing, not UI.

Facts checked against the code and npm:
- `vite-plugin-pwa@2.0.0` supports Vite 6 and ships `virtual:pwa-register/react` (`useRegisterSW`).
- There is no manifest, `theme-color` meta, PNG icon or service worker yet.
- `index.html:34` loads Material Symbols from Google Fonts. Offline, the icons would render as their literal names, e.g. "upload_file".
- Offline with only the example track, the loading overlay turns into a permanent "Couldn't load" card (`AudioPlayer.jsx:153-160`, `:317-322`).
- There are no next/previous-track handlers. `selectTrack(index)` (`AudioPlayer.jsx:126`) is the building block.
- ESLint has no import plugin, so the virtual-module import is fine.

## Phase 1: Installable and works offline (core)

1. **Dependencies:** add `vite-plugin-pwa` and `@vite-pwa/assets-generator` as devDependencies. Neither is in `package.json` today.
2. **Icons:** add `pwa-assets.config.js` using the `minimal2023Preset`, with source `public/audio-equalizer-device.svg`.
   - Add a script, `"generate-pwa-assets": "pwa-assets-generator"`.
   - Run it once and commit the output to `public/`: pwa-64/192/512, maskable-512, apple-touch-icon-180 and favicon.ico.
3. **`vite.config.js`:** add `VitePWA({...})` with these settings.
   - `registerType: 'prompt'`. Don't auto-reload, so an update never cuts off a song.
   - **Manifest:**
     - `name: 'Web Audio Player'`, `short_name: 'Audio Player'`, `id`/`start_url`/`scope` = `'/web-audio-app/'`.
     - `display: 'standalone'`, `theme_color`/`background_color: '#09090b'` (zinc-950).
     - `icons` = the generated set, including `purpose: 'maskable'`.
   - **`workbox.globPatterns`:** `**/*.{js,css,html,svg,png,ico}` for the app shell and the lazy `music-metadata` chunks. **Don't precache `example.mp3`** (16 MB).
   - **`workbox.runtimeCaching`:**
     - Google Fonts: StaleWhileRevalidate for `fonts.googleapis.com`, CacheFirst for `fonts.gstatic.com` (`cacheableResponse: {statuses:[0,200]}`, 1-year expiry).
     - `example.mp3`: CacheFirst, `cacheableResponse: {statuses:[200]}` plus `RangeRequestsPlugin`. WaveSurfer's full fetch fills the cache, and the `<audio>` element's later Range requests are answered from it, so it works offline after the first visit.
   - `devOptions.enabled: false`. Test with `vite preview` instead, so no `dev-dist/` is created.
4. **`index.html`:**
   - Add `<meta name="theme-color" content="#09090b">` and an `apple-touch-icon` link.
   - Add `<meta name="apple-mobile-web-app-status-bar-style" content="black">`. Use "black" rather than "black-translucent", so the fixed Navbar doesn't slide under the iOS status bar. That means `Navbar.jsx` needs no change.
   - Change the favicon href to `%BASE_URL%audio-equalizer-device.svg`.
   - The plugin injects the manifest link.
5. **Update prompt:** add a new `src/components/PwaUpdatePrompt.jsx`.
   - It uses `useRegisterSW()` from `virtual:pwa-register/react`.
   - When `needRefresh`, it shows a small pill: "Update available · Reload" plus a dismiss button, which calls `updateServiceWorker(true)`.
   - When `offlineReady`, it briefly shows "Ready to work offline" and auto-dismisses after 4s.
   - Styling: `fixed bottom-4 inset-x-0 mx-auto w-fit z-[60]`, above FullscreenPlayer's z-50. Use `bg-zinc-800 ring-1 ring-white/10`, violet-400 for the action, and the safe-area bottom inline style.
   - Render it in `src/App.jsx` after `<footer>`. This task targets App.jsx, so the "don't touch App.jsx" rule doesn't apply.
6. **Offline error copy:** in `handleWaveError` (`AudioPlayer.jsx:153`), when `!navigator.onLine` and the track isn't a blob, change the message to "You're offline: add a file from this device to play". Otherwise behaviour stays the same.

## Phase 2: Native-feeling playback controls

7. **`src/hooks/useMediaSession.js`:** a new hook, called from AudioPlayer.
   - **Metadata:** set `navigator.mediaSession.metadata = new MediaMetadata({title, artist, album, artwork})` whenever `currentTrack.id` or `metadata` changes. Artwork comes from `metadata.picture` (a blob URL) or the 512 icon.
   - **`playbackState`:** mirrors `isPlaying`.
   - **Action handlers:**
     - `play` and `pause` → `togglePlay` (guarded by the current state).
     - `seekbackward` and `seekforward` → `handleSeekBackward` / `handleSeekForward`.
     - `seekto` → `ws.setTime(details.seekTime)`.
     - `previoustrack` and `nexttrack` → new `selectPrev` / `selectNext` wrappers around `selectTrack`, bounded by `playlist.length`. They're only registered when there is more than one track; otherwise set to null.
   - **Position:** `setPositionState({duration, position, playbackRate:1})`, updated on ready and on seek.
   - Feature-detect with `'mediaSession' in navigator`.
   - The result: lock-screen and notification controls on Android, the iOS Now Playing panel, and hardware media keys plus the media flyout on Windows (Chrome/Edge).

Next and previous only select the track. Like a queue click today, they don't auto-play. Auto-advance on finish is a separate feature.

## Phase 3: Optional, decide later

- **Persist the queue across launches:** store user `File` blobs plus metadata in IndexedDB. Today uploads are lost on reload. This is the biggest remaining gap for an "app" feel, but it costs storage quota (iOS limits are tight) and needs its own design.
- **Desktop Chromium extras:** `file_handlers` ("Open with" .mp3/.flac) and a custom install button via `beforeinstallprompt`.

## Files touched
`package.json`, `vite.config.js`, `pwa-assets.config.js` (new), `public/*` (generated icons), `index.html`, `src/App.jsx`, `src/components/PwaUpdatePrompt.jsx` (new), `src/hooks/useMediaSession.js` (new), `src/components/AudioPlayer/AudioPlayer.jsx` (hook call, prev/next wrappers, offline copy), `.claude/CLAUDE.md` (new PWA section, file tree and dev rule: "don't precache example.mp3; SW update is prompt-based").

## Known limitations (to tell users / you)
- **iOS background audio:** playback routed through the shared `AudioContext` (`audioGraph.js`) may stop when the screen locks in an installed iOS PWA. This is a WebKit limitation; Android Chrome keeps playing. It will be checked on a device and documented, not fixed in this plan.
- **Uploads don't persist:** user uploads stay as session-only blob URLs until Phase 3.

## Verification
1. `npm run lint` and `npm run build` pass. `dist/` contains `sw.js`, `manifest.webmanifest` and the icons, and `dist/index.html` has the manifest link and a favicon under `/web-audio-app/`.
2. `npm run preview` → open `http://localhost:4173/web-audio-app/` in Chrome. In DevTools → Application:
   - the manifest shows no errors and the icons render,
   - the SW is activated,
   - the install icon appears in the address bar.
3. Play example.mp3 once, then turn on DevTools "Offline" and reload:
   - the shell loads, icons render, and the example plays with the visualizer working,
   - an uploaded local file plays.
4. Change a string, rebuild and re-preview. The "Update available" pill appears, and Reload picks up the change.
5. Media Session in Chrome on Windows: media keys and the Windows media flyout show the title and artwork and control play/pause/seek. With 2+ tracks, next and previous switch tracks.
6. After `npm run deploy`, on real phones:
   - Android Chrome: install, lock-screen controls, background playback.
   - iOS Safari: Add to Home Screen, standalone launch and status bar look, then note background-audio behaviour.
