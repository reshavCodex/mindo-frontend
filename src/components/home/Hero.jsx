import { motion, AnimatePresence } from "framer-motion";
import Brain3D from "../ui/Brain3D";
import CapabilityCard from "../ui/CapabilityCard";
import Button from "../ui/Button";
import useBrainState from "../../hooks/useBrainState";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: "easeOut",
    },
  }),
};

// Small inline icons — no icon-library dependency.
function EmotionIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function SpeechIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
    </svg>
  );
}

// Per-capability status text for each brain state.
const CAPABILITY_STATUS = {
  emotion: {
    idle: "Standing by",
    listening: "Standing by",
    processing: "Reading expression",
    calm: "Logged: steady",
    ready: "Profile updated",
  },

  speech: {
    idle: "Listening",
    listening: "Parsing tone",
    processing: "Cross-checking cues",
    calm: "Logged: calm tone",
    ready: "Profile updated",
  },

  focus: {
    idle: "Standing by",
    listening: "Standing by",
    processing: "Tracking attention",
    calm: "Measuring focus",
    ready: "Profile updated",
  },
};

export default function Hero() {
  const { state, config } = useBrainState();

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-6 pb-16 pt-10 scroll-mt-20 md:pb-20 md:pt-16"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-6">
        {/* Hero Content */}
        <div className="relative z-20 md:-translate-y-2">
          {/* Badge */}
          <motion.span
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-medium text-primary-deep shadow-soft"
          >
            AI wellness counselling
          </motion.span>

          {/* Heading */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.1] text-ink md:text-5xl"
          >
            A five-minute check-in with{" "}
            <span className="text-gradient">
              an AI that actually listens
            </span>
            .
          </motion.h1>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-5 max-w-md text-base text-ink-soft"
          >
            Mindo pairs a short conversation with facial-expression and
            speech analysis to give you a grounded, judgment-free read on
            how you're really doing — plus practical next steps.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button to="/signup" variant="primary">
              Start your screening
            </Button>

            <a
              href="#how-it-works"
              className="group text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              See how it works{" "}
              <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>

        {/* 3D Brain — the AI Core */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2,
          }}
          className="relative flex h-[25rem] items-center justify-center md:h-[34rem] md:-translate-x-2"
        >
          {/* Brain */}
          <Brain3D size={425} modelScale={0.86} />

          {/* Live AI Status Line */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 1.0,
            }}
            className="pointer-events-none absolute bottom-[5%] left-1/2 -translate-x-1/2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 font-mono text-[11px] text-primary-deep shadow-soft">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-deep opacity-60" />

                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-deep" />
              </span>

              <span className="relative inline-grid">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={state}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: "easeInOut",
                    }}
                    className="col-start-1 row-start-1"
                  >
                    {config.statusLabel}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.div>

          {/* Emotion */}
          <CapabilityCard
            icon={<EmotionIcon />}
            label="Emotion"
            status={CAPABILITY_STATUS.emotion[state]}
            active={config.activeCapability === 0}
            positionClassName="left-[2%] top-[8%] -translate-x-[10%]"
            entranceDelay={0.9}
            entranceX={-20}
            float={{
              y: [0, -8, 0],
              x: [0, 3, 0],
              duration: 5.8,
              delay: 0.4,
            }}
            tapDirection={{
              x: -10,
              y: -8,
            }}
          />

          {/* Speech */}
          <CapabilityCard
            icon={<SpeechIcon />}
            label="Speech"
            status={CAPABILITY_STATUS.speech[state]}
            active={config.activeCapability === 1}
            positionClassName="right-[2%] top-[14%] translate-x-[10%]"
            entranceDelay={1.05}
            entranceX={20}
            float={{
              y: [0, -6, 0],
              x: [0, -4, 0],
              duration: 6.6,
              delay: 1.1,
            }}
            tapDirection={{
              x: 10,
              y: -8,
            }}
          />

          {/* Focus */}
          <CapabilityCard
            icon={<FocusIcon />}
            label="Focus"
            status={CAPABILITY_STATUS.focus[state]}
            active={config.activeCapability === 2}
            positionClassName="bottom-[16%] right-[6%] translate-x-[6%]"
            entranceDelay={1.2}
            entranceX={20}
            float={{
              y: [0, -9, 0],
              x: [0, 2, 0],
              duration: 7.2,
              delay: 0.7,
            }}
            tapDirection={{
              x: 10,
              y: 10,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}