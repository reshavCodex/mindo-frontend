import { motion } from "framer-motion";
import Brain3D from "../ui/Brain3D";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" },
  }),
};

const chipFade = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.3 + i * 0.12, ease: "easeOut" },
  }),
};

const lineDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.7, delay: 0.25 + i * 0.12, ease: "easeInOut" },
  }),
};

/**
 * Floating metric chip — deliberately not a bordered card: subtle
 * glass only, sized to content, no rounded-2xl "tile" feeling.
 */
function MetricChip({ label, status, value, unit, icon, hasHistory, className = "", delay = 0 }) {
  return (
    <motion.div
      custom={delay}
      variants={chipFade}
      className={`glass-panel absolute rounded-2xl px-4 py-3 shadow-glass ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        <span className="text-xs text-ink-soft">{label}</span>
        <span className="text-base text-primary-deep" aria-hidden="true">
          {icon}
        </span>
      </div>

      <div className="mt-1.5 text-xs text-ink-soft">
        {hasHistory ? (
          <>
            Status: <span className="text-ink">{status}</span>
          </>
        ) : (
          <span className="italic text-ink-soft/80">{status}</span>
        )}
      </div>

      <div className="mt-0.5 font-display text-xl font-semibold text-ink">
        {hasHistory ? value : "—"}
        {hasHistory && unit && (
          <span className="ml-1 text-sm font-normal text-ink-soft">{unit}</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Same metric, laid out as a plain stacked row for mobile — no
 * absolute positioning, no connector lines, same visual language.
 */
function MetricRow({ label, status, value, unit, icon, hasHistory }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="text-base text-primary-deep" aria-hidden="true">
          {icon}
        </span>
        <span className="text-sm text-ink-soft">{label}</span>
      </div>
      <div className="text-right">
        <div className="font-display text-base font-semibold text-ink">
          {hasHistory ? value : "—"}
          {hasHistory && unit && (
            <span className="ml-1 text-xs font-normal text-ink-soft">{unit}</span>
          )}
        </div>
        <div className="text-[11px] text-ink-soft">
          {hasHistory ? status : "Awaiting first check-in"}
        </div>
      </div>
    </div>
  );
}

/**
 * WellnessSnapshot
 * -----------------
 * Brain-centered composition: Brain3D as the visual anchor, with
 * Mood / Stress / Focus floating around it as connected chips
 * (desktop) or a plain stacked list beneath a smaller brain (mobile).
 *
 * `hasHistory` never swaps out the whole layout — only whether each
 * chip shows a real value or an intentional "—" / "Awaiting first
 * check-in" empty state. This keeps the composition stable once real
 * session data starts flowing in.
 */
export default function WellnessSnapshot({ snapshot, hasHistory, startIndex = 0 }) {
  const mood = {
    label: "Mood",
    icon: "🙂",
    status: hasHistory ? snapshot.mood.status : "Awaiting first check-in",
    value: snapshot?.mood?.value,
    unit: snapshot?.mood?.unit,
  };
  const stress = {
    label: "Stress",
    icon: "🧘",
    status: hasHistory ? snapshot.stress.status : "Awaiting first check-in",
    value: snapshot?.stress?.value,
    unit: snapshot?.stress?.unit,
  };
  const focus = {
    label: "Focus",
    icon: "✨",
    status: hasHistory ? snapshot.focus.status : "Awaiting first check-in",
    value: snapshot?.focus?.value,
    unit: snapshot?.focus?.unit,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={startIndex}
      variants={fadeUp}
      className="relative"
    >
      {/* Desktop: brain-centered composition with floating connected chips */}
      <div className="relative hidden min-h-[460px] items-center justify-center md:flex">
        {/* Connector lines — percentage-based viewBox so they track the
            chip positions below regardless of container width. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 20 18 L 47 42"
            stroke="#8B7FE8"
            strokeWidth="0.15"
            fill="none"
            vectorEffect="non-scaling-stroke"
            custom={0}
            variants={lineDraw}
          />
          <motion.path
            d="M 82 24 L 56 44"
            stroke="#8B7FE8"
            strokeWidth="0.15"
            fill="none"
            vectorEffect="non-scaling-stroke"
            custom={1}
            variants={lineDraw}
          />
          <motion.path
            d="M 16 78 L 45 58"
            stroke="#8B7FE8"
            strokeWidth="0.15"
            fill="none"
            vectorEffect="non-scaling-stroke"
            custom={2}
            variants={lineDraw}
          />
        </svg>

        {/* Brain — the centerpiece, nudged slightly right of center for
            intentional asymmetry rather than perfect symmetry. */}
        <div className="relative left-[4%]">
          <Brain3D size={420} modelScale={0.85} />
        </div>

        <MetricChip
          {...mood}
          hasHistory={hasHistory}
          delay={0}
          className="left-[2%] top-[10%] w-44"
        />
        <MetricChip
          {...stress}
          hasHistory={hasHistory}
          delay={1}
          className="right-[4%] top-[16%] w-44"
        />
        <MetricChip
          {...focus}
          hasHistory={hasHistory}
          delay={2}
          className="bottom-[10%] left-[0%] w-44"
        />
      </div>

      {/* Mobile: smaller centered brain, metrics as a plain stacked list */}
      <div className="flex flex-col items-center gap-6 md:hidden">
        <Brain3D size={220} modelScale={0.85} />
        <div className="w-full">
          <MetricRow {...mood} hasHistory={hasHistory} />
          <MetricRow {...stress} hasHistory={hasHistory} />
          <MetricRow {...focus} hasHistory={hasHistory} />
        </div>
      </div>
    </motion.div>
  );
}