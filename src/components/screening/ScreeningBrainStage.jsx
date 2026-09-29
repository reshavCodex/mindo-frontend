import { AnimatePresence, motion } from "framer-motion";
import Brain3D from "../ui/Brain3D";

const STATUS_LABEL = {
  ready: "Ready when you are",
  connecting: "Connecting...",
  listening: "Listening...",
  speaking: "MINDO is responding...",
  ending: "Finishing your check-in...",
  summary: "Session complete",
  error: "Connection interrupted",
};

const RING_MOTION = {
  ready: {
    scale: [1, 1.03, 1],
    opacity: [0.25, 0.4, 0.25],
    duration: 4.5,
  },

  connecting: {
    scale: [1, 1.08, 1],
    opacity: [0.3, 0.55, 0.3],
    duration: 1.8,
  },

  listening: {
    scale: [1, 1.12, 1],
    opacity: [0.35, 0.65, 0.35],
    duration: 1.6,
  },

  speaking: {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.7, 0.4],
    duration: 1.2,
  },

  ending: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.5, 0.3],
    duration: 1.8,
  },

  summary: {
    scale: [1, 1.02, 1],
    opacity: [0.25, 0.35, 0.25],
    duration: 3.5,
  },

  error: {
    scale: [1, 1.04, 1],
    opacity: [0.25, 0.45, 0.25],
    duration: 2.2,
  },
};

function WaveformBars({ active = true }) {
  const bars = [0, 1, 2, 3, 4];

  return (
    <div
      className="flex h-3.5 items-end gap-[3px]"
      aria-hidden="true"
    >
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-primary-deep"
          animate={
            active
              ? {
                  height: [
                    "30%",
                    "100%",
                    "45%",
                    "80%",
                    "30%",
                  ],
                }
              : {
                  height: "30%",
                }
          }
          transition={{
            duration: 1.1 + i * 0.08,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

/**
 * ScreeningBrainStage
 * -------------------
 * Visual centerpiece for the real MINDO conversation.
 *
 * This component is presentation-only. It does not own the
 * camera, microphone, WebSocket, Gemini, or FER state.
 */
export default function ScreeningBrainStage({
  state = "ready",
  size = 380,
}) {
  const ring =
    RING_MOTION[state] ??
    RING_MOTION.ready;

  const isActive =
    state === "listening" ||
    state === "speaking";

  const isConnecting =
    state === "connecting";

  const isEnding =
    state === "ending";

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        width: size,
      }}
    >

      {/* ======================================================
          BRAIN STAGE
          ====================================================== */}

      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >

        {/* ====================================================
            MAIN BREATHING RING
            ==================================================== */}

        <motion.div
          key={`ring-${state}`}
          className="pointer-events-none absolute rounded-full border border-primary/35"
          style={{
            width: size * 0.76,
            height: size * 0.76,
          }}
          animate={{
            scale: ring.scale,
            opacity: ring.opacity,
          }}
          transition={{
            duration: ring.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />


        {/* ====================================================
            SOFT INNER GLOW
            ==================================================== */}

        <motion.div
          className="pointer-events-none absolute rounded-full bg-primary-deep/[0.055] blur-2xl"
          style={{
            width: size * 0.54,
            height: size * 0.54,
          }}
          animate={{
            scale:
              state === "listening" ||
              state === "speaking"
                ? [1, 1.08, 1]
                : [1, 1.03, 1],
            opacity:
              state === "listening" ||
              state === "speaking"
                ? [0.5, 0.85, 0.5]
                : [0.35, 0.5, 0.35],
          }}
          transition={{
            duration:
              state === "listening"
                ? 1.6
                : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />


        {/* ====================================================
            CONNECTING RING
            ==================================================== */}

        <AnimatePresence>
          {isConnecting && (
            <motion.div
              key="connecting-ring"
              className="pointer-events-none absolute rounded-full border border-dashed border-primary-deep/40"
              style={{
                width: size * 0.84,
                height: size * 0.84,
              }}
              initial={{
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                opacity: 1,
                rotate: 360,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                opacity: {
                  duration: 0.3,
                },
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>


        {/* ====================================================
            ENDING RING
            ==================================================== */}

        <AnimatePresence>
          {isEnding && (
            <motion.div
              key="ending-ring"
              className="pointer-events-none absolute rounded-full border border-dashed border-primary-deep/30"
              style={{
                width: size * 0.82,
                height: size * 0.82,
              }}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>


        {/* ====================================================
            BRAIN
            ==================================================== */}

        <div className="relative z-10 flex items-center justify-center">

          <Brain3D
            size={size * 0.60}
            modelScale={0.86}
          />

        </div>

      </div>


      {/* ======================================================
          STATUS AREA
          ====================================================== */}

      <div className="relative z-20 -mt-1 flex flex-col items-center gap-2">

        {/* STATUS PILL */}

        <span className="inline-flex min-h-[30px] items-center gap-2 rounded-full border border-white/60 bg-white/[0.48] px-3.5 py-1 font-mono text-[11px] leading-none text-primary-deep shadow-[0_8px_24px_rgba(72,55,110,0.10),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl">

          <span className="relative flex h-1.5 w-1.5 shrink-0">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-deep opacity-50" />

            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-deep" />

          </span>


          <span className="relative inline-grid">

            <AnimatePresence mode="wait">

              <motion.span
                key={state}
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className="col-start-1 row-start-1 whitespace-nowrap"
              >
                {STATUS_LABEL[state] ??
                  STATUS_LABEL.ready}
              </motion.span>

            </AnimatePresence>

          </span>

        </span>


        {/* ====================================================
            VOICE ACTIVITY
            ==================================================== */}

        {isActive && (
          <WaveformBars
            active={
              state === "listening"
            }
          />
        )}

      </div>

    </div>
  );
}