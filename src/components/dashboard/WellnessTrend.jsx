import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import EmptyStateCard from "./EmptyStateCard";



const WINDOW_DAYS = 7;



const fadeUp = {

  hidden: {

    opacity: 0,

    y: 14,

  },



  visible: (i = 0) => ({

    opacity: 1,

    y: 0,

    transition: {

      duration: 0.45,

      delay: i * 0.08,

      ease: "easeOut",

    },

  }),

};



function formatDateLabel(value) {

  if (!value) return "";



  const date = new Date(value);



  if (Number.isNaN(date.getTime())) {

    return value;

  }



  return date.toLocaleDateString("en-IN", {

    day: "numeric",

    month: "short",

  });

}



/*

 * Keep only check-ins from the latest 7 calendar days.

 *

 * Today counts as day 1, so the visible window is:

 *

 * today

 * yesterday

 * 2 days ago

 * ...

 * 6 days ago

 */

function getRecentSevenDayPoints(points) {

  if (!Array.isArray(points) || points.length === 0) {

    return [];

  }



  const now = new Date();



  const todayStart = new Date(

    now.getFullYear(),

    now.getMonth(),

    now.getDate()

  );



  const windowStart = new Date(todayStart);



  windowStart.setDate(

    windowStart.getDate() - (WINDOW_DAYS - 1)

  );



  return points.filter((point) => {

    if (!point?.day) {

      return false;

    }



    const date = new Date(point.day);



    if (Number.isNaN(date.getTime())) {

      return false;

    }



    return date >= windowStart && date <= now;

  });

}



function TrendChart({ points }) {
  if (!points?.length) return null;

  const scrollRef = useRef(null);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    const scrollToLatest = () => {
      element.scrollLeft =
        element.scrollWidth - element.clientWidth;
    };

    const frame = requestAnimationFrame(scrollToLatest);

    return () => cancelAnimationFrame(frame);
  }, [points]);

  /*
   * Visual-only sizing:
   * every backend-provided check-in keeps its own position/date,
   * while the timeline gets enough horizontal room to breathe.
   */
  const width = Math.max(760, points.length * 76 + 36);
  const height = 118;

  const paddingX = 24;
  const centerY = 38;

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
    <div className="relative">
      <style>{`
        .mindo-timeline-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(102, 87, 232, 0.38) transparent;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }

        .mindo-timeline-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .mindo-timeline-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.24);
          border-radius: 999px;
        }

        .mindo-timeline-scroll::-webkit-scrollbar-thumb {
          background: rgba(102, 87, 232, 0.30);
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.30);
        }

        .mindo-timeline-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(102, 87, 232, 0.48);
        }
      `}</style>

      <div
        className="
          relative overflow-hidden rounded-[18px]
          border border-white/45
          bg-white/[0.16]
          px-3 py-3.5
          backdrop-blur-sm
          sm:px-4 sm:py-4
        "
      >
        {/* Soft edge fades make the horizontal continuation feel intentional. */}
        <div
          className="
            pointer-events-none absolute inset-y-0 left-0 z-20
            w-5
            bg-gradient-to-r from-white/[0.18] to-transparent
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none absolute inset-y-0 right-0 z-20
            w-5
            bg-gradient-to-l from-white/[0.18] to-transparent
          "
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          className="
            mindo-timeline-scroll
            relative z-10
            overflow-x-auto overflow-y-hidden
            pb-2
          "
        >
          <div
            className="relative"
            style={{
              width: `${width}px`,
              minWidth: "100%",
            }}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
              className="block overflow-visible"
              role="img"
              aria-label="Check-in activity over the last 7 days"
            >
              {/* Ambient baseline */}
              <line
                x1={paddingX}
                y1={centerY}
                x2={width - paddingX}
                y2={centerY}
                stroke="rgba(91,79,207,0.10)"
                strokeWidth="1"
              />

              {/* Dotted journey line */}
              {points.length > 1 && (
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#8B7FE8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2 8"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.7,
                  }}
                  transition={{
                    duration: 0.9,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Session points */}
              {points.map((point, index) => {
                const isLatest = index === points.length - 1;

                return (
                  <g key={`${point.day}-${index}`}>
                    {/* Latest session glow */}
                    {isLatest && (
                      <motion.circle
                        cx={coords[index].x}
                        cy={coords[index].y}
                        r="10"
                        fill="none"
                        stroke="#8B7FE8"
                        strokeWidth="1"
                        initial={{
                          opacity: 0,
                          scale: 0.65,
                        }}
                        animate={{
                          opacity: [0, 0.45, 0],
                          scale: [0.65, 1.1, 1.3],
                        }}
                        transition={{
                          duration: 2,
                          delay: 0.8,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeOut",
                        }}
                      />
                    )}

                    <motion.circle
                      cx={coords[index].x}
                      cy={coords[index].y}
                      r={isLatest ? 4.5 : 3.5}
                      fill="#5B4FCF"
                      initial={{
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.15 + index * 0.07,
                        type: "spring",
                        stiffness: 300,
                        damping: 17,
                      }}
                    />

                    {/* Latest point center */}
                    {isLatest && (
                      <motion.circle
                        cx={coords[index].x}
                        cy={coords[index].y}
                        r="1.8"
                        fill="white"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay: 0.75,
                          duration: 0.3,
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Backend-provided dates stay one-to-one with their check-in dots. */}
            <div
              className="grid items-start"
              style={{
                gridTemplateColumns: `repeat(${points.length}, minmax(76px, 1fr))`,
                marginTop: "-2px",
              }}
            >
              {points.map((point, index) => (
                <div
                  key={`${point.day}-label-${index}`}
                  className="flex justify-center px-1"
                >
                  <span
                    className={`
                      whitespace-nowrap
                      font-mono text-[9px] tracking-wide
                      ${
                        index === points.length - 1
                          ? "text-primary-deep"
                          : "text-ink-soft/60"
                      }
                    `}
                  >
                    {formatDateLabel(point.day)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Small hint that this is a scrollable timeline, without adding clutter. */}
        {points.length > 8 && (
          <div className="pointer-events-none mt-1 flex items-center justify-center">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-ink-soft/35">
              Scroll horizontally for all check-ins
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WellnessTrend({

  trend,

  hasHistory,

  index = 0,

}) {

  const allPoints = trend?.points || [];



  /*

   * The dashboard now represents a 7-day window rather than

   * simply taking the latest 7 sessions.

   */

  const points = getRecentSevenDayPoints(

    allPoints

  );



  return (

    <motion.section

      initial="hidden"

      animate="visible"

      custom={index}

      variants={fadeUp}

      className="relative"

    >

      {/* =====================================================

          HEADER

      ===================================================== */}

      <div className="mb-4 flex items-end justify-between gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">

              Your journey

            </p>



            {hasHistory && points.length > 0 && (

              <>

                <span className="h-1 w-1 rounded-full bg-primary/40" />



                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/55">

                  Last 7 days

                </span>

              </>

            )}

          </div>



          <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">

            Check-in activity

          </h2>



          <p className="mt-1 max-w-xl text-xs leading-5 text-ink-soft md:text-sm">

            A simple record of the moments you've

            checked in with Mindo.

          </p>

        </div>



        {/* Session count */}

        {hasHistory && points.length > 0 && (

          <div className="flex shrink-0 items-baseline gap-1.5">

            <span className="font-display text-2xl font-semibold leading-none tracking-tight text-primary-deep">

              {points.length}

            </span>



            <div className="flex flex-col">

              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft/60">

                {points.length === 1

                  ? "check-in"

                  : "check-ins"}

              </span>



              <span className="font-mono text-[7px] tracking-[0.06em] text-ink-soft/45">

                (in 7 days)

              </span>

            </div>

          </div>

        )}

      </div>



      {/* =====================================================

          CHART

      ===================================================== */}

      {hasHistory && points.length > 0 ? (

        <div className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/20 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5">

          {/* Ambient highlight */}

          <div

            className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/8 blur-3xl"

            aria-hidden="true"

          />



          <div className="relative z-10">

            <TrendChart points={points} />



            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/35 pt-3">

              <div className="flex items-center gap-2">

                <span

                  className="h-1.5 w-1.5 rounded-full bg-primary"

                  aria-hidden="true"

                />



                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft/65">

                  Completed sessions

                </span>

              </div>



              <span className="text-[9px] text-ink-soft/55">

                Latest activity highlighted

              </span>

            </div>

          </div>

        </div>

      ) : (

        <EmptyStateCard

          icon="✦"

          title="Your journey starts here"

          body="Complete your first check-in and MINDO will begin building your personal session history."

          compact

        />

      )}

    </motion.section>

  );

}