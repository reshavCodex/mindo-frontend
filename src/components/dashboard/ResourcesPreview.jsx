import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: "easeOut",
    },
  }),
};

const resources = [
  {
    title: "Understanding stress vs. anxiety",
    tag: "Guide",
  },
  {
    title: "Building a grounding routine",
    tag: "Practice",
  },
  {
    title: "When to talk to a professional",
    tag: "Guide",
  },
];

export default function ResourcesPreview({ index = 0 }) {
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
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            Explore
          </p>

          <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
            Resources
          </h2>
        </div>

        <Link
          to="/#resources"
          className="group flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-primary-deep transition-colors duration-300 hover:text-primary"
        >
          <span>View all</span>

          <span
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>

      {/* =====================================================
          RESOURCE LIST
      ===================================================== */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/15 backdrop-blur-sm">
        {resources.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{
              opacity: 0,
              x: -8,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.12 + i * 0.07,
              duration: 0.35,
              ease: "easeOut",
            }}
          >
            <Link
              to="/#resources"
              className={`group flex min-h-[62px] items-center gap-3 px-3.5 py-3 transition-all duration-300 hover:bg-white/30 ${
                i === resources.length - 1
                  ? ""
                  : "border-b border-white/35"
              }`}
            >
              {/* Index */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/45 font-mono text-[9px] text-ink-soft/70 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary-deep">
                0{i + 1}
              </span>

              {/* Title */}
              <span className="min-w-0 flex-1 text-xs leading-5 text-ink transition-colors duration-300 group-hover:text-primary-deep">
                {item.title}
              </span>

              {/* Tag */}
              <span className="hidden shrink-0 rounded-full bg-white/50 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-ink-soft/65 transition-colors duration-300 group-hover:bg-primary/8 group-hover:text-primary-deep sm:inline-flex">
                {item.tag}
              </span>

              {/* Arrow */}
              <span
                className="shrink-0 text-xs text-ink-soft/45 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-deep"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-1 w-1 rounded-full bg-primary/50"
          aria-hidden="true"
        />

        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft/50">
          Curated for your wellbeing
        </span>
      </div>
    </motion.section>
  );
}