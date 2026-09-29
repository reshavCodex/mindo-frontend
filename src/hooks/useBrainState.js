import { useEffect, useRef, useState } from "react";

/**
 * useBrainState
 * -------------
 * Cycles the "living brain" through a sequence of subtle AI states —
 * idle, listening, processing, calm, ready — and exposes a per-state
 * config object describing how the brain should look/move in that
 * state, plus a human-readable status label and which capability
 * card (if any) should read as active.
 *
 * Design notes:
 *  - Timing is randomized within a range per state (not a fixed
 *    interval) so the cycle doesn't feel mechanical/looped.
 *  - States advance in a natural order (idle → listening → processing
 *    → calm → ready → idle) rather than jumping randomly, which reads
 *    more like real AI activity than a random slot machine.
 *  - Consumers should LERP toward these values frame-by-frame rather
 *    than snapping — that's what makes transitions feel alive.
 *  - Respects prefers-reduced-motion: stays on "idle" and never
 *    advances.
 */

// Capability cards are indexed 0/1/2 = Emotion / Speech / Focus.
// `activeCapability` says which card should read as "currently
// active" while the brain is in a given state — null means none of
// the three should highlight (e.g. the final "ready" beat).
const STATE_CONFIG = {
  idle: {
    statusLabel: "Listening...",
    activeCapability: 1, // Speech
    floatSpeed: 1.2,
    floatIntensity: 0.5,
    rotationSpeed: 0.15,
    emissiveIntensity: 0.25,
    glowScale: 1,
    glowOpacity: 0.55,
    duration: [5000, 7000],
  },
  listening: {
    statusLabel: "Analyzing speech...",
    activeCapability: 1, // Speech
    floatSpeed: 1.6,
    floatIntensity: 0.7,
    rotationSpeed: 0.22,
    emissiveIntensity: 0.38,
    glowScale: 1.08,
    glowOpacity: 0.7,
    duration: [3500, 5000],
  },
  processing: {
    statusLabel: "Detecting emotions...",
    activeCapability: 0, // Emotion
    floatSpeed: 2.0,
    floatIntensity: 0.4,
    rotationSpeed: 0.42,
    emissiveIntensity: 0.5,
    glowScale: 1.12,
    glowOpacity: 0.8,
    duration: [2800, 4200],
  },
  calm: {
    statusLabel: "Building wellness profile...",
    activeCapability: 2, // Focus
    floatSpeed: 0.8,
    floatIntensity: 0.35,
    rotationSpeed: 0.08,
    emissiveIntensity: 0.18,
    glowScale: 0.94,
    glowOpacity: 0.45,
    duration: [4500, 6500],
  },
  ready: {
    statusLabel: "Ready.",
    activeCapability: null,
    floatSpeed: 1.0,
    floatIntensity: 0.4,
    rotationSpeed: 0.12,
    emissiveIntensity: 0.3,
    glowScale: 1.02,
    glowOpacity: 0.6,
    duration: [2200, 3200],
  },
};

function randomInRange([min, max]) {
  return min + Math.random() * (max - min);
}

const NEXT_STATE = {
  idle: "listening",
  listening: "processing",
  processing: "calm",
  calm: "ready",
  ready: "idle",
};

export default function useBrainState() {
  const [state, setState] = useState("idle");
  const timeoutRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const scheduleNext = (currentState) => {
      const { duration } = STATE_CONFIG[currentState];
      timeoutRef.current = setTimeout(() => {
        const next = NEXT_STATE[currentState];
        setState(next);
        scheduleNext(next);
      }, randomInRange(duration));
    };

    scheduleNext(state);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    config: STATE_CONFIG[state],
  };
}