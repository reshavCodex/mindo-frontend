import { motion } from "framer-motion";

const layers = [
  {
    label: "Facial analysis",
    name: "Vision model",
    body: "Reads expression trends from your video — not identity, not recording — to track mood shifts across the conversation.",
    icon: "👁️",
  },
  {
    label: "Grounded knowledge",
    name: "Retrieval",
    body: "Pulls from established mental-wellness guidelines so advice stays evidence-based, not improvised.",
    icon: "📚",
  },
  {
    label: "Conversation",
    name: "Language model",
    body: "Asks adaptive follow-up questions and responds with context, the way a thoughtful listener would.",
    icon: "💭",
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

export default function TechOverview() {
  return (
    <section id="technology" className="relative px-6 py-24">
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
            Under the hood
          </span>

          <h2 className="mt-3 font-display text-3xl font-bold text-ink">
            What&apos;s actually reading you
          </h2>

          <p className="mt-3 max-w-xl text-ink-soft">
            Three systems work together during your session. Here&apos;s what
            each one does, in plain terms.
          </p>
        </motion.div>

        {/* Technology Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.name}
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
              className="glass-panel glass-hover group relative overflow-hidden rounded-2xl p-6"
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

              {/* Primary ambient glow */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/25 opacity-40 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-70"
                aria-hidden="true"
              />

              {/* Secondary ambient glow */}
              <div
                className="pointer-events-none absolute -bottom-20 -left-16 h-32 w-32 rounded-full bg-accent/15 opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                aria-hidden="true"
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-lg shadow-soft">
                  <span aria-hidden="true">{layer.icon}</span>
                </div>

                <span className="mt-4 block font-mono text-xs uppercase tracking-wide text-primary-deep">
                  {layer.label}
                </span>

                <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                  {layer.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {layer.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={4}
          variants={fadeUp}
          className="mt-8 text-sm text-ink-soft"
        >
          These signals are combined into a single wellness score and risk
          level — never used to label or diagnose you.
        </motion.p>
      </div>
    </section>
  );
}