import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
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

const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 22,
  mass: 0.7,
};

const MotionLink = motion(Link);

function ActionIcon({ type }) {
  if (type === "video") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="13"
          height="14"
          rx="2"
        />
        <path d="m16 10 5-3v10l-5-3" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.1-.9L3 20l1.1-4.5A8.2 8.2 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
      <path d="M8 11h.01" />
      <path d="M12 11h.01" />
      <path d="M16 11h.01" />
    </svg>
  );
}

function ActionButton({
  to,
  type,
  title,
  description,
}) {
  return (
    <MotionLink
      to={to}
      whileHover={{
        y: -2,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={SPRING}
      className="
        group
        relative
        isolate
        flex
        min-h-[74px]
        w-full
        items-center
        overflow-hidden
        rounded-full
        border
        border-white/15
        bg-gradient-primary
        px-4
        py-3
        text-white
        shadow-[0_12px_32px_-16px_rgba(91,79,207,0.72)]
        transition-[box-shadow,border-color]
        duration-500
        hover:border-white/25
        hover:shadow-[0_18px_42px_-16px_rgba(91,79,207,0.88)]
        md:min-h-[78px]
        md:px-5
      "
    >
      {/* Soft ambient glow */}
      <motion.span
        className="
          pointer-events-none
          absolute
          -right-10
          -top-12
          h-28
          w-28
          rounded-full
          bg-white/15
          blur-3xl
        "
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* Hover sheen */}
      <motion.span
        className="
          pointer-events-none
          absolute
          inset-y-0
          -left-1/2
          w-1/3
          skew-x-[-18deg]
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
          opacity-0
          blur-sm
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        animate={{
          x: ["0%", "420%"],
        }}
        transition={{
          duration: 1.15,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 3,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex min-w-0 w-full items-center gap-3">
        {/* Icon */}
        <motion.span
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/12
            text-white/95
            backdrop-blur-sm
          "
          whileHover={{
            scale: 1.08,
          }}
          transition={SPRING}
        >
          <ActionIcon type={type} />

          <motion.span
            className="
              absolute
              ml-7
              mt-[-27px]
              h-1.5
              w-1.5
              rounded-full
              bg-white/85
            "
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.85, 1.1, 0.85],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />
        </motion.span>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold tracking-tight md:text-base">
            {title}
          </h3>

          <p className="mt-0.5 truncate text-[10px] leading-4 text-white/68 md:text-[11px]">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <motion.span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/10
            text-sm
            text-white/90
            transition-colors
            duration-300
            group-hover:bg-white/15
          "
          whileHover={{
            scale: 1.08,
          }}
          transition={SPRING}
          aria-hidden="true"
        >
          <motion.span
            className="inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={SPRING}
          >
            →
          </motion.span>
        </motion.span>
      </div>
    </MotionLink>
  );
}

export default function CheckInCTA({ index = 0 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={index}
      variants={fadeUp}
      className="flex w-full flex-col gap-2.5"
    >
      <ActionButton
        to="/screening"
        type="video"
        title="Start your screening"
        description="Talk with Mindo through a video check-in."
      />

      <ActionButton
        to="/chat"
        type="chat"
        title="Chat with Mindo"
        description="Reflect, ask questions, or talk things through."
      />
    </motion.div>
  );
}