import { motion } from "framer-motion";
import EmptyStateCard from "./EmptyStateCard";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16,
  },

  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: "easeOut",
    },
  }),
};

function RecommendationItem({ recommendation, index }) {
  return (
    <motion.li
      initial={{
        opacity: 0,
        x: -6,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.35,
        delay: 0.16 + index * 0.08,
        ease: "easeOut",
      }}
      className="group flex gap-3 border-b border-white/35 py-3 last:border-b-0 last:pb-0"
    >
      {/* Recommendation marker */}
      <span
        className="mt-[7px] flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80 transition-transform duration-300 group-hover:scale-125"
        aria-hidden="true"
      />

      {/* Recommendation text */}
      <p className="min-w-0 text-xs leading-5 text-ink-soft transition-colors duration-300 group-hover:text-ink md:text-sm md:leading-6">
        {recommendation}
      </p>
    </motion.li>
  );
}

export default function InsightCard({
  insight,
  hasHistory,
  index = 0,
}) {
  const recommendations = Array.isArray(
    insight?.recommendations
  )
    ? insight.recommendations.filter(
        (recommendation) =>
          typeof recommendation === "string" &&
          recommendation.trim().length > 0
      )
    : [];

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      custom={index}
      variants={fadeUp}
      className="relative"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            From your latest check-in
          </p>

          {insight?.assessmentCategory && (
            <>
              <span
                className="h-1 w-1 rounded-full bg-primary/35"
                aria-hidden="true"
              />

              <span className="max-w-[115px] truncate font-mono text-[8px] uppercase tracking-[0.08em] text-primary-deep/70">
                {insight.assessmentCategory}
              </span>
            </>
          )}
        </div>

        <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
          Your next steps
        </h2>

        <p className="mt-1.5 text-xs leading-5 text-ink-soft">
          Practical suggestions based on your most recent
          session.
        </p>
      </div>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}
      {hasHistory ? (
        recommendations.length > 0 ? (
          <ul className="divide-y-0">
            {recommendations
              .slice(0, 3)
              .map((recommendation, recommendationIndex) => (
                <RecommendationItem
                  key={`${recommendation}-${recommendationIndex}`}
                  recommendation={recommendation}
                  index={recommendationIndex}
                />
              ))}
          </ul>
        ) : (
          <div className="border-t border-white/35 pt-3">
            <p className="text-xs leading-5 text-ink-soft">
              Your latest check-in is complete. More
              personalized recommendations will appear here
              when available.
            </p>
          </div>
        )
      ) : (
        <EmptyStateCard
          icon="✦"
          title="Your first insight is waiting"
          body="Complete a check-in and MINDO will surface practical next steps based on your session."
          compact
        />
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}
      {hasHistory && insight?.assessmentCategory && (
        <div className="mt-4 flex items-center gap-2 border-t border-white/35 pt-3">
          <span
            className="h-1 w-1 rounded-full bg-primary/45"
            aria-hidden="true"
          />

          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft/50">
            Based on your latest session
          </span>
        </div>
      )}
    </motion.section>
  );
}