/**
 * ⚠️ MOCK DATA — placeholder only.
 *
 * This file simulates the shape of data the real Dashboard will eventually
 * read from the backend (user profile, session history, Decision Engine
 * wellness snapshots, and Recommendation output). It is intentionally
 * separate from `mockWellnessData.js` (which backs the homepage's marketing
 * "dashboard preview" section) so the two surfaces can evolve independently.
 *
 * When the real API is ready, replace the exported values/functions below
 * with fetch/query calls that resolve to the same shapes — components
 * consuming this file (via `useDashboardData`) should not need to change.
 */

// ---------------------------------------------------------------------------
// Toggle point: whether this user has any check-in history yet.
//
// The Dashboard is now the very first screen after login/signup, so a
// brand-new user genuinely has nothing behind them yet — this defaults to
// `false` so first-time users see the elegant empty state instead of
// fabricated numbers, per spec. Flip to `true` locally (or replace this
// whole module with a real API call) to preview the populated state.
// ---------------------------------------------------------------------------
export const hasCheckInHistory = false;

// Mirrors auth/profile data — replace with the real logged-in user later.
export const mockUser = {
  name: "Sara",
  firstCheckInComplete: hasCheckInHistory,
};

// Mirrors "Decision Engine" output for the three snapshot metrics.
// Only rendered when hasCheckInHistory is true.
export const mockWellnessSnapshot = {
  mood: { label: "Mood", status: "Balanced", value: 72, unit: "%", icon: "🙂" },
  stress: { label: "Stress", status: "Low", value: 28, unit: "%", icon: "🧘" },
  focus: { label: "Focus", status: "Steady", value: 46, unit: "mins" },
};

// Mirrors a sampled emotion/wellness timeline for the trend chart.
export const mockWellnessTrend = {
  period: "Last 7 check-ins",
  points: [
    { day: "Mon", value: 54 },
    { day: "Tue", value: 61 },
    { day: "Wed", value: 58 },
    { day: "Thu", value: 66 },
    { day: "Fri", value: 63 },
    { day: "Sat", value: 71 },
    { day: "Sun", value: 74 },
  ],
};

// Mirrors "Report Generation" output — most recent check-ins.
export const mockRecentCheckIns = [
  { id: "c1", title: "Evening Check-in", date: "Aug 29", mood: "Calm", riskLevel: "low" },
  { id: "c2", title: "Morning Check-in", date: "Aug 27", mood: "Focused", riskLevel: "low" },
  { id: "c3", title: "Evening Check-in", date: "Aug 24", mood: "Tense", riskLevel: "moderate" },
];

// Mirrors "Recommendations & Resources" output from the User Output stage.
export const mockInsight = {
  title: "This week's insight",
  body:
    "Your stress readings tend to dip after evening check-ins. Keeping this as your regular time slot may help.",
};

// Helper: maps a risk level string to the semantic Tailwind color tokens
// already defined in tailwind.config.js (success / warning / danger).
export function riskLevelToTokens(riskLevel) {
  switch (riskLevel) {
    case "moderate":
      return { text: "text-warning", bg: "bg-warning-soft", label: "Moderate" };
    case "high":
      return { text: "text-danger", bg: "bg-danger-soft", label: "High" };
    case "low":
    default:
      return { text: "text-success", bg: "bg-success-soft", label: "Low" };
  }
}