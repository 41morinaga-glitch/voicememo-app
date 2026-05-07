import { useRef, useCallback } from 'react';

const THRESHOLD = 50;
const MAX_VERTICAL_RATIO = 0.8;

export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const resolve = useCallback(
    (dx: number, dy: number) => {
      if (Math.abs(dy) > Math.abs(dx) * MAX_VERTICAL_RATIO) return;
      if (Math.abs(dx) < THRESHOLD) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight],
  );

  // Touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      startX.current = null;
      startY.current = null;
      resolve(dx, dy);
    },
    [resolve],
  );

  // Mouse (PC)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      startX.current = null;
      startY.current = null;
      resolve(dx, dy);
    },
    [resolve],
  );

  const onMouseLeave = useCallback(() => {
    startX.current = null;
    startY.current = null;
  }, []);

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp, onMouseLeave };
}
