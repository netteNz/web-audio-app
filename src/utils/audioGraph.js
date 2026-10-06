// Shared Web Audio graph for WaveSurfer media elements.
//
// createMediaElementSource() can only be called ONCE per <audio> element, and
// once called the element's output is routed through the AudioContext. So:
//   - one AudioContext for the whole app (contexts are expensive and capped)
//   - one MediaElementSourceNode per media element, cached here
//   - source -> destination is always wired; analysers attach as extra taps

let audioContext = null;
const sources = new WeakMap();

export const getAudioContext = () => {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioContext = new Ctx();
  }
  return audioContext;
};

export const getSource = (mediaElement) => {
  if (!mediaElement) return null;
  let source = sources.get(mediaElement);
  if (!source) {
    const ctx = getAudioContext();
    source = ctx.createMediaElementSource(mediaElement);
    source.connect(ctx.destination);
    sources.set(mediaElement, source);
  }
  return source;
};

export const releaseSource = (mediaElement) => {
  const source = mediaElement && sources.get(mediaElement);
  if (!source) return;
  try { source.disconnect(); } catch { /* already disconnected */ }
  sources.delete(mediaElement);
};

export const resumeAudio = async () => {
  if (audioContext?.state === 'suspended') await audioContext.resume();
};
