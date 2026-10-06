import { useRef, useState } from 'react';

// Drag-and-drop file target. Tracks enter/leave depth so moving the cursor
// over child elements doesn't flicker the dragging state.
export const useFileDrop = (onFiles) => {
  const [dragging, setDragging] = useState(false);
  const depthRef = useRef(0);

  const dropProps = {
    onDragEnter: (e) => {
      e.preventDefault();
      depthRef.current += 1;
      setDragging(true);
    },
    onDragOver: (e) => e.preventDefault(),
    onDragLeave: (e) => {
      e.preventDefault();
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) setDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);
      if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
    },
  };

  return { dragging, dropProps };
};
