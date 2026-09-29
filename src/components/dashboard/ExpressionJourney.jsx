import React, { useMemo, useState } from "react";

const EMOTIONS = [
  { key: "angry", label: "Angry" },
  { key: "disgust", label: "Disgust" },
  { key: "fear", label: "Fear" },
  { key: "happy", label: "Happy" },
  { key: "neutral", label: "Neutral" },
  { key: "sad", label: "Sad" },
  { key: "surprise", label: "Surprise" },
];

const ACCENT = "#6657E8";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPercentage(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0%";
  }

  return `${Math.round(numericValue * 100)}%`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Unknown time";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeProbability(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  // Your FER probabilities are normally fractions between 0 and 1.
  // This also safely handles percentage-style values if they appear.
  if (numericValue > 1) {
    return clamp(numericValue / 100, 0, 1);
  }

  return clamp(numericValue, 0, 1);
}

function buildPoints(timeline, emotion) {
  if (!Array.isArray(timeline)) {
    return [];
  }

  return timeline
    .map((entry, index) => {
      const probabilities = entry?.probabilities || {};

      return {
        index,
        timestamp: entry?.timestamp ?? null,
        value: normalizeProbability(probabilities?.[emotion]),
        dominantEmotion: entry?.dominant_emotion ?? null,
      };
    })
    .filter((point) => Number.isFinite(point.value));
}

function buildSmoothPath(points, width, height, padding) {
  if (points.length === 0) {
    return "";
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (index / (points.length - 1)) * chartWidth;

    const y =
      padding.top + (1 - point.value) * chartHeight;

    return { x, y };
  });

  if (coordinates.length === 1) {
    return `M ${coordinates[0].x} ${coordinates[0].y}`;
  }

  let path = `M ${coordinates[0].x} ${coordinates[0].y}`;

  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const current = coordinates[i];
    const next = coordinates[i + 1];

    const controlPoint1X =
      current.x + (next.x - current.x) / 3;

    const controlPoint2X =
      next.x - (next.x - current.x) / 3;

    path += `
      C
      ${controlPoint1X} ${current.y},
      ${controlPoint2X} ${next.y},
      ${next.x} ${next.y}
    `;
  }

  return path;
}

function buildAreaPath(points, width, height, padding) {
  if (points.length === 0) {
    return "";
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baselineY = padding.top + chartHeight;

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (index / (points.length - 1)) * chartWidth;

    const y =
      padding.top + (1 - point.value) * chartHeight;

    return { x, y };
  });

  const linePath = buildSmoothPath(
    points,
    width,
    height,
    padding
  );

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  return `
    ${linePath}
    L ${last.x} ${baselineY}
    L ${first.x} ${baselineY}
    Z
  `;
}

function GlassCard({ children, className = "" }) {
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-violet-200/[0.08]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function ExpressionJourney({
  timeline = [],
  observationCount = 0,
}) {
  const [selectedEmotion, setSelectedEmotion] =
    useState("neutral");

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const points = useMemo(
    () => buildPoints(timeline, selectedEmotion),
    [timeline, selectedEmotion]
  );

  const selectedEmotionLabel =
    EMOTIONS.find(
      (emotion) => emotion.key === selectedEmotion
    )?.label || "Neutral";

  const width = 1000;
  const height = 310;

  const padding = {
    top: 24,
    right: 24,
    bottom: 46,
    left: 58,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const linePath = useMemo(
    () =>
      buildSmoothPath(
        points,
        width,
        height,
        padding
      ),
    [points]
  );

  const areaPath = useMemo(
    () =>
      buildAreaPath(
        points,
        width,
        height,
        padding
      ),
    [points]
  );

  const coordinates = useMemo(() => {
    return points.map((point, index) => {
      const x =
        points.length === 1
          ? padding.left + chartWidth / 2
          : padding.left +
            (index / (points.length - 1)) * chartWidth;

      const y =
        padding.top +
        (1 - point.value) * chartHeight;

      return {
        ...point,
        x,
        y,
      };
    });
  }, [
    points,
    chartWidth,
    chartHeight,
  ]);

  const hoveredPoint =
    hoveredIndex !== null
      ? coordinates[hoveredIndex]
      : null;

  const latestPoint =
    coordinates.length > 0
      ? coordinates[coordinates.length - 1]
      : null;

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#756BA3]/70">
                Facial-expression signals
              </span>
            </div>

            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#181536]">
              Your expression journey
            </h3>
          </div>
        </div>

        <div className="mt-5 flex min-h-[210px] items-center justify-center rounded-[18px] border border-white/50 bg-white/[0.16] px-6 text-center">
          <div>
            <p className="text-sm font-medium text-[#252044]/75">
              Your expression journey will appear here
            </p>

            <p className="mt-1 text-xs text-[#6F688E]/70">
              Complete a check-in to see your facial-expression
              signals.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#756BA3]/70">
              Facial-expression signals
            </span>
          </div>

          <h3 className="text-xl font-semibold tracking-[-0.035em] text-[#181536]">
            Your expression journey
          </h3>
        </div>

        <div className="shrink-0 rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[11px] font-medium text-[#59527A] shadow-sm">
          {observationCount || timeline.length}{" "}
          observations
        </div>
      </div>

      {/* Emotion selector */}
      <div className="mt-4 rounded-[18px] border border-white/55 bg-white/[0.16] p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {EMOTIONS.map((emotion) => {
            const active =
              emotion.key === selectedEmotion;

            return (
              <button
                key={emotion.key}
                type="button"
                onClick={() => {
                  setSelectedEmotion(emotion.key);
                  setHoveredIndex(null);
                }}
                className={`
                  rounded-full border px-3 py-1.5
                  text-[10px] font-medium
                  transition-all duration-200 active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-violet-400/60
                  ${
                    active
                      ? "border-violet-400/70 bg-violet-400/15 text-violet-700 shadow-sm"
                      : "border-white/60 bg-white/25 text-[#6F688E] hover:bg-white/40 hover:text-[#383157]"
                  }
                `}
              >
                {emotion.label}
              </button>
            );
          })}

          <div className="ml-auto hidden items-center gap-2 text-[10px] text-[#77708F] sm:flex">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />

            Viewing {selectedEmotionLabel.toLowerCase()}
          </div>
        </div>

        {/* Chart */}
        <div className="relative mt-3">
          <div className="overflow-hidden rounded-[15px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`${selectedEmotionLabel} expression probability across the latest session`}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient
                  id="expressionJourneyFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={ACCENT}
                    stopOpacity="0.20"
                  />

                  <stop
                    offset="100%"
                    stopColor={ACCENT}
                    stopOpacity="0.015"
                  />
                </linearGradient>
              </defs>

              {/* Grid */}
              {[0, 25, 50, 75, 100].map(
                (percentage) => {
                  const y =
                    padding.top +
                    (1 - percentage / 100) *
                      chartHeight;

                  return (
                    <g key={percentage}>
                      <line
                        x1={padding.left}
                        x2={width - padding.right}
                        y1={y}
                        y2={y}
                        stroke="#7E76A8"
                        strokeOpacity={
                          percentage === 0
                            ? 0.18
                            : 0.10
                        }
                        strokeDasharray={
                          percentage === 0
                            ? undefined
                            : "3 7"
                        }
                      />

                      <text
                        x={padding.left - 12}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#5E5878"
                        fillOpacity="0.82"
                      >
                        {percentage}%
                      </text>
                    </g>
                  );
                }
              )}

              {/* Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#expressionJourneyFill)"
                />
              )}

              {/* Main line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive points */}
              {coordinates.map(
                (point, index) => {
                  const active =
                    hoveredIndex === index;

                  return (
                    <g key={`${point.timestamp}-${index}`}>
                      {active && (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="9"
                          fill={ACCENT}
                          fillOpacity="0.10"
                        />
                      )}

                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={active ? 5 : 3.6}
                        fill="#FFFFFF"
                        stroke={ACCENT}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredIndex(index)
                        }
                        onClick={() =>
                          setHoveredIndex(index)
                        }
                      />

                      {/* Larger invisible interaction target */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="14"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredIndex(index)
                        }
                        onClick={() =>
                          setHoveredIndex(index)
                        }
                      />
                    </g>
                  );
                }
              )}

              {/* Start / End */}
              <text
                x={padding.left}
                y={height - 13}
                fontSize="10"
                fill="#746D91"
                fillOpacity="0.75"
              >
                Start
              </text>

              <text
                x={width - padding.right}
                y={height - 13}
                textAnchor="end"
                fontSize="10"
                fill="#746D91"
                fillOpacity="0.75"
              >
                End
              </text>
            </svg>
          </div>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="pointer-events-none absolute z-30 min-w-[150px] -translate-x-1/2 -translate-y-full rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-xl"
              style={{
                left: `${
                  (hoveredPoint.x / width) * 100
                }%`,
                top: `${
                  (hoveredPoint.y / height) * 100
                }%`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium text-[#716A8E]">
                  {selectedEmotionLabel}
                </span>

                <span
                  className="text-xs font-semibold"
                  style={{ color: ACCENT }}
                >
                  {formatPercentage(
                    hoveredPoint.value
                  )}
                </span>
              </div>

              <div className="mt-1 text-[9px] text-[#8A839F]">
                {formatTimestamp(
                  hoveredPoint.timestamp
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-1 flex items-center justify-between gap-4 px-1">
          <span className="text-[9px] text-[#817A99]/80">
            Facial-expression probability
          </span>

          <span className="text-[9px] text-[#817A99]/80">
            Hover a point for the full snapshot
          </span>
        </div>
      </div>

      {/* Mobile viewing indicator */}
      <div className="mt-2 flex items-center gap-2 px-1 text-[10px] text-[#77708F] sm:hidden">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />

        Viewing {selectedEmotionLabel.toLowerCase()}
      </div>

      {/* Latest observation */}
      {latestPoint && (
        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <span className="text-[10px] text-[#817A99]">
            Latest detected signal
          </span>

          <span className="text-[10px] font-medium text-[#575071]">
            {selectedEmotionLabel}{" "}
            {formatPercentage(latestPoint.value)}
          </span>
        </div>
      )}
    </GlassCard>
  );
}