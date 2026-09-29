import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Brain3D from "../ui/Brain3D";

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
      delay: i * 0.08,
      ease: "easeOut",
    },
  }),
};

const previewData = {
  checkIns: 5,

  activity: [
    { day: "06 Aug", active: true },
    { day: "09 Aug", active: true },
    { day: "12 Aug", active: true },
    { day: "16 Aug", active: true },
    { day: "20 Aug", active: true },
  ],

  category: "STRESS_SUPPORT",

  recommendations: [
    "Try setting aside a few quiet minutes each evening to slow down and reset before the next day.",
    "Consider keeping a simple routine around sleep, movement, and regular breaks when your schedule feels demanding.",
  ],

  checkInHistory: [
    {
      date: "20 Aug 2026",
      time: "6:18 pm",
      category: "STRESS_SUPPORT",
    },
  ],
};

function ActivityChart({ points }) {
  const width = 560;
  const height = 100;
  const paddingX = 12;
  const centerY = 36;
  const usableWidth = width - paddingX * 2;

  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX +
          (index / (points.length - 1)) * usableWidth;

    return {
      x,
      y: centerY,
    };
  });

  const linePath = coords
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`
    )
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Check-in activity"
      >
        <line
          x1={paddingX}
          y1={centerY}
          x2={width - paddingX}
          y2={centerY}
          stroke="rgba(91,79,207,0.10)"
          strokeWidth="1"
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="#8B7FE8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 7"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          whileInView={{
            pathLength: 1,
            opacity: 0.7,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
          }}
        />

        {points.map((point, index) => (
          <motion.circle
            key={`${point.day}-${index}`}
            cx={coords[index].x}
            cy={coords[index].y}
            r={index === points.length - 1 ? 4.5 : 3.5}
            fill="#5B4FCF"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            whileInView={{
              scale: 1,
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.2 + index * 0.08,
              type: "spring",
              stiffness: 300,
              damping: 16,
            }}
          />
        ))}

        <motion.circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r="8"
          fill="none"
          stroke="#8B7FE8"
          strokeWidth="1"
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          whileInView={{
            opacity: [0, 0.45, 0],
            scale: [0.6, 1.15, 1.35],
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 2,
            delay: 0.9,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="mt-1 flex justify-between px-1 font-mono text-[9px] tracking-wide text-ink-soft/70">
        {points.map((point, index) => (
          <span key={`${point.day}-label-${index}`}>
            {point.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActionCard({
  type,
  title,
  description,
  delay,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-40px",
      }}
      custom={delay}
      variants={fadeUp}
      whileHover={{
        y: -3,
        scale: 1.01,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
      className="group flex min-h-[68px] items-center gap-3 rounded-2xl bg-gradient-primary px-3.5 py-2.5 text-white shadow-[0_12px_30px_-16px_rgba(91,79,207,0.7)]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/90">
        {type === "video" ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="13" height="14" rx="2" />
            <path d="m16 10 5-3v10l-5-3" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
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
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xs font-semibold md:text-sm">
          {title}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-[9px] leading-4 text-white/70 md:text-[10px]">
          {description}
        </p>
      </div>

      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs text-white/90 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        →
      </span>
    </motion.div>
  );
}

function Recommendation({ children, index }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -8,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.4,
        delay: 0.15 + index * 0.1,
        ease: "easeOut",
      }}
      className="flex gap-2.5 border-b border-white/35 py-2.5 last:border-b-0"
    >
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
        aria-hidden="true"
      />

      <p className="text-[9px] leading-4.5 text-ink-soft md:text-[10px]">
        {children}
      </p>
    </motion.div>
  );
}

function BrowserChrome() {
  return (
    <div className="relative z-10 flex items-center gap-3 border-b border-white/40 bg-white/45 px-3.5 py-2">
      <div
        className="flex gap-1.5"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-danger/60 transition-transform duration-200 hover:scale-125" />
        <span className="h-2 w-2 rounded-full bg-warning/60 transition-transform duration-200 hover:scale-125" />
        <span className="h-2 w-2 rounded-full bg-success/60 transition-transform duration-200 hover:scale-125" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/65 px-3.5 py-1 text-[9px] text-ink-soft">
          <span aria-hidden="true">🔒</span>
          <span>mindo.app/dashboard</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const frameRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(
      mouseY,
      [-0.5, 0.5],
      [1.5, -1.5]
    ),
    {
      stiffness: 150,
      damping: 20,
    }
  );

  const rotateY = useSpring(
    useTransform(
      mouseX,
      [-0.5, 0.5],
      [-1.5, 1.5]
    ),
    {
      stiffness: 150,
      damping: 20,
    }
  );

  function handleMouseMove(event) {
    const rect =
      frameRef.current?.getBoundingClientRect();

    if (!rect) return;

    mouseX.set(
      (event.clientX - rect.left) /
        rect.width -
        0.5
    );

    mouseY.set(
      (event.clientY - rect.top) /
        rect.height -
        0.5
    );
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      id="dashboard-preview"
      className="px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-60px",
          }}
          custom={0}
          variants={fadeUp}
          className="max-w-lg"
        >
          <span className="font-mono text-[11px] uppercase tracking-wide text-primary-deep">
            Dashboard preview
          </span>

          <h2 className="mt-2.5 font-display text-2xl font-bold text-ink md:text-3xl">
            A glimpse inside your dashboard
          </h2>

          <p className="mt-2.5 text-sm leading-6 text-ink-soft">
            Your personal space for check-ins,
            reflections, recommendations, and session
            history — all in one place.
          </p>
        </motion.div>

        {/* Dashboard mockup */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          custom={1}
          variants={fadeUp}
          className="relative mx-auto mt-8"
          style={{
            perspective: 1400,
          }}
        >
          <motion.div
            ref={frameRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="glass-frame relative overflow-hidden rounded-2xl bg-gradient-dashboard shadow-glow"
          >
            {/* Ambient depth */}

            <div
              className="pointer-events-none absolute -right-14 -top-14 z-0 h-56 w-56 rounded-full bg-primary/30 blur-2xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-16 -left-14 z-0 h-64 w-64 rounded-full bg-accent/20 blur-2xl"
              aria-hidden="true"
            />

            <BrowserChrome />

            <div className="relative z-10 p-3.5 md:p-4">
              {/* Top dashboard area */}

              <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
                {/* Welcome */}

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  custom={1}
                  variants={fadeUp}
                  className="flex flex-col justify-center rounded-2xl border border-white/45 bg-white/30 p-4"
                >
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary">
                    Welcome back
                  </span>

                  <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-ink md:text-xl">
                    Good morning, Aarav
                  </h3>

                  <p className="mt-1.5 max-w-md text-[9px] leading-4 text-ink-soft md:text-[10px]">
                    Your recent check-ins,
                    observations, and next steps —
                    all in one place.
                  </p>
                </motion.div>

                {/* Actions */}

                <div className="flex flex-col gap-2">
                  <ActionCard
                    type="video"
                    title="Start your screening"
                    description="Talk with Mindo through a video check-in."
                    delay={2}
                  />

                  <ActionCard
                    type="chat"
                    title="Chat with Mindo"
                    description="Reflect, ask questions, or talk things through."
                    delay={3}
                  />
                </div>
              </div>

              {/* Journey + insight */}

              <div className="mt-3 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
                {/* Journey */}

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  custom={2}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/45 bg-white/30 p-4"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary">
                        Your journey
                      </p>

                      <h3 className="mt-1 font-display text-base font-semibold text-ink">
                        Check-in activity
                      </h3>

                      <p className="mt-0.5 text-[9px] text-ink-soft">
                        A record of your moments with
                        Mindo.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-xl font-semibold text-primary-deep">
                        {previewData.checkIns}
                      </div>

                      <div className="font-mono text-[7px] uppercase tracking-wide text-ink-soft">
                        check-ins
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/45 bg-white/40 px-2.5 py-3">
                    <ActivityChart
                      points={previewData.activity}
                    />

                    <div className="mt-3 flex items-center justify-between border-t border-white/35 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                        <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-soft">
                          Completed sessions
                        </span>
                      </div>

                      <span className="text-[7px] text-ink-soft/60">
                        Latest activity highlighted
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Latest insight + brain */}

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  custom={3}
                  variants={fadeUp}
                  className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/30 p-3.5"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[7px] uppercase tracking-[0.17em] text-primary">
                        Latest check-in
                      </p>

                      <span className="max-w-[105px] truncate rounded-full bg-primary/8 px-2 py-0.5 font-mono text-[6px] uppercase tracking-[0.08em] text-primary-deep">
                        {previewData.category}
                      </span>
                    </div>

                    <h3 className="mt-1 font-display text-base font-semibold text-ink">
                      Your next steps
                    </h3>

                    {/* Brain */}

                    <div className="relative mx-auto -my-1 flex h-[88px] items-center justify-center">
                      <div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl"
                        aria-hidden="true"
                      />

                      <div className="relative z-10 scale-[0.58]">
                        <Brain3D
                          size={160}
                          modelScale={0.82}
                        />
                      </div>
                    </div>

                    <div className="mt-0.5">
                      {previewData.recommendations.map(
                        (recommendation, index) => (
                          <Recommendation
                            key={`${recommendation}-${index}`}
                            index={index}
                          >
                            {recommendation}
                          </Recommendation>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent history */}

              <div className="mt-3">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  custom={4}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/45 bg-white/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary">
                        Your history
                      </p>

                      <h3 className="mt-1 font-display text-base font-semibold text-ink">
                        Recent check-in
                      </h3>
                    </div>

                    <span className="rounded-full bg-white/45 px-2 py-0.5 font-mono text-[7px] uppercase tracking-wide text-ink-soft">
                      1 session
                    </span>
                  </div>

                  <div className="mt-2.5 overflow-hidden rounded-xl border border-white/45 bg-white/35">
                    {previewData.checkInHistory.map(
                      (session, index) => (
                        <motion.div
                          key={`${session.date}-${session.time}-${index}`}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay: 0.08 * index,
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                          className="flex items-center gap-2.5 px-3 py-2.5"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                            aria-hidden="true"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[9px] font-semibold text-ink">
                                MINDO Check-in
                              </span>

                              <span className="hidden max-w-[130px] truncate font-mono text-[6px] uppercase tracking-wide text-primary-deep sm:inline">
                                {session.category}
                              </span>
                            </div>

                            <p className="mt-0.5 font-mono text-[7px] text-ink-soft">
                              {session.date} ·{" "}
                              {session.time}
                            </p>
                          </div>

                          <span className="hidden font-mono text-[6px] uppercase tracking-wide text-primary-deep sm:inline">
                            View summary
                          </span>

                          <span className="hidden font-mono text-[6px] text-ink-soft sm:inline">
                            PDF
                          </span>

                          <span
                            className="text-[10px] text-primary-deep"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-60px",
          }}
          custom={2}
          variants={fadeUp}
          className="mt-3 text-center text-[11px] text-ink-soft"
        >
          Example — illustrative data only. Your real
          dashboard is generated privately from your own
          sessions.
        </motion.p>
      </div>
    </section>
  );
}