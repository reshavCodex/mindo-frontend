/**
 * ⚠️ MOCK DATA — placeholder only.
 *
 * Frontend-only stand-in for the real conversation flow described in
 * the backend architecture (Conversation Flow: Greeting & Rapport →
 * Initial Questions → Deeper Exploration → Adaptive Questions →
 * Summary & Closing, driven by Speech-to-Text + the Conversational
 * LLM). When that pipeline is connected, useScreeningFlow.js should
 * receive questions from the backend instead of this file — nothing
 * else in the screening UI should need to change shape.
 */

export const SCREENING_PHASES = [
  {
    id: "greeting",
    label: "Greeting & Rapport",
    questions: [
      "Hi, I'm glad you're here. How has your day been so far?",
      "Before we start, is there anything on your mind right now?",
    ],
  },
  {
    id: "initial",
    label: "Initial Questions",
    questions: [
      "On a scale from calm to overwhelmed, how would you describe the last few days?",
      "Would you say your energy has felt higher, lower, or about the same as usual?",
    ],
  },
  {
    id: "deeper",
    label: "Deeper Exploration",
    questions: [
      "What's been taking up most of your headspace lately?",
      "Is there a particular moment recently that stands out — good or hard?",
    ],
  },
  {
    id: "adaptive",
    label: "Adaptive Questions",
    questions: [
      "That's helpful to know. How have you been sleeping lately?",
      "Have you had a chance to do anything just for yourself this week?",
    ],
  },
  {
    id: "closing",
    label: "Summary & Closing",
    questions: [
      "Thank you for sharing all of that with me. How are you feeling right now, in this moment?",
      "Is there anything you'd like noted in your summary before we wrap up?",
    ],
  },
];