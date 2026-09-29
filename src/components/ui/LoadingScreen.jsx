import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * LoadingScreen
 * -------------
 * Shown on every page load / reload, before the app is revealed.
 *
 * A calm MINDO loading moment built around the project's lavender
 * atmosphere, soft ambient light, glassmorphism, and breathing motion.
 *
 * It waits for what the first paint actually needs (fonts, the logo,
 * the background artwork, the window load event), but:
 *
 *   - never shows for less than MIN_MS, so it never just flashes
 *   - never shows for more than MAX_MS, so a slow asset can't trap you
 *
 * When it is ready to leave it sets
 *
 *     document.documentElement.dataset.mindoLoaded = "1"
 *
 * and dispatches a "mindo:loaded" event, then fades out. The homepage
 * opening listens for that to start the wordmark's entrance.
 *
 * Mounted once in SiteLayout, which persists across route changes, so
 * it appears on reload and never on in-app navigation.
 *
 * Motion is CSS + one opacity fade: cheap, and disabled for reduced
 * motion.
 */

const MIN_MS = 1500;
const MAX_MS = 4500;

const ASSETS = ["/images/logo.png", "/images/bkg.png"];

const LOADED_EVENT = "mindo:loaded";

function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
}

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let finished = false;

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;

      document.documentElement.dataset.mindoLoaded = "1";
      window.dispatchEvent(new Event(LOADED_EVENT));

      setVisible(false);
    };

    const minimum = new Promise((resolve) => {
      window.setTimeout(resolve, MIN_MS);
    });

    const fonts =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

    const assets = Promise.all(ASSETS.map(preload));

    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener("load", resolve, { once: true });
          });

    Promise.all([minimum, fonts, assets, pageLoaded]).then(finish);

    const maxTimer = window.setTimeout(finish, MAX_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(maxTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mindo-loader"
          role="status"
          aria-live="polite"
          aria-label="Loading Mindo"
          className="mindo-loader fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{ zIndex: 100 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
        >
          {/* Base MINDO atmosphere */}
          <div className="mindo-loader-background" aria-hidden="true" />

          {/* Soft animated ambient lights */}
          <div className="mindo-loader-orb mindo-loader-orb-a" aria-hidden="true" />
          <div className="mindo-loader-orb mindo-loader-orb-b" aria-hidden="true" />
          <div className="mindo-loader-orb mindo-loader-orb-c" aria-hidden="true" />

          {/* Subtle vignette */}
          <div className="mindo-loader-vignette" aria-hidden="true" />

          {/* Central atmospheric glow */}
          <div className="mindo-loader-glow" aria-hidden="true" />

          {/* Fine ambient lines */}
          <div className="mindo-loader-lines" aria-hidden="true">
            <span className="mindo-loader-line mindo-loader-line-a" />
            <span className="mindo-loader-line mindo-loader-line-b" />
            <span className="mindo-loader-line mindo-loader-line-c" />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Central glass atmosphere */}
            <div className="mindo-loader-glass">
              {/* Breathing rings around the logo */}
              <div className="relative flex h-60 w-60 items-center justify-center">
                <span className="mindo-loader-ring mindo-loader-ring-a" />
                <span className="mindo-loader-ring mindo-loader-ring-b" />
                <span className="mindo-loader-ring mindo-loader-ring-c" />
                <span className="mindo-loader-ring mindo-loader-ring-d" />

                {/* Logo halo */}
                <div className="mindo-loader-logo-halo" aria-hidden="true" />

                <img
                  src="/images/logo.png"
                  alt=""
                  className="mindo-loader-logo relative h-[4.5rem] w-[4.5rem] rounded-full"
                  draggable="false"
                />
              </div>
            </div>

            {/* Text */}
            <div className="mt-1 text-center">
              <p className="font-display text-xl font-bold tracking-tight text-ink">
                Take a slow breath
              </p>

              <p className="mt-1.5 text-sm text-ink-soft">
                Mindo is getting ready for you
              </p>
            </div>

            {/* Breathing cue */}
            <div className="relative mt-5 h-5 w-32 text-center font-mono text-[11px] font-medium tracking-wide text-primary-deep">
              <span className="mindo-loader-in absolute inset-0">
                Breathe in
              </span>

              <span className="mindo-loader-out absolute inset-0">
                Breathe out
              </span>
            </div>

            {/* Minimal loading indicator */}
            <div className="mindo-loader-progress mt-5" aria-hidden="true">
              <span />
            </div>
          </motion.div>

          <style>{`
            .mindo-loader {
              isolation: isolate;
              background:
                linear-gradient(
                  135deg,
                  #f4f1ff 0%,
                  #ece9fb 38%,
                  #e7e3f8 68%,
                  #f3efff 100%
                );
            }

            .mindo-loader-background {
              position: absolute;
              inset: -40px;
              pointer-events: none;
              background:
                radial-gradient(
                  45% 40% at 50% 45%,
                  rgba(139, 127, 232, 0.18) 0%,
                  rgba(139, 127, 232, 0.08) 42%,
                  transparent 76%
                ),
                radial-gradient(
                  40% 45% at 8% 92%,
                  rgba(184, 174, 242, 0.32) 0%,
                  rgba(184, 174, 242, 0.08) 52%,
                  transparent 78%
                ),
                radial-gradient(
                  40% 40% at 94% 8%,
                  rgba(123, 111, 220, 0.18) 0%,
                  rgba(123, 111, 220, 0.06) 48%,
                  transparent 78%
                );
              filter: blur(2px);
              transform: scale(1.04);
            }

            .mindo-loader-glow {
              position: absolute;
              left: 50%;
              top: 46%;
              width: min(58vw, 720px);
              height: min(58vw, 720px);
              pointer-events: none;
              transform: translate(-50%, -50%);
              border-radius: 9999px;
              background:
                radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.52) 0%,
                  rgba(184, 174, 242, 0.20) 32%,
                  rgba(139, 127, 232, 0.08) 54%,
                  transparent 72%
                );
              filter: blur(12px);
            }

            .mindo-loader-orb {
              position: absolute;
              border-radius: 9999px;
              pointer-events: none;
              filter: blur(12px);
              will-change: transform, opacity;
              animation: mindo-loader-float 8s ease-in-out infinite;
            }

            .mindo-loader-orb-a {
              top: 12%;
              left: 14%;
              width: 180px;
              height: 180px;
              background: rgba(184, 174, 242, 0.22);
            }

            .mindo-loader-orb-b {
              right: 8%;
              bottom: 10%;
              width: 240px;
              height: 240px;
              background: rgba(139, 127, 232, 0.13);
              animation-delay: -2.5s;
            }

            .mindo-loader-orb-c {
              right: 24%;
              top: 18%;
              width: 110px;
              height: 110px;
              background: rgba(255, 255, 255, 0.30);
              filter: blur(18px);
              animation-delay: -4s;
            }

            .mindo-loader-vignette {
              position: absolute;
              inset: 0;
              pointer-events: none;
              background:
                radial-gradient(
                  ellipse at center,
                  transparent 42%,
                  rgba(63, 55, 120, 0.035) 68%,
                  rgba(50, 43, 96, 0.10) 100%
                );
            }

            .mindo-loader-glass {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 18rem;
              height: 18rem;
              border: 1px solid rgba(255, 255, 255, 0.62);
              border-radius: 9999px;
              background:
                radial-gradient(
                  circle at 50% 38%,
                  rgba(255, 255, 255, 0.30),
                  rgba(255, 255, 255, 0.08) 52%,
                  rgba(139, 127, 232, 0.04) 100%
                );
              box-shadow:
                0 30px 80px -40px rgba(72, 61, 145, 0.30),
                inset 0 1px 0 rgba(255, 255, 255, 0.50);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }

            .mindo-loader-ring {
              position: absolute;
              border-radius: 9999px;
              border: 1px solid rgba(139, 127, 232, 0.34);
              background:
                radial-gradient(
                  circle,
                  rgba(184, 174, 242, 0.12) 0%,
                  rgba(184, 174, 242, 0) 70%
                );
              animation: mindo-loader-breathe 3.2s ease-in-out infinite;
              will-change: transform, opacity;
            }

            .mindo-loader-ring-a {
              width: 104px;
              height: 104px;
            }

            .mindo-loader-ring-b {
              width: 150px;
              height: 150px;
              animation-delay: 0.18s;
            }

            .mindo-loader-ring-c {
              width: 196px;
              height: 196px;
              animation-delay: 0.36s;
            }

            .mindo-loader-ring-d {
              width: 238px;
              height: 238px;
              border-color: rgba(139, 127, 232, 0.16);
              animation-delay: 0.54s;
            }

            .mindo-loader-logo-halo {
              position: absolute;
              width: 94px;
              height: 94px;
              border-radius: 9999px;
              background:
                radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.58) 0%,
                  rgba(184, 174, 242, 0.28) 42%,
                  rgba(139, 127, 232, 0.08) 66%,
                  transparent 74%
                );
              filter: blur(7px);
            }

            .mindo-loader-logo {
              object-fit: cover;
              box-shadow:
                0 12px 34px -10px rgba(91, 79, 207, 0.48),
                0 0 0 1px rgba(255, 255, 255, 0.52);
              animation: mindo-loader-logo 3.2s ease-in-out infinite;
              will-change: transform;
            }

            .mindo-loader-lines {
              position: absolute;
              inset: 0;
              overflow: hidden;
              pointer-events: none;
              opacity: 0.30;
            }

            .mindo-loader-line {
              position: absolute;
              height: 1px;
              transform-origin: left center;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(139, 127, 232, 0.28),
                transparent
              );
            }

            .mindo-loader-line-a {
              top: 28%;
              left: -5%;
              width: 42%;
              transform: rotate(-18deg);
            }

            .mindo-loader-line-b {
              right: -5%;
              top: 67%;
              width: 38%;
              transform: rotate(-24deg);
            }

            .mindo-loader-line-c {
              bottom: 18%;
              left: 18%;
              width: 26%;
              transform: rotate(16deg);
            }

            .mindo-loader-progress {
              position: relative;
              width: 72px;
              height: 2px;
              overflow: hidden;
              border-radius: 9999px;
              background: rgba(91, 79, 207, 0.10);
            }

            .mindo-loader-progress span {
              position: absolute;
              inset: 0 auto 0 -100%;
              width: 70%;
              border-radius: inherit;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(91, 79, 207, 0.65),
                transparent
              );
              animation: mindo-loader-progress 2.2s ease-in-out infinite;
            }

            @keyframes mindo-loader-breathe {
              0%,
              100% {
                transform: scale(0.86);
                opacity: 0.40;
              }

              50% {
                transform: scale(1.08);
                opacity: 1;
              }
            }

            @keyframes mindo-loader-logo {
              0%,
              100% {
                transform: scale(0.96);
              }

              50% {
                transform: scale(1.06);
              }
            }

            @keyframes mindo-loader-float {
              0%,
              100% {
                transform: translate3d(0, 0, 0) scale(1);
              }

              50% {
                transform: translate3d(0, -14px, 0) scale(1.04);
              }
            }

            @keyframes mindo-loader-progress {
              0% {
                transform: translateX(0);
              }

              100% {
                transform: translateX(285%);
              }
            }

            .mindo-loader-in {
              animation:
                mindo-loader-in 3.2s ease-in-out infinite;
            }

            .mindo-loader-out {
              animation:
                mindo-loader-out 3.2s ease-in-out infinite;
            }

            @keyframes mindo-loader-in {
              0% {
                opacity: 0;
              }

              12%,
              42% {
                opacity: 1;
              }

              54%,
              100% {
                opacity: 0;
              }
            }

            @keyframes mindo-loader-out {
              0%,
              50% {
                opacity: 0;
              }

              62%,
              92% {
                opacity: 1;
              }

              100% {
                opacity: 0;
              }
            }

            @media (max-width: 640px) {
              .mindo-loader-glass {
                width: 15rem;
                height: 15rem;
              }

              .mindo-loader-ring-d {
                width: 204px;
                height: 204px;
              }

              .mindo-loader-orb-a {
                left: -12%;
              }

              .mindo-loader-orb-b {
                right: -14%;
              }

              .mindo-loader-vignette {
                background:
                  radial-gradient(
                    ellipse at center,
                    transparent 36%,
                    rgba(63, 55, 120, 0.045) 70%,
                    rgba(50, 43, 96, 0.12) 100%
                  );
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .mindo-loader-ring,
              .mindo-loader-logo,
              .mindo-loader-orb,
              .mindo-loader-in,
              .mindo-loader-out,
              .mindo-loader-progress span {
                animation: none;
              }

              .mindo-loader-out {
                opacity: 0;
              }

              .mindo-loader-in {
                opacity: 1;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}