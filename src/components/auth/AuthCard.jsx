import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Brain3D from "../ui/Brain3D";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

/**
 * AuthCard
 * --------
 * Shared visual shell for the Login and Signup pages. Both pages
 * differ only in their form fields/copy passed as children/props —
 * the surrounding chrome (glass panel, brain accent, heading rhythm,
 * footer link) is identical, matching the homepage's premium
 * aesthetic via existing tokens only (.glass-panel, shadow-glass,
 * bg-gradient-primary, font-display/font-body) — nothing new.
 *
 * Props:
 *  - eyebrow: small mono label above the heading (e.g. "Welcome back").
 *  - title: main heading text.
 *  - subtitle: optional supporting line under the heading.
 *  - children: the form itself.
 *  - footerText / footerLinkText / footerLinkTo: the cross-link at the
 *    bottom (e.g. "Don't have an account? Sign up").
 */
export default function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center px-6 py-16 scroll-mt-20">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="glass-panel w-full max-w-md rounded-3xl p-8 md:p-10"
      >
        <div className="mx-auto -mt-2 mb-1 flex justify-center">
          <Brain3D size={130} modelScale={0.86} />
        </div>

        <motion.span
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="block text-center font-mono text-xs uppercase tracking-wide text-primary-deep"
        >
          {eyebrow}
        </motion.span>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="mt-2 text-center font-display text-2xl font-bold text-ink"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="mt-2 text-center text-sm text-ink-soft"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeUp}
          className="mt-8"
        >
          {children}
        </motion.div>

        {footerText && (
          <motion.p
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
            className="mt-6 text-center text-sm text-ink-soft"
          >
            {footerText}{" "}
            <Link
              to={footerLinkTo}
              className="story-link font-medium text-primary-deep"
            >
              {footerLinkText}
            </Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}