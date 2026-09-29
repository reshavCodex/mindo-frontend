import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import { useEffect } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock3,
  HeartHandshake,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const resources = [
  {
    id: "stress-anxiety",
    number: "01",
    icon: Brain,
    tag: "UNDERSTANDING",
    title: "Understanding stress vs. anxiety",
    description:
      "Stress and anxiety can feel similar, but understanding the difference can make it easier to recognize what you are experiencing and what kind of support may help.",
    sections: [
      {
        heading: "Stress",
        text: "Stress is often connected to a specific situation, demand, or challenge. It may show up when you are dealing with deadlines, uncertainty, conflict, or a major change.",
      },
      {
        heading: "Anxiety",
        text: "Anxiety can involve a feeling of worry, fear, or uneasiness that may continue even when there is no immediate threat or clear problem to solve.",
      },
      {
        heading: "A useful distinction",
        text: "Both can affect your thoughts, body, sleep, concentration, and daily routine. Paying attention to when these feelings appear, how long they last, and how much they interfere with everyday life can help you understand your experience better.",
      },
    ],
  },
  {
    id: "grounding-routine",
    number: "02",
    icon: Clock3,
    tag: "PRACTICAL TOOL",
    title: "Building a 5-minute grounding routine",
    description:
      "A short grounding routine can give you a simple way to pause, reconnect with the present moment, and create a little space before responding to whatever is happening.",
    sections: [
      {
        heading: "Minute 1 — Pause",
        text: "Stop what you are doing for a moment. Sit comfortably if you can and allow yourself to slow down without trying to immediately fix how you feel.",
      },
      {
        heading: "Minute 2 — Breathe",
        text: "Take a few slow, comfortable breaths. Let your breathing settle naturally rather than forcing deep breaths or trying to achieve a particular result.",
      },
      {
        heading: "Minute 3 — Notice",
        text: "Look around and identify a few things you can see, hear, and physically feel. Bring your attention back to what is happening around you right now.",
      },
      {
        heading: "Minute 4 — Check in",
        text: "Notice what is happening internally. You might ask yourself: What am I feeling right now? What do I need in this moment?",
      },
      {
        heading: "Minute 5 — Choose one next step",
        text: "Pick one small, realistic action for the next few minutes. It could be getting some water, stepping outside, finishing one task, or reaching out to someone you trust.",
      },
    ],
  },
  {
    id: "professional-support",
    number: "03",
    icon: HeartHandshake,
    tag: "SUPPORT",
    title: "When to talk to a professional",
    description:
      "You do not have to wait until things feel overwhelming before seeking support. Talking with a qualified professional can be useful when difficult experiences begin affecting your everyday life.",
    sections: [
      {
        heading: "Consider reaching out",
        text: "Professional support may be worth considering when persistent worry, low mood, stress, changes in sleep, difficulty concentrating, or other concerns are making everyday activities harder.",
      },
      {
        heading: "You can start small",
        text: "Talking to a professional does not mean you need to have everything figured out first. You can simply describe what you have been noticing and how it has been affecting you.",
      },
      {
        heading: "If you are in immediate danger",
        text: "If you are in immediate danger or think you may hurt yourself or someone else, seek urgent help through local emergency services or a crisis service in your area rather than relying on an online wellness tool.",
      },
    ],
  },
];

function ResourceCard({ resource, index }) {
  const Icon = resource.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0 },
      }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative overflow-hidden rounded-[28px] border border-white/45 bg-white/[0.30] p-6 shadow-[0_20px_80px_rgba(72,55,110,0.10),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-500 hover:border-white/60 hover:bg-white/[0.38] md:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary-deep/[0.07] blur-3xl transition-all duration-700 group-hover:bg-primary-deep/[0.12]" />

      <div className="relative">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-deep/10 bg-primary-deep/[0.06] text-primary-deep">
            <Icon size={21} strokeWidth={1.7} />
          </div>

          <span className="font-mono text-xs tracking-[0.18em] text-ink-soft/45">
            {resource.number}
          </span>
        </div>

        <div className="mb-3 text-[10px] font-medium tracking-[0.22em] text-primary-deep/70">
          {resource.tag}
        </div>

        <h2 className="max-w-xl text-2xl font-medium leading-tight tracking-[-0.025em] text-ink md:text-[28px]">
          {resource.title}
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft/75 md:text-[15px]">
          {resource.description}
        </p>

        <div className="mt-8 space-y-6 border-t border-ink/[0.08] pt-7">
          {resource.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-sm font-medium text-ink/90">
                {section.heading}
              </h3>

              <p className="mt-2 text-sm leading-7 text-ink-soft/70">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function Resources() {
  const { currentUser } = useAuth();

  const backPath = currentUser ? "/dashboard" : "/";
  const checkInPath = currentUser ? "/screening" : "/login";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <main className="min-h-screen px-5 pb-20 pt-28 text-ink sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-12"
        >
          <Link
            to={backPath}
            className="group mb-10 inline-flex items-center gap-2 text-sm text-ink-soft/65 transition-colors duration-300 hover:text-ink"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.7}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to MINDO
          </Link>

          <div className="max-w-3xl">
            <div className="mb-4 text-[10px] font-medium tracking-[0.24em] text-primary-deep/70">
              MINDO RESOURCES
            </div>

            <h1 className="text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl">
              A little more understanding can go a long way.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft/70 md:text-lg">
              Simple, practical resources to help you understand what you are
              experiencing, find moments of calm, and recognize when additional
              support may be useful.
            </p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {resources.map((resource, index) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[24px] border border-white/45 bg-white/[0.24] px-6 py-6 shadow-[0_16px_55px_rgba(72,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:px-7"
        >
          <div>
            <p className="text-sm font-medium text-ink/85">
              Want to check in with MINDO?
            </p>

            <p className="mt-1 text-sm text-ink-soft/65">
              You can return to your dashboard or start a video check-in.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {currentUser && (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full border border-ink/[0.08] bg-white/[0.28] px-5 py-2.5 text-sm text-ink-soft/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-300 hover:border-ink/[0.14] hover:bg-white/[0.42] hover:text-ink"
              >
                Dashboard

                <ArrowRight
                  size={15}
                  strokeWidth={1.7}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            )}

            <Link
              to={checkInPath}
              className="group inline-flex items-center gap-2 rounded-full border border-primary-deep/15 bg-primary-deep/[0.08] px-5 py-2.5 text-sm text-primary-deep/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 hover:border-primary-deep/25 hover:bg-primary-deep/[0.13] hover:text-primary-deep"
            >
              Start a check-in

              <ArrowRight
                size={15}
                strokeWidth={1.7}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[11px] leading-5 text-ink-soft/45">
          MINDO is a wellness and self-reflection tool. The information here
          is educational and is not a substitute for professional medical or
          mental health advice.
        </p>
      </div>
    </main>
  );
}