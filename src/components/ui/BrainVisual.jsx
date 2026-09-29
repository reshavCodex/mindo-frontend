import { motion } from "framer-motion";

/**
 * Reusable AI-brain visual — inline SVG so there's no external asset to
 * license or load. Styled after the Mindo logo's purple gradient +
 * neural-node motif. Used in Hero and DashboardPreview.
 *
 * Props:
 *  - size: pixel size of the square viewport (default 320)
 *  - animated: enables idle float + glow pulse (default true)
 *  - className: extra classes on the wrapper
 */
export default function BrainVisual({ size = 320, animated = true, className = "" }) {
  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? {
        animate: { y: [0, -14, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      }
    : {};

  return (
    <Wrapper
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...wrapperProps}
    >
      {/* Ambient glow behind the brain */}
      <div
        className="absolute rounded-full bg-gradient-primary opacity-40 blur-3xl animate-breathe"
        style={{ width: size * 0.75, height: size * 0.75 }}
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="relative drop-shadow-[0_20px_40px_rgba(91,79,207,0.35)]"
      >
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8AEF2" />
            <stop offset="55%" stopColor="#8B7FE8" />
            <stop offset="100%" stopColor="#5B4FCF" />
          </linearGradient>
          <linearGradient id="brainGradientSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1ECFB" />
            <stop offset="100%" stopColor="#D9D0F7" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#B8AEF2" />
          </radialGradient>
        </defs>

        {/* Brain silhouette — two hemispheres, simplified organic shape */}
        <g>
          <path
            d="M200 60
               C 130 60 90 110 88 165
               C 60 175 45 205 55 235
               C 40 250 42 280 65 295
               C 62 320 85 340 115 338
               C 125 358 155 365 180 352
               C 195 360 210 360 200 340
               C 210 355 235 352 240 335
               C 265 345 290 328 288 302
               C 312 292 320 262 302 240
               C 315 215 305 182 278 168
               C 275 115 245 60 200 60 Z"
            fill="url(#brainGradient)"
          />
          {/* Center fissure line for brain detail */}
          <path
            d="M200 70 C 190 130 195 200 200 260 C 203 300 198 325 195 345"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Soft highlight lobe */}
          <path
            d="M120 150 C 100 175 95 210 110 235 C 100 255 108 280 130 285"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Neural network overlay — echoes the logo's node/constellation motif */}
        <g stroke="#F1ECFB" strokeOpacity="0.9" strokeWidth="1.5">
          <line x1="200" y1="120" x2="165" y2="155" />
          <line x1="165" y1="155" x2="200" y2="190" />
          <line x1="200" y1="190" x2="235" y2="155" />
          <line x1="235" y1="155" x2="200" y2="120" />
          <line x1="200" y1="190" x2="200" y2="235" />
          <line x1="165" y1="155" x2="140" y2="200" />
          <line x1="235" y1="155" x2="260" y2="200" />
        </g>
        <g fill="url(#nodeGlow)">
          <circle cx="200" cy="120" r="6" />
          <circle cx="165" cy="155" r="5" />
          <circle cx="235" cy="155" r="5" />
          <circle cx="200" cy="190" r="6" />
          <circle cx="200" cy="235" r="5" />
          <circle cx="140" cy="200" r="4" />
          <circle cx="260" cy="200" r="4" />
        </g>
      </svg>

      {/* Small orbiting pulse dot, purely decorative */}
      {animated && (
        <motion.span
          className="absolute h-3 w-3 rounded-full bg-accent shadow-glow"
          style={{ top: "18%", right: "20%" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
    </Wrapper>
  );
}