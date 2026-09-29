import { useEffect, useMemo, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import useMousePosition from "../../hooks/useMousePosition";

/**
 * AmbientBackground
 * ------------------
 * MINDO's global ambient environment.
 *
 * Visually identical to the previous version. The animation
 * architecture is unchanged: scroll is a TIMELINE across six states
 *
 *   CALM -> AWAKEN -> CONNECT -> INTELLIGENCE -> RELEASE -> SETTLED
 *
 * with exactly two adjacent states active at any moment, weights
 * summing to 1. State anchors are measured from [data-mindo-phase].
 *
 * WHAT CHANGED - RENDERING COST
 * -----------------------------
 * 1. No CSS custom properties are written during the loop. Writing a
 *    custom property on the root invalidated style for every
 *    descendant and forced dozens of multi-var calc() expressions to
 *    re-resolve each frame. All animated values are now written
 *    straight to ~13 element styles, so nothing cascades.
 *
 * 2. Each parallax layer is its own <svg> / <div> and is transformed
 *    as a whole element. The browser rasterises each layer once and
 *    then only composites it, so scrolling repaints nothing except
 *    the constellation layer, which is the only thing whose contents
 *    genuinely change.
 *
 * 3. Blurred layers (atmospheric fields, presence) translate and fade
 *    but never scale. Changing scale on a blurred layer forces the
 *    filter to re-run instead of reusing the cached texture.
 *
 * 4. The presence glow no longer animates left/top. Those are layout
 *    properties; it now uses a transform off a fixed base position.
 *
 * 5. Ring rotation is a composited CSS rotation on wrapper divs, so
 *    the idle state costs nothing at all.
 *
 * 6. Adaptive quality. A frame-time average drops tier-2 edges and
 *    signal pulses when the browser falls behind, and restores them
 *    when it recovers. A separate gate — time since the last real
 *    scroll input, not the size of any single frame's delta — skips
 *    pulse math and the idle drift wobble while actively scrolling,
 *    whether that's one big mouse-wheel jump or a multi-second
 *    trackpad glide made of many small deltas.
 *
 * 7. Math.hypot -> sqrt, toFixed -> integer rounding, and the loop
 *    pauses on document.hidden.
 *
 * PRESERVED
 * ---------
 * bkg.png, the cursor-following light, reduced-motion support, the
 * fixed / pointer-events-none / transparent global architecture, and
 * the existing MINDO palette and opacity range.
 */

/* =====================================================================
   PALETTE
   ===================================================================== */

const VIOLET = "#5B4FCF";
const LAVENDER = "#8B7FE8";
const MIST = "#B8AEF2";

/* =====================================================================
   SCENE GEOMETRY
   ===================================================================== */

const VB_W = 1440;
const VB_H = 900;

/** Where the hero's 3D brain lives. Rings are anchored here. */
const BRAIN = { x: 1075, y: 330 };

const CENTRE = { x: 720, y: 450 };

const FORMED = [
  [1075, 215],
  [990, 300],
  [1160, 300],
  [1020, 400],
  [1130, 400],
  [1075, 470],

  [120, 700],
  [285, 660],
  [450, 690],
  [620, 745],
  [790, 760],
  [960, 720],
  [1140, 660],
  [1320, 690],

  [170, 150],
  [330, 120],
  [250, 250],
  [410, 225],
  [155, 330],
  [335, 360],
  [480, 330],
  [520, 470],
];

const MOBILE_NODE_COUNT = 14;

const EDGE_TIERS = [
  [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
  ],
  [
    [14, 15],
    [14, 16],
    [15, 17],
    [16, 19],
    [17, 19],
    [16, 18],
    [19, 20],
    [17, 20],
    [20, 21],
    [18, 6],
  ],
  [
    [1, 2],
    [3, 4],
    [5, 11],
    [21, 9],
    [20, 0],
    [13, 2],
    [12, 4],
    [21, 19],
    [15, 0],
  ],
];

const CHANNELS = [
  { path: [6, 7, 8, 9, 10, 11, 12, 13], speed: 0.85, offset: 0.0 },
  { path: [0, 1, 3, 5], speed: 1.25, offset: 0.35 },
  { path: [14, 16, 19, 20, 21], speed: 1.0, offset: 0.62 },
  { path: [2, 4, 5, 11], speed: 1.1, offset: 0.18 },
];

const MOBILE_CHANNELS = [0, 1];

const PHASE_NAMES = [
  "calm",
  "awaken",
  "connect",
  "intelligence",
  "release",
  "settled",
];

const DEFAULT_ANCHORS = [0.02, 0.18, 0.36, 0.53, 0.71, 0.89];

/* =====================================================================
   MATH
   ===================================================================== */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

const mix = (a, b, t) => a + (b - a) * t;

const dist = (ax, ay, bx, by) => {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
};

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function makeRng(seed) {
  let s = seed >>> 0;

  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildPositionSets() {
  const rng = makeRng(20260916);

  const scattered = [];
  const dispersed = [];
  const phases = [];

  for (let i = 0; i < FORMED.length; i += 1) {
    const [fx, fy] = FORMED[i];

    scattered.push([
      clamp(fx + (rng() - 0.5) * 430, -90, VB_W + 90),
      clamp(fy + (rng() - 0.5) * 320, -70, VB_H + 70),
    ]);

    dispersed.push([
      CENTRE.x + (fx - CENTRE.x) * 1.42 + (rng() - 0.5) * 110,
      CENTRE.y + (fy - CENTRE.y) * 1.3 + (rng() - 0.5) * 90,
    ]);

    phases.push(rng() * Math.PI * 2);
  }

  return { scattered, dispersed, phases };
}

/* =====================================================================
   STATE WEIGHTS
   ===================================================================== */

function phaseWeights(p, anchors, out) {
  for (let i = 0; i < 6; i += 1) out[i] = 0;

  if (p <= anchors[0]) {
    out[0] = 1;
    return out;
  }

  if (p >= anchors[5]) {
    out[5] = 1;
    return out;
  }

  for (let i = 0; i < 5; i += 1) {
    if (p >= anchors[i] && p <= anchors[i + 1]) {
      const span = Math.max(anchors[i + 1] - anchors[i], 0.0001);
      const t = smoothstep(0, 1, (p - anchors[i]) / span);

      out[i] = 1 - t;
      out[i + 1] = t;

      return out;
    }
  }

  out[5] = 1;
  return out;
}

function measureAnchors() {
  if (typeof document === "undefined") return DEFAULT_ANCHORS.slice();

  const anchors = DEFAULT_ANCHORS.slice();

  const doc = document.documentElement;
  const vh = window.innerHeight || 1;
  const scrollable = Math.max(doc.scrollHeight - vh, 1);

  document.querySelectorAll("[data-mindo-phase]").forEach((el) => {
    const slot = PHASE_NAMES.indexOf(el.getAttribute("data-mindo-phase"));

    if (slot === -1) return;

    const rect = el.getBoundingClientRect();
    const centre = rect.top + window.scrollY + rect.height / 2 - vh / 2;

    anchors[slot] = clamp(centre / scrollable, 0, 1);
  });

  for (let i = 1; i < anchors.length; i += 1) {
    if (anchors[i] <= anchors[i - 1]) {
      anchors[i] = Math.min(anchors[i - 1] + 0.04, 1);
    }
  }

  return anchors;
}

/**
 * Screen-space position of the brain under preserveAspectRatio slice.
 * Used once per resize to place the ring rotation origin, never in
 * the animation loop.
 */
function brainOriginPercent() {
  if (typeof window === "undefined") return "74.65% 36.67%";

  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;

  const scale = Math.max(vw / VB_W, vh / VB_H);

  const x = (vw - VB_W * scale) / 2 + BRAIN.x * scale;
  const y = (vh - VB_H * scale) / 2 + BRAIN.y * scale;

  return `${((x / vw) * 100).toFixed(2)}% ${((y / vh) * 100).toFixed(2)}%`;
}

/**
 * Replicates preserveAspectRatio="xMidYMid slice" for a canvas: given
 * the canvas's CSS size, returns the scale + offset that maps scene
 * space (0..VB_W, 0..VB_H) onto it the same way the old <svg viewBox>
 * did. Computed once per resize, applied via ctx.setTransform, never
 * recomputed in the draw loop.
 */
function coverTransform(cssWidth, cssHeight) {
  const scale = Math.max(cssWidth / VB_W, cssHeight / VB_H) || 1;

  return {
    scale,
    offsetX: (cssWidth - VB_W * scale) / 2,
    offsetY: (cssHeight - VB_H * scale) / 2,
  };
}

/**
 * Pre-renders the node "halo" radial gradient once to an offscreen
 * canvas. Nodes then drawImage() this sprite instead of each resolving
 * an SVG radialGradient fill every frame (22 resolves/frame -> 0).
 * Rendered at a fixed device-pixel size so it stays crisp regardless
 * of the current scene-space transform.
 */
function buildHaloSprite() {
  if (typeof document === "undefined") return null;

  const SIZE = 128;
  const sprite = document.createElement("canvas");
  sprite.width = SIZE;
  sprite.height = SIZE;

  const ctx = sprite.getContext("2d");
  const r = SIZE / 2;

  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, "rgba(184, 174, 242, 0.55)"); // MIST
  gradient.addColorStop(0.55, "rgba(139, 127, 232, 0.16)"); // LAVENDER
  gradient.addColorStop(1, "rgba(139, 127, 232, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  return sprite;
}

/* =====================================================================
   COMPONENT
   ===================================================================== */

export default function AmbientBackground() {
  const layerRef = useRef(null);

  const lightRef = useRef(null);

  /* One ref per composited layer. These are the only elements the
     loop touches directly. */
  const artRef = useRef(null);
  const veilRef = useRef(null);
  const fieldARef = useRef(null);
  const fieldBRef = useRef(null);
  const orbitsRef = useRef(null);
  const ringRefs = useRef([]);
  const swooshRef = useRef(null);
  const netRef = useRef(null);
  const wavesRef = useRef(null);
  const leafRef = useRef(null);
  const presenceRef = useRef(null);

  /* The constellation is drawn on a single canvas instead of ~50+
     individually-updated SVG elements. These refs replace the old
     per-element ref arrays. */
  const netCtxRef = useRef(null);
  const haloSpriteRef = useRef(null);

  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 768px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onCompact = (e) => setIsCompact(e.matches);
    const onMotion = (e) => setReducedMotion(e.matches);

    compact.addEventListener("change", onCompact);
    motion.addEventListener("change", onMotion);

    return () => {
      compact.removeEventListener("change", onCompact);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  /* ------------------------------------------------------------------
     SCENE DEFINITION
     ------------------------------------------------------------------ */

  const scene = useMemo(() => {
    const { scattered, dispersed, phases } = buildPositionSets();

    const nodeCount = isCompact ? MOBILE_NODE_COUNT : FORMED.length;

    const tiers = EDGE_TIERS.map((tier) =>
      tier.filter(([a, b]) => a < nodeCount && b < nodeCount)
    );

    const channels = (isCompact
      ? MOBILE_CHANNELS.map((i) => CHANNELS[i])
      : CHANNELS
    ).filter((c) => c.path.every((i) => i < nodeCount));

    return { nodeCount, scattered, dispersed, phases, tiers, channels };
  }, [isCompact]);

  /* ------------------------------------------------------------------
     SCROLL SOURCE
     ------------------------------------------------------------------ */

  const { scrollYProgress } = useScroll();

  const driver = useRef({
    target: 0,
    current: 0,
    anchors: DEFAULT_ANCHORS.slice(),
    t: 0,
    pulses: [],
    vw: 1440,
    vh: 900,
    lastInputTime: 0,
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    driver.current.target = clamp(v);
    driver.current.lastInputTime = performance.now();
  });

  /* ------------------------------------------------------------------
     MEASUREMENT - resize only, never per frame
     ------------------------------------------------------------------ */

  useEffect(() => {
    let frame = 0;

    /* Sized both synchronously on mount and on every resize, so the
       canvas never renders a first frame at the default 300x150
       buffer size before this runs. */
    const sizeCanvas = () => {
      const canvas = netRef.current;
      if (!canvas) return;

      if (!netCtxRef.current) {
        netCtxRef.current = canvas.getContext("2d");
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || window.innerWidth || 1;
      const cssH = canvas.clientHeight || window.innerHeight || 1;

      const pxW = Math.round(cssW * dpr);
      const pxH = Math.round(cssH * dpr);

      /* Resizing the backing buffer clears it and resets the
         transform, so only touch it when the size actually changed. */
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
      }

      const { scale, offsetX, offsetY } = coverTransform(cssW, cssH);

      if (netCtxRef.current) {
        netCtxRef.current.setTransform(
          scale * dpr,
          0,
          0,
          scale * dpr,
          offsetX * dpr,
          offsetY * dpr
        );
      }
    };

    const remeasure = () => {
      cancelAnimationFrame(frame);
      sizeCanvas();

      frame = requestAnimationFrame(() => {
        driver.current.anchors = measureAnchors();
        driver.current.vw = window.innerWidth || 1;
        driver.current.vh = window.innerHeight || 1;

        sizeCanvas();

        const origin = brainOriginPercent();

        if (orbitsRef.current) {
          orbitsRef.current.style.transformOrigin = origin;
        }

        ringRefs.current.forEach((el) => {
          if (el) el.style.transformOrigin = origin;
        });
      });
    };

    sizeCanvas();
    remeasure();

    window.addEventListener("resize", remeasure);

    let observer = null;

    if (typeof ResizeObserver !== "undefined" && document.body) {
      observer = new ResizeObserver(remeasure);
      observer.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", remeasure);
      if (observer) observer.disconnect();
    };
  }, [isCompact]);

  /* ------------------------------------------------------------------
     THE LOOP
     ------------------------------------------------------------------ */

  useEffect(() => {
    const { nodeCount, scattered, dispersed, phases, tiers, channels } = scene;

    const px = new Float32Array(nodeCount);
    const py = new Float32Array(nodeCount);
    const boost = new Float32Array(nodeCount);
    const weights = new Array(6).fill(0);

    /* Last-written values for the ring elements, so writes that would
       change nothing are skipped. (The constellation no longer needs
       this: it's one canvas redraw rather than per-element writes.) */
    const lastRing = [-1, -1, -1, -1];

    driver.current.pulses = channels.map((c) => c.offset);

    /* ---------------- static pose for reduced motion ---------------- */

    if (!haloSpriteRef.current) {
      haloSpriteRef.current = buildHaloSprite();
    }

    if (reducedMotion) {
      const canvas = netRef.current;
      const ctx = netCtxRef.current;

      if (canvas && ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        const tierColors = [LAVENDER, LAVENDER, VIOLET];
        const tierOps = [0.2, 0.14, 0.07];

        for (let ti = 0; ti < tiers.length; ti += 1) {
          const tier = tiers[ti];
          if (!tier.length) continue;

          ctx.beginPath();

          for (let e = 0; e < tier.length; e += 1) {
            const a = tier[e][0];
            const b = tier[e][1];

            ctx.moveTo(FORMED[a][0], FORMED[a][1]);
            ctx.lineTo(FORMED[b][0], FORMED[b][1]);
          }

          ctx.strokeStyle = tierColors[ti];
          ctx.lineWidth = 1;
          ctx.lineCap = "round";
          ctx.globalAlpha = tierOps[ti];
          ctx.stroke();
        }

        const sprite = haloSpriteRef.current;

        for (let i = 0; i < nodeCount; i += 1) {
          const [nx, ny] = FORMED[i];

          if (sprite) {
            ctx.globalAlpha = 0.38;
            ctx.drawImage(sprite, nx - 16, ny - 16, 32, 32);
          }

          ctx.globalAlpha = 0.38 * 0.3;
          ctx.fillStyle = MIST;
          ctx.beginPath();
          ctx.arc(nx, ny, 3.1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      ringRefs.current.forEach((el, i) => {
        if (el) el.style.opacity = i === 0 ? "0.09" : i === 1 ? "0.12" : "0.05";
      });

      return undefined;
    }

    /* ---------------------------- live ------------------------------ */

    let raf = 0;
    let last = performance.now();

    /* Adaptive quality. Falls back when the browser cannot keep up,
       restores itself when it recovers. */
    let frameEMA = 16;
    let lite = false;
    let idleFrames = 0;

    /* While actively scrolling, the canvas repaint — the one
       genuinely expensive operation left — runs every other frame
       instead of every rAF tick, the same way idle frames are
       already throttled below. */
    let netFrameToggle = false;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);

      if (document.hidden) {
        last = now;
        return;
      }

      const rawDt = now - last;
      last = now;

      const dt = Math.min(rawDt / 1000, 0.05);

      frameEMA = frameEMA * 0.9 + rawDt * 0.1;

      if (!lite && frameEMA > 21) lite = true;
      else if (lite && frameEMA < 13.5) lite = false;

      const d = driver.current;

      const gap = d.target - d.current;
      const absGap = gap < 0 ? -gap : gap;

      /* Catch up harder when a long way behind, so a scrollbar drag
         resolves in a few frames instead of a long expensive tail. */
      const stiffness = absGap > 0.15 ? 13 : 7.5;

      d.current += gap * (1 - Math.exp(-dt * stiffness));
      d.t += dt;

      /* True whenever a scroll input has arrived recently — a mouse
         wheel notch and a multi-second trackpad glide both count.
         Per-frame delta size used to gate this instead, but a
         trackpad's continuous stream of small deltas rarely crossed
         that per-frame threshold even while scrolling for seconds,
         so the reduced-detail path never engaged for it. Time since
         the last real input treats both input types the same. */
      const scrolling = now - d.lastInputTime < 150;

      if (absGap < 0.0004) idleFrames += 1;
      else idleFrames = 0;

      /* With nothing scrolling, node breathing does not need 60fps.
         Halving it halves the only layer that still repaints. */
      if (idleFrames > 8 && (idleFrames & 1) === 1) return;

      const p = d.current;

      phaseWeights(p, d.anchors, weights);

      const wAwaken = weights[1];
      const wConnect = weights[2];
      const wIntel = weights[3];
      const wRelease = weights[4];
      const wSettled = weights[5];

      const energy =
        wAwaken * 0.35 +
        wConnect * 0.7 +
        wIntel * 1 +
        wRelease * 0.35 +
        wSettled * 0.12;

      const coherence = clamp(
        wAwaken * 0.28 +
        wConnect * 0.9 +
        wIntel * 1 +
        wRelease * 0.45 +
        wSettled * 0.3
      );

      const dispersion = clamp(wRelease * 0.85 + wSettled * 0.55);

      const flow = clamp(
        wAwaken * 0.35 + wConnect * 0.7 + wIntel * 1 + wRelease * 0.28
      );

      const breath = 4 + energy * 11;

      /* ================= node positions ================= */

      let sumX = 0;
      let sumY = 0;
      let sumW = 0;

      const drift = breath * (1 - coherence * 0.6);
      const tSlow = d.t * 0.28;
      const tSlower = d.t * 0.22;
      const w = 0.25 + coherence * 0.75;

      for (let i = 0; i < nodeCount; i += 1) {
        const f = FORMED[i];
        const s = scattered[i];
        const dsp = dispersed[i];

        const ax = mix(s[0], f[0], coherence);
        const ay = mix(s[1], f[1], coherence);

        const ph = phases[i];

        let x = mix(ax, dsp[0], dispersion);
        let y = mix(ay, dsp[1], dispersion);

        /* The idle wobble is decorative, not something scroll
           position needs — skip it while a scroll input is active
           so the loop doesn't spend time on 22 sin + 22 cos calls a
           frame during exactly the window the frame budget is
           tightest. */
        if (!scrolling) {
          x += Math.sin(tSlow + ph) * drift;
          y += Math.cos(tSlower + ph * 1.3) * drift * 0.8;
        }

        px[i] = x;
        py[i] = y;
        boost[i] = 0;

        sumX += x * w;
        sumY += y * w;
        sumW += w;
      }

      /* ================= constellation canvas ================= */

      netFrameToggle = !netFrameToggle;

      /* The heavy part — clearing and redrawing the canvas — is
         skipped on alternating frames while a scroll input is live.
         Everything above (positions, the presence centroid) still
         runs every frame; only the repaint itself is capped. */
      const shouldDrawNet = !scrolling || netFrameToggle;

      const pulsesOn = !lite && !scrolling && flow > 0.02;

      if (pulsesOn) {
        for (let c = 0; c < channels.length; c += 1) {
          const chan = channels[c];
          const idx = chan.path;

          d.pulses[c] =
            (d.pulses[c] + dt * (0.018 + flow * 0.085) * chan.speed) % 1;
        }
      }

      if (shouldDrawNet) {
        const canvas = netRef.current;
        const ctx = netCtxRef.current;

        if (canvas && ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          /* ---- edges (tiers) — drawn first, underneath nodes ---- */

          const tierOpacity = [
            0.03 + coherence * 0.26,
            smoothstep(0.34, 0.95, coherence) * 0.21,
            lite || scrolling ? 0 : (wIntel * 0.95 + wConnect * 0.12) * 0.15,
          ];

          const tierColors = [LAVENDER, LAVENDER, VIOLET];

          for (let ti = 0; ti < tiers.length; ti += 1) {
            const op = tierOpacity[ti];
            if (op < 0.004) continue;

            const tier = tiers[ti];
            if (!tier.length) continue;

            ctx.beginPath();

            for (let e = 0; e < tier.length; e += 1) {
              const a = tier[e][0];
              const b = tier[e][1];

              ctx.moveTo(px[a], py[a]);
              ctx.lineTo(px[b], py[b]);
            }

            ctx.strokeStyle = tierColors[ti];
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.globalAlpha = op;
            ctx.stroke();
          }

          /* ---- signal pulses: dashed channel lines only here.
             Heads are collected and drawn after nodes, below, to
             match the original DOM order (heads painted topmost). */

          const heads = pulsesOn ? [] : null;

          if (pulsesOn) {
            ctx.lineCap = "round";
            ctx.strokeStyle = MIST;
            ctx.lineWidth = 1.6;

            for (let c = 0; c < channels.length; c += 1) {
              const chan = channels[c];
              const idx = chan.path;
              const t = d.pulses[c];

              let total = 0;

              for (let s = 1; s < idx.length; s += 1) {
                total += dist(px[idx[s - 1]], py[idx[s - 1]], px[idx[s]], py[idx[s]]);
              }

              const pulseLen = 24 + flow * 26;

              ctx.beginPath();
              ctx.moveTo(px[idx[0]], py[idx[0]]);

              for (let s = 1; s < idx.length; s += 1) {
                ctx.lineTo(px[idx[s]], py[idx[s]]);
              }

              ctx.setLineDash([pulseLen, total + pulseLen]);
              ctx.lineDashOffset = pulseLen - t * (total + pulseLen);
              ctx.globalAlpha = flow * 0.5;
              ctx.stroke();

              let travelled = t * total;
              let hx = px[idx[0]];
              let hy = py[idx[0]];

              for (let s = 1; s < idx.length; s += 1) {
                const a = idx[s - 1];
                const b = idx[s];

                const segLen = dist(px[a], py[a], px[b], py[b]) || 1;

                if (travelled <= segLen) {
                  const k = travelled / segLen;
                  hx = mix(px[a], px[b], k);
                  hy = mix(py[a], py[b], k);
                  break;
                }

                travelled -= segLen;
                hx = px[b];
                hy = py[b];
              }

              heads.push(hx, hy);

              /* A pulse passing a node lights that node up. */
              for (let i = 0; i < nodeCount; i += 1) {
                const dd = dist(px[i], py[i], hx, hy);

                if (dd < 110) {
                  const b = (1 - dd / 110) * flow;
                  if (b > boost[i]) boost[i] = b;
                }
              }
            }

            ctx.setLineDash([]);
          }

          /* ---- nodes — halo sprite, then core, on top of pulse lines ---- */

          const nodeBase = 0.16 + wAwaken * 0.3 + coherence * 0.3;
          const sprite = haloSpriteRef.current;

          for (let i = 0; i < nodeCount; i += 1) {
            const scale = 0.62 + coherence * 0.4 + boost[i] * 0.55;
            const op = clamp(nodeBase + boost[i] * 0.45, 0, 0.92);

            if (op > 0.004 && sprite) {
              const haloSize = 32 * scale;

              ctx.globalAlpha = op;
              ctx.drawImage(
                sprite,
                px[i] - haloSize / 2,
                py[i] - haloSize / 2,
                haloSize,
                haloSize
              );
            }

            const co = 0.3 + boost[i] * 0.7;
            const coreAlpha = op * co;

            if (coreAlpha > 0.004) {
              ctx.globalAlpha = coreAlpha;
              ctx.fillStyle = MIST;
              ctx.beginPath();
              ctx.arc(px[i], py[i], 3.1 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          /* ---- pulse heads — topmost layer ---- */

          if (heads && heads.length) {
            const headR = 2 + flow * 1.6;

            ctx.globalAlpha = flow * 0.9;
            ctx.fillStyle = "#FFFFFF";

            for (let h = 0; h < heads.length; h += 2) {
              ctx.beginPath();
              ctx.arc(heads[h], heads[h + 1], headR, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1;
        }
      }

      /* ================= layers =================
         Direct style writes. No custom properties, so none of this
         invalidates anything below it in the tree. */

      if (artRef.current) {
        artRef.current.style.transform =
          `translate3d(${(p * 18).toFixed(1)}px, ${(p * -44).toFixed(1)}px, 0) ` +
          `scale(${(1.04 + p * 0.055).toFixed(4)})`;
      }

      if (veilRef.current) {
        veilRef.current.style.opacity =
          wConnect * 0.5 + wIntel * 1 + wRelease * 0.25;
      }

      if (fieldARef.current) {
        /* Translate and fade only. Scaling a blurred layer forces the
           filter to re-run instead of compositing a cached texture. */
        fieldARef.current.style.transform =
          `translate3d(${(p * 150).toFixed(1)}px, ${(p * -90).toFixed(1)}px, 0)`;
        fieldARef.current.style.opacity = 0.4 + wAwaken * 0.3 + wRelease * 0.35;
      }

      if (fieldBRef.current) {
        fieldBRef.current.style.transform =
          `translate3d(${(p * -120).toFixed(1)}px, ${(p * -150).toFixed(1)}px, 0)`;
        fieldBRef.current.style.opacity = 0.25 + wConnect * 0.3 + wIntel * 0.45;
      }

      if (orbitsRef.current) {
        const ringScale =
          1 - wConnect * 0.06 - wIntel * 0.1 + wRelease * 0.16 + wSettled * 0.1;

        orbitsRef.current.style.transform =
          `translate3d(${(p * -46).toFixed(1)}px, ${(p * 62).toFixed(1)}px, 0) ` +
          `scale(${ringScale.toFixed(4)})`;
      }

      const ringOps = [
        0.05 + wAwaken * 0.05 + wConnect * 0.07 + wIntel * 0.08 - wSettled * 0.02,
        wAwaken * 0.1 + wConnect * 0.14 + wIntel * 0.16 + wRelease * 0.06,
        wConnect * 0.04 + wIntel * 0.09 + wRelease * 0.03,
        0.035 + wSettled * 0.02,
      ];

      for (let i = 0; i < ringOps.length; i += 1) {
        const el = ringRefs.current[i];
        if (!el) continue;

        const op = clamp(ringOps[i], 0, 1);

        if (Math.abs(op - lastRing[i]) > 0.004) {
          el.style.opacity = op;
          lastRing[i] = op;
        }
      }

      if (swooshRef.current) {
        swooshRef.current.style.transform =
          `translate3d(${(p * -58).toFixed(1)}px, ${(p * 96).toFixed(1)}px, 0)`;
        swooshRef.current.style.opacity = 1 - p * 0.35;
      }

      if (netRef.current) {
        netRef.current.style.transform =
          `translate3d(${(p * -34).toFixed(1)}px, ${(p * -86).toFixed(1)}px, 0) ` +
          `scale(${(1 + wIntel * 0.05 + dispersion * 0.06).toFixed(4)})`;
      }

      if (wavesRef.current) {
        const wx = isCompact ? p * -80 : p * -168;
        const wy = isCompact ? p * -48 : p * -74;

        wavesRef.current.style.transform =
          `translate3d(${wx.toFixed(1)}px, ${wy.toFixed(1)}px, 0) ` +
          `scale(${(1 + p * 0.09).toFixed(4)})`;
        wavesRef.current.style.opacity = 0.75 + wRelease * 0.25 + wSettled * 0.2;
      }

      if (leafRef.current) {
        leafRef.current.style.transform =
          `translate3d(${(p * 96).toFixed(1)}px, ${(p * -210).toFixed(1)}px, 0) ` +
          `rotate(${(p * -9).toFixed(2)}deg)`;
        leafRef.current.style.opacity = clamp(1 - p * 0.75, 0, 1);
      }

      if (presenceRef.current) {
        const cx = sumW ? sumX / sumW : BRAIN.x;
        const cy = sumW ? sumY / sumW : BRAIN.y;

        const gx = mix(BRAIN.x, cx, 0.55 + energy * 0.35);
        const gy = mix(BRAIN.y, cy, 0.45 + energy * 0.35);

        /* Transform off a centred base. Never left/top: those run
           layout, and this element carries a 45px blur. */
        const dx = (gx / VB_W - 0.5) * d.vw;
        const dy = (gy / VB_H - 0.5) * d.vh;

        presenceRef.current.style.transform =
          `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        presenceRef.current.style.opacity = clamp(
          0.6 + wAwaken * 0.2 + wIntel * 0.3 - wSettled * 0.15,
          0,
          1
        );
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [scene, reducedMotion, isCompact]);

  /* ------------------------------------------------------------------
     CURSOR LIGHT - unchanged, still independent of scroll
     ------------------------------------------------------------------ */

  useMousePosition(layerRef, ({ x, y, active }) => {
    const el = lightRef.current;

    if (!el) return;

    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    el.style.opacity = active ? "1" : "0";
  });

  /* ------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------ */

  const viewBox = `0 0 ${VB_W} ${VB_H}`;

  return (
    <div
      ref={layerRef}
      className="mindo-ambient pointer-events-none fixed inset-0 z-0 overflow-hidden bg-mesh"
      aria-hidden="true"
    >
      {/* =========================================================
          BRAND ARTWORK - deepest layer, slowest parallax
          ========================================================= */}

      <div ref={artRef} className="mindo-art absolute inset-[-4%]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bkg.png')",
            opacity: 0.45,
          }}
        />
      </div>

      <div ref={veilRef} className="mindo-veil absolute inset-0" />

      {/* =========================================================
          ATMOSPHERIC FIELDS
          ========================================================= */}

      <div
        ref={fieldARef}
        className="mindo-field mindo-field-a absolute rounded-full"
      />

      {!isCompact && (
        <div
          ref={fieldBRef}
          className="mindo-field mindo-field-b absolute rounded-full"
        />
      )}

      {/* =========================================================
          ORBITAL SYSTEM

          Each ring is its own layer, so its rotation is composited
          rather than repainted. An idle page therefore costs nothing
          while the rings keep turning.
          ========================================================= */}

      <div ref={orbitsRef} className="mindo-orbits absolute inset-0">
        <div
          ref={(el) => (ringRefs.current[0] = el)}
          className="mindo-ring-layer mindo-spin-a absolute inset-0"
        >
          <svg
            className="mindo-svg-static"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid slice"
          >
            <ellipse
              cx={BRAIN.x}
              cy={BRAIN.y}
              rx="330"
              ry="318"
              fill="none"
              stroke={LAVENDER}
              strokeWidth="1"
            />
          </svg>
        </div>

        <div
          ref={(el) => (ringRefs.current[1] = el)}
          className="mindo-ring-layer mindo-spin-b absolute inset-0"
        >
          <svg
            className="mindo-svg-static"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid slice"
          >
            <ellipse
              cx={BRAIN.x}
              cy={BRAIN.y}
              rx="452"
              ry="398"
              fill="none"
              stroke={LAVENDER}
              strokeWidth="1"
              strokeDasharray="2 26"
            />
          </svg>
        </div>

        {!isCompact && (
          <div
            ref={(el) => (ringRefs.current[2] = el)}
            className="mindo-ring-layer mindo-spin-c absolute inset-0"
          >
            <svg
              className="mindo-svg-static"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid slice"
            >
              <ellipse
                cx={BRAIN.x}
                cy={BRAIN.y}
                rx="586"
                ry="520"
                fill="none"
                stroke={VIOLET}
                strokeWidth="1"
              />
            </svg>
          </div>
        )}

        {/* The original far ring, retained as horizon. Static. */}
        <div
          ref={(el) => (ringRefs.current[3] = el)}
          className="mindo-ring-layer absolute inset-0"
        >
          <svg
            className="mindo-svg-static"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid slice"
          >
            <circle
              cx="760"
              cy="420"
              r="760"
              fill="none"
              stroke={LAVENDER}
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
          PROFILE / HAIR SWOOSHES
          ========================================================= */}

      <svg
        ref={swooshRef}
        className="mindo-svg mindo-swoosh"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M 660,40 C 900,-10 1140,30 1340,190"
          fill="none"
          stroke={VIOLET}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.07"
        />

        <path
          d="M 980,10 C 1220,60 1400,270 1380,520 C 1362,750 1160,870 950,880"
          fill="none"
          stroke={LAVENDER}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.055"
        />
      </svg>

      {/* =========================================================
          THE CONSTELLATION

          The only layer whose contents change, and therefore the
          only layer that repaints while scrolling. No filters live
          inside it, deliberately.
          ========================================================= */}

      <canvas ref={netRef} className="mindo-svg mindo-net" />

      {/* =========================================================
          LOWER WAVES
          ========================================================= */}

      <svg
        ref={wavesRef}
        className="mindo-svg mindo-waves"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -120 690 C 100 610 250 650 420 730 S 720 850 920 760 S 1240 620 1560 730"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.12"
        />

        <path
          d="M -140 730 C 120 650 270 700 450 770 S 760 850 960 790 S 1260 660 1580 760"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity="0.08"
        />

        <path
          d="M -120 780 C 140 700 320 750 500 810 S 780 880 1010 820 S 1300 720 1560 800"
          fill="none"
          stroke={LAVENDER}
          strokeWidth="1"
          opacity="0.08"
        />
      </svg>

      {/* =========================================================
          LEAF - foreground. The blur rasterises once and the layer
          is only composited afterwards.
          ========================================================= */}

      <svg
        ref={leafRef}
        className="mindo-svg mindo-leaf"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        {!isCompact && (
          <defs>
            <filter
              id="mindo-soft-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
        )}

        <g
          transform="translate(90,760) rotate(-18)"
          filter={isCompact ? undefined : "url(#mindo-soft-blur)"}
        >
          <path
            d="M 0,120 C 10,60 40,10 100,0 C 90,50 100,100 130,140 C 80,150 30,150 0,120 Z"
            fill={MIST}
            opacity="0.14"
          />

          <path
            d="M 8,112 C 40,80 70,50 96,10"
            fill="none"
            stroke={VIOLET}
            strokeWidth="1.5"
            opacity="0.16"
          />
        </g>
      </svg>

      {/* =========================================================
          MINDO PRESENCE - tracks the constellation's centroid
          ========================================================= */}

      <div ref={presenceRef} className="mindo-presence absolute rounded-full" />

      {/* =========================================================
          CURSOR LIGHT
          ========================================================= */}

      <div
        ref={lightRef}
        className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full opacity-0 transition-opacity duration-700 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(139,127,232,0.16) 0%, rgba(139,127,232,0.06) 45%, transparent 70%)",
          filter: "blur(40px)",
          willChange: "transform, opacity",
        }}
      />

      {/* =========================================================
          STATIC LAYER STYLES

          Nothing here is animated by the loop. Every rule below is
          resolved once. All motion arrives as a direct style write
          on an already-promoted layer.
          ========================================================= */}

      <style>{`
        .mindo-ambient {
          contain: layout paint style;
        }

        .mindo-svg,
        .mindo-svg-static {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
        }

        .mindo-svg {
          will-change: transform;
          transform: translateZ(0);
        }

        /* ---------------------------------------------------------
           DEEPEST LAYER - brand artwork
           --------------------------------------------------------- */

        .mindo-art {
          will-change: transform;
          transform: translateZ(0) scale(1.04);
        }

        .mindo-veil {
          background:
            radial-gradient(
              120% 90% at 78% 22%,
              rgba(91, 79, 207, 0.10) 0%,
              rgba(91, 79, 207, 0) 62%
            );
          opacity: 0;
          will-change: opacity;
        }

        /* ---------------------------------------------------------
           ATMOSPHERIC FIELDS
           Blur is baked once. These only translate and fade, so the
           filter never re-runs.
           --------------------------------------------------------- */

        .mindo-field {
          filter: blur(60px);
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        .mindo-field-a {
          left: -12%;
          top: 28%;
          width: 62vmax;
          height: 52vmax;
          background: radial-gradient(
            circle,
            rgba(184, 174, 242, 0.20) 0%,
            rgba(184, 174, 242, 0.07) 42%,
            transparent 70%
          );
          opacity: 0.4;
        }

        .mindo-field-b {
          right: -8%;
          bottom: -14%;
          width: 54vmax;
          height: 50vmax;
          background: radial-gradient(
            circle,
            rgba(91, 79, 207, 0.16) 0%,
            rgba(91, 79, 207, 0.05) 45%,
            transparent 72%
          );
          opacity: 0.25;
        }

        /* ---------------------------------------------------------
           ORBITAL SYSTEM
           Rotation is a composited transform on each wrapper, so the
           rings turn without repainting anything.
           --------------------------------------------------------- */

        .mindo-orbits {
          transform-origin: 74.65% 36.67%;
          will-change: transform;
          transform: translateZ(0);
        }

        .mindo-ring-layer {
          transform-origin: 74.65% 36.67%;
          will-change: transform, opacity;
          opacity: 0;
        }

        .mindo-spin-a { animation: mindo-spin 190s linear infinite; }
        .mindo-spin-b { animation: mindo-spin 260s linear infinite reverse; }
        .mindo-spin-c { animation: mindo-spin 340s linear infinite; }

        @keyframes mindo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ---------------------------------------------------------
           PARALLAX LAYERS
           --------------------------------------------------------- */

        .mindo-swoosh,
        .mindo-waves,
        .mindo-leaf {
          will-change: transform, opacity;
        }

        .mindo-leaf {
          transform-origin: 10% 90%;
        }

        /* ---------------------------------------------------------
           PRESENCE
           Centred base position; the loop only ever translates it.
           --------------------------------------------------------- */

        .mindo-presence {
          left: 50%;
          top: 50%;
          width: 46vmax;
          height: 46vmax;
          margin-left: -23vmax;
          margin-top: -23vmax;
          background: radial-gradient(
            circle,
            rgba(139, 127, 232, 0.18) 0%,
            rgba(139, 127, 232, 0.08) 35%,
            rgba(139, 127, 232, 0.025) 55%,
            transparent 72%
          );
          filter: blur(45px);
          opacity: 0.6;
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        /* ---------------------------------------------------------
           MOBILE - cheaper blurs
           --------------------------------------------------------- */

        @media (max-width: 768px) {
          .mindo-field {
            filter: blur(40px);
          }

          .mindo-presence {
            filter: blur(32px);
            width: 70vmax;
            height: 70vmax;
            margin-left: -35vmax;
            margin-top: -35vmax;
          }
        }

        /* ---------------------------------------------------------
           REDUCED MOTION
           The loop never starts, so nothing needs promoting.
           --------------------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          .mindo-art,
          .mindo-field,
          .mindo-orbits,
          .mindo-ring-layer,
          .mindo-swoosh,
          .mindo-net,
          .mindo-waves,
          .mindo-leaf,
          .mindo-presence,
          .mindo-svg {
            transform: none !important;
            animation: none !important;
            transition: none !important;
            will-change: auto !important;
          }

          .mindo-art {
            transform: scale(1.04) !important;
          }

          .mindo-swoosh,
          .mindo-waves,
          .mindo-leaf {
            opacity: 1 !important;
          }

          .mindo-veil {
            opacity: 0.35 !important;
          }

          .mindo-presence {
            opacity: 0.6 !important;
          }
        }
      `}</style>
    </div>
  );
}