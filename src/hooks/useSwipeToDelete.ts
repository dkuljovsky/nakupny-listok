import { useRef, useState } from "react";

const MAX_DRAG = -120;
const DELETE_THRESHOLD = -80;

export default function useSwipeToDelete(onDelete: (id: string) => void, id: string) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragXRef = useRef(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const justSwipedRef = useRef(false);

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    draggingRef.current = true;
    justSwipedRef.current = false;
    startXRef.current = e.touches[0].clientX;
    setDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;

    const delta = e.touches[0].clientX - startXRef.current;

    if (delta < 0) {
      const next = Math.max(delta, MAX_DRAG);
      dragXRef.current = next;
      setDragX(next);
    }
  }

  function handleTouchEnd() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    if (dragXRef.current < DELETE_THRESHOLD) {
      justSwipedRef.current = true;
      onDelete(id);
    } else {
      dragXRef.current = 0;
      setDragX(0);
    }
  }

  function wasJustSwiped() {
    if (justSwipedRef.current) {
      justSwipedRef.current = false;
      return true;
    }
    return false;
  }

  return {
    dragX,
    dragging,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    wasJustSwiped,
  };
}