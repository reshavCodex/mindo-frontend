import { useEffect, useRef, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

/**
 * AnimatedStat
 * ------------
 * A numeric value that:
 *   1. Counts up from 0 on mount to its initial value.
 *   2. Occasionally drifts to a nearby randomized value, simulating
 *      a live-updating AI dashboard reading.
 *   3. Briefly glows (soft box-shadow pulse) whenever the value changes,
 *      so updates read as "live data" rather than a glitch.
 *
 * Design notes:
 *  - Uses a Framer Motion motion value + animate() rather than
 *    setInterval + setState, so the count-up itself is interpolated
 *    (eased) frame by frame instead of stepping digit by digit.
 *  - Live updates are intentionally infrequent (6–9s apart, jittered)
 *    and small in magnitude (+/- `driftAmount`) — this should read as
 *    "quietly alive," not "flickering."
 *  - Respects prefers-reduced-motion: still shows the final value
 *    immediately, but skips the count-up tween and the live-update
 *    drift loop entirely.
 *  - `formatValue` lets callers control display (e.g. rounding,
 *    adding a unit inline) without this component needing to know
 *    about units itself.
 *
 * Props:
 *  - value: number — the "true"/base value to count up to and drift around.
 *  - driftAmount: number — max +/- amount a live update can nudge by (default 3).
 *  - formatValue: (n: number) => string | number — display formatter (default Math.round).
 *  - live: boolean — whether to enable the occasional drift updates (default true).
 *  - className: extra classes for the number's wrapper span.
 */
export default function AnimatedStat({
  value,
  driftAmount = 3,
  formatValue = (n) => Math.round(n),
  live = true,
  className = "",
}) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const [pulsing, setPulsing] = useState(false);

  const baseValueRef = useRef(value);
  const timeoutRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const triggerPulse = () => {
    setPulsing(true);
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = setTimeout(() => setPulsing(false), 900);
  };

  // Count up on mount (and whenever the base `value` prop changes).
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    baseValueRef.current = value;

    if (reducedMotionRef.current) {
      motionValue.set(value);
      setDisplay(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
      onComplete: () => triggerPulse(),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Occasional live drift.
  useEffect(() => {
    if (!live || reducedMotionRef.current) return;

    const scheduleDrift = () => {
      const delay = 6000 + Math.random() * 3000;
      timeoutRef.current = setTimeout(() => {
        const nudge = (Math.random() * 2 - 1) * driftAmount;
        const target = Math.max(0, baseValueRef.current + nudge);

        animate(motionValue, target, {
          duration: 0.8,
          ease: "easeInOut",
          onUpdate: (v) => setDisplay(v),
          onComplete: () => triggerPulse(),
        });

        scheduleDrift();
      }, delay);
    };

    scheduleDrift();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [live, driftAmount]);

  return (
    <motion.span
      className={`relative inline-block rounded-md transition-shadow duration-500 ${className}`}
      animate={{
        boxShadow: pulsing
          ? "0 0 0 6px rgba(139,127,232,0.12)"
          : "0 0 0 0 rgba(139,127,232,0)",
      }}
    >
      {formatValue(display)}
    </motion.span>
  );
}