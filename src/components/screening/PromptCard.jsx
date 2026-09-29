import { AnimatePresence, motion } from "framer-motion";

export default function PromptCard({ question }) {
  if (!question) return null;

  return (
    <div className="glass-panel relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl p-6 text-center md:p-8">
      <span className="font-mono text-xs uppercase tracking-wide text-primary-deep">
        {question.phaseLabel}
      </span>

      <div className="relative mt-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={question.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="font-display text-xl font-semibold text-ink md:text-2xl"
          >
            {question.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}