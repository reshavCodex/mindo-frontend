import { motion } from "framer-motion";

function MicIcon({ muted }) {
  return (
    <svg
      width="18"
      height="18"
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

      {muted && (
        <line
          x1="4"
          y1="4"
          x2="20"
          y2="20"
        />
      )}
    </svg>
  );
}

function CameraIcon({ off }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="6"
        width="14"
        height="12"
        rx="2"
      />

      <path d="M16 10l6-3v10l-6-3" />

      {off && (
        <line
          x1="2"
          y1="2"
          x2="22"
          y2="22"
        />
      )}
    </svg>
  );
}

/**
 * ControlsDock
 * ------------
 * Presentation-only controls for the live MINDO session.
 *
 * The actual microphone and camera streams are owned by the
 * real session layer. This component receives their state and
 * callbacks from the parent.
 */
export default function ControlsDock({
  micMuted = false,
  cameraOff = false,
  onToggleMic,
  onToggleCamera,
  onEnd,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        scale: 1.045,
        y: -2,
      }}
      transition={{
        opacity: {
          duration: 0.5,
          delay: 0.2,
        },
        y: {
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut",
        },
        scale: {
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="
        relative
        mx-auto
        flex
        w-fit
        items-center
        gap-2.5
        overflow-hidden
        rounded-full
        border
        border-white/50
        bg-white/[0.10]
        px-3
        py-2.5
        shadow-[0_18px_55px_rgba(72,55,110,0.16),inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(255,255,255,0.08)]
        backdrop-blur-[28px]
        backdrop-saturate-150
        [-webkit-backdrop-filter:blur(28px)_saturate(150%)]
      "
    >
      {/* ==================================================
          GLASS HIGHLIGHT
          ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-full
          bg-gradient-to-b
          from-white/[0.22]
          via-white/[0.04]
          to-transparent
        "
        aria-hidden="true"
      />

      {/* ==================================================
          SOFT INNER GLOW
          ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-[1px]
          rounded-full
          border
          border-white/[0.18]
        "
        aria-hidden="true"
      />

      {/* ==================================================
          MICROPHONE
          ================================================== */}

      <button
        type="button"
        onClick={onToggleMic}
        aria-label={
          micMuted
            ? "Unmute microphone"
            : "Mute microphone"
        }
        aria-pressed={micMuted}
        className={`
          relative
          z-10
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          transition-all
          duration-200

          ${
            micMuted
              ? `
                border-danger/20
                bg-danger-soft/55
                text-danger
                shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
              `
              : `
                border-white/40
                bg-white/[0.16]
                text-primary-deep
                shadow-[0_6px_20px_rgba(72,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]
                backdrop-blur-xl
              `
          }

          hover:bg-white/[0.25]
          hover:border-white/55
          hover:shadow-[0_8px_24px_rgba(72,55,110,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]

          active:scale-95
        `}
      >
        <MicIcon muted={micMuted} />
      </button>

      {/* ==================================================
          CAMERA
          ================================================== */}

      <button
        type="button"
        onClick={onToggleCamera}
        aria-label={
          cameraOff
            ? "Turn camera on"
            : "Turn camera off"
        }
        aria-pressed={cameraOff}
        className={`
          relative
          z-10
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          transition-all
          duration-200

          ${
            cameraOff
              ? `
                border-danger/20
                bg-danger-soft/55
                text-danger
                shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
              `
              : `
                border-white/40
                bg-white/[0.16]
                text-primary-deep
                shadow-[0_6px_20px_rgba(72,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]
                backdrop-blur-xl
              `
          }

          hover:bg-white/[0.25]
          hover:border-white/55
          hover:shadow-[0_8px_24px_rgba(72,55,110,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]

          active:scale-95
        `}
      >
        <CameraIcon off={cameraOff} />
      </button>

      {/* ==================================================
          SEPARATOR
          ================================================== */}

      <div
        className="
          relative
          z-10
          h-6
          w-px
          bg-white/20
        "
        aria-hidden="true"
      />

      {/* ==================================================
          END CHECK-IN
          ================================================== */}

      <button
        type="button"
        onClick={onEnd}
        className="
          relative
          z-10
          flex
          h-10
          items-center
          justify-center
          rounded-full
          border
          border-white/30
          bg-white/[0.10]
          px-4
          text-sm
          font-medium
          text-danger
          shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]
          backdrop-blur-xl
          transition-all
          duration-200

          hover:border-danger/20
          hover:bg-danger-soft/35
          hover:shadow-[0_6px_20px_rgba(72,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.55)]

          active:scale-[0.98]
        "
      >
        End check-in
      </button>
    </motion.div>
  );
}