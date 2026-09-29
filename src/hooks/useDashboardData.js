import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_CONVERSATION_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_CONVERSATION_API_URL is not configured."
  );
}

/* ============================================================
HELPERS
============================================================ */

function normalizeSession(session) {
  return {
    id: session?.session_id,
    sessionId: session?.session_id,

    status: session?.status || "unknown",

    startedAt: session?.started_at || null,
    endedAt: session?.ended_at || null,
    createdAt: session?.created_at || null,

    assessmentCategory:
      session?.assessment_category || null,

    confidence:
      session?.confidence ?? null,

    summary:
      session?.summary || null,

    recommendations:
      Array.isArray(session?.recommendations)
        ? session.recommendations.filter(
            (recommendation) =>
              typeof recommendation === "string" &&
              recommendation.trim().length > 0
          )
        : [],
  };
}

/* ============================================================
DASHBOARD DATA HOOK
============================================================ */

export default function useDashboardData() {
  const { currentUser } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ==========================================================
  LOAD USER SESSION HISTORY
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      if (!currentUser) {
        if (!cancelled) {
          setSessions([]);
          setLoading(false);
          setError(null);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await currentUser.getIdToken();

        const response = await fetch(
          `${API_BASE_URL}/api/v1/sessions`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          let message =
            "Unable to load your check-in history.";

          try {
            const errorData =
              await response.json();

            if (errorData?.detail) {
              message = errorData.detail;
            }
          } catch {
            // Keep the default message.
          }

          throw new Error(message);
        }

        const data = await response.json();

        const receivedSessions =
          Array.isArray(data?.sessions)
            ? data.sessions
            : [];

        const normalizedSessions =
          receivedSessions.map(normalizeSession);

        if (!cancelled) {
          setSessions(normalizedSessions);
        }
      } catch (loadError) {
        console.error(
          "[DASHBOARD] Failed to load session history:",
          loadError
        );

        if (!cancelled) {
          setSessions([]);

          setError(
            loadError?.message ||
              "Unable to load your check-in history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  /* ==========================================================
  DERIVED DATA
  ========================================================== */

  const completedSessions =
    sessions.filter(
      (session) =>
        session.status === "completed"
    );

  const hasHistory =
    completedSessions.length > 0;

  /* ==========================================================
  LATEST SESSION
  ========================================================== */

  const latestSession =
    completedSessions[0] || null;

  /* ==========================================================
  LATEST INSIGHT
  ========================================================== */

  const insight =
    latestSession
      ? {
          title: "From your latest check-in",

          body:
            latestSession.summary ||
            "Your latest check-in has been completed. Review your detailed report for more context.",

          recommendations:
            latestSession.recommendations,

          assessmentCategory:
            latestSession.assessmentCategory,
        }
      : null;

  /* ==========================================================
  RECENT CHECK-INS
  ========================================================== */

  const recentCheckIns =
    completedSessions.map(
      (session) => ({
        id: session.id,

        sessionId:
          session.sessionId,

        title:
          "MINDO Check-in",

        date:
          session.startedAt,

        mood:
          session.assessmentCategory,

        riskLevel:
          null,

        status:
          session.status,

        summary:
          session.summary,

        recommendations:
          session.recommendations,

        confidence:
          session.confidence,

        startedAt:
          session.startedAt,

        endedAt:
          session.endedAt,
      })
    );

  /* ==========================================================
  WELLNESS TREND
  ========================================================== */

  /*
   * We intentionally do NOT manufacture a wellness score from
   * confidence or assessment_category.
   *
   * The dashboard currently represents real check-in activity.
   * The journey visualization is limited to the last 30 days.
   */

  const thirtyDaysAgo =
    Date.now() -
    30 * 24 * 60 * 60 * 1000;

  const recentTrendSessions =
    completedSessions.filter(
      (session) => {
        if (!session.startedAt) {
          return false;
        }

        const timestamp =
          new Date(
            session.startedAt
          ).getTime();

        return (
          !Number.isNaN(timestamp) &&
          timestamp >= thirtyDaysAgo
        );
      }
    );

  const trend = {
    period:
      "Last 30 days",

    points:
      [...recentTrendSessions]
        .reverse()
        .map(
          (session, index) => ({
            day:
              session.startedAt ||
              `Check-in ${index + 1}`,

            value:
              index + 1,
          })
        ),
  };

  /* ==========================================================
  SNAPSHOT
  ========================================================== */

  /*
   * There is currently no trustworthy database-backed mood,
   * stress, or focus metric in the session schema.
   *
   * Returning null prevents the Dashboard from displaying
   * fabricated wellness numbers.
   */

  const snapshot = null;

  /* ==========================================================
  RETURN
  ========================================================== */

  return {
    user:
      currentUser,

    hasHistory,

    snapshot,

    trend,

    recentCheckIns,

    insight,

    sessions,

    latestSession,

    loading,

    error,
  };
}