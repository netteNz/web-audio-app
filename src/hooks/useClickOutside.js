import { useEffect } from 'react';

// Calls onOutside when a mousedown/touchstart lands outside ref's element.
export const useClickOutside = (ref, onOutside, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const handle = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [ref, onOutside, enabled]);
};
