import { AnimatePresence, motion } from "framer-motion";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import PreCheckIn from "../components/screening/PreCheckIn";

import ScreeningBrainStage from "../components/screening/ScreeningBrainStage";

import ControlsDock from "../components/screening/ControlsDock";

import Button from "../components/ui/Button";

import useScreeningFlow from "../hooks/useScreeningFlow";

import useMindoSession from "../hooks/useMindoSession";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_CONVERSATION_API_URL;

const GLASS_ROOM =
  "border border-white/40 bg-white/[0.17] shadow-[0_24px_90px_rgba(72,55,110,0.16),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-2xl";

const GLASS_PANEL =
  "border border-white/45 bg-white/[0.095] shadow-[0_18px_55px_rgba(72,55,110,0.11),inset_0_1px_0_rgba(255,255,255,0.52)] backdrop-blur-2xl";

const GLASS_PILL =
  "border border-white/55 bg-white/[0.34] shadow-[0_8px_26px_rgba(72,55,110,0.10),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-xl";

const CAMERA_BADGE =
  "border border-white/80 bg-white/[0.88] shadow-[0_8px_24px_rgba(45,35,80,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]";

function formatElapsedTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function GlassAtmosphere({ variant = "default" }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        aria-hidden="true"
      >
        <div className="absolute -left-[15%] -top-[30%] h-[75%] w-[75%] rounded-full bg-primary-deep/[0.055] blur-3xl" />

        <div className="absolute -bottom-[35%] -right-[20%] h-[80%] w-[75%] rounded-full bg-primary-deep/[0.045] blur-3xl" />

        {variant === "brain" && (
          <div className="absolute left-1/2 top-1/2 h-[65%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-deep/[0.075] blur-3xl" />
        )}

        {variant === "camera" && (
          <div className="absolute left-[25%] top-[15%] h-[55%] w-[55%] rounded-full bg-white/[0.08] blur-3xl" />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.10]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.52]"
        aria-hidden="true"
      />
    </>
  );
}

function LiveTranscript({
  transcript,
  interimTranscript,
}) {
  if (
    transcript.length === 0 &&
    !interimTranscript
  ) {
    return (
      <div className="flex min-h-[240px] items-center justify-center px-8 text-center">
        <div>
          <div
            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${GLASS_PILL} text-primary-deep`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <path d="M12 18v3" />
              <path d="M8 21h8" />
            </svg>
          </div>

          <p className="mt-4 text-sm font-medium text-ink">
            Your conversation will appear here.
          </p>

          <p className="mt-1 text-xs leading-5 text-ink-soft/60">
            Take your time and speak naturally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {transcript.map((message) => {
        const isAssistant =
          message.role === "assistant";

        return (
          <motion.div
            key={message.id}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className={`flex ${
              isAssistant
                ? "justify-start"
                : "justify-end"
            }`}
          >
            <div
              className={`max-w-[88%] ${
                isAssistant
                  ? "text-left"
                  : "text-right"
              }`}
            >
              <div
                className={`mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/50 ${
                  isAssistant
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {isAssistant ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
                    <span>Mindo</span>
                  </>
                ) : (
                  <span>You</span>
                )}
              </div>

              <p
                className={`text-sm leading-6 ${
                  isAssistant
                    ? "text-ink"
                    : "text-ink-soft"
                }`}
              >
                {message.text}
              </p>
            </div>
          </motion.div>
        );
      })}

      {interimTranscript && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="flex justify-end"
        >
          <div className="max-w-[88%] text-right">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/40">
              You
            </span>

            <p className="text-sm italic leading-6 text-ink-soft/60">
              {interimTranscript}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* =========================================================
   PREPARING REPORT SCREEN
   ========================================================= */

function PreparingReportScreen({
  reflection,
  connectionState,
}) {
  const hasReflection =
    typeof reflection === "string" &&
    reflection.trim().length > 0;

  const reflectionStillGenerating =
    connectionState === "ending" &&
    !hasReflection;

  return (
    <motion.div
      key="preparing-report"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="flex h-[100dvh] w-full items-center justify-center overflow-hidden px-5 py-4 sm:px-8 sm:py-5"
    >
      <div className="flex h-full min-h-0 w-full max-w-4xl flex-col justify-center">

        {/* COMPACT HEADER */}

        <div className="flex shrink-0 flex-col items-center text-center">
          <ScreeningBrainStage
            state="connecting"
            size={108}
          />

          <div
            className={`mt-0.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 ${GLASS_PILL}`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-deep" />

            <span className="font-mono text-[9px] text-primary-deep">
              {reflectionStillGenerating
                ? "Finishing your session"
                : "Processing your session"}
            </span>

            <span className="flex items-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-1 w-1 rounded-full bg-primary-deep/55"
                  animate={{
                    opacity: [0.25, 1, 0.25],
                    y: [0, -1.5, 0],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }}
                />
              ))}
            </span>
          </div>

          <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.04] tracking-tight text-ink sm:text-[36px]">
            Preparing your
            <br />
            <span className="text-gradient">
              detailed report
            </span>
          </h1>

          <p className="mt-2 max-w-xl text-[11px] leading-5 text-ink-soft sm:text-xs">
            {reflectionStillGenerating
              ? "MINDO is finishing your closing reflection before turning your check-in into a detailed report."
              : "MINDO is reviewing your conversation and session signals to prepare your detailed report."}
          </p>
        </div>

        {/* THIN LANDSCAPE REPORT GENERATION CARD */}

        <div
          className={`mx-auto mt-4 w-full rounded-[20px] px-5 py-3.5 ${GLASS_PANEL}`}
        >
          <div className="flex items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-ink sm:text-xs">
                Report generation
              </p>

              <p className="mt-0.5 truncate text-[9px] leading-4 text-ink-soft/60 sm:text-[10px]">
                Your conversation and session signals are being
                prepared for the detailed report.
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-primary-deep/55"
                  animate={{
                    opacity: [0.25, 1, 0.25],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }}
                />
              ))}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.14em] text-ink-soft/40">
              <span>
                {reflectionStillGenerating
                  ? "Finalizing"
                  : "Analyzing"}
              </span>

              <span>MINDO</span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-primary-deep/[0.08]">
              <motion.div
                className="h-full w-1/3 rounded-full bg-primary-deep/35"
                animate={{
                  x: ["-100%", "320%"],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>

        {/* CLOSING REFLECTION */}

        <div
          className={`mx-auto mt-3 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[22px] px-5 py-4 ${GLASS_ROOM}`}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
              Mindo's closing reflection
            </span>
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {hasReflection ? (
              <p className="whitespace-pre-line text-xs leading-5 text-ink sm:text-[13px] sm:leading-6">
                {reflection}
              </p>
            ) : (
              <div className="flex h-full min-h-[70px] items-center justify-center">
                <div className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((index) => (
                      <motion.span
                        key={index}
                        className="h-1.5 w-1.5 rounded-full bg-primary-deep/55"
                        animate={{
                          opacity: [0.25, 1, 0.25],
                        }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: index * 0.15,
                        }}
                      />
                    ))}
                  </span>

                  <span>
                    Mindo is finishing its reflection…
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-2 flex shrink-0 items-center justify-center gap-2 text-[8px] uppercase tracking-[0.16em] text-ink-soft/35">
          <span className="h-px w-6 bg-primary-deep/10" />

          <span>
            Your detailed report will be ready shortly
          </span>

          <span className="h-px w-6 bg-primary-deep/10" />
        </div>
      </div>
    </motion.div>
  );
}

function ErrorScreen({
  error,
  onDashboard,
}) {
  return (
    <motion.div
      key="screening-error"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -18,
      }}
      transition={{
        duration: 0.45,
      }}
      className="flex min-h-screen items-center justify-center px-6 py-10"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-[30px] p-8 text-center sm:p-10 ${GLASS_ROOM}`}
      >
        <GlassAtmosphere />

        <div className="relative z-10">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${GLASS_PILL} text-danger`}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M12 8v5" />

              <path d="M12 16h.01" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.08,
            }}
            className="mt-6 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            We couldn't finish
            <br />
            your check-in
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.16,
            }}
            className="mx-auto mt-4 max-w-sm text-sm leading-6 text-ink-soft"
          >
            {error ||
              "Something interrupted your check-in. Please return to your dashboard and try again later."}
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.24,
            }}
            className="mt-8"
          >
            <Button
              variant="primary"
              onClick={onDashboard}
            >
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


const FER_EMOTIONS = [
  ["angry", "Angry"],
  ["disgust", "Disgust"],
  ["fear", "Fear"],
  ["happy", "Happy"],
  ["neutral", "Neutral"],
  ["sad", "Sad"],
  ["surprise", "Surprise"],
];

function normalizeFerProbability(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const normalized =
    Math.abs(numeric) > 1 ? numeric / 100 : numeric;
  return Math.min(1, Math.max(0, normalized));
}

function formatFerTimestamp(timestamp, fallbackSeconds = 0) {
  const date = timestamp ? new Date(timestamp) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], {
      minute: "2-digit",
      second: "2-digit",
    });
  }
  const minutes = Math.floor(fallbackSeconds / 60);
  const seconds = Math.round(fallbackSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getFerTimelineData(ferData) {
  if (!Array.isArray(ferData?.timeline) || !ferData.timeline.length) {
    return [];
  }

  const timeline = [...ferData.timeline].sort((a, b) => {
    const first = new Date(a?.timestamp).getTime();
    const second = new Date(b?.timestamp).getTime();
    if (Number.isFinite(first) && Number.isFinite(second)) {
      return first - second;
    }
    return 0;
  });

  const firstTimestamp = timeline
    .map((entry) => new Date(entry?.timestamp).getTime())
    .find((value) => Number.isFinite(value));

  return timeline.map((entry, index) => {
    const timestamp = new Date(entry?.timestamp).getTime();
    const relativeSeconds =
      Number.isFinite(timestamp) && Number.isFinite(firstTimestamp)
        ? Math.max(0, (timestamp - firstTimestamp) / 1000)
        : index;

    const probabilities = entry?.probabilities || {};

    return {
      ...entry,
      relativeSeconds,
      timestampLabel: formatFerTimestamp(
        entry?.timestamp,
        relativeSeconds
      ),
      probabilities: Object.fromEntries(
        FER_EMOTIONS.map(([key]) => [
          key,
          normalizeFerProbability(probabilities[key]),
        ])
      ),
    };
  });
}

function getFerProfile(ferData, timeline) {
  const overall =
    ferData?.emotion_summary?.overall_average_probabilities;

  if (overall && typeof overall === "object") {
    return Object.fromEntries(
      FER_EMOTIONS.map(([key]) => [
        key,
        normalizeFerProbability(overall[key]),
      ])
    );
  }

  const totals = Object.fromEntries(
    FER_EMOTIONS.map(([key]) => [key, 0])
  );

  timeline.forEach((entry) => {
    FER_EMOTIONS.forEach(([key]) => {
      totals[key] += entry.probabilities[key] || 0;
    });
  });

  return Object.fromEntries(
    FER_EMOTIONS.map(([key]) => [
      key,
      timeline.length ? totals[key] / timeline.length : 0,
    ])
  );
}

function getFerSignals(profile) {
  const angry = profile.angry || 0;
  const disgust = profile.disgust || 0;
  const fear = profile.fear || 0;
  const happy = profile.happy || 0;
  const surprise = profile.surprise || 0;

  return {
    positive: Math.min(1, happy),
    tension: Math.min(1, angry + fear + surprise),
    stressAssociated: Math.min(
      1,
      angry + disgust + fear + surprise
    ),
  };
}

function ExpressionJourney({ timeline }) {
  const [selectedEmotion, setSelectedEmotion] = useState("neutral");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const width = 1000;
  const height = 250;
  const left = 58;
  const right = 28;
  const top = 24;
  const bottom = 40;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const points = timeline.map((entry, index) => {
    const x =
      left +
      (timeline.length === 1
        ? chartWidth / 2
        : (index / (timeline.length - 1)) * chartWidth);
    const value = entry.probabilities[selectedEmotion] || 0;
    const y = top + (1 - value) * chartHeight;
    return { x, y, value, entry, index };
  });

  const buildSmoothPath = (items) => {
    if (!items.length) return "";
    if (items.length === 1) {
      return `M ${items[0].x} ${items[0].y}`;
    }

    let path = `M ${items[0].x} ${items[0].y}`;

    for (let i = 1; i < items.length; i += 1) {
      const previous = items[i - 1];
      const current = items[i];
      const midpoint = (previous.x + current.x) / 2;
      path += ` C ${midpoint} ${previous.y}, ${midpoint} ${current.y}, ${current.x} ${current.y}`;
    }

    return path;
  };

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${
          top + chartHeight
        } L ${points[0].x} ${top + chartHeight} Z`
      : "";

  const hovered =
    hoveredIndex !== null ? points[hoveredIndex] : null;

  const selectedLabel =
    FER_EMOTIONS.find(([key]) => key === selectedEmotion)?.[1] ||
    "Neutral";

  return (
    <div
      className={`relative mt-3.5 overflow-hidden rounded-[24px] ${GLASS_PANEL}`}
    >
      <div className="relative z-10 border-b border-white/15 px-4 py-2.5 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FER_EMOTIONS.map(([key, label]) => {
              const active = selectedEmotion === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedEmotion(key);
                    setHoveredIndex(null);
                  }}
                  className={`rounded-full border px-2.5 py-1.5 text-[9.5px] font-semibold transition-all duration-200 ${
                    active
                      ? "border-primary-deep/30 bg-primary-deep/[0.12] text-primary-deep shadow-[0_5px_18px_rgba(96,78,200,0.10)]"
                      : "border-white/30 bg-white/[0.14] text-ink-soft hover:border-white/45 hover:bg-white/[0.24]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[9px] text-ink-soft/55">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
            Viewing {selectedLabel.toLowerCase()}
          </div>
        </div>
      </div>

      <div className="relative px-2.5 pb-2.5 pt-1.5 sm:px-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${selectedEmotion} facial-expression probability across the session`}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient
              id="ferAreaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#7567E8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#7567E8" stopOpacity="0.015" />
            </linearGradient>

            <linearGradient
              id="ferLineGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#6254D8" />
              <stop offset="55%" stopColor="#7A6AE8" />
              <stop offset="100%" stopColor="#9889F4" />
            </linearGradient>

            <filter id="ferLineGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0, 25, 50, 75, 100].map((percent) => {
            const y = top + (1 - percent / 100) * chartHeight;
            return (
              <g key={percent}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={percent === 0 ? "0.13" : "0.055"}
                  strokeDasharray={percent === 0 ? undefined : "3 7"}
                />
                <text
                  x={left - 12}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-ink-soft/38 text-[10px]"
                >
                  {percent}%
                </text>
              </g>
            );
          })}

          {areaPath && (
            <path
              d={areaPath}
              fill="url(#ferAreaGradient)"
              className="transition-opacity duration-300"
            />
          )}

          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#ferLineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.22"
              filter="url(#ferLineGlow)"
            />
          )}

          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#ferLineGradient)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((point) => (
            <g key={`fer-point-${point.index}`}>
              {hoveredIndex === point.index && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="none"
                  stroke="#7567E8"
                  strokeOpacity="0.18"
                  strokeWidth="5"
                />
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === point.index ? 5.5 : 2.6}
                fill="#ffffff"
                stroke="#7567E8"
                strokeWidth={hoveredIndex === point.index ? 3 : 2}
                opacity={
                  hoveredIndex === null || hoveredIndex === point.index
                    ? 1
                    : 0.42
                }
                onMouseEnter={() => setHoveredIndex(point.index)}
              />
            </g>
          ))}

          <text
            x={left}
            y={height - 10}
            className="fill-ink-soft/40 text-[10px]"
          >
            Start
          </text>
          <text
            x={width - right}
            y={height - 10}
            textAnchor="end"
            className="fill-ink-soft/40 text-[10px]"
          >
            End
          </text>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-3 z-20 w-[196px] rounded-[18px] border border-white/65 bg-white/[0.94] p-3 shadow-[0_18px_45px_rgba(45,35,80,0.16)] backdrop-blur-xl"
            style={{
              left: `${Math.min(
                84,
                Math.max(12, (hovered.x / width) * 100)
              )}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-soft/50">
                Session moment
              </p>
              <p className="text-[11px] font-semibold text-ink">
                {hovered.entry.timestampLabel}
              </p>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {FER_EMOTIONS.map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 text-[9px]"
                >
                  <span
                    className={
                      key === selectedEmotion
                        ? "font-semibold text-primary-deep"
                        : "text-ink-soft"
                    }
                  >
                    {label}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {Math.round(
                      (hovered.entry.probabilities[key] || 0) * 100
                    )}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-0.5 flex items-center justify-between px-1">
          <p className="text-[9px] text-ink-soft/45">
            Facial-expression probability
          </p>
          <p className="text-[9px] text-ink-soft/45">
            Hover a point for the full snapshot
          </p>
        </div>
      </div>
    </div>
  );
}

function ExpressionProfile({ profile }) {
  return (
    <div className={`mt-5 rounded-[24px] p-5 sm:p-6 ${GLASS_PANEL}`}>
      <div className="space-y-4">
        {FER_EMOTIONS.map(([key, label]) => {
          const value = profile[key] || 0;
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-ink">
                  {label}
                </span>
                <span className="text-[10px] font-semibold text-ink-soft">
                  {Math.round(value * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-primary-deep/[0.07]">
                <div
                  className="h-full rounded-full bg-primary-deep/60 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, value * 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[10px] leading-5 text-ink-soft/55">
        Average probability assigned to each facial-expression class
        during this session. This is descriptive session data, not a
        clinical measurement of emotional state.
      </p>
    </div>
  );
}

function ExpressionSignals({ signals }) {
  const bars = [
    {
      key: "positive",
      label: "Positive-expression",
      sublabel: "signal",
      value: signals.positive,
    },
    {
      key: "tension",
      label: "Tension",
      sublabel: "signal",
      value: signals.tension,
    },
    {
      key: "stress",
      label: "Stress-associated",
      sublabel: "signal",
      value: signals.stressAssociated,
    },
  ];

  return (
    <div className="mt-2.5 rounded-[20px] p-2.5 sm:p-3">
      <div className="relative h-[148px] overflow-hidden rounded-[18px] border border-white/25 bg-white/[0.07] px-2.5 pb-2 pt-2.5">
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 bottom-7">
          {[100, 75, 50, 25, 0].map((level) => (
            <div
              key={level}
              className="absolute inset-x-0 border-t border-primary-deep/[0.08]"
              style={{ top: `${100 - level}%` }}
            >
              {level > 0 && (
                <span className="absolute -left-0.5 -top-2.5 text-[7px] tabular-nums text-ink-soft/35">
                  {level}%
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex h-full items-end justify-around gap-3 px-4">
          {bars.map((bar) => {
            const percentage = Math.round(
              Math.min(100, Math.max(0, bar.value * 100))
            );

            return (
              <div
                key={bar.key}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${percentage}%`, opacity: 1 }}
                  transition={{
                    duration: 0.65,
                    delay:
                      bar.key === "positive"
                        ? 0.08
                        : bar.key === "tension"
                          ? 0.16
                          : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative w-10 max-w-full rounded-t-[10px] bg-gradient-to-t from-primary-deep/65 via-primary-deep/55 to-primary-deep/30 shadow-[0_8px_18px_rgba(96,78,200,0.12)] sm:w-11"
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-primary-deep/[0.09] px-2.5 py-0.5 text-[9px] font-bold tabular-nums text-primary-deep">
                    {percentage}%
                  </span>
                </motion.div>

                <div className="mt-2 min-h-[25px] text-center">
                  <p className="text-[8.5px] font-semibold leading-3.5 text-ink sm:text-[9px]">
                    {bar.label}
                  </p>
                  <p className="text-[8px] leading-3 text-ink-soft/55">
                    {bar.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FerVisualizationSection({
  ferData,
  ferDataLoading,
  ferDataError,
}) {
  const timeline = getFerTimelineData(ferData);
  const profile = getFerProfile(ferData, timeline);
  const signals = getFerSignals(profile);

  if (ferDataLoading && !ferData) {
    return (
      <div className={`rounded-[26px] p-4 ${GLASS_ROOM}`}>
        <div className="flex min-h-[160px] items-center justify-center">
          <div className="text-center">
            <span className="mx-auto block h-2 w-2 animate-pulse rounded-full bg-primary-deep" />
            <p className="mt-3 text-xs text-ink-soft">
              Preparing your facial-expression timeline...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (ferDataError || !timeline.length) {
    return (
      <div className={`rounded-[26px] p-4 ${GLASS_ROOM}`}>
        <div className="flex min-h-[160px] items-center justify-center text-center">
          <div>
            <p className="text-sm font-semibold text-ink">
              Expression data is unavailable for this check-in.
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Your conversation summary and detailed report remain available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="grid gap-3 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className={`overflow-hidden rounded-[26px] p-3 sm:p-3.5 ${GLASS_ROOM}`}
        >
          <GlassAtmosphere variant="brain" />

          <div className="relative z-10">
            <div className="mb-2.5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
                    Facial-expression signals
                  </p>
                </div>

                <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  Your expression journey
                </h3>
              </div>

              <div
                className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-medium text-ink-soft ${GLASS_PILL}`}
              >
                {timeline.length} observations
              </div>
            </div>

            <ExpressionJourney timeline={timeline} />
          </div>
        </motion.div>

        <div className="grid gap-2.5">
<motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.27 }}
            className={`overflow-hidden rounded-[26px] p-4 sm:p-4.5 ${GLASS_ROOM}`}
          >
            <GlassAtmosphere />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft/50">
                  Derived expression signals
                </p>
              </div>

              <h4 className="mt-1 text-[17px] font-semibold tracking-tight text-ink">
                Additional session context
              </h4>

              <p className="mt-0.5 text-[9px] leading-3.5 text-ink-soft/60">
                Simple heuristics from FER probabilities; not clinical measurements.
              </p>

              <ExpressionSignals signals={signals} />
            </div>
          </motion.div>

<motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className={`overflow-hidden rounded-[26px] p-3 sm:p-3.5 ${GLASS_ROOM}`}
          >
            <GlassAtmosphere />

            <div className="relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
                    Session Expression Profile
                  </p>
                </div>

                <h4 className="mt-1 text-[17px] font-semibold tracking-tight text-ink">
                  Overall distribution
                </h4>
              </div>

              <div className="mt-3 space-y-1.5">
                {FER_EMOTIONS.map(([key, label]) => {
                  const value = profile[key] || 0;

                  return (
                    <div key={key}>
                      <div className="mb-0 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-ink">
                          {label}
                        </span>

                        <span className="text-[10.5px] font-semibold tabular-nums text-ink-soft">
                          {Math.round(value * 100)}%
                        </span>
                      </div>

                      <div className="h-1 overflow-hidden rounded-full bg-primary-deep/[0.07]">
                        <div
                          className="h-full rounded-full bg-primary-deep/60 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, value * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SummarySection({
  sessionResult,
  ferData,
  ferDataLoading,
  ferDataError,
  onDownload,
  downloading,
  downloadError,
  onDashboard,
}) {
  const summary =
    sessionResult?.summary ||
    "Your check-in has been completed.";

  const recommendations = Array.isArray(
    sessionResult?.recommendations
  )
    ? sessionResult.recommendations.filter(
        (recommendation) =>
          typeof recommendation === "string" &&
          recommendation.trim().length > 0
      )
    : [];

  const ferObservationCount =
    Number.isFinite(ferData?.observation_count)
      ? ferData.observation_count
      : Array.isArray(ferData?.timeline)
        ? ferData.timeline.length
        : 0;

  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto w-full max-w-[1500px] px-3 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-3"
    >
      <div className="relative flex w-full flex-col">
        {/* Compact page header */}
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary-deep"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
              Check-in complete
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mt-0.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            >
              Here’s what MINDO noticed
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-0.5 text-[11px] text-ink-soft sm:text-xs"
            >
              A reflection based on your conversation and session signals.
            </motion.p>

          </div>
        </div>

        {/* Reflection + recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className={`relative mt-2.5 overflow-hidden rounded-[26px] ${GLASS_ROOM}`}
        >
          <GlassAtmosphere />

          <div className="relative z-10 grid md:grid-cols-[1.02fr_0.98fr]">
            <div className="border-b border-white/20 px-5 py-3 md:border-b-0 md:border-r md:px-6 md:py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
                  Your overall reflection
                </p>
              </div>

              <p className="mt-2 max-w-2xl text-[11px] leading-4.5 text-ink sm:text-xs sm:leading-5">
                {summary}
              </p>

              {(sessionResult?.assessment_category ||
                sessionResult?.confidence) && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sessionResult?.assessment_category && (
                    <div
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium capitalize text-ink ${GLASS_PILL}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
                      {sessionResult.assessment_category.replace(
                        /_/g,
                        " "
                      )}
                    </div>
                  )}

                  {sessionResult?.confidence && (
                    <div
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium text-ink-soft ${GLASS_PILL}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-deep/50" />
                      Confidence · {sessionResult.confidence}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 md:px-6 md:py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
                  A few things to try
                </p>
              </div>

              {recommendations.length > 0 ? (
                <div className="mt-2.5 space-y-1.5">
                  {recommendations.map((recommendation, index) => (
                    <motion.div
                      key={`${recommendation}-${index}`}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.16 + index * 0.05,
                      }}
                      className="flex gap-2.5"
                    >
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-deep/[0.08]">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
                      </div>

                      <p className="text-[10px] leading-4 text-ink sm:text-[11px] sm:leading-4.5">
                        {recommendation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="mt-2.5 text-xs leading-5 text-ink-soft">
                  No personalized recommendations were returned for this
                  check-in.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Four-card information area:
            1. reflection/recommendations above
            2. expression journey
            3. expression profile
            4. derived expression signals */}
        <div className="mt-2.5">
          <FerVisualizationSection
            ferData={ferData}
            ferDataLoading={ferDataLoading}
            ferDataError={ferDataError}
          />
        </div>

        {ferData && (
          <p className="mt-1 text-center text-[8px] text-ink-soft/35">
            {ferObservationCount} facial-expression observations
          </p>
        )}

        {downloadError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-1/2 z-[60] w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl bg-danger-soft px-4 py-2 text-center text-[10px] text-danger shadow-[0_18px_45px_rgba(45,35,80,0.16)]"
          >
            {downloadError}
          </motion.div>
        )}

        {/* Floating summary actions — aligned with the main content frame */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.3,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
          className="fixed bottom-4 left-6 z-50 flex items-center gap-2.5 sm:bottom-6 sm:left-12"
        >
          <motion.div
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
              y: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 22,
            }}
            className="rounded-full"
          >
            <Button
              variant="secondary"
              onClick={onDashboard}
              className="!px-4 !py-3 text-xs shadow-[0_12px_30px_rgba(72,55,110,0.12)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(72,55,110,0.18)]"
            >
              ← Back to Dashboard
            </Button>
          </motion.div>

          <motion.div
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
              y: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 22,
            }}
            className="rounded-full"
          >
            <Button
              variant="primary"
              onClick={onDownload}
              disabled={downloading}
              className="!px-5 !py-3 text-xs shadow-[0_14px_34px_rgba(72,55,110,0.22)] transition-shadow duration-300 hover:shadow-[0_18px_42px_rgba(72,55,110,0.30)]"
            >
              <span className="inline-flex items-center gap-2">
                <motion.span
                  aria-hidden="true"
                  animate={downloading ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    downloading
                      ? {
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }
                      : {
                          duration: 0.25,
                        }
                  }
                >
                  ↓
                </motion.span>

                {downloading
                  ? "Preparing report..."
                  : "Download Detailed Report"}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ParticipantPanel({
  type,
  session,
  brainState,
}) {
  if (type === "camera") {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-[20px] ${GLASS_PANEL}`}
      >
        <GlassAtmosphere variant="camera" />

        <video
          ref={session.videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-300 ${
            session.cameraOff
              ? "opacity-0"
              : "opacity-100"
          }`}
        />

        {session.cameraOff && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center">
            <div className="relative text-center">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${GLASS_PILL} text-primary-deep`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="6"
                    width="14"
                    height="12"
                    rx="2"
                  />

                  <path d="M16 10l6-3v10l-6-3" />

                  <line
                    x1="2"
                    y1="2"
                    x2="22"
                    y2="22"
                  />
                </svg>
              </div>

              <p className="mt-3 text-sm font-medium text-ink">
                Camera is off
              </p>
            </div>
          </div>
        )}

        <div
          className={`absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-deep ${CAMERA_BADGE}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

          You
        </div>

        {!session.cameraOff && (
          <div
            className={`absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-primary-deep ${CAMERA_BADGE}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                session.faceDetected
                  ? "bg-primary-deep"
                  : "bg-ink-soft/40"
              }`}
            />

            {session.faceDetected
              ? "Face detected"
              : "Looking for face"}
          </div>
        )}

        {session.dominantEmotion &&
          !session.cameraOff && (
            <div
              className={`absolute bottom-3 right-3 z-10 rounded-full px-3 py-1.5 text-[11px] capitalize text-primary-deep ${CAMERA_BADGE}`}
            >
              {session.dominantEmotion}
            </div>
          )}
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-[20px] ${GLASS_PANEL}`}
    >
      <GlassAtmosphere variant="brain" />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <ScreeningBrainStage
          state={brainState}
          size={205}
        />
      </div>

      <div
        className={`absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-deep ${GLASS_PILL}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />

        Mindo
      </div>
    </div>
  );
}

function ActiveRoom({
  session,
  brainState,
  elapsedSeconds,
  onEndSession,
  hasError,
}) {
  const participantColumnWidth =
    "calc((100vh - 198px) * 0.8888889)";

  const transcriptScrollRef =
    useRef(null);

  const shouldAutoScrollRef =
    useRef(true);

  const handleTranscriptScroll =
    useCallback(() => {
      const container =
        transcriptScrollRef.current;

      if (!container) {
        return;
      }

      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      shouldAutoScrollRef.current =
        distanceFromBottom <= 80;
    }, []);

  useEffect(() => {
    const container =
      transcriptScrollRef.current;

    if (
      !container ||
      !shouldAutoScrollRef.current
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(() => {
        container.scrollTo({
          top:
            container.scrollHeight,
          behavior: "smooth",
        });
      });

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    session.transcript,
    session.interimTranscript,
  ]);

  return (
    <motion.div
      key="active-session"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="relative flex h-screen w-full flex-col overflow-hidden px-2.5 pt-2.5 sm:px-4 sm:pt-4"
    >
      <div
        className={`mx-auto flex h-[calc(100vh-72px)] w-full max-w-[1320px] flex-col overflow-hidden rounded-[26px] ${GLASS_ROOM}`}
      >
        <header className="relative flex h-[62px] shrink-0 items-center justify-between border-b border-white/20 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              <img
                src="/images/logo.png"
                alt="Mindo"
                className="h-9 w-9 object-contain"
              />
            </div>

            <div>
              <p className="font-display text-sm font-bold tracking-tight text-ink">
                Mindo
              </p>

              <p className="hidden text-[9px] uppercase tracking-[0.16em] text-ink-soft/50 sm:block">
                AI wellness companion
              </p>
            </div>
          </div>

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-deep" />

            <span className="text-xs font-medium text-ink-soft">
              Check-in ·{" "}
              <span className="tabular-nums text-ink">
                {formatElapsedTime(
                  elapsedSeconds
                )}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={onEndSession}
            disabled={
              session.connectionState ===
                "ending" ||
              !session.sessionId
            }
            className={`group flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium text-ink-soft transition hover:border-danger/20 hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 ${GLASS_PILL}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-danger/70 transition group-hover:bg-danger" />

            <span className="hidden sm:inline">
              End Session
            </span>

            <span className="sm:hidden">
              End
            </span>
          </button>
        </header>

        <div className="min-h-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">
          <div
            className="grid h-full min-h-0 gap-3"
            style={{
              gridTemplateColumns:
                `minmax(0, ${participantColumnWidth}) minmax(300px, 1fr)`,
            }}
          >
            <section className="flex min-h-0 flex-col gap-3">
              <ParticipantPanel
                type="camera"
                session={session}
                brainState={brainState}
              />

              <ParticipantPanel
                type="brain"
                session={session}
                brainState={brainState}
              />
            </section>

            <section
              className={`flex min-h-0 flex-col overflow-hidden rounded-[20px] ${GLASS_PANEL}`}
            >
              <GlassAtmosphere />

              <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/20 px-5 py-4">
                <div>
                  <p className="font-display text-sm font-semibold text-ink">
                    Conversation
                  </p>

                  <p className="mt-0.5 text-[10px] text-ink-soft/55">
                    Your private check-in with Mindo
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 text-primary-deep ${GLASS_PILL}`}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-deep" />

                  <span className="text-[10px] font-medium">
                    Live
                  </span>
                </div>
              </div>

              <div
                ref={transcriptScrollRef}
                onScroll={
                  handleTranscriptScroll
                }
                className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
                style={{
                  scrollbarWidth: "thin",
                }}
              >
                <LiveTranscript
                  transcript={
                    session.transcript
                  }
                  interimTranscript={
                    session.interimTranscript
                  }
                />
              </div>

              <div className="relative z-10 shrink-0 border-t border-white/20 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      session.currentSpeaker ===
                      "assistant"
                        ? "animate-pulse bg-primary-deep"
                        : "bg-ink-soft/30"
                    }`}
                  />

                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft/50">
                    {session.currentSpeaker ===
                    "assistant"
                      ? "Mindo is speaking"
                      : "Your turn"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {hasError && (
          <div className="shrink-0 px-4 pb-4 sm:px-6">
            <div
              className={`mx-auto max-w-xl rounded-2xl px-4 py-3 text-center text-sm text-danger ${GLASS_PANEL}`}
            >
              {session.error ||
                "Something interrupted your check-in."}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-40 -translate-x-1/2 sm:bottom-3">
        <div className="pointer-events-auto">
          <ControlsDock
            micMuted={
              session.micMuted
            }
            cameraOff={
              session.cameraOff
            }
            onToggleMic={
              session.toggleMicrophone
            }
            onToggleCamera={
              session.toggleCamera
            }
            onEnd={
              onEndSession
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function Screening() {
  const navigate = useNavigate();

  const flow = useScreeningFlow();

  const session = useMindoSession();

  const { currentUser } =
    useAuth();

  const [processing, setProcessing] =
    useState(false);

  const [sessionResult, setSessionResult] =
    useState(null);

  const [ferData, setFerData] =
    useState(null);

  const [ferDataLoading, setFerDataLoading] =
    useState(false);

  const [ferDataError, setFerDataError] =
    useState(null);

  const [processingError, setProcessingError] =
    useState(null);

  const [downloading, setDownloading] =
    useState(false);

  const [downloadError, setDownloadError] =
    useState(null);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [endingSessionId, setEndingSessionId] =
    useState(null);

  const timerRef =
    useRef(null);

  const pollingTimerRef =
    useRef(null);

  const backendProcessingStartedRef =
    useRef(false);

  useEffect(() => {
    if (
      session.connectionState ===
      "active"
    ) {
      if (!timerRef.current) {
        timerRef.current =
          setInterval(() => {
            setElapsedSeconds(
              (previous) =>
                previous + 1
            );
          }, 1000);
      }
    } else if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, [
    session.connectionState,
  ]);

  const stopPolling =
    useCallback(() => {
      if (pollingTimerRef.current) {
        clearTimeout(
          pollingTimerRef.current
        );

        pollingTimerRef.current =
          null;
      }
    }, []);

  const checkSessionStatus =
    useCallback(
      async (sessionId) => {
        if (
          !currentUser ||
          !sessionId
        ) {
          throw new Error(
            "Unable to identify the completed session."
          );
        }

        const token =
          await currentUser.getIdToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          let message =
            "Unable to retrieve session status.";

          try {
            const errorData =
              await response.json();

            if (errorData?.detail) {
              message =
                errorData.detail;
            }
          } catch {
            // Keep default error.
          }

          throw new Error(message);
        }

        return response.json();
      },
      [currentUser]
    );

  const fetchEmotionData =
    useCallback(
      async (sessionId) => {
        if (
          !currentUser ||
          !sessionId
        ) {
          const message =
            "Unable to identify the completed session for emotion data.";

          console.error(
            "[SCREENING] FER data error:",
            message
          );

          setFerDataError(message);
          setFerDataLoading(false);

          return;
        }

        setFerDataLoading(true);
        setFerDataError(null);

        console.log(
          `[SCREENING] Fetching FER data for session: ${sessionId}`
        );

        try {
          const token =
            await currentUser.getIdToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/v1/sessions/${sessionId}/emotion-data`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          if (!response.ok) {
            let message =
              "Unable to retrieve session expression data.";

            try {
              const errorData =
                await response.json();

              if (errorData?.detail) {
                message =
                  errorData.detail;
              }
            } catch {
              // Keep default message.
            }

            throw new Error(message);
          }

          const data =
            await response.json();

          const observationCount =
            Number.isFinite(
              data?.observation_count
            )
              ? data.observation_count
              : Array.isArray(
                    data?.timeline
                  )
                ? data.timeline.length
                : 0;

          const timelineCount =
            Array.isArray(data?.timeline)
              ? data.timeline.length
              : 0;

          setFerData(data);
          setFerDataError(null);

          console.log(
            `[SCREENING] FER data loaded successfully — ${observationCount} observations, ${timelineCount} timeline entries.`
          );
        } catch (error) {
          console.error(
            "[SCREENING] FER data error:",
            error
          );

          setFerData(null);
          setFerDataError(
            error?.message ||
              "Unable to retrieve session expression data."
          );
        } finally {
          setFerDataLoading(false);
        }
      },
      [currentUser]
    );

  const waitForSessionCompletion =
    useCallback(
      async (sessionId) => {
        setProcessing(true);

        setProcessingError(null);

        setSessionResult(null);

        setFerData(null);
        setFerDataLoading(false);
        setFerDataError(null);

        const poll =
          async () => {
            try {
              const result =
                await checkSessionStatus(
                  sessionId
                );

              if (
                result.status ===
                "completed"
              ) {
                stopPolling();

                setSessionResult(
                  result
                );

                void fetchEmotionData(
                  result.session_id
                );

                setProcessing(
                  false
                );

                flow.endSession();

                return;
              }

              if (
                result.status ===
                "failed"
              ) {
                stopPolling();

                setProcessing(
                  false
                );

                setProcessingError(
                  "We couldn't finish processing your check-in. Please return to your dashboard and try again later."
                );

                flow.resetSession();

                return;
              }

              pollingTimerRef.current =
                setTimeout(
                  poll,
                  1500
                );
            } catch (error) {
              console.error(
                "[SCREENING] Session status error:",
                error
              );

              stopPolling();

              setProcessing(
                false
              );

              setProcessingError(
                error?.message ||
                  "Unable to retrieve your session result."
              );
            }
          };

        await poll();
      },
      [
        checkSessionStatus,
        fetchEmotionData,
        flow,
        stopPolling,
      ]
    );

  const requestDevicePermissions =
    useCallback(async () => {
      /*
       * Request both permissions while the user is still on
       * the Start Check-in click.
       *
       * The actual long-lived camera/microphone streams are
       * still created by useMindoSession. This is only the
       * browser permission handshake, so the permission prompt
       * appears at the expected moment.
       */
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera and microphone access is not available in this browser."
        );
      }

      const permissionStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
            facingMode: "user",
          },
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      permissionStream
        .getTracks()
        .forEach((track) => track.stop());
    }, []);

  const handleBegin =
    async () => {
      setProcessing(false);

      setSessionResult(null);

      setProcessingError(null);

      setDownloadError(null);

      setEndingSessionId(null);

      backendProcessingStartedRef.current =
        false;

      setElapsedSeconds(0);

      try {
        /*
         * Ask for browser camera + microphone permission
         * immediately from the Start Check-in action.
         *
         * Once permission is granted, the actual session hook
         * obtains its own streams for FER and Gemini audio.
         */
        await requestDevicePermissions();
      } catch (permissionError) {
        console.error(
          "[SCREENING] Camera/microphone permission error:",
          permissionError
        );

        setProcessingError(
          permissionError?.message ||
            "Camera and microphone access are required to start your MINDO check-in."
        );

        return;
      }

      flow.begin();

      /*
       * Let React commit the ActiveRoom and its real video
       * element before useMindoSession starts its long-lived
       * camera stream.
       */
      await new Promise(
        (resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(
              resolve
            );
          });
        }
      );

      const started =
        await session.startSession();

      if (!started) {
        flow.resetSession();
      }
    };

  const handleEndSession =
    async () => {
      const completedSessionId =
        session.sessionId;

      if (!completedSessionId) {
        console.error(
          "[SCREENING] No session ID available."
        );

        setProcessingError(
          "Unable to identify this check-in."
        );

        return;
      }

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      /*
       * From this point onward, the active room is replaced by
       * the single unified Preparing Report page.
       *
       * The hook keeps Gemini alive long enough to generate the
       * final closing reflection.
       */
      setEndingSessionId(
        completedSessionId
      );

      backendProcessingStartedRef.current =
        false;

      await session.stopSession();
    };

  useEffect(() => {
    if (
      session.connectionState !==
        "ended" ||
      !endingSessionId ||
      backendProcessingStartedRef.current
    ) {
      return;
    }

    backendProcessingStartedRef.current =
      true;

    void waitForSessionCompletion(
      endingSessionId
    );
  }, [
    session.connectionState,
    endingSessionId,
    waitForSessionCompletion,
  ]);

  const handleDownloadReport =
    async () => {
      if (
        !currentUser ||
        !sessionResult?.session_id
      ) {
        setDownloadError(
          "Unable to identify this report."
        );

        return;
      }

      try {
        setDownloading(true);

        setDownloadError(null);

        const token =
          await currentUser.getIdToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/v1/sessions/${sessionResult.session_id}/report`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          let message =
            "Unable to download your report.";

          try {
            const errorData =
              await response.json();

            if (errorData?.detail) {
              message =
                errorData.detail;
            }
          } catch {
            // Keep default message.
          }

          throw new Error(
            message
          );
        }

        const blob =
          await response.blob();

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          downloadUrl;

        anchor.download =
          `mindo_assessment_${sessionResult.session_id}.pdf`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        window.URL.revokeObjectURL(
          downloadUrl
        );
      } catch (error) {
        console.error(
          "[SCREENING] Report download error:",
          error
        );

        setDownloadError(
          error?.message ||
            "Unable to download your report."
        );
      } finally {
        setDownloading(false);
      }
    };

  const handleDashboard =
    () => {
      stopPolling();

      navigate(
        "/dashboard"
      );
    };

  useEffect(() => {
    return () => {
      stopPolling();

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, [
    stopPolling,
  ]);

  let brainState =
    "ready";

  if (
    session.connectionState ===
    "connecting"
  ) {
    brainState =
      "connecting";
  } else if (
    session.connectionState ===
    "ending"
  ) {
    brainState =
      "ending";
  } else if (
    processing
  ) {
    brainState =
      "connecting";
  } else if (
    flow.state ===
    "summary"
  ) {
    brainState =
      "summary";
  } else if (
    session.currentSpeaker ===
    "assistant"
  ) {
    brainState =
      "speaking";
  } else if (
    session.connectionState ===
    "active"
  ) {
    brainState =
      "listening";
  }

  const hasError =
    Boolean(session.error) ||
    Boolean(processingError);

  const showErrorScreen =
    !processing &&
    !sessionResult &&
    hasError;

  return (
    <main className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[-25%] h-[65vh] w-[65vw] -translate-x-1/2 rounded-full bg-primary-deep/[0.035] blur-3xl" />

        <div className="absolute bottom-[-25%] left-[-10%] h-[50vh] w-[45vw] rounded-full bg-primary-deep/[0.03] blur-3xl" />

        <div className="absolute right-[-10%] top-[20%] h-[40vh] w-[35vw] rounded-full bg-primary-deep/[0.025] blur-3xl" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showErrorScreen && (
            <ErrorScreen
              error={
                processingError ||
                session.error
              }
              onDashboard={
                handleDashboard
              }
            />
          )}

          {!showErrorScreen &&
            flow.state === "ready" &&
            !processing &&
            session.connectionState !==
              "connecting" && (
              <motion.div
                key="pre-checkin"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -12,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8"
              >
                <div className="w-full">
                  <PreCheckIn
                    onBegin={
                      handleBegin
                    }
                  />
                </div>
              </motion.div>
            )}

          {!showErrorScreen &&
            flow.state === "listening" &&
            !processing &&
            session.connectionState !==
              "ending" && (
              <ActiveRoom
                session={
                  session
                }
                brainState={
                  brainState
                }
                elapsedSeconds={
                  elapsedSeconds
                }
                onEndSession={
                  handleEndSession
                }
                hasError={false}
              />
            )}

          {!showErrorScreen &&
            endingSessionId &&
            flow.state !== "summary" && (
              <PreparingReportScreen
                reflection={
                  session.closingReflection
                }
                connectionState={
                  session.connectionState
                }
              />
            )}

          {!showErrorScreen &&
            flow.state ===
              "summary" &&
            !processing &&
            sessionResult && (
              <motion.div
                key="summary-wrapper"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="min-h-screen px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-2"
              >
                <SummarySection
                  sessionResult={
                    sessionResult
                  }
                  ferData={
                    ferData
                  }
                  ferDataLoading={
                    ferDataLoading
                  }
                  ferDataError={
                    ferDataError
                  }
                  onDownload={
                    handleDownloadReport
                  }
                  downloading={
                    downloading
                  }
                  downloadError={
                    downloadError
                  }
                  onDashboard={
                    handleDashboard
                  }
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}