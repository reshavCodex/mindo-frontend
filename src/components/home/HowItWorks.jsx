import { motion } from "framer-motion";
import SectionTint from "../ui/SectionTint";

const steps = [
  {
    time: "0:00",
    title: "Set up in seconds",
    body: "Create a private 4-digit PIN and pick an AI counsellor and language.",
    icon: "🔐",
  },
  {
    time: "1:00",
    title: "Talk it through",
    body: "A short video or chat conversation — camera and mic optional, your call.",
    icon: "💬",
  },
  {
    time: "4:00",
    title: "AI reads the signals",
    body: "Facial expression trends and conversation content are analyzed together.",
    icon: "🧠",
  },
  {
    time: "5:00",
    title: "Get your summary",
    body: "A wellness report with mood insights, coping activities, and next steps.",
    icon: "📋",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <SectionTint />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-wide text-primary-deep">
            The flow
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink">
            How a session flows
          </h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            Every screening follows the same short, predictable arc — so
            there's never any guessing about what happens next.
          </p>
        </motion.div>

        <div className="relative mt-16">
          {/* Connecting line behind the nodes (desktop only) */}
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block"
            aria-hidden="true"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
              className="h-full origin-left bg-gradient-primary"
            />
          </div>

          <div className="grid gap-10 md:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i + 1}
                variants={fadeUp}
                className="relative"
              >
                {/* Node */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg shadow-soft">
                  <span aria-hidden="true">{s.icon}</span>
                </div>

                <div className="mt-4 font-mono text-xs text-primary-deep">
                  {s.time}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}