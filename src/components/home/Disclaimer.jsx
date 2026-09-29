import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Disclaimer() {
  return (
    <section id="disclaimer" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-line bg-gradient-card p-10 text-center shadow-lift"
      >
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-primary opacity-20 blur-3xl"
          aria-hidden="true"
        />

        <h2 className="relative font-display text-2xl font-bold text-ink">
          Ready when you are
        </h2>

        <p className="relative mx-auto mt-3 max-w-xl text-sm text-ink-soft">
          Mindo is a wellness screening and awareness tool. It is not a
          substitute for care from a qualified professional. If you're in
          crisis, please contact local emergency services immediately.
        </p>

        <Link
          to="/login"
          className="group relative mt-6 inline-flex items-center overflow-hidden rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition-[box-shadow,transform] duration-300 hover:scale-[1.04] hover:shadow-glow active:scale-[0.98]"
        >
          <span className="relative z-10">Get started</span>

          <span
            className="absolute inset-0 shimmer-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        </Link>
      </motion.div>
    </section>
  );
}