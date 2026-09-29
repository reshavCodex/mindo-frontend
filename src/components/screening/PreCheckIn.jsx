import { motion } from "framer-motion";
import Button from "../ui/Button";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 14,
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

const informationItems = [
  {
    icon: "◉",
    title: "Real-time conversation",
    text: "Talk naturally with your AI wellness companion. It listens to what you say and responds during the session.",
  },
  {
    icon: "⌁",
    title: "Voice & facial signals",
    text: "With microphone and camera access, MINDO can use speech and facial-expression signals as part of your wellness assessment.",
  },
  {
    icon: "∞",
    title: "Go at your own pace",
    text: "There is no fixed session duration. Take as much time as you need and end the check-in whenever you are ready.",
  },
];

const beforeYouBegin = [
  "Allow microphone access so MINDO can hear your conversation.",
  "Allow camera access for facial-expression analysis during the session.",
  "For the best experience, use a reasonably quiet and well-lit space.",
  "You remain in control and can mute your microphone or turn off your camera during the session.",
];

export default function PreCheckIn({ onBegin }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col px-6 py-6 text-center lg:px-10 lg:py-7">
      {/* ==================================================
          HERO
          ================================================== */}

      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="flex flex-col items-center"
      >
        <span
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-white/55
            bg-white/[0.16]
            px-3.5
            py-1.5
            text-[11px]
            font-medium
            tracking-wide
            text-primary-deep
            shadow-[0_8px_25px_rgba(72,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.65)]
            backdrop-blur-xl
            backdrop-saturate-150
          "
        >
          AI wellness screening · not a diagnosis
        </span>

        <h1
          className="
            mt-3
            max-w-3xl
            font-display
            text-3xl
            font-bold
            leading-[1.05]
            tracking-tight
            text-ink
            md:text-4xl
            lg:text-[46px]
          "
        >
          Take a breath.
          <br />
          <span className="text-gradient">Let's check in.</span>
        </h1>

        <p
          className="
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-ink-soft
            md:text-base
          "
        >
          MINDO is about having a natural conversation and reflecting on how
          you're doing. Before you begin, here's what the session involves.
        </p>
      </motion.div>

      {/* ==================================================
          SESSION FEATURES
          ================================================== */}

      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="
          mt-6
          grid
          w-full
          gap-3
          md:grid-cols-3
        "
      >
        {informationItems.map((item) => (
          <div
            key={item.title}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/50
              bg-white/[0.10]
              px-5
              py-4
              text-left
              shadow-[0_12px_35px_rgba(72,55,110,0.07),inset_0_1px_0_rgba(255,255,255,0.62)]
              backdrop-blur-[24px]
              backdrop-saturate-150
              transition-all
              duration-300
              hover:bg-white/[0.15]
              hover:shadow-[0_16px_40px_rgba(72,55,110,0.10),inset_0_1px_0_rgba(255,255,255,0.7)]
            "
          >
            {/* Soft glass highlight */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-16
                bg-gradient-to-b
                from-white/[0.16]
                to-transparent
              "
              aria-hidden="true"
            />

            <div className="relative flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/45
                  bg-primary/[0.10]
                  text-sm
                  text-primary-deep
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]
                  backdrop-blur-md
                "
              >
                {item.icon}
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    font-display
                    text-sm
                    font-semibold
                    text-ink
                  "
                >
                  {item.title}
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-ink-soft
                  "
                >
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ==================================================
          BEFORE YOU BEGIN
          ================================================== */}

      <motion.section
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fadeUp}
        className="
          mt-5
          w-full
          rounded-2xl
          border
          border-white/45
          bg-white/[0.07]
          px-5
          py-4
          text-left
          shadow-[0_12px_35px_rgba(72,55,110,0.05),inset_0_1px_0_rgba(255,255,255,0.55)]
          backdrop-blur-[22px]
          backdrop-saturate-150
          md:px-6
        "
      >
        <div className="flex items-center justify-between">
          <h2
            className="
              font-display
              text-base
              font-semibold
              text-ink
            "
          >
            Before you begin
          </h2>

          <span
            className="
              hidden
              rounded-full
              border
              border-white/45
              bg-white/[0.10]
              px-2.5
              py-1
              text-[10px]
              font-medium
              tracking-wide
              text-ink-soft
              backdrop-blur-md
              sm:inline-flex
            "
          >
            Quick setup
          </span>
        </div>

        <div className="mt-3 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
          {beforeYouBegin.map((item) => (
            <div
              key={item}
              className="
                flex
                items-start
                gap-2.5
                text-xs
                leading-5
                text-ink-soft
              "
            >
              <span
                className="
                  mt-[2px]
                  flex
                  h-4
                  w-4
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary/[0.12]
                  text-[10px]
                  font-semibold
                  text-primary-deep
                "
              >
                ✓
              </span>

              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ==================================================
          BOTTOM ACTION AREA
          ================================================== */}

      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={fadeUp}
        className="
          mt-auto
          flex
          flex-col
          items-center
          pt-5
        "
      >
        {/* Safety notice */}

        <p
          className="
            max-w-3xl
            text-center
            text-[10px]
            leading-4
            text-ink-soft/75
            md:text-[11px]
          "
        >
          <span className="font-semibold text-ink">
            Important:
          </span>{" "}
          MINDO provides wellness support and reflection. It is not a medical
          diagnosis, medical treatment, or emergency service. If you are in
          immediate danger or need urgent help, contact appropriate emergency
          or professional services.
        </p>

        {/* CTA */}

        <div className="mt-4 flex flex-col items-center">
          <Button
            variant="primary"
            onClick={onBegin}
          >
            Begin Check-in
          </Button>

          <p className="mt-2 text-[10px] text-ink-soft/65">
            No fixed session duration · End whenever you're ready
          </p>
        </div>
      </motion.div>
    </div>
  );
}