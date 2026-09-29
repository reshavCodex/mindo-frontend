import { motion, AnimatePresence } from "framer-motion";

/**
 * CapabilityCard
 * ---------------
 * Floating AI capability readout used around the MINDO brain.
 *
 * Behavior:
 * - Smooth entrance animation.
 * - Independent floating motion per card.
 * - Horizontal and vertical floating work simultaneously.
 * - Active capability gets a restrained neural glow.
 * - Hover produces a noticeable but controlled 5% zoom.
 * - Click/tap keeps the existing directional spring response.
 * - Status text cross-fades smoothly when the brain state changes.
 *
 * Props:
 * - icon: JSX node
 * - label: string
 * - status: string
 * - active: boolean
 * - positionClassName: Tailwind positioning classes
 * - entranceDelay: seconds
 * - entranceX: initial horizontal entrance offset
 * - float: {
 *     x?: number[],
 *     y?: number[],
 *     duration: number,
 *     delay: number
 *   }
 * - tapDirection: { x: number, y: number }
 * - onClick: optional click handler
 */

export default function CapabilityCard({
  icon,
  label,
  status,
  active = false,
  positionClassName = "",
  entranceDelay = 0.9,
  entranceX = 0,
  float = {
    y: [0, -7, 0],
    duration: 5.5,
    delay: 0,
  },
  tapDirection = {
    x: 0,
    y: -10,
  },
  onClick,
}) {
  /*
   * Normalize the floating keyframes.
   *
   * This allows cards to independently move on both
   * the X and Y axes without the entrance animation
   * interfering with their continuous floating motion.
   */

  const hasFloatX =
    Array.isArray(float.x) &&
    float.x.length > 0;

  const hasFloatY =
    Array.isArray(float.y) &&
    float.y.length > 0;

  const floatingX = hasFloatX
    ? float.x
    : [0];

  const floatingY = hasFloatY
    ? float.y
    : [0];

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: entranceX,
        y: 8,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        x: floatingX,
        y: floatingY,
        scale: 1,
      }}
      transition={{
        /*
         * Entrance opacity.
         */
        opacity: {
          duration: 0.65,
          delay: entranceDelay,
          ease: [0.22, 1, 0.36, 1],
        },

        /*
         * Horizontal floating.
         */
        x: {
          duration: float.duration,
          delay: entranceDelay + float.delay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        },

        /*
         * Vertical floating.
         */
        y: {
          duration: float.duration,
          delay: entranceDelay + float.delay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        },

        /*
         * Entrance scale.
         */
        scale: {
          duration: 0.7,
          delay: entranceDelay,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      /*
       * Cursor hover:
       *
       * The card subtly pops toward the user when the
       * pointer is actually over it.
       *
       * 1.05 = 5% enlargement.
       */
      whileHover={{
        scale: 1.05,
        transition: {
          type: "spring",
          stiffness: 320,
          damping: 18,
          mass: 0.6,
        },
      }}
      /*
       * Existing responsive tap interaction.
       */
      whileTap={{
        x: tapDirection.x,
        y: tapDirection.y,
        scale: 0.97,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 14,
          mass: 0.55,
        },
      }}
      onClick={onClick}
      className={`
        absolute
        hidden
        cursor-pointer
        select-none
        overflow-hidden
        rounded-2xl
        border
        border-white/65
        bg-white/74
        px-4
        py-3
        shadow-[0_10px_30px_-14px_rgba(72,61,145,0.35)]
        transition-[background-color,border-color,box-shadow]
        duration-500
        ease-out
        hover:border-white/85
        hover:bg-white/82
        hover:shadow-[0_16px_38px_-14px_rgba(72,61,145,0.42)]
        md:block
        ${positionClassName}
      `}
      style={{
        willChange: "transform, opacity",
        transformOrigin: "center center",
      }}
    >
      {/* =========================================================
          SOFT GLASS HIGHLIGHT
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
          opacity-80
        "
        aria-hidden="true"
      />

      {/* =========================================================
          SUBTLE AMBIENT GLOW
          ========================================================= */}

      <motion.div
        className="
          pointer-events-none
          absolute
          -inset-8
          rounded-full
          bg-primary/10
          blur-2xl
        "
        animate={{
          opacity: active ? 0.9 : 0.35,
          scale: active ? 1.05 : 0.95,
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* =========================================================
          ACTIVE NEURAL EDGE
          ========================================================= */}

      <motion.div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
        "
        animate={{
          boxShadow: active
            ? [
                "0 0 0 1px rgba(139,127,232,0.28), 0 0 18px -8px rgba(139,127,232,0.28)",
                "0 0 0 1px rgba(139,127,232,0.52), 0 0 26px -6px rgba(139,127,232,0.42)",
                "0 0 0 1px rgba(139,127,232,0.28), 0 0 18px -8px rgba(139,127,232,0.28)",
              ]
            : "0 0 0 1px rgba(139,127,232,0), 0 0 0 rgba(139,127,232,0)",
        }}
        transition={{
          duration: 2.4,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* =========================================================
          CONTENT
          ========================================================= */}

      <div className="relative flex items-center gap-3">
        {/* =======================================================
            ICON
            ======================================================= */}

        <motion.span
          animate={{
            scale: active ? [1, 1.06, 1] : 1,

            backgroundColor: active
              ? "rgba(139,127,232,0.16)"
              : "rgba(248,247,252,0.72)",

            color: active
              ? "#5B4FCF"
              : "#8B7FE8",
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            },

            backgroundColor: {
              duration: 0.6,
              ease: "easeInOut",
            },

            color: {
              duration: 0.5,
              ease: "easeInOut",
            },
          }}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/70
            shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
          "
        >
          {icon}
        </motion.span>

        {/* =======================================================
            TEXT
            ======================================================= */}

        <div className="min-w-0 overflow-hidden">
          <div className="text-xs font-medium tracking-[-0.01em] text-ink-soft">
            {label}
          </div>

          <div className="relative mt-0.5 min-w-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
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
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="
                  whitespace-nowrap
                  font-display
                  text-sm
                  font-semibold
                  tracking-[-0.01em]
                  text-ink
                "
              >
                {status}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}