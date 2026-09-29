import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://127.0.0.1:8000";

const MAX_HISTORY_ITEMS = 10;
const SCROLL_THRESHOLD = 5;

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

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSessionLabel(item) {
  const category = item?.mood;

  if (!category) {
    return "Completed check-in";
  }

  return category;
}

function CheckInRow({
  item,
  index,
  isLast,
  currentUser,
}) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const recommendations = Array.isArray(
    item?.recommendations
  )
    ? item.recommendations.filter(
        (recommendation) =>
          typeof recommendation === "string" &&
          recommendation.trim().length > 0
      )
    : [];

  const hasSummary =
    typeof item?.summary === "string" &&
    item.summary.trim().length > 0;

  const handleDownloadReport = async () => {
    if (!currentUser || !item?.sessionId) {
      return;
    }

    try {
      setDownloading(true);
      setDownloadError(null);

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/sessions/${item.sessionId}/report`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          "Unable to download this report.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            message = errorData.detail;
          }
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `mindo-check-in-${item.sessionId}.pdf`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "[DASHBOARD] Failed to download report:",
        error
      );

      setDownloadError(
        error?.message ||
          "Unable to download this report."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
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
        delay: 0.08 * index,
        duration: 0.4,
        ease: "easeOut",
      }}
      className="relative"
    >
      {/* =====================================================
          SESSION ROW
      ===================================================== */}
      <motion.div
        whileHover={{
          x: 2,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-[background-color,box-shadow] duration-300 ${
          expanded
            ? "bg-white/35"
            : "hover:bg-white/30"
        }`}
      >
        {/* Session indicator */}
        <span
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/8"
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125" />
        </span>

        {/* Main information */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-display text-sm font-semibold text-ink">
              MINDO Check-in
            </h3>

            <span className="hidden truncate rounded-full bg-primary/7 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-primary-deep sm:inline-block">
              {getSessionLabel(item)}
            </span>
          </div>

          <div className="mt-0.5 font-mono text-[10px] text-ink-soft/80">
            {formatDate(item?.date)}

            {formatTime(item?.date) && (
              <>
                <span className="mx-1.5 text-ink-soft/35">
                  ·
                </span>

                {formatTime(item?.date)}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {hasSummary && (
            <button
              type="button"
              onClick={() =>
                setExpanded((value) => !value)
              }
              className="rounded-lg px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-primary-deep transition-all duration-200 hover:bg-primary/8"
            >
              <span className="hidden sm:inline">
                {expanded
                  ? "Hide summary"
                  : "View summary"}
              </span>

              <span className="sm:hidden">
                {expanded ? "Hide" : "View"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={downloading}
            className="rounded-lg px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft transition-all duration-200 hover:bg-white/45 hover:text-primary-deep disabled:cursor-wait disabled:opacity-50"
          >
            {downloading
              ? "Preparing..."
              : "PDF"}
          </button>

          <span
            className={`hidden text-sm text-primary transition-transform duration-300 sm:block ${
              expanded
                ? "rotate-90"
                : "group-hover:translate-x-0.5"
            }`}
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </motion.div>

      {/* Mobile category */}
      <div className="px-12 pb-2 sm:hidden">
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-primary-deep/80">
          {getSessionLabel(item)}
        </span>
      </div>

      {/* =====================================================
          EXPANDED DETAILS
      ===================================================== */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="mx-3 mb-2 rounded-xl border border-white/45 bg-white/20 px-4 py-4 backdrop-blur-sm"
            >
              {hasSummary && (
                <div>
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-soft/65">
                    Session summary
                  </span>

                  <p className="mt-2 max-w-2xl text-xs leading-5 text-ink-soft">
                    {item.summary}
                  </p>
                </div>
              )}

              {recommendations.length > 0 && (
                <div
                  className={
                    hasSummary ? "mt-4" : ""
                  }
                >
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-soft/65">
                    Recommended steps
                  </span>

                  <ul className="mt-2 space-y-2">
                    {recommendations
                      .slice(0, 4)
                      .map(
                        (
                          recommendation,
                          recommendationIndex
                        ) => (
                          <motion.li
                            key={`${recommendation}-${recommendationIndex}`}
                            initial={{
                              opacity: 0,
                              x: -5,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay:
                                recommendationIndex *
                                0.06,
                              duration: 0.25,
                            }}
                            className="flex gap-2 text-xs leading-5 text-ink-soft"
                          >
                            <span
                              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden="true"
                            />

                            <span>
                              {recommendation}
                            </span>
                          </motion.li>
                        )
                      )}
                  </ul>
                </div>
              )}

              {!hasSummary &&
                recommendations.length === 0 && (
                  <p className="text-xs leading-5 text-ink-soft">
                    No additional summary
                    information is available for
                    this check-in.
                  </p>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download error */}
      <AnimatePresence>
        {downloadError && (
          <motion.p
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
            className="px-12 pb-2 text-[10px] text-red-500"
          >
            {downloadError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Subtle separator */}
      {!isLast && (
        <div className="mx-3 border-b border-white/35" />
      )}
    </motion.div>
  );
}

export default function RecentCheckIns({
  checkIns,
  hasHistory,
  currentUser,
  index = 0,
}) {
  /*
   * Keep only the latest 10 sessions in this component.
   * The backend already returns sessions in history order,
   * so the first 10 represent the most recent sessions.
   */
  const visibleCheckIns = Array.isArray(checkIns)
    ? checkIns.slice(0, MAX_HISTORY_ITEMS)
    : [];

  /*
   * Scrolling begins only after 5 sessions.
   * This keeps the original compact appearance for
   * smaller histories while preventing the dashboard
   * from growing indefinitely.
   */
  const shouldScroll =
    visibleCheckIns.length > SCROLL_THRESHOLD;

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
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            Your history
          </p>

          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
            Recent check-ins
          </h2>
        </div>

        {visibleCheckIns.length > 0 && (
          <span className="rounded-full bg-white/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft">
            {visibleCheckIns.length}{" "}
            {visibleCheckIns.length === 1
              ? "session"
              : "sessions"}
          </span>
        )}
      </div>

      {/* =====================================================
          SESSION LIST
      ===================================================== */}
      {hasHistory && visibleCheckIns.length > 0 ? (
        <div
          className={`rounded-2xl border border-white/40 bg-white/12 p-1.5 backdrop-blur-sm ${
            shouldScroll
              ? "max-h-[360px] overflow-y-auto overscroll-contain"
              : ""
          }`}
        >
          {visibleCheckIns.map((item, i) => (
            <CheckInRow
              key={
                item.id ||
                item.sessionId ||
                i
              }
              item={item}
              index={i}
              isLast={
                i ===
                visibleCheckIns.length - 1
              }
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <EmptyHistory />
      )}
    </motion.section>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/15 px-4 py-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary-deep"
          aria-hidden="true"
        >
          ✦
        </span>

        <div>
          <h3 className="font-display text-sm font-semibold text-ink">
            Your first check-in is waiting
          </h3>

          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Completed sessions will appear here
            with their summaries and reports.
          </p>
        </div>
      </div>
    </div>
  );
}