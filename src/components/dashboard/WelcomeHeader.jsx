import { motion } from "framer-motion";

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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function WelcomeHeader({
  name,
  hasHistory,
  index = 0,
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={index}
      variants={fadeUp}
      className="max-w-xl"
    >
      {/* =====================================================
          EYEBROW
      ===================================================== */}
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary-deep">
        {hasHistory ? "Welcome back" : "Your MINDO space"}
      </span>

      {/* =====================================================
          GREETING
      ===================================================== */}
      <h1 className="mt-2.5 max-w-xl font-display text-[2.65rem] leading-[1.02] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.35rem]">
        <span className="font-normal text-ink-soft">
          {getGreeting()}
        </span>

        {name ? (
          <>
            <span className="font-normal text-ink-soft">,</span>{" "}
            <span className="font-semibold text-ink">
              {name}
            </span>
          </>
        ) : (
          <span className="font-normal text-ink-soft">.</span>
        )}
      </h1>

      {/* =====================================================
          SUPPORTING COPY
      ===================================================== */}
      <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft md:text-[15px]">
        {hasHistory
          ? "Your recent check-ins, observations, and next steps — all in one place."
          : "A private space to check in with yourself, reflect, and take things one step at a time."}
      </p>
    </motion.div>
  );
}