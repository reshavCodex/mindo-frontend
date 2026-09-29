import React, { useMemo } from "react";

const ACCENT = "#6657E8";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function normalizeProbability(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  if (numericValue > 1) {
    return clamp(numericValue / 100);
  }

  return clamp(numericValue);
}

/*
 * Build the same facial-expression profile used by the
 * Summary page.
 *
 * Primary source:
 *   emotionSummary.overall_average_probabilities
 *
 * Fallback:
 *   Calculate averages from the timeline only when the
 *   backend summary profile is unavailable.
 */
function getEmotionProfile(emotionSummary, timeline) {
  const overall =
    emotionSummary?.overall_average_probabilities;

  if (overall && typeof overall === "object") {
    return {
      angry: normalizeProbability(overall.angry),
      disgust: normalizeProbability(overall.disgust),
      fear: normalizeProbability(overall.fear),
      happy: normalizeProbability(overall.happy),
      surprise: normalizeProbability(overall.surprise),
    };
  }

  /*
   * Fallback for older sessions or if the backend does not
   * provide overall_average_probabilities.
   */
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return {
      angry: 0,
      disgust: 0,
      fear: 0,
      happy: 0,
      surprise: 0,
    };
  }

  const totals = {
    angry: 0,
    disgust: 0,
    fear: 0,
    happy: 0,
    surprise: 0,
  };

  let validEntries = 0;

  timeline.forEach((entry) => {
    const probabilities = entry?.probabilities;

    if (!probabilities) {
      return;
    }

    totals.angry += normalizeProbability(
      probabilities.angry
    );

    totals.disgust += normalizeProbability(
      probabilities.disgust
    );

    totals.fear += normalizeProbability(
      probabilities.fear
    );

    totals.happy += normalizeProbability(
      probabilities.happy
    );

    totals.surprise += normalizeProbability(
      probabilities.surprise
    );

    validEntries += 1;
  });

  if (validEntries === 0) {
    return {
      angry: 0,
      disgust: 0,
      fear: 0,
      happy: 0,
      surprise: 0,
    };
  }

  return {
    angry: totals.angry / validEntries,
    disgust: totals.disgust / validEntries,
    fear: totals.fear / validEntries,
    happy: totals.happy / validEntries,
    surprise: totals.surprise / validEntries,
  };
}

/*
 * These formulas match the Summary page:
 *
 * Positive-expression:
 *   happy
 *
 * Tension:
 *   angry + fear + surprise
 *
 * Stress-associated expression:
 *   angry + disgust + fear + surprise
 *
 * Values are descriptive session-derived signals.
 * They are NOT clinical measurements.
 */
function calculateSignals(emotionSummary, timeline) {
  const profile = getEmotionProfile(
    emotionSummary,
    timeline
  );

  return {
    positive: Math.min(
      1,
      profile.happy
    ),

    tension: Math.min(
      1,
      profile.angry +
        profile.fear +
        profile.surprise
    ),

    stressAssociated: Math.min(
      1,
      profile.angry +
        profile.disgust +
        profile.fear +
        profile.surprise
    ),
  };
}

function GlassCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[22px]
        border border-white/60
        bg-white/[0.24]
        backdrop-blur-xl
        ${className}
      `}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-violet-200/[0.08]"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function SignalColumn({
  label,
  value,
}) {
  const percentage = Math.round(
    clamp(value) * 100
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      {/* Percentage */}
      <span
        className="text-[11px] font-semibold tabular-nums"
        style={{ color: ACCENT }}
      >
        {percentage}%
      </span>

      {/* Vertical graph */}
      <div className="relative mt-2 flex h-[118px] w-full max-w-[72px] items-end justify-center">
        {/* Background track */}
        <div className="absolute bottom-0 h-full w-[28px] overflow-hidden rounded-t-[10px] rounded-b-[5px] bg-[#8B82B8]/10">
          {/* Filled value */}
          <div
            className="absolute bottom-0 left-0 w-full rounded-t-[10px] transition-all duration-700 ease-out"
            style={{
              height: `${Math.max(
                percentage,
                3
              )}%`,
              background:
                "linear-gradient(to top, rgba(102, 87, 232, 0.68), rgba(102, 87, 232, 0.30))",
            }}
          />
        </div>

        {/* Baseline */}
        <div
          className="absolute bottom-0 h-[2px] w-12 rounded-full"
          style={{
            backgroundColor: ACCENT,
            opacity: 0.18,
          }}
        />
      </div>

      {/* Label */}
      <div className="mt-3 min-h-[30px] px-1 text-center">
        <span className="text-[9px] font-medium leading-[1.35] text-[#625B7D]">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function AdditionalSessionContext({
  timeline = [],
  emotionSummary = null,
}) {
  const signals = useMemo(
    () =>
      calculateSignals(
        emotionSummary,
        timeline
      ),
    [emotionSummary, timeline]
  );

  const hasData =
    (emotionSummary?.overall_average_probabilities &&
      typeof emotionSummary.overall_average_probabilities ===
        "object") ||
    (Array.isArray(timeline) &&
      timeline.length > 0);

  if (!hasData) {
    return (
      <GlassCard className="p-4 sm:p-5">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: ACCENT,
            }}
          />

          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#756BA3]/70">
            Derived expression signals
          </span>
        </div>

        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#181536]">
          Additional session context
        </h3>

        <p className="mt-1 text-[10px] leading-relaxed text-[#77708F]">
          Simple heuristics derived from FER
          probabilities; not clinical measurements.
        </p>

        <div className="mt-4 rounded-[16px] border border-white/55 bg-white/[0.16] px-4 py-5 text-center">
          <p className="text-xs font-medium text-[#514A70]">
            Additional expression context will
            appear after your first completed
            check-in.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-5">
      {/* Header */}
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: ACCENT,
          }}
        />

        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#756BA3]/70">
          Derived expression signals
        </span>
      </div>

      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#181536]">
        Additional session context
      </h3>

      <p className="mt-1 text-[10px] leading-relaxed text-[#77708F]">
        Simple heuristics derived from FER
        probabilities; not clinical measurements.
      </p>

      {/* Signal graph */}
      <div className="mt-5 rounded-[18px] border border-white/55 bg-white/[0.16] px-3 pb-3 pt-4">
        <div className="flex items-end justify-between gap-2">
          <SignalColumn
            label="Positive-expression"
            value={signals.positive}
          />

          <SignalColumn
            label="Tension"
            value={signals.tension}
          />

          <SignalColumn
            label="Stress-associated expression"
            value={
              signals.stressAssociated
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[9px] text-[#817A99]/75">
          Session-derived signals
        </span>

        <span className="text-[9px] text-[#817A99]/75">
          Heuristic indicators
        </span>
      </div>
    </GlassCard>
  );
}