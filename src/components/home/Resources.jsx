import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionTint from "../ui/SectionTint";

const resources = [
  {
    title: "Understanding stress vs. anxiety",
    tag: "Guide",
    icon: "🌊",
  },
  {
    title: "Building a 5-minute grounding routine",
    tag: "Practice",
    icon: "🌿",
  },
  {
    title: "When to talk to a professional",
    tag: "Guide",
    icon: "🤝",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: "easeOut",
    },
  }),
};

export default function Resources() {
  return (
    <section id="resources" className="relative px-6 py-24">
      <SectionTint />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-wide text-primary-deep">
            Keep exploring
          </span>

          <h2 className="mt-3 font-display text-3xl font-bold text-ink">
            Resources
          </h2>

          <p className="mt-3 max-w-xl text-ink-soft">
            Short reads to explore between sessions.
          </p>
        </motion.div>

        {/* Resource Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={index + 1}
              variants={fadeUp}
              whileHover={{
                y: -5,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <Link
                to="/resources"
                className="glass-panel glass-hover group relative block overflow-hidden rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
                  border: "1px solid rgba(255,255,255,0.48)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.12), 0 12px 40px rgba(91,79,207,0.10)",
                }}
              >
                {/* Glass reflection */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70"
                  aria-hidden="true"
                />

                {/* Ambient purple glow */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/25 opacity-40 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-70"
                  aria-hidden="true"
                />

                {/* Secondary glow */}
                <div
                  className="pointer-events-none absolute -bottom-20 -left-16 h-32 w-32 rounded-full bg-accent/15 opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-lg shadow-soft">
                    <span aria-hidden="true">{resource.icon}</span>
                  </div>

                  <span className="mt-4 block font-mono text-xs uppercase tracking-wide text-primary-deep">
                    {resource.tag}
                  </span>

                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {resource.title}
                  </h3>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-deep">
                    Read
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}