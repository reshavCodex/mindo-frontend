import { motion } from "framer-motion";

export default function SessionProgress({ phases, currentPhaseIndex }) {
  const progressPercent =
    phases.length <= 1 ? 100 : (currentPhaseIndex / (phases.length - 1)) * 100;

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute left-0 right-0 top-3 h-px bg-line" aria-hidden="true">
        <motion.div
          className="h-full origin-left bg-gradient-primary"
          animate={{ scaleX: progressPercent / 100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex justify-between">
        {phases.map((phase, index) => {
          const isDone = index < currentPhaseIndex;
          const isActive = index === currentPhaseIndex;

          return (
            <div key={phase.id} className="flex flex-col items-center gap-2 text-center">
              <motion.span
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isDone || isActive ? "#5B4FCF" : "#E4DEF5",
                }}
                transition={{ duration: 0.4 }}
                className="h-2.5 w-2.5 rounded-full"
              />
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  isActive ? "text-primary-deep" : "text-ink-soft"
                }`}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}