/**
 * ⚠️ MOCK DATA — placeholder only.
 *
 * This file simulates the shape of data that will eventually come from
 * the backend's Decision Engine + Report Generation stages (see system
 * architecture: Wellness Score, Risk Level, Emotion Timeline, Recommendations).
 *
 * When the real API is ready, replace the exported constants below with
 * a fetch/query call that returns the same shape — components consuming
 * this file should not need to change.
 */

// Mirrors "Decision Engine" output: Wellness Score, Risk Level, Key Observations
export const mockWellnessSummary = {
  userName: "Sara",
  goalProgress: { label: "Goal Progress", status: "Standard", value: 65, unit: "%" },
  stressLevel: { label: "Stress Level", status: "Low", value: 70, unit: "%" },
  focusPower: { label: "Focus Power", status: "Standard", value: 42, unit: "mins" },
  riskLevel: "low", // "low" | "moderate" | "high" — maps to success/warning/danger tokens
  wellnessScore: 78, // 0–100
};

// Mirrors "Facial Analysis" emotion timeline output, sampled across a week
// for the dashboard's "Health Improvement" chart.
export const mockHealthImprovement = {
  period: "This week",
  points: [
    { day: "Mon", value: 52 },
    { day: "Tue", value: 61 },
    { day: "Wed", value: 58 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 66 },
    { day: "Sat", value: 74 },
    { day: "Sun", value: 78 },
  ],
};

// Mirrors "Report Generation" output — past session summaries.
export const mockReports = [
  { title: "Cognitive Therapy", date: "17-08-25", clinician: "Dr. Jasmin" },
  { title: "Stress Management", date: "15-08-25", clinician: "Dr. Jonshon" },
  { title: "Sleep Therapy", date: "12-08-25", clinician: "Dr. Samira" },
  { title: "Emotional Wellness", date: "05-08-25", clinician: "Dr. K Sato" },
];

// Mirrors upcoming scheduled session info (not part of the AI screening
// pipeline itself, but shown alongside it in the dashboard).
export const mockUpcomingSession = {
  clinician: "Dr. Jams Alther",
  remaining: { hours: 6, minutes: 52 },
};

// Mirrors "Recommendations & Resources" output from the User Output stage.
export const mockActivePath = ["Meditation", "Exercise", "Journaling"];

// Helper: maps a risk level string to the semantic Tailwind color tokens
// defined in tailwind.config.js (success / warning / danger).
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