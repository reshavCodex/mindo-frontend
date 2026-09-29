import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

/**
 * MindoOpening
 * ------------
 * One-gesture cinematic opening for the homepage.
 *
 *   OPEN     (progress 0)  giant wordmark centred, background lightly
 *                          blurred, subtle vignette, hero hidden.
 *   SETTLED  (progress 1)  the normal homepage, exactly as before.
 *
 * At the very top of the page, ONE wheel notch / swipe / key press
 * plays the whole transition on its own (~0.7s): the wordmark shrinks
 * onto the navbar brand, the blur and vignette clear, the hero fades
 * in. Scrolling up from the top of the hero snaps back to OPEN.
 * Everywhere else on the page, scrolling is completely normal.
 *
 * Nothing autoplays. The snap only happens when the user asks for it.
 *
 * ENTRANCE (on load)
 * ------------------
 * The site's LoadingScreen announces "mindo:loaded" as it fades out.
 * On that signal the giant wordmark eases in (fade + rise + settle).
 * Input is held until the entrance is mostly done.
 *
 * HERO REVEAL
 * -----------
 * When the wordmark lands on the navbar, the hero's text (staggered)
 * and brain are revealed with a short entrance of their own, using the
 * Web Animations API on the hero's DOM. That layers over the hero's
 * own styles without editing Hero.jsx or the brain.
 *
 * PERFORMANCE
 * -----------
 * `progress` is a Framer Motion motion value driven by animate().
 * All visuals are derived with useTransform and written straight to
 * the DOM: no React state changes and no re-renders while animating.
 * The wordmark only animates transform + opacity. The blur radius is
 * fixed; only its opacity changes, and the layer is display:none once
 * the transition ends.
 */

/* Matches the navbar brand text ("Mindo") so the giant wordmark can
   land exactly on it. Change to "MINDO" for all caps. */
const WORD = "Mindo";

/* Timing of the snap, in seconds. */
const FORWARD_DURATION = 0.7;
const REVERSE_DURATION = 0.6;

/* Starts moving immediately, then settles. */
const EASE = [0.3, 0, 0.1, 1];

/* Fraction of progress over which the wordmark travels. After this it
   sits exactly on the navbar brand while the two cross-fade. */
const TRAVEL_END = 0.86;

/* Progress window in which the navbar's own "Mindo" text takes over
   from the giant wordmark. */
const HANDOFF_START = 0.84;
const HANDOFF_END = 0.96;

/* Approximate cap-height of the display font, as a fraction of its
   font size. Used only to centre the wordmark optically. */
const CAP_HEIGHT = 0.7;

/* Signal from LoadingScreen that the page is ready to be revealed. */
const LOADED_EVENT = "mindo:loaded";
const LOADER_FALLBACK_MS = 6500;

/* Wordmark entrance after loading. */
const ENTRANCE_DURATION = 1.1;
const ENTRANCE_DELAY = 0.1;
const ENTRANCE_EASE = [0.22, 1, 0.36, 1];

/* Progress at which the wordmark has landed and the hero is revealed. */
const REVEAL_AT = 0.86;

/* The navbar brand text the wordmark lands on. */
const NAV_TEXT_SELECTOR = 'header a[href="/"] > span';

/* Input tuning. */
const WHEEL_THRESHOLD = 4; /* px of deltaY that counts as intent */
const TOUCH_THRESHOLD = 32; /* px of swipe that counts as intent */
const FRESH_GESTURE_GAP = 160; /* ms of silence = a new wheel gesture */
const REVERSE_COOLDOWN = 350; /* ms after a snap before reversing */
const RESTORE_GRACE = 700; /* ms after mount for scroll restoration */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

const smooth = (t) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Position of an element inside `root` using offset* properties,
   which ignore CSS transforms. */
function offsetWithin(el, root) {
  let x = 0;
  let y = 0;
  let node = el;

  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }

  return { x, y };
}

function shouldStartSettled() {
  if (typeof window === "undefined") return true;

  /* Arriving mid-page (refresh, back button, or a #section link)
     skips the opening entirely. */
  return window.scrollY > 8 || Boolean(window.location.hash);
}

function isEditable(target) {
  if (!target || !target.tagName) return false;

  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export default function MindoOpening({ children }) {
  const wordRef = useRef(null);

  const startSettled = useRef(null);
  if (startSettled.current === null) {
    startSettled.current = shouldStartSettled();
  }

  const progress = useMotionValue(startSettled.current ? 1 : 0);

  /* Wordmark entrance after the loader (0 = hidden, 1 = shown). */
  const entrance = useMotionValue(startSettled.current ? 1 : 0);

  /* Wrapper visibility for the hero (its children animate themselves). */
  const heroVis = useMotionValue(startSettled.current ? 1 : 0);
  const heroRef = useRef(null);
  const heroFade = useRef(null);
  const revealed = useRef(startSettled.current);
  const revealAnims = useRef([]);

  /* Held until the entrance is mostly done, so a scroll during the
     loader cannot fire the snap. */
  const ready = useRef(startSettled.current);

  /* Interaction state lives in refs: none of it needs a render. */
  const mode = useRef(startSettled.current ? "settled" : "open");
  const animating = useRef(false);
  const controls = useRef(null);
  const lastEnd = useRef(0);

  /* Geometry is re-measured on resize; bumping geoTick re-derives the
     wordmark transform without any React render. */
  const geo = useRef({ x0: 0, y0: 0, x1: 0, y1: 0, s0: 1, s1: 0.05 });
  const geoTick = useMotionValue(0);

  /* The navbar's own "Mindo" text, which this component fades in as
     the wordmark lands on it, and the latest measure() function. */
  const navTextRef = useRef(null);
  const measureRef = useRef(null);

  /* 0 while the giant wordmark owns the brand, 1 once the navbar's
     own text has taken over. Written straight to the DOM (no render). */
  const navTextOpacity = useTransform(
    progress,
    [HANDOFF_START, HANDOFF_END],
    [0, 1]
  );

  useMotionValueEvent(navTextOpacity, "change", (v) => {
    const el = navTextRef.current;

    if (el) el.style.opacity = v >= 1 ? "" : String(v);
  });

  /* ------------------------------------------------------------------
     ENTRANCE - runs once the loader hands over
     ------------------------------------------------------------------ */

  useEffect(() => {
    if (startSettled.current) return undefined;

    let started = false;
    let timer = 0;
    let ctl = null;

    const start = () => {
      if (started) return;
      started = true;

      if (prefersReducedMotion()) {
        entrance.set(1);
        ready.current = true;
        return;
      }

      ctl = animate(entrance, 1, {
        duration: ENTRANCE_DURATION,
        delay: ENTRANCE_DELAY,
        ease: ENTRANCE_EASE,
        onUpdate: (v) => {
          if (v > 0.55) ready.current = true;
        },
        onComplete: () => {
          ready.current = true;
        },
      });
    };

    if (document.documentElement.dataset.mindoLoaded === "1") {
      start();
    } else {
      window.addEventListener(LOADED_EVENT, start, { once: true });

      /* Safety net: never leave the page waiting on a missing loader. */
      timer = window.setTimeout(start, LOADER_FALLBACK_MS);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOADED_EVENT, start);
      if (ctl) ctl.stop();
    };
  }, [entrance]);

  /* ------------------------------------------------------------------
     HERO REVEAL - text (staggered) then brain, once the wordmark lands
     ------------------------------------------------------------------ */

  const cancelReveal = useCallback(() => {
    revealAnims.current.forEach((a) => {
      try {
        a.cancel();
      } catch (err) {
        /* already gone */
      }
    });

    revealAnims.current = [];
  }, []);

  const playReveal = useCallback(() => {
    cancelReveal();

    if (prefersReducedMotion()) return;

    const root = heroRef.current;

    if (!root || typeof root.animate !== "function") return;

    /* Hero.jsx: section#top > grid > [text column, brain column].
       If the structure ever changes, this quietly does nothing and
       the hero simply appears. */
    const grid = root.querySelector("#top > div");

    if (!grid || grid.children.length < 2) return;

    const left = grid.children[0];
    const right = grid.children[1];

    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const list = [];

    /* Individual transform properties (translate / scale) compose with
       the hero's own transforms instead of replacing them. */
    Array.from(left.children).forEach((child, i) => {
      list.push(
        child.animate(
          [
            { opacity: 0, translate: "0 20px" },
            { opacity: 1, translate: "0 0" },
          ],
          { duration: 700, delay: i * 80, easing: ease, fill: "backwards" }
        )
      );
    });

    list.push(
      right.animate(
        [
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1 },
        ],
        { duration: 950, delay: 220, easing: ease, fill: "backwards" }
      )
    );

    revealAnims.current = list;
  }, [cancelReveal]);

  useMotionValueEvent(progress, "change", (p) => {
    if (!revealed.current && p >= REVEAL_AT) {
      revealed.current = true;

      if (heroFade.current) heroFade.current.stop();
      heroFade.current = null;

      /* Start the child animations first, so their hidden first
         frame is already in place when the wrapper turns visible. */
      playReveal();
      heroVis.set(1);
    } else if (revealed.current && p < REVEAL_AT - 0.06) {
      revealed.current = false;

      cancelReveal();

      if (heroFade.current) heroFade.current.stop();

      heroFade.current = animate(heroVis, 0, {
        duration: 0.22,
        ease: "easeOut",
      });
    }
  });

  useEffect(
    () => () => {
      cancelReveal();
      if (heroFade.current) heroFade.current.stop();
    },
    [cancelReveal]
  );

  /* ------------------------------------------------------------------
     THE SNAP
     ------------------------------------------------------------------ */

  const go = useCallback(
    (target) => {
      if (animating.current) return;

      const to = target === 1 ? "settled" : "open";
      if (mode.current === to) return;

      /* Fresh geometry right before the snap, so the wordmark lands
         exactly on the navbar brand whatever changed since mount. */
      if (measureRef.current) measureRef.current();

      animating.current = true;
      mode.current = to;

      const finish = () => {
        animating.current = false;
        lastEnd.current = performance.now();
        controls.current = null;
      };

      if (prefersReducedMotion()) {
        progress.set(target);
        finish();
        return;
      }

      controls.current = animate(progress, target, {
        duration: target === 1 ? FORWARD_DURATION : REVERSE_DURATION,
        ease: EASE,
        onComplete: finish,
      });
    },
    [progress]
  );

  /* Jump straight to the finished homepage with no animation. */
  const settleNow = useCallback(() => {
    if (controls.current) controls.current.stop();
    controls.current = null;

    progress.set(1);
    mode.current = "settled";
    animating.current = false;
    lastEnd.current = performance.now();
  }, [progress]);

  /* ------------------------------------------------------------------
     INPUT
     ------------------------------------------------------------------ */

  useEffect(() => {
    const mountedAt = performance.now();

    let userInteracted = false;
    let lastWheel = 0;
    let waitForFreshGesture = false;

    let touchStartY = 0;
    let touchAtTop = false;
    let touchConsumed = false;

    const atTop = () => window.scrollY <= 0;

    /* ---------------- wheel / trackpad ---------------- */

    const onWheel = (e) => {
      if (e.ctrlKey) return; /* pinch-zoom */

      const now = performance.now();
      const fresh = now - lastWheel > FRESH_GESTURE_GAP;
      lastWheel = now;

      userInteracted = true;

      /* Vertical intent only. */
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      /* Loader / entrance still running: hold the page. */
      if (!ready.current && mode.current === "open") {
        e.preventDefault();
        return;
      }

      /* Mid-animation: swallow everything. */
      if (animating.current) {
        e.preventDefault();
        return;
      }

      /* Trackpad momentum from the gesture that triggered the snap
         keeps arriving for a while. Swallow it until the user pauses
         and starts a new gesture, so the page does not drift. */
      if (waitForFreshGesture) {
        if (!fresh) {
          e.preventDefault();
          return;
        }

        waitForFreshGesture = false;
      }

      if (mode.current === "open") {
        e.preventDefault();

        if (e.deltaY > WHEEL_THRESHOLD) {
          waitForFreshGesture = true;
          go(1);
        }

        return;
      }

      /* Settled: only intercept a fresh upward gesture at the top. */
      if (
        atTop() &&
        e.deltaY < -WHEEL_THRESHOLD &&
        fresh &&
        now - lastEnd.current > REVERSE_COOLDOWN
      ) {
        e.preventDefault();
        waitForFreshGesture = true;
        go(0);
      }
    };

    /* ---------------- touch ---------------- */

    const onTouchStart = (e) => {
      if (!e.touches.length) return;

      userInteracted = true;
      touchStartY = e.touches[0].clientY;
      touchAtTop = atTop();
      touchConsumed = false;
    };

    const onTouchMove = (e) => {
      if (!e.touches.length) return;

      const dy = touchStartY - e.touches[0].clientY; /* + = swipe up */

      if (!ready.current && mode.current === "open") {
        if (e.cancelable) e.preventDefault();
        return;
      }

      if (animating.current || touchConsumed) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      if (mode.current === "open") {
        if (e.cancelable) e.preventDefault();

        if (dy > TOUCH_THRESHOLD) {
          touchConsumed = true;
          go(1);
        }

        return;
      }

      if (
        touchAtTop &&
        atTop() &&
        dy < -TOUCH_THRESHOLD &&
        performance.now() - lastEnd.current > REVERSE_COOLDOWN
      ) {
        if (e.cancelable) e.preventDefault();
        touchConsumed = true;
        go(0);
      }
    };

    const onTouchEnd = () => {
      touchConsumed = false;
    };

    /* ---------------- keyboard ---------------- */

    const DOWN_KEYS = ["ArrowDown", "PageDown", "End", " ", "Spacebar"];
    const UP_KEYS = ["ArrowUp", "PageUp", "Home"];

    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;

      const isSpace = e.key === " " || e.key === "Spacebar";
      const down = DOWN_KEYS.includes(e.key) && !(isSpace && e.shiftKey);
      const up = UP_KEYS.includes(e.key) || (isSpace && e.shiftKey);

      if (!down && !up) return;

      userInteracted = true;

      if (!ready.current && mode.current === "open") {
        e.preventDefault();
        return;
      }

      if (animating.current) {
        e.preventDefault();
        return;
      }

      if (mode.current === "open") {
        e.preventDefault();

        if (down && !e.repeat) go(1);

        return;
      }

      if (
        up &&
        !e.repeat &&
        atTop() &&
        performance.now() - lastEnd.current > REVERSE_COOLDOWN
      ) {
        e.preventDefault();
        go(0);
      }
    };

    /* ---------------- scrollbar drag / anything else ---------------- */

    const onScroll = () => {
      const pinned = mode.current === "open" || animating.current;

      if (!pinned || window.scrollY <= 0) return;

      /* The browser restored a scroll position after mount (reload,
         back button): show the homepage, not the opening. */
      if (
        mode.current === "open" &&
        !animating.current &&
        !userInteracted &&
        performance.now() - mountedAt < RESTORE_GRACE
      ) {
        settleNow();
        return;
      }

      /* Otherwise the page must stay pinned at the top. A scrollbar
         drag is treated like a scroll gesture and plays the snap. */
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      if (mode.current === "open" && !animating.current && ready.current) {
        go(1);
      }
    };

    /* ---------------- in-page section links ---------------- */

    /* The navbar pushes a hash and dispatches popstate before it
       scrolls to a section. Skip the opening so that scroll works. */
    const onHashNav = () => {
      if (window.location.hash && mode.current === "open") settleNow();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onHashNav);
    window.addEventListener("hashchange", onHashNav);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onHashNav);
      window.removeEventListener("hashchange", onHashNav);

      if (controls.current) controls.current.stop();
    };
  }, [go, settleNow]);

  /* ------------------------------------------------------------------
     MEASUREMENT - mount + resize + font load, never per frame
     ------------------------------------------------------------------ */

  useLayoutEffect(() => {
    let frame = 0;

    /* Reads a text element's baseline by dropping a zero-size inline
       marker into it, then removes the marker again. Returns the
       marker's offset chain start so the caller can resolve it. */
    const withBaselineMarker = (el, read) => {
      const marker = document.createElement("span");

      marker.style.cssText =
        "display:inline-block;width:0;height:0;vertical-align:baseline;";

      el.appendChild(marker);

      const result = read(marker);

      el.removeChild(marker);

      return result;
    };

    const applyNavText = (v) => {
      const el = navTextRef.current;

      if (el) el.style.opacity = v >= 1 ? "" : String(v);
    };

    const measure = () => {
      const word = wordRef.current;

      if (!word) return;

      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;

      const W = word.offsetWidth;
      const H = word.offsetHeight;

      if (!W || !H) return;

      /* Starting size: as set by CSS, but never wider than 90% of
         the viewport, so it can never overflow horizontally. */
      const s0 = Math.min(1, (vw * 0.9) / W);

      /* Baseline of the giant wordmark inside its own box. */
      const wordBaseline = withBaselineMarker(word, (m) => m.offsetTop);
      const fontSize = parseFloat(getComputedStyle(word).fontSize) || H;

      /* Destination: the existing navbar brand text, matched by
         baseline and left edge. Fallback if it cannot be found. */
      let tx = 56;
      let tBaseline = 44;
      let tw = W * 0.05;
      let tBaselineInWord = null;

      const target = document.querySelector(NAV_TEXT_SELECTOR);

      if (target) {
        const header = target.closest("header");
        const hr = header.getBoundingClientRect();

        const left = offsetWithin(target, header).x;
        const base = withBaselineMarker(
          target,
          (m) => offsetWithin(m, header).y
        );

        tx = hr.left + left;
        tBaseline = hr.top + base;
        tw = target.offsetWidth || tw;
        tBaselineInWord = wordBaseline;

        if (navTextRef.current !== target) {
          if (navTextRef.current) navTextRef.current.style.opacity = "";
          navTextRef.current = target;
        }

        applyNavText(navTextOpacity.get());
      }

      const s1 = clamp(tw / W, 0.01, s0);

      /* Optical centring: middle of the capitals on the viewport
         middle, rather than the middle of the line box. */
      const capMid = wordBaseline - fontSize * CAP_HEIGHT * 0.5;

      geo.current = {
        s0,
        s1,
        x0: (vw - W * s0) / 2,
        y0: vh / 2 - capMid * s0,
        x1: tx,
        y1:
          tBaselineInWord !== null
            ? tBaseline - tBaselineInWord * s1
            : tBaseline - (H * s1) / 2,
      };

      /* Reveal only once real geometry exists, so the wordmark
         never flashes at the wrong place on first paint. */
      word.style.visibility = "visible";

      geoTick.set(geoTick.get() + 1);
    };

    measureRef.current = measure;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();

    window.addEventListener("resize", schedule);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule);
    }

    let observer = null;

    if (typeof ResizeObserver !== "undefined" && wordRef.current) {
      observer = new ResizeObserver(schedule);
      observer.observe(wordRef.current);
    }

    /* The navbar brand may not be laid out until fonts / images
       settle. One late re-measure covers it. */
    const late = window.setTimeout(schedule, 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.removeEventListener("resize", schedule);
      if (observer) observer.disconnect();

      measureRef.current = null;

      /* Give the navbar its text back. */
      if (navTextRef.current) {
        navTextRef.current.style.opacity = "";
        navTextRef.current = null;
      }
    };
    /* navTextOpacity is a stable motion value. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoTick]);

  /* ------------------------------------------------------------------
     DERIVED VALUES
     ------------------------------------------------------------------ */

  const wordTransform = useTransform([progress, geoTick], ([p]) => {
    const g = geo.current;
    const e = clamp(p / TRAVEL_END);

    /* Geometric interpolation: a constant zoom rate feels smoother
       than a linear change in scale. */
    const s = g.s0 * Math.pow(g.s1 / g.s0, e);
    const x = g.x0 + (g.x1 - g.x0) * e;
    const y = g.y0 + (g.y1 - g.y0) * e;

    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
  });

  /* Cross-fade with the navbar text: the wordmark is already sitting
     exactly on it by the time this starts. */
  const wordOpacity = useTransform(
    progress,
    [HANDOFF_START + 0.04, HANDOFF_END + 0.02],
    [1, 0]
  );
  const cueOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  const blurOpacity = useTransform(progress, (p) => 1 - smooth(p / 0.8));
  const vignetteOpacity = useTransform(progress, (p) => 1 - smooth(p / 0.65));

  /* Blur / vignette layers stop rendering entirely once faded. */
  const layerDisplay = useTransform(progress, (p) =>
    p >= 0.86 ? "none" : "block"
  );

  /* The wordmark stops existing once the transition completes. */
  const wordDisplay = useTransform(progress, (p) =>
    p >= 0.999 ? "none" : "block"
  );

  /* Entrance: fade + gentle rise + settle, applied to the whole
     wordmark layer. Transform and opacity only. */
  const entranceY = useTransform(entrance, [0, 1], [28, 0]);
  const entranceScale = useTransform(entrance, [0, 1], [0.94, 1]);

  /* The hidden hero must not catch clicks while invisible. */
  const heroPointer = useTransform(progress, (p) =>
    p < 0.5 ? "none" : "auto"
  );

  /* Keyboard users tabbing into the (invisible) hero get the snap. */
  const onHeroFocus = useCallback(() => {
    if (mode.current === "open" && !animating.current && ready.current) {
      go(1);
    }
  }, [go]);

  return (
    <>
      {/* =========================================================
          BACKGROUND TREATMENT
          Sits above the (unchanged) AmbientBackground and below all
          page content. Light blur + subtle vignette. No tint, so the
          background elements stay clearly visible.
          ========================================================= */}

      <motion.div
        aria-hidden="true"
        className="mindo-open-blur pointer-events-none fixed inset-0"
        style={{
          zIndex: -10,
          opacity: blurOpacity,
          display: layerDisplay,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="mindo-open-vignette pointer-events-none fixed inset-0"
        style={{
          zIndex: -10,
          opacity: vignetteOpacity,
          display: layerDisplay,
        }}
      />

      {/* =========================================================
          THE GIANT WORDMARK
          ========================================================= */}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          zIndex: 60,
          display: wordDisplay,
          opacity: entrance,
          y: entranceY,
          scale: entranceScale,
        }}
      >
        <motion.div
          ref={wordRef}
          className="mindo-open-word font-display font-bold"
          style={{
            transform: wordTransform,
            opacity: wordOpacity,
            visibility: "hidden",
          }}
        >
          {WORD}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="mindo-open-cue"
          style={{ opacity: cueOpacity }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>

      {/* =========================================================
          EXISTING HERO - untouched, revealed as the wordmark lands.
          No spacer: the page layout is identical to before.
          ========================================================= */}

      <motion.div
        ref={heroRef}
        onFocusCapture={onHeroFocus}
        style={{
          opacity: heroVis,
          pointerEvents: heroPointer,
        }}
      >
        {children}
      </motion.div>

      <style>{`
        .mindo-open-blur {
          -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px);
          will-change: opacity;
        }

        .mindo-open-vignette {
          background: radial-gradient(
            ellipse 78% 72% at 50% 50%,
            rgba(72, 61, 145, 0) 52%,
            rgba(72, 61, 145, 0.2) 100%
          );
          will-change: opacity;
        }

        .mindo-open-word {
          position: absolute;
          left: 0;
          top: 0;
          transform-origin: 0 0;
          white-space: nowrap;
          user-select: none;
          font-size: min(29vw, 44vh);
          line-height: 1;
          letter-spacing: -0.03em;
          background-image: linear-gradient(
            100deg,
            #2b2478 0%,
            #5b4fcf 48%,
            #8b7fe8 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          will-change: transform, opacity;
        }

        .mindo-open-cue {
          position: absolute;
          left: 50%;
          bottom: max(1.75rem, env(safe-area-inset-bottom, 0px));
          margin-left: -11px;
          color: rgba(72, 61, 145, 0.6);
          animation: mindo-open-cue 2.2s ease-in-out infinite;
        }

        @keyframes mindo-open-cue {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mindo-open-cue { animation: none; }
        }
      `}</style>
    </>
  );
}
