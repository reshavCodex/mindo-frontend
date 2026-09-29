import { motion } from "framer-motion";

/**
 * EmptyStateCard
 * ---------------
 * Shared "nothing here yet" surface used across the dashboard (wellness
 * snapshot, trend area, recent check-ins) for first-time users. Deliberately
 * calm and inviting rather than a bare "No data" label — this is often the
 * very first thing a brand-new user sees right after signing up.
 *
 * Props:
 *  - icon: small emoji/glyph shown above the copy.
 *  - title: short headline (e.g. "No check-ins yet").
 *  - body: one supporting sentence.
 *  - compact: tighter padding, for use inside smaller card slots.
 */
export default function EmptyStateCard({ icon = "🌱", title, body, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "gap-2 py-6" : "gap-3 py-10"
      }`}
    >
      <motion.span
        className="animate-icon-float text-3xl"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.span>

      <p className="font-display text-sm font-semibold text-ink">{title}</p>

      {body && (
        <p className="max-w-[26ch] text-xs text-ink-soft">{body}</p>
      )}
    </div>
  );
}