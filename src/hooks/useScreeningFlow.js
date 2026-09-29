import { useCallback, useState } from "react";

/**
 * useScreeningFlow
 *
 * Controls the real MINDO check-in lifecycle.
 *
 * Unlike the previous implementation, this hook does NOT:
 * - cycle through mock questions
 * - use artificial listening/thinking timers
 * - impose a session duration
 * - simulate Gemini responses
 *
 * The actual conversation is open-ended and ends only when the
 * user explicitly chooses to end the check-in.
 *
 * Session states:
 *   ready     → before the check-in starts
 *   listening → active live conversation
 *   summary   → session has ended and report processing can begin
 */
export default function useScreeningFlow() {
  const [state, setState] = useState("ready");

  /**
   * Starts the real check-in.
   *
   * The WebSocket/media connection will be handled by the
   * real session layer that we connect to this lifecycle.
   */
  const begin = useCallback(() => {
    setState("listening");
  }, []);

  /**
   * Ends the current check-in.
   *
   * This is intentionally manual.
   * There is no automatic timeout or question completion.
   */
  const endSession = useCallback(() => {
    setState("summary");
  }, []);

  /**
   * Returns the UI to the initial state.
   *
   * Useful if the user leaves the summary screen or wants
   * to start another check-in.
   */
  const resetSession = useCallback(() => {
    setState("ready");
  }, []);

  return {
    state,

    // Kept for compatibility with components that may still
    // expect these values while we transition the UI.
    currentQuestion: undefined,
    currentPhaseIndex: 0,
    phases: [],
    questionIndex: 0,
    totalQuestions: 0,

    // No artificial elapsed timer.
    elapsedSeconds: 0,

    begin,
    endSession,
    resetSession,
  };
}