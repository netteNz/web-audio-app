import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const OFFLINE_READY_MS = 4000;

// Service worker registration + toast. registerType is 'prompt', so a new
// version only activates when the user taps Reload — never mid-song.
const PwaUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!offlineReady) return;
    const id = setTimeout(() => setOfflineReady(false), OFFLINE_READY_MS);
    return () => clearTimeout(id);
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 mx-auto w-fit z-[60] flex items-center gap-3 rounded-full bg-zinc-800 ring-1 ring-white/10 shadow-xl shadow-black/60 pl-4 pr-2 py-2 text-sm text-zinc-300 animate-fadein"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {needRefresh ? (
        <>
          <span>Update available</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1 rounded-full text-violet-400 font-medium hover:bg-white/5"
          >
            Reload
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss"
            className="p-1 rounded-full text-zinc-400 hover:bg-white/5 flex"
          >
            <span className="material-symbols-rounded leading-none select-none" style={{ fontSize: 18 }}>close</span>
          </button>
        </>
      ) : (
        <span className="pr-2">Ready to work offline</span>
      )}
    </div>
  );
};

export default PwaUpdatePrompt;
