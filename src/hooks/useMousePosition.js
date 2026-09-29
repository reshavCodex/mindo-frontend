import { useEffect, useRef } from "react";

/**
 * useMousePosition
 * -----------------
 * Tracks pointer position relative to `containerRef`'s bounding box,
 * throttled to the browser's animation frame rate.
 *
 * Listeners are attached to `window` rather than the container node,
 * since a container may have `pointer-events: none` (excluding it
 * from hit-testing) — window-level listening works regardless, while
 * the container ref is still used purely for the bounding-rect math.
 *
 * onMove receives { x, y, normX, normY, active, contained }. x/y are
 * pixel coordinates relative to the container's top-left; normX/normY
 * are -1..1 relative to the container's center (NOT clamped — callers
 * using normX/normY for effects that should stay bounded, like a
 * rotation tilt, should clamp on their end).
 *
 * `contained` is true only when the pointer's last known real
 * movement placed it inside the container's current bounding box.
 * It is recomputed exclusively from genuine `pointermove` events, so
 * — unlike DOM `pointerenter`/`pointerleave` (which browsers can also
 * fire when an element scrolls underneath a stationary cursor,
 * without the mouse actually moving) — it never flips on scroll.
 * Use this for hover-driven effects that must stay still while the
 * page scrolls under the cursor.
 *
 * No-ops if containerRef.current is null or prefers-reduced-motion.
 */
export default function useMousePosition(containerRef, onMove) {
  const rafRef = useRef(null);
  const pendingRef = useRef(null);
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const flush = () => {
      rafRef.current = null;
      if (pendingRef.current && onMoveRef.current) {
        onMoveRef.current(pendingRef.current);
      }
    };

    const scheduleFlush = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    const handlePointerMove = (e) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;
      const contained =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      pendingRef.current = { x, y, normX, normY, active: true, contained };
      scheduleFlush();
    };

    const handlePointerOut = (e) => {
      if (e.relatedTarget !== null) return;
      pendingRef.current = { x: 0, y: 0, normX: 0, normY: 0, active: false, contained: false };
      scheduleFlush();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef]);
}