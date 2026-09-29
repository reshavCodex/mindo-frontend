import { motion } from "framer-motion";
import SectionTint from "../ui/SectionTint";

const points = [
  "Video is processed for emotion signals in real time and is not stored by default.",
  "Your PIN and session data stay tied to your account, never shared or sold.",
  "You can delete your session history and reports at any time.",
  "Sensitive conversations are never used to train shared models.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function PrivacySection() {
  return (
    <section id="privacy" className="relative px-6 py-24">
      <SectionTint />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-wide text-primary-deep">
            Privacy first
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink">
            Your data stays yours
          </h2>
          <p className="mt-3 max-w-md text-ink-soft">
            Wellness data is sensitive. We designed Mindo so that being
            honest with it never feels risky.
          </p>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-4"
        >
          {points.map((p, i) => (
            <motion.li
              key={p}
              custom={i + 1}
              variants={fadeUp}
              whileHover={{
                y: -3,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
              className="glass-panel glass-hover flex gap-3 rounded-2xl p-4 text-sm text-ink-soft"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] text-white">
                ✓
              </span>
              {p}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}