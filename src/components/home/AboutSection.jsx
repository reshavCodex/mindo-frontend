import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-10 blur-3xl"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel relative mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-10"
      >
        <span className="font-mono text-xs uppercase tracking-wide text-primary-deep">
          Our why
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink">
          Why we built Mindo
        </h2>
        <p className="mt-4 text-ink-soft">
          Most people never get a low-friction way to check in on how
          they're doing emotionally. Mindo isn't a replacement for therapy
          or a clinician — it's a first, honest checkpoint that helps you
          notice patterns and decide what to do next, on your own time.
        </p>
      </motion.div>
    </section>
  );
}